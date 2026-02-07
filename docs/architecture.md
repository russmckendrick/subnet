# Architecture

subnet.fit is a client-side-only application. All computation happens in the browser — there is no backend, no API calls, and no server-side rendering.

## Layer Diagram

```mermaid
flowchart TD
    subgraph lib["lib/ — Pure Calculations"]
        ipv4["ipv4.ts"]
        cidr["cidr.ts"]
        subnetmath["subnet-math.ts"]
        binary["binary.ts"]
        cloud["cloud-providers.ts"]
        rfc["rfc-ranges.ts"]
        constants["constants.ts"]
        exportmod["export.ts"]
        urlcodec["url-codec.ts"]
        configmod["config.ts"]
    end

    subgraph store["store/ — State Management"]
        calcstore["calculator-store.ts"]
        themestore["theme-store.ts"]
    end

    subgraph hooks["hooks/ — Side Effects"]
        urlsync["use-url-sync.ts"]
        keyboard["use-keyboard-shortcuts.ts"]
        clipboard["use-clipboard.ts"]
    end

    subgraph components["components/ — UI"]
        calculator["calculator/"]
        splitter["splitter/"]
        visualmap["visual-map/"]
        cloudcomp["cloud/"]
        tools["tools/"]
        exportcomp["export/"]
        shared["shared/"]
        layout["layout/"]
    end

    lib --> store
    store --> hooks
    hooks --> components
    lib --> components
    store --> components
```

Each layer has a strict dependency direction:

| Layer | Responsibility | Dependencies |
|-------|---------------|--------------|
| `lib/` | Pure functions. IPv4 parsing, CIDR math, subnet allocation, binary formatting, cloud provider logic, RFC detection, export formatting, URL encoding, and centralised app configuration (`config.ts`). Zero React imports. | None |
| `store/` | Zustand stores. Holds all application state and actions. Calls `lib/` functions to compute derived values. | `lib/` |
| `hooks/` | React hooks for side effects. URL hash synchronization, keyboard shortcut handling, clipboard operations. | `store/`, `lib/` |
| `components/` | React components organized by feature domain. Read from stores, call actions, render UI. | `store/`, `hooks/`, `lib/` |

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Store
    participant Lib
    participant URL

    User->>Component: Types CIDR input
    Component->>Store: setRawInput("10.0.0.0/16")
    Store->>Lib: parseCidr("10.0.0.0/16")
    Lib-->>Store: CidrResult
    Store-->>Component: State update triggers re-render
    Component->>User: Displays results

    Note over Store,URL: URL sync (via useUrlSync hook)
    Store->>URL: updateUrl({ mode, cidr })
    URL-->>URL: history.replaceState()
```

On mount, the flow reverses — any legacy hash URL is migrated first, then the path is read and used to initialize the store:

```mermaid
sequenceDiagram
    participant URL
    participant Hook
    participant Store
    participant Lib

    URL->>Hook: useUrlSync mounts
    Hook->>Hook: migrateHashUrl() (legacy redirect)
    Hook->>URL: readUrl() reads pathname + search
    Hook->>Store: initFromUrl(cidr, splits, labels)
    Store->>Lib: parseCidr() + allocateSubnets()
    Lib-->>Store: CidrResult + SubnetSplit[]
    Store-->>Hook: State initialized
```

## Component Hierarchy

```mermaid
flowchart TD
    App["App.tsx"]
    Layout["Layout"]
    Header["Header"]
    Footer["Footer"]

    App --> Layout
    Layout --> Header
    Layout --> Footer

    subgraph MainContent["Main Content (always visible)"]
        CidrInput["CidrInput"]
        ResultsPanel["ResultsPanel"]
        SubnetSplitting["SubnetSplittingSection<br/>(includes visualization bar + detail cards)"]
        DetailsSection["DetailsSection"]
    end

    subgraph DetailsSub["DetailsSection children"]
        SubnetMap["SubnetMap<br/>(hidden when splits exist)"]
        CloudContext["CloudContext"]
        BinaryBreakdown["BinaryBreakdown"]
        ExportMenu["ExportMenu"]
    end

    subgraph Drawers["Drawers"]
        QuickReference["QuickReference"]
        SupernetTool["SupernetTool"]
    end

    App --> MainContent
    App --> Drawers
    DetailsSection --> DetailsSub

    CloudContext --> ProviderCard["ProviderCard (x3)"]
    ResultsPanel --> SubnetInfoCard["SubnetInfoCard (x8)"]
```

## State Management

Two Zustand stores with no middleware:

- **`calculator-store`** — All app state: active tab, CIDR input/result, splitter allocations (parent CIDR, prefix list, labels, computed splits, remaining space, available prefixes), and supernet inputs/result. Reads default CIDR from `config.ts`.
- **`theme-store`** — Dark/light theme with localStorage persistence. Reads default theme preference and storage key from `config.ts`, with support for `'system'` as the default (resolves via `prefers-color-scheme` media query).

See [State Management](state-management.md) for the full state shape and action descriptions.

## URL Routing

There is no router library. The app uses **path-based URL encoding** for state sharing:

- `/10.0.0.0/16` — Calculator mode
- `/10.0.0.0/16?split=24~Web,25~API` — Splitter mode with labels
- `/super?nets=10.0.0.0/24,10.0.1.0/24` — Supernet mode

The `useUrlSync` hook migrates legacy hash URLs on mount, reads the current path to restore state, and writes URL changes on state updates using `history.replaceState()` (no navigation events).

See [URL Sharing](url-sharing.md) for the full specification.

## Deployment

Deployed to **Cloudflare Workers** via GitHub Actions (`.github/workflows/deploy.yml`). The `wrangler.jsonc` config uses `single-page-application` not-found handling so all paths serve `index.html`, which is critical for path-based routing.
