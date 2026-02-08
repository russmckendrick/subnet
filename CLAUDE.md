# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start Vite dev server (localhost:5173)
pnpm build            # TypeScript type-check + Vite production build
pnpm lint             # ESLint with flat config
pnpm preview          # Preview production build
pnpm generate-icons   # Regenerate TSX icon components from SVGs (all providers, or pass provider name)
```

No test framework is currently configured.

## Documentation

See the [`docs/`](docs/) folder for detailed documentation:

- [Features Guide](docs/features.md) — Walkthrough of every feature
- [Architecture](docs/architecture.md) — Layers, data flow, component hierarchy
- [Calculation Engine](docs/calculation-engine.md) — IPv4 math, CIDR parsing, subnet allocation
- [State Management](docs/state-management.md) — Zustand stores, actions, URL sync
- [Styling & Theming](docs/styling.md) — Tailwind v4, dark mode, custom theme tokens
- [URL Sharing](docs/url-sharing.md) — Path-based URL format, state persistence, legacy hash migration
- [Development Guide](docs/development.md) — Setup, tooling, adding new features

## Architecture

subnet.fit is a client-side-only CIDR/subnet calculator. All computation happens in the browser — there is no backend. The only external API call is the optional RDAP lookup against `rdap.org` for public IP registration data.

### Layers

- **`src/lib/`** — Pure calculation functions (zero React). IPv4 parsing, CIDR math, subnet splitting, binary representations, cloud provider constraints, RFC range detection, RDAP response parsing (`rdap.ts`) and caching (`rdap-cache.ts`), IaC export formatters, URL path codec, resource type labels (`resource-labels.ts`), centralised app configuration (`config.ts`), draw.io icon registry (`drawio-icons.ts`), raw SVG string maps (`drawio-svg-strings/`), named diagram saves (`diagram-saves.ts`), and designer state extraction (`designer-state-extract.ts`) for extracting CIDR/splits from diagram nodes. All IPv4 math uses 32-bit unsigned integers with `>>> 0`.
- **`src/store/`** — Zustand stores. `calculator-store.ts` holds all app state (active tab, calculator result, splitter allocations, supernet inputs, input mode, command palette open state). `designer-store.ts` holds diagram state (nodes, edges, palette, selection, multi-selection, export modal, node color updates, localStorage persistence, cloud provider, `activeLayer` for layer filtering, `pendingDrop` for touch tap-to-place). Node data types: `SubnetNodeData`, `ResourceNodeData` (legacy flat), `VpcContainerNodeData`, `SubnetContainerNodeData`, `CloudResourceNodeData` (cloud containment). `theme-store.ts` persists dark/light mode to localStorage. Calculator and theme stores read defaults from `config.ts`.
- **`src/hooks/`** — Side-effect hooks. `use-url-sync.ts` syncs store ↔ URL path bidirectionally (with legacy hash migration). `use-designer-url-sync.ts` reads `?from=`, `&split=`, and `&provider=` params on `/designer` route and initializes the diagram canvas. `use-calculator-href.ts` returns a calculator URL from designer state via `extractDesignerState()` and `encodeState()`, enabling state-preserving back-navigation from designer to calculator. `use-keyboard-shortcuts.ts` handles `/` to open command palette, arrows to adjust prefix when input focused. `use-clipboard.ts` wraps clipboard API with feedback state. `use-rdap-lookup.ts` fetches RDAP data for public IPs with debounce, abort, and caching. `use-diagram-persistence.ts` auto-saves/loads designer state to/from localStorage with 1s debounce, runs migration from v1→v2 on load. `use-designer-shortcuts.ts` handles Escape (deselect/close), Cmd+E (export modal), Cmd+S (manual save), 1/2/3 (layer switching) in designer. `use-touch-detect.ts` detects touch devices for tap-to-place mode.
- **`src/components/`** — UI organized by feature domain: `calculator/`, `splitter/`, `designer/`, `visual-map/`, `cloud/`, `whois/`, `tools/`, `export/`, `command-palette/`, `shared/`, `layout/`.

### Routing

No router library. The app uses **path-based URL encoding** for state and shareability:
- Calculator: `/10.0.0.0/16`
- Splitter: `/10.0.0.0/16?split=24~Web,25~API`
- Supernet: `/super?nets=10.0.0.0/24,10.0.1.0/24`
- Designer: `/designer` or `/designer?from=10.0.0.0/16&split=24~Web,25~API&provider=aws`

Encoding/decoding is in `src/lib/url-codec.ts`. The `useUrlSync` hook migrates legacy hash URLs on mount, reads the path, and writes it on state changes via `history.replaceState()`. The designer route is detected in `App.tsx` via `pathname.startsWith('/designer')` and renders `<DesignerPage>` instead of the calculator layout.

### State Flow

`App.tsx` checks pathname — if `/designer`, renders `<DesignerPage>` (separate React Flow canvas); otherwise renders the calculator `<Layout>`. Calculator: `useUrlSync()` migrates legacy hash URLs then initializes store from path → Zustand store drives all components → store changes trigger URL path updates. Designer: `useDesignerUrlSync()` reads `?from=` and `&split=` params → `generateInitialLayout()` creates nodes/edges → `designer-store` drives React Flow canvas. Navigation between views is bidirectional and state-preserving: the Header and command palette build designer URLs from calculator store state (`?from=&split=`) only when no saved diagram exists in localStorage (to avoid overwriting user-added resources); otherwise they link to bare `/designer` so persistence restores the full diagram. `DesignerHeader` and the mobile fallback use `useCalculatorHref()` to build calculator URLs from diagram nodes. The SplitterToolbar "Open in Designer" always carries params as an explicit "generate new diagram" action.

### Tailwind CSS v4

Uses `@tailwindcss/vite` plugin (not PostCSS). Dark mode requires this custom variant in `src/index.css`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

The `dark` class is toggled on `<html>` by the theme store. The visual design uses the **Solarized** color system with custom theme colors defined in `@theme` in `index.css`.

### Design System — "Obsidian" / Solarized

**Typography:**
- **Display/UI**: Schibsted Grotesk (Google Fonts)
- **Monospace/Data**: Martian Mono (Google Fonts)

**Solarized palette (applied via hardcoded hex values in Tailwind classes):**

| Role | Dark mode | Light mode |
|------|-----------|------------|
| Background | `#002b36` (base03) | `#fdf6e3` (base3) |
| Card/Surface | `#073642` (base02) | `#eee8d5` (base2) |
| Secondary content | `#586e75` (base01) | `#93a1a1` (base1) |
| Body text | `#839496` (base0) | `#657b83` (base00) |
| Emphasized text | `#93a1a1` (base1) | `#586e75` (base01) |

