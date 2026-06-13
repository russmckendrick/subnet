# URL Sharing & State Persistence

subnet.fit encodes application state in the URL path and query string, making every configuration shareable by copying the URL. No server is involved — the path is decoded client-side on page load.

## URL Format Specification

### Calculator Mode

```
/<ip>/<prefix>
```

The CIDR notation is used directly as the path.

When a user is editing direct CIDR input, invalid drafts remain local to the input control. The browser URL is updated only after the CIDR parses successfully, so invalid states such as `/10.0.0.0/33` are not written to history or share links.

**Examples:**
- `/10.0.0.0/16`
- `/192.168.1.0/24`
- `/172.16.0.0/12`

#### Bare IP URLs

Bare IPs (without a prefix) are also accepted. The prefix is inferred from the IP's trailing-zero structure using `inferDefaultPrefix()`:

| URL path | Inferred CIDR | Reason |
|----------|---------------|--------|
| `/10.0.0.0` | `10.0.0.0/8` | `.0.0.0` → `/8` |
| `/10.10.0.0` | `10.10.0.0/16` | `.0.0` → `/16` |
| `/192.168.1.0` | `192.168.1.0/24` | `.0` → `/24` |
| `/8.8.8.8` | `8.8.8.8/32` | No trailing zeros → `/32` |

On load, bare IP URLs are normalized to include the inferred prefix (e.g. `/8.8.8.8` becomes `/8.8.8.8/32` in the address bar).

### Splitter Mode

```
/<ip>/<prefix>?split=<prefix~label,prefix~label,...>
```

Components:
- `/<ip>/<prefix>` — Parent network in CIDR notation as the path
- `?split=` — Query parameter containing child subnets
- `<prefix~label>` — Child prefix length, optionally followed by `~` and a URL-encoded label
- `,` — Separator between child entries

Each `split` segment's head is either a **bare prefix** (`24` — the subnet is VLSM-packed
contiguously from the parent's base) or a **full CIDR** (`10.0.2.0/24` — the subnet keeps
that exact address). Full-CIDR segments are emitted by the designer handoff so the
calculator shows the designer's actual ranges instead of re-packing them. Parsing is
**all-or-nothing**: a `?split=` is treated as explicit only when *every* segment carries a
full CIDR; any bare segment falls back to VLSM packing for the whole set.

**Examples:**
- `/10.0.0.0/16?split=24~Web,25~API,26~Database` (bare prefixes, VLSM-packed)
- `/192.168.0.0/16?split=24,24,24` (uses default labels)
- `/10.0.0.0/8?split=16~Production,16~Staging`
- `/10.0.0.0/16?split=10.0.0.0/24~Web,10.0.4.0/24~DB` (explicit CIDRs, e.g. after editing in the designer)

### Supernet Mode

```
/super?nets=<cidr>,<cidr>,...
```

Components:
- `/super` — Fixed path for supernet mode
- `?nets=` — Query parameter with comma-separated CIDR notations

**Examples:**
- `/super?nets=10.0.0.0/24,10.0.1.0/24`
- `/super?nets=192.168.0.0/24,192.168.1.0/24,192.168.2.0/24`

### Designer Mode

```
/designer
/designer?from=<cidr>&split=<prefix~label,prefix~label,...>
```

Components:
- `/designer` — Fixed path for designer mode
- `?from=` — Optional parent CIDR to auto-generate a diagram from
- `&split=` — Optional child subnets (same format as splitter mode)

**Examples:**
- `/designer` — Empty canvas (loads from localStorage if available)
- `/designer?from=10.0.0.0/16&split=24~Web,25~API` — Auto-generates Internet Gateway → VPC → Subnet nodes

Optional extra parameters: `&provider=aws|azure|gcp` sets the cloud provider, and `?d={compressed}` loads a shared diagram (base64url-encoded pako-deflated JSON).

When URL parameters are present, `useDesignerUrlSync` checks for a saved diagram in localStorage. If a saved diagram exists with the same VPC CIDR, new subnets from the URL are **merged** into the existing diagram — preserving all existing nodes, edges, positions, and user-added resources. If no saved diagram exists or the CIDR differs, a fresh layout is generated via `generateInitialLayout()` from `diagram-layout.ts`.

