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

subnet.fit is a client-side-only CIDR/subnet calculator. All computation happens in the browser — there is no backend.

### Layers

- **`src/lib/`** — Pure calculation functions (zero React). IPv4 parsing, CIDR math, subnet splitting, binary representations, cloud provider constraints, RFC range detection, IaC export formatters, and URL hash codec. All IPv4 math uses 32-bit unsigned integers with `>>> 0`.
- **`src/store/`** — Zustand stores. `calculator-store.ts` holds all app state (active tab, calculator result, splitter allocations, supernet inputs). `theme-store.ts` persists dark/light mode to localStorage.
- **`src/hooks/`** — Side-effect hooks. `use-url-sync.ts` syncs store ↔ URL hash bidirectionally. `use-keyboard-shortcuts.ts` handles `/` to focus, arrows to adjust prefix. `use-clipboard.ts` wraps clipboard API with feedback state.
- **`src/components/`** — UI organized by feature domain: `calculator/`, `splitter/`, `visual-map/`, `cloud/`, `tools/`, `export/`, `shared/`, `layout/`.

### Routing

No router library. The app uses **hash-based URL encoding** for tab state and shareability:
- Calculator: `#10.0.0.0/16`
- Splitter: `#split:10.0.0.0/16:24~Label,25~Other`
- Supernet: `#super:10.0.0.0/24,10.0.1.0/24`

Encoding/decoding is in `src/lib/url-codec.ts`. The `useUrlSync` hook reads the hash on mount and writes it on state changes.

### State Flow

`App.tsx` → `useUrlSync()` initializes store from hash → Zustand store drives all components → store changes trigger hash updates.

### Tailwind CSS v4

Uses `@tailwindcss/vite` plugin (not PostCSS). Dark mode requires this custom variant in `src/index.css`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

The `dark` class is toggled on `<html>` by the theme store. Custom theme colors are defined with `@theme` in `index.css` (network-bit cyan, host-bit amber, cloud provider brand colors).

### Path Alias

`@/*` maps to `./src/*` — configured in both `vite.config.ts` and `tsconfig.app.json`.

### Key Types

- `CidrResult` (in `src/lib/cidr.ts`) — Full parsed CIDR with network/broadcast addresses, masks, host counts, IP class, RFC type, cloud context.
- `SubnetSplit` (in `src/lib/subnet-math.ts`) — A single allocated subnet within a splitter session, with CIDR, label, color, and host info.
- `UrlState` (in `src/lib/url-codec.ts`) — Serializable state for hash encoding (mode, cidr, splits, labels).

### Export Formats

`src/lib/export.ts` generates JSON, CSV, Terraform HCL, Pulumi TypeScript, and CloudFormation JSON from calculator results.