**Accent colors (same in both modes):**
- Primary/links: Cyan `#2aa198`
- Network bits: Blue `#268bd2`
- Host bits: Magenta `#d33682`
- Valid/success: Green `#859900`
- Error: Red `#dc322f`
- Warnings: Yellow `#b58900`
- Secondary: Violet `#6c71c4`
- Tertiary: Orange `#cb4b16`

**Cloud provider colors** (used in designer container borders): AWS → Orange `#FF9900`, Azure → Blue `#0078D4`, GCP → Blue `#4285F4`, Generic → Cyan `#2aa198`. Export/calculator clouds map to Solarized: AWS → Orange `#cb4b16`, Azure → Blue `#268bd2`, GCP → Violet `#6c71c4`.

**Visual treatment:** No glassmorphism or gradient orbs. Solid Solarized backgrounds with subtle CSS dot grid pattern. `rounded-lg` (8px) corners. Minimal shadows (near-zero in dark, subtle in light). Body backgrounds use `radial-gradient(circle, ... 1px, transparent 1px)` at 24px spacing.

### Path Alias

`@/*` maps to `./src/*` — configured in both `vite.config.ts` and `tsconfig.app.json`.

### Key Types

- `CidrResult` (in `src/lib/cidr.ts`) — Full parsed CIDR with network/broadcast addresses, masks, host counts, IP class, RFC type, cloud context.
- `SubnetSplit` (in `src/lib/subnet-math.ts`) — A single allocated subnet within a splitter session, with CIDR, label, color, and host info.
- `UrlState` (in `src/lib/url-codec.ts`) — Serializable state for path-based URL encoding (mode, cidr, splits, labels).
- `RdapResult` (in `src/lib/rdap.ts`) — Parsed RDAP registration data: network name, RIR, country, organization, allocated range, dates.
- `RdapLookupState` (in `src/lib/rdap.ts`) — Discriminated union: `idle | loading | success | error | private`.
- `Command` (in `src/lib/commands.ts`) — Command palette entry with id, label, description, category, keywords, icon, optional `requiresResult`, and action string.
- `CloudProvider` (in `src/lib/cloud-theme.ts`) — `'aws' | 'azure' | 'gcp' | 'generic'`.
- `ActiveLayer` (in `src/store/designer-store.ts`) — `'all' | 'infrastructure' | 'resources'`.
- `VpcContainerNodeData` (in `src/store/designer-store.ts`) — Container node for VPC/VNet with CIDR, label, cloudProvider.
- `SubnetContainerNodeData` (in `src/store/designer-store.ts`) — Dotted container for subnet with CIDR, label, color, hosts, cloudProvider.
- `CloudResourceNodeData` (in `src/store/designer-store.ts`) — Provider-aware resource icon node with resourceType, label, cloudProvider.
- `DesignerNodeData` (in `src/store/designer-store.ts`) — Union of all 5 node data types.
- `DiagramJsonData` (in `src/lib/export-diagram.ts`) — Validated JSON import structure: `{ nodes, edges, version, cloudProvider? }`.
- `SaveEntry` (in `src/lib/diagram-saves.ts`) — Named save manifest entry: id, name, createdAt, updatedAt, nodeCount, cloudProvider.
- `ExtractedDesignerState` (in `src/lib/designer-state-extract.ts`) — Extracted CIDR, splits (prefix + label), and cloud provider from designer diagram nodes.