#### Canonical Designer URLs

Designer URL parameters are no longer stripped after load. Instead, the URL is kept **canonical** with the diagram:

- `buildDesignerUrl()` in `src/lib/designer-state-extract.ts` derives `/designer?from=<cidr>&split=<segments>&provider=<provider>` from the current diagram nodes, emitting **full CIDRs** in each segment (`10.0.2.0/24~Web`) so a refresh reproduces the exact layout instead of re-packing (falling back to plain `/designer` when no VPC exists; `provider` is omitted for `generic`)
- After `useDesignerUrlSync` initialises from `?from=` params (fresh layout or merge), it writes the canonical URL via `history.replaceState()`
- After a `?d=` share link loads, the bulky compressed payload is **replaced** by the canonical `?from=&split=&provider=` parameters
- `useDiagramPersistence` rewrites the canonical URL on every debounced auto-save, and when loading a saved diagram from localStorage

The result: refreshing or bookmarking the designer always keeps the diagram context.

### Bidirectional Navigation

Navigation between the calculator and designer preserves state in both directions using URL parameters:

**Calculator → Designer:**
- The Header "Designer" link, command palette "Open Designer" command, and SplitterToolbar "Open in Designer" button always build `/designer?from={cidr}&split={cidr~label,...}` from calculator store state, emitting each subnet's full CIDR so exact ranges (including explicit/edited positions) survive the handoff
- `useDesignerUrlSync` handles merge logic: if a saved diagram exists with the same VPC CIDR, only new subnets are added (existing nodes/resources preserved); otherwise a fresh layout is generated
- Falls back to bare `/designer` when no CIDR is loaded

**Designer → Calculator:**
- The `useCalculatorHref()` hook in `src/hooks/use-calculator-href.ts` extracts CIDR and splits from designer nodes using `extractDesignerState()` from `src/lib/designer-state-extract.ts`
- Finds the first `vpc-container` node for the parent CIDR
- Collects all `subnet-container` nodes for split prefixes, labels, and **full CIDRs**
- Encodes the result as a calculator URL via `encodeState()` with `splitCidrs` so the calculator shows the designer's exact ranges instead of re-packing (e.g. `/10.0.0.0/16?split=10.0.0.0/24~Web,10.0.4.0/24~DB`)
- Falls back to `/` when no VPC container exists in the diagram
- Used by the `DesignerHeader` logo — the single state-preserving back link to the calculator

## UrlState Type

```typescript
interface UrlState {
  mode: 'network' | 'supernet'
  cidr: string
  splits?: number[]
  splitLabels?: string[]
  splitCidrs?: string[] // full subnet CIDRs (parallel to splits); present only for explicit/designer handoffs
  supernetInputs?: string[]
}
```

`splitCidrs` carries each subnet's exact CIDR. When present, the calculator and designer
use these ranges verbatim; when absent, subnets are derived by VLSM-packing `splits` from
the parent's base. `decodeState` populates it only when every `?split=` segment is a full
CIDR; `encodeState` emits `splitCidrs[i]` as the segment head when set, otherwise the bare
prefix.

## Label Encoding

Labels support arbitrary text through URL encoding:
- On encode: `encodeURIComponent(label)` handles special characters
- On decode: `decodeURIComponent(encoded)` restores the original text, with a fallback to the raw string if decoding fails
- Labels are separated from their prefix by `~`
- If no `~` is present in a segment, the default label `"Subnet N"` is used

## Encoding/Decoding Functions

### encodeState(state: UrlState) → string

Produces the URL path + query string:

- **Network (no splits):** Returns `/<cidr>` (e.g. `/10.0.0.0/16`)
- **Network (with splits):** Returns `/<cidr>?split=<segments>`. Each segment head is `splitCidrs[i]` (a full CIDR) when set, otherwise the bare `prefix`; an optional `~encodedLabel` follows
- **Supernet:** Returns `/super?nets=<cidr1>,<cidr2>,...`

### decodeState(pathname: string, search: string) → UrlState | null

