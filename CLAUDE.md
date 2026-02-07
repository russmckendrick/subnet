# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Vite dev server (localhost:5173)
pnpm build        # TypeScript type-check + Vite production build
pnpm lint         # ESLint with flat config
pnpm preview      # Preview production build
```

No test framework is currently configured.

## Architecture

subnet.fit is a client-side-only CIDR/subnet calculator. All computation happens in the browser — there is no backend. The only external API call is the optional RDAP lookup against `rdap.org` for public IP registration data.

### Layers

- **`src/lib/`** — Pure calculation functions (zero React). IPv4 parsing, CIDR math, subnet splitting, binary representations, cloud provider constraints, RFC range detection, RDAP response parsing (`rdap.ts`) and caching (`rdap-cache.ts`), IaC export formatters, URL path codec, and centralised app configuration (`config.ts`). All IPv4 math uses 32-bit unsigned integers with `>>> 0`.
- **`src/store/`** — Zustand stores. `calculator-store.ts` holds all app state (active tab, calculator result, splitter allocations, supernet inputs, input mode, command palette open state). `designer-store.ts` holds diagram state (nodes, edges, palette, selection, multi-selection, export modal, node color updates, localStorage persistence). `theme-store.ts` persists dark/light mode to localStorage. Calculator and theme stores read defaults from `config.ts`.
- **`src/hooks/`** — Side-effect hooks. `use-url-sync.ts` syncs store ↔ URL path bidirectionally (with legacy hash migration). `use-designer-url-sync.ts` reads `?from=` and `&split=` params on `/designer` route and initializes the diagram canvas. `use-keyboard-shortcuts.ts` handles `/` to open command palette, arrows to adjust prefix when input focused. `use-clipboard.ts` wraps clipboard API with feedback state. `use-rdap-lookup.ts` fetches RDAP data for public IPs with debounce, abort, and caching. `use-diagram-persistence.ts` auto-saves/loads designer state to/from localStorage with 1s debounce. `use-designer-shortcuts.ts` handles Escape (deselect/close), Cmd+E (export modal), Cmd+S (manual save) in designer.
- **`src/components/`** — UI organized by feature domain: `calculator/`, `splitter/`, `designer/`, `visual-map/`, `cloud/`, `whois/`, `tools/`, `export/`, `command-palette/`, `shared/`, `layout/`.

### Routing

No router library. The app uses **path-based URL encoding** for state and shareability:
- Calculator: `/10.0.0.0/16`
- Splitter: `/10.0.0.0/16?split=24~Web,25~API`
- Supernet: `/super?nets=10.0.0.0/24,10.0.1.0/24`
- Designer: `/designer` or `/designer?from=10.0.0.0/16&split=24~Web,25~API`

Encoding/decoding is in `src/lib/url-codec.ts`. The `useUrlSync` hook migrates legacy hash URLs on mount, reads the path, and writes it on state changes via `history.replaceState()`. The designer route is detected in `App.tsx` via `pathname.startsWith('/designer')` and renders `<DesignerPage>` instead of the calculator layout.

### State Flow

`App.tsx` checks pathname — if `/designer`, renders `<DesignerPage>` (separate React Flow canvas); otherwise renders the calculator `<Layout>`. Calculator: `useUrlSync()` migrates legacy hash URLs then initializes store from path → Zustand store drives all components → store changes trigger URL path updates. Designer: `useDesignerUrlSync()` reads `?from=` and `&split=` params → `generateInitialLayout()` creates nodes/edges → `designer-store` drives React Flow canvas.

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

**Cloud provider colors** map to Solarized: AWS → Orange `#cb4b16`, Azure → Blue `#268bd2`, GCP → Violet `#6c71c4`.

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

### Command Palette

`src/lib/commands.ts` defines the `Command` interface and a static list of ~22 commands across 4 categories (Navigate, Tools, Export, Actions). `filterCommands()` filters by label/description/keywords. `detectCidrInput()` detects CIDR input in the search query and returns a normalised CIDR string. The `CommandPalette` component (`src/components/command-palette/`) is a modal overlay triggered by pressing `/` (outside inputs) or clicking the header button. It supports keyboard navigation (arrows, Enter, Escape), CIDR auto-detection, and grouped results. Export commands with `requiresResult: true` are hidden when no CIDR is loaded. The `inputMode` state (`'guided' | 'cidr'`) lives in the calculator store and is shared between `CidrInput` and the command palette's mode-switching commands.

### Export Formats

`src/lib/export.ts` generates JSON, CSV, and Terraform HCL (AWS, Azure, GCP). `src/lib/export-cli.ts` generates CLI commands (AWS CLI, Azure CLI, gcloud). `src/lib/export-diagram.ts` generates PNG, SVG, JSON, and draw.io XML from designer diagrams. `src/lib/syntax-highlight.ts` provides regex-based tokenization for `hcl`, `json`, `shell`, `csv`, and `xml` with Solarized colors. The export UI uses two-tier tabs (Data, CLI, Terraform, Share) with provider selector for CLI/Terraform categories.

### Network Designer (v2)

The designer at `/designer` includes:
- **Properties Panel** — Right-side `<Drawer>` for editing selected node (label, color for subnets, label for resources). Opens on node selection, closes on Escape/deselect.
- **Custom Edges** — `NetworkEdge` component using `getSmoothStepPath` with Solarized cyan stroke, width changes on selection.
- **Arrange Tools** — `ArrangeToolbar` dropdown with auto-layout (hierarchical BFS), align (6 directions for 2+ selected nodes), and distribute (horizontal/vertical for 3+ selected). Pure layout functions in `src/lib/diagram-arrange.ts`.
- **Export** — `DiagramExportModal` with Image (PNG/SVG via `html-to-image`), JSON, and draw.io XML tabs. XML syntax highlighting support.
- **Persistence** — Auto-saves to `localStorage` key `subnet-designer-state` with 1s debounce. Loads on mount if no URL params. `clearDiagram` also clears storage.
- **Keyboard Shortcuts** — `Escape` (deselect/close modal), `Cmd/Ctrl+E` (toggle export), `Cmd/Ctrl+S` (save to localStorage).
- **Floating Toolbar** — Bottom-center bar with Fit View, Export, Save, and Clear buttons.

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