### Command Palette

`src/lib/commands.ts` defines the `Command` interface and a static list of ~22 commands across 4 categories (Navigate, Tools, Export, Actions). `filterCommands()` filters by label/description/keywords. `detectCidrInput()` detects CIDR input in the search query and returns a normalised CIDR string. The `CommandPalette` component (`src/components/command-palette/`) is a modal overlay triggered by pressing `/` (outside inputs) or clicking the header button. It supports keyboard navigation (arrows, Enter, Escape), CIDR auto-detection, and grouped results. Export commands with `requiresResult: true` are hidden when no CIDR is loaded. The `inputMode` state (`'guided' | 'cidr'`) lives in the calculator store and is shared between `CidrInput` and the command palette's mode-switching commands.

### Export Formats

`src/lib/export.ts` generates JSON, CSV, and Terraform HCL (AWS, Azure, GCP). `src/lib/export-cli.ts` generates CLI commands (AWS CLI, Azure CLI, gcloud). `src/lib/export-diagram.ts` generates PNG (transparent, 2x), SVG (transparent), JSON (with `cloudProvider`), and draw.io XML from designer diagrams; `parseDiagramJson()` validates imported JSON structure; `compressDiagramState()`/`decompressDiagramState()` encode diagram state via `pako.deflateRaw` + base64url for share URLs (`?d=` param); `getShareUrl()` produces `/designer?d={compressed}` URLs; `getDiagramsNetUrl()` encodes draw.io XML via `pako.deflateRaw` + base64 into a `https://app.diagrams.net/#R{data}` URL for direct editing. `src/lib/diagram-saves.ts` provides named localStorage saves CRUD (`getSavedDiagrams`, `saveDiagram`, `loadSavedDiagram`, `deleteSavedDiagram`) with manifest at `subnet-designer-saves` and per-save at `subnet-designer-save-{id}`. `src/lib/syntax-highlight.ts` provides regex-based tokenization for `hcl`, `json`, `shell`, `csv`, and `xml` with Solarized colors. The export UI uses two-tier tabs (Data, CLI, Terraform, Share) with provider selector for CLI/Terraform categories. The draw.io export uses `html=1` rich labels for VPC containers (provider badge + label + CIDR) and subnet containers (color dot + label + CIDR + hosts badge), embedded SVG data URIs (`shape=image`) for cloud resource icons via `src/lib/drawio-icons.ts`, and `background="#002b36"` dark theme. The designer export/import modal (Image | Data | draw.io | Share tabs) offers transparent PNG/SVG export, JSON download/import with validation and migration, named localStorage saves with load/delete, draw.io download + open in diagrams.net, and compressed share URL generation. Raw SVG strings live in `src/lib/drawio-svg-strings/` — AWS and Azure are auto-generated by `pnpm generate-icons`, GCP and generic are hand-written.