Parses a pathname and search string:

1. Strip leading `/` and trim whitespace
2. If empty, return `null` (home page)
3. If path is `super` — parse supernet format from `?nets=` query param
4. If path matches CIDR pattern (`ip/prefix`) — parse as network mode, optionally with `?split=` query param
5. If path matches bare IP pattern (`ip` without prefix) — validate with `parseIPv4()`, infer prefix via `inferDefaultPrefix()`, construct full CIDR, and continue as network mode (with optional `?split=`)
6. Otherwise — return `null`

`?split=` parsing (shared `parseSplitSegments` helper) reads each segment's head as a full
CIDR when it contains `/`, else a bare prefix. It returns `splitCidrs` only when **every**
segment is a full CIDR (all-or-nothing); a mix falls back to bare-prefix VLSM. Legacy hash
URLs only ever carried bare prefixes and are parsed as such.

### updateUrl(state: UrlState) → void

Encodes the state and writes it to the URL:

```typescript
window.history.replaceState(null, '', encodedPath)
```

Uses `replaceState` (not `pushState`) to avoid polluting browser history.

### readUrl() → UrlState | null

Reads and decodes `window.location.pathname` + `window.location.search`.

## Legacy Hash URL Migration

The `migrateHashUrl()` function provides backward compatibility with old hash-based URLs. On mount, `useUrlSync` calls this before reading the current URL.

**Supported legacy formats:**
- `#10.0.0.0/16` → `/10.0.0.0/16`
- `#10.0.0.0/16:24~Web,25~API` → `/10.0.0.0/16?split=24~Web,25~API`
- `#split:10.0.0.0/16:24~Web,25~API` → `/10.0.0.0/16?split=24~Web,25~API`
- `#super:10.0.0.0/24,10.0.1.0/24` → `/super?nets=10.0.0.0/24,10.0.1.0/24`

The migration uses `history.replaceState()` so the old hash URL is replaced in-place without a page reload.

## useUrlSync Hook

The `useUrlSync` hook in `src/hooks/use-url-sync.ts` provides bidirectional sync between the Zustand store and the URL.

### Mount: URL → Store

```mermaid
sequenceDiagram
    participant Browser
    participant Hook as useUrlSync
    participant Codec as url-codec
    participant Store as calculator-store

    Browser->>Hook: Component mounts
    Hook->>Codec: migrateHashUrl()
    Note over Codec: Redirects legacy #hash URLs
    Hook->>Codec: readUrl()
    Codec->>Codec: decodeState(pathname, search)
    Codec-->>Hook: UrlState | null

    alt Network mode
        Hook->>Store: initFromUrl(cidr, splits, labels)
    else Supernet mode
        Hook->>Store: setSupernetInputs(inputs)
    end
```

Runs once on mount via `useEffect(() => { ... }, [])`.

### Changes: Store → URL

```mermaid
sequenceDiagram
    participant Store as calculator-store
    participant Hook as useUrlSync
    participant Codec as url-codec
    participant Browser

    Store->>Hook: State change detected
    Note over Hook: Watches: rawInput,<br/>splitPrefixes, splitLabels,<br/>supernetInputs, activeDrawer

    alt Supernet drawer
        Hook->>Codec: updateUrl({ mode: 'supernet', ... })
    else Network
        Note over Hook: If rawInput is a bare IP (no /),<br/>append inferred prefix via inferDefaultPrefix()
        Note over Hook: If rawInput is invalid CIDR,<br/>leave the existing URL untouched
        Hook->>Codec: updateUrl({ mode: 'network', cidr, ... })
    end

    Codec->>Browser: history.replaceState()
```

Runs on every relevant state change via `useEffect` with a dependency array.

## initFromUrl Flow

When restoring from a URL, the `initFromUrl` store action:

1. Calls `parseCidr(cidr)` to compute the calculator result
2. Sets `rawInput` and `result`
3. If splits are present:
   - Sets `splitPrefixes` and `splitLabels`
   - Calls `recalcSplits()` to compute `splits`, `remainingSpace`, and `availablePrefixes`
   - Merges all computed values into the state
