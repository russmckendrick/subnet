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
| `lib/` | Pure functions. IPv4 parsing, CIDR math, subnet allocation, binary formatting, cloud provider logic, RFC detection, export formatting, URL encoding. Zero React imports. | None |
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
    Store->>URL: updateHash({ mode, cidr })
    URL-->>URL: history.replaceState()
```

On mount, the flow reverses — the URL hash is read first and used to initialize the store:

```mermaid
sequenceDiagram
    participant URL
    participant Hook
    participant Store
    participant Lib

    URL->>Hook: useUrlSync reads window.location.hash
    Hook->>Store: initFromHash(cidr, tab, splits, labels)
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
    Tabs["Tabs"]

    App --> Layout
    Layout --> Header
    Layout --> Footer
    App --> Tabs

    subgraph CalculatorTab["Calculator Tab"]
        CidrInput["CidrInput"]
        ResultsPanel["ResultsPanel"]
        BinaryBreakdown["BinaryBreakdown"]
        CloudContext["CloudContext"]
        SubnetMap["SubnetMap"]
        ExportMenu["ExportMenu"]
    end

    subgraph SplitterTab["Splitter Tab"]
        SubnetSplitter["SubnetSplitter"]
    end

    subgraph SupernetTab["Supernet Tab"]
        SupernetTool["SupernetTool"]
    end

    subgraph ReferenceTab["Reference Tab"]
        QuickReference["QuickReference"]
    end

    Tabs --> CalculatorTab
    Tabs --> SplitterTab
    Tabs --> SupernetTab
    Tabs --> ReferenceTab

    CloudContext --> ProviderCard["ProviderCard (x3)"]
    ResultsPanel --> SubnetInfoCard["SubnetInfoCard (x8)"]
```

## State Management

Two Zustand stores with no middleware:

- **`calculator-store`** — All app state: active tab, CIDR input/result, splitter allocations (parent CIDR, prefix list, labels, computed splits, remaining space, available prefixes), and supernet inputs/result.
- **`theme-store`** — Dark/light theme with localStorage persistence.

See [State Management](state-management.md) for the full state shape and action descriptions.

## URL Routing

There is no router library. The app uses hash-based URL encoding for state sharing:

- `#10.0.0.0/16` — Calculator mode
- `#split:10.0.0.0/16:24~Web,25~API` — Splitter mode with labels
- `#super:10.0.0.0/24,10.0.1.0/24` — Supernet mode

The `useUrlSync` hook reads the hash on mount to restore state, and writes it on state changes using `history.replaceState()` (no navigation events).

See [URL Sharing](url-sharing.md) for the full specification.