### Network Designer (v3 — Cloud-First)

The designer at `/designer` uses **nested containment** to produce cloud-native architecture diagrams:

- **Cloud Provider System** — `CloudProvider` type (`'aws' | 'azure' | 'gcp' | 'generic'`). Theme system in `src/lib/cloud-theme.ts` maps each provider to border colors, styles, backgrounds. `CloudProviderSelector` segmented control switches providers, re-skinning all container nodes. Icon registry (`src/components/designer/icons/cloud-icon-registry.ts`) provides two-level lookup: provider-specific → generic fallback.
- **Container Nodes** — `VpcContainerNode` (large dashed/solid box), `SubnetContainerNode` (dotted box nested inside VPC), `CloudResourceNode` (icon+label inside subnet). All use React Flow `parentId` and `extent: 'parent'` for visual nesting. Container dimensions set via `style.width/height`.
- **Cloud Icons** — Auto-generated from official provider SVGs via `pnpm generate-icons` (see `scripts/generate-icons.mjs`). Source SVGs live in `icons/{provider}/`; generated TSX components are written to `src/components/designer/icons/{provider}/`. Azure has 24 multicolor gradient icons (18x18 viewBox, fill-based with `<defs>` gradients). AWS/GCP retain stroke-based placeholders until official SVGs are added. Each component accepts `{ className, color? }` props (`color` accepted for interface compat but unused by multicolor icons). Provider barrel exports in `index.ts` feed `{PROVIDER}_ICON_MAP` records.
- **Layout** — `generateCloudLayout()` in `src/lib/diagram-layout.ts` creates IGW → VPC container → subnet containers. `generateLegacyFlatLayout()` preserved for v1 backwards compat. `autoLayoutNested()` in `diagram-arrange.ts` handles BFS on top-level nodes + grid layout within containers.
- **Container-Aware Drop** — `DesignerCanvas.onDrop` checks `findContainerAtPoint()` from `src/lib/diagram-container.ts`, sets `parentId` and converts to parent-relative coordinates. Touch devices use tap-to-place: `PaletteItem` sets `pendingDrop` in store, `DesignerCanvas.onPaneClick` creates the node at the tapped position via `screenToFlowPosition()`.
- **Layer System** — `activeLayer` state (`'all' | 'infrastructure' | 'resources'`). `LayerToggle` segmented control in header. `DesignerCanvas` applies `layer-dimmed` className to nodes based on active layer. Keyboard shortcuts: `1`/`2`/`3`.
- **Container Resize** — `NodeResizer` from `@xyflow/react` on `VpcContainerNode` and `SubnetContainerNode`, visible when selected. Minimum sizes: VPC 300x200, Subnet 200x120.
- **Inline Properties Panel** — `PropertiesPanel` is an animated inline sidebar (320px, `motion/react` AnimatePresence) inside the flex row, not an overlay Drawer. Includes a Delete Node button in the footer.
- **Provider-Specific Palette** — `ResourcePalette` shows categorized resources per provider (Azure: 24, AWS: 18, GCP: 17, across Networking, Compute, Database, Storage & Security). Generic mode shows traditional network resources.
- **Properties Panels** — `VpcProperties`, `SubnetContainerProperties`, `CloudResourceProperties` panels with provider badges, in addition to legacy `SubnetProperties` and `ResourceProperties`. All resource type labels are centralised in `src/lib/resource-labels.ts` — edit that file to add/rename labels without touching component code.
- **Persistence** — Storage version 2 includes `cloudProvider`. Migration in `src/lib/diagram-migration.ts` converts v1 → v2 (adds `cloudProvider: 'generic'`). Old flat diagrams load intact.
- **Export / Import** — Modal with 4 tabs (Image, Data, draw.io, Share). Image exports transparent PNG/SVG. Data tab has JSON download/import (with validation via `parseDiagramJson`) and named localStorage saves (via `src/lib/diagram-saves.ts`). draw.io tab exports XML with `html=1` rich labels, embedded SVG data URIs, `curved=1` edge routing, and `background="#002b36"`. Share tab generates compressed `?d=` URLs via `compressDiagramState()`. Store action `importDiagram` loads external data with `isDirty: true`.
- **Custom Edges** — `NetworkEdge` component using `getSmoothStepPath` with Solarized cyan stroke, width changes on selection.
- **Arrange Tools** — `ArrangeToolbar` dropdown with auto-layout (hierarchical BFS + nested), align (6 directions for 2+ selected nodes), and distribute (horizontal/vertical for 3+ selected).
- **Keyboard Shortcuts** — `Escape` (deselect/close modal), `Cmd/Ctrl+E` (toggle export), `Cmd/Ctrl+S` (save to localStorage), `1`/`2`/`3` (layer switching).
- **Floating Toolbar** — Bottom-center bar with Fit View, Export, Save, and Clear buttons.
- **URL Params** — `?provider=aws|azure|gcp` sets cloud provider: `/designer?from=10.0.0.0/16&split=24~Web,25~API&provider=aws`. `?d={compressed}` loads a shared diagram (base64url-encoded pako-deflated JSON), handled by `useDesignerUrlSync` before `?from=` processing.
- **Bidirectional Navigation** — All navigation links between calculator and designer preserve state. Calculator → Designer: Header link and command palette build `/designer?from=&split=` from calculator store, but only when no saved diagram exists in localStorage (prevents overwriting user-added resources). SplitterToolbar "Open in Designer" always carries params. Designer → Calculator: `useCalculatorHref()` hook extracts CIDR and splits from diagram nodes via `extractDesignerState()` and encodes a calculator URL via `encodeState()`. Used by `DesignerHeader` back links and mobile fallback.

