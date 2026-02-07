# URL Sharing & State Persistence

subnet.fit encodes application state in the URL path and query string, making every configuration shareable by copying the URL. No server is involved — the path is decoded client-side on page load.

## URL Format Specification

### Calculator Mode

```
/<ip>/<prefix>
```

The CIDR notation is used directly as the path.

**Examples:**
- `/10.0.0.0/16`
- `/192.168.1.0/24`
- `/172.16.0.0/12`

### Splitter Mode

```
/<ip>/<prefix>?split=<prefix~label,prefix~label,...>
```

Components:
- `/<ip>/<prefix>` — Parent network in CIDR notation as the path
- `?split=` — Query parameter containing child subnets
- `<prefix~label>` — Child prefix length, optionally followed by `~` and a URL-encoded label
- `,` — Separator between child entries

**Examples:**
- `/10.0.0.0/16?split=24~Web,25~API,26~Database`
- `/192.168.0.0/16?split=24,24,24` (uses default labels)
- `/10.0.0.0/8?split=16~Production,16~Staging`

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

## UrlState Type

```typescript
interface UrlState {
  mode: 'network' | 'supernet'
  cidr: string
  splits?: number[]
  splitLabels?: string[]
  supernetInputs?: string[]
}
```

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
- **Network (with splits):** Returns `/<cidr>?split=<segments>` where each segment is `prefix` or `prefix~encodedLabel`
- **Supernet:** Returns `/super?nets=<cidr1>,<cidr2>,...`

### decodeState(pathname: string, search: string) → UrlState | null

Parses a pathname and search string:

1. Strip leading `/` and trim whitespace
2. If empty, return `null` (home page)
3. If path is `super` — parse supernet format from `?nets=` query param
4. If path matches CIDR pattern — parse as network mode, optionally with `?split=` query param
5. Otherwise — return `null`

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
    else Network (with splits)
        Hook->>Codec: updateUrl({ mode: 'network', cidr, splits, labels })
    else Network (no splits)
        Hook->>Codec: updateUrl({ mode: 'network', cidr })
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