### Deployment

Deployed to **Cloudflare Workers** via GitHub Actions (`.github/workflows/deploy.yml`). Configuration in `wrangler.jsonc` uses `single-page-application` fallback so all paths serve `index.html`. Triggers on pushes to `main` and pull requests. Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub secrets.

## Post-Change Checklist

After making code changes, update the relevant documentation:

- **`docs/`** — Check `url-sharing.md`, `architecture.md`, `state-management.md`, `features.md`, `calculation-engine.md`, `development.md`
- **`README.md`** — Feature list, tech stack, deployment info
- **`CLAUDE.md`** — This file: architecture, routing, key types, design system

Keep mermaid diagrams in docs in sync with actual function and action names.

## Common Gotchas

- Don't use `require()` in Vite/ESM — use ES imports
- Unused variables cause TS build errors (strict mode)
- `motion/react` (not `framer-motion`) for animations
- Use hardcoded Solarized hex values (e.g. `text-[#2aa198]`), not Tailwind color names like `text-cyan-500`
- URL codec uses `encodeState`/`decodeState(pathname, search)`, `updateUrl`/`readUrl` — not hash-based functions
- Store action is `initFromUrl` (not `initFromHash`)
- Legacy hash URLs auto-redirect via `migrateHashUrl()` on mount
