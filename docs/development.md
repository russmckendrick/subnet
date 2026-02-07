# Development Guide

## Prerequisites

- **Node.js** — v18+ recommended
- **pnpm** — Package manager ([installation](https://pnpm.io/installation))

## Setup

```bash
git clone <repo-url>
cd subnet
pnpm install
pnpm dev
```

The dev server starts at `http://localhost:5173` with hot module replacement.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start Vite dev server with HMR |
| `build` | `tsc -b && vite build` | Type-check then build for production |
| `lint` | `eslint .` | Run ESLint with flat config |
| `preview` | `vite preview` | Serve the production build locally |

## Path Alias

The `@/` alias maps to `./src/` and is configured in two places:

**vite.config.ts:**
```typescript
resolve: {
  alias: {
    '@': '/src',
  },
}
```

**tsconfig.app.json:**
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

Use `@/lib/cidr` instead of `../../lib/cidr` in imports.

## TypeScript Configuration

Two tsconfig files:

### tsconfig.app.json (application code)
- Target: ES2022
- Strict mode enabled
- JSX: `react-jsx`
- Module resolution: `bundler`
- Additional strictness: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`

### tsconfig.node.json (build tooling)
- Target: ES2023
- Covers `vite.config.ts`
- Same strict settings

## ESLint Configuration

Uses the flat config format (`eslint.config.js`):

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
```

Plugins:
- `@eslint/js` — Base recommended rules
- `typescript-eslint` — TypeScript-aware linting
- `eslint-plugin-react-hooks` — Enforces Rules of Hooks
- `eslint-plugin-react-refresh` — Ensures components are HMR-compatible

## Project Structure

```
subnet/
├── public/                Static assets
├── src/
│   ├── lib/               Pure calculation functions (no React)
│   │   ├── config.ts        Centralised app defaults (CIDR, theme, input mode)
│   │   ├── ipv4.ts          IPv4 parsing and formatting
│   │   ├── cidr.ts          CIDR calculation (CidrResult)
│   │   ├── subnet-math.ts   Subnet splitting and supernet
│   │   ├── binary.ts        Binary bit representation
│   │   ├── cloud-providers.ts  AWS/Azure/GCP constraints
│   │   ├── rfc-ranges.ts    RFC special-purpose range detection
│   │   ├── constants.ts     Pre-computed reference table
│   │   ├── export.ts        JSON/CSV/Terraform (AWS/Azure/GCP) generators
│   │   ├── export-cli.ts    CLI command generators (AWS/Azure/GCP)
│   │   ├── export-diagram.ts  Diagram export (PNG/SVG/JSON/draw.io XML)
│   │   ├── syntax-highlight.ts  Regex-based syntax tokenizer (HCL/JSON/Shell/CSV/XML)
│   │   ├── url-codec.ts     URL path encoding/decoding
│   │   ├── diagram-layout.ts   Initial diagram layout from splitter data
│   │   └── diagram-arrange.ts  Auto-layout, align, distribute algorithms
│   ├── store/             Zustand state management
│   │   ├── calculator-store.ts  Main app state and actions
│   │   ├── designer-store.ts   Network diagram state and actions
│   │   └── theme-store.ts      Dark/light theme
│   ├── hooks/             React hooks for side effects
│   │   ├── use-url-sync.ts      Bidirectional URL path ↔ store sync (with legacy hash migration)
│   │   ├── use-designer-url-sync.ts  Designer URL param initialization
│   │   ├── use-diagram-persistence.ts  Auto-save/load to localStorage
│   │   ├── use-designer-shortcuts.ts  Designer keyboard shortcuts
│   │   ├── use-keyboard-shortcuts.ts  / focus, ↑↓ prefix, Escape blur
│   │   ├── use-clipboard.ts    Clipboard API with feedback state
│   │   └── use-rdap-lookup.ts  RDAP data fetch with debounce and caching
│   ├── components/        UI components by feature domain
│   │   ├── calculator/      CidrInput, ResultsPanel, BinaryBreakdown,
│   │   │                    SubnetInfoCard, QuickReference
│   │   ├── splitter/        SubnetSplittingSection (with integrated visualization)
│   │   ├── designer/        Network diagram editor (see below)
│   │   │   ├── nodes/         SubnetNode, ResourceNode, NodeLabel
│   │   │   ├── edges/         NetworkEdge (custom Solarized edge)
│   │   │   ├── panels/        SubnetProperties, ResourceProperties
│   │   │   ├── icons/         NetworkIcons (SVG icon components)
│   │   │   ├── DesignerPage, DesignerCanvas, DesignerHeader
│   │   │   ├── ResourcePalette, PaletteItem
│   │   │   ├── PropertiesPanel, ArrangeToolbar
│   │   │   ├── DiagramExportModal, FloatingToolbar
│   │   │   └── designer-theme.css
│   │   ├── visual-map/      SubnetMap (shown only when no splits exist)
│   │   ├── cloud/           CloudContext, ProviderCard
│   │   ├── whois/           RdapSection
│   │   ├── tools/           SupernetTool
│   │   ├── export/          ExportMenu, CodeBlock, TerminalFrame
│   │   ├── command-palette/  CommandPalette
│   │   ├── shared/          AnimatedCard, Badge, CollapsibleSection, CopyButton, Drawer, Tabs
│   │   └── layout/          Layout, Header, Footer
│   ├── App.tsx            Root component with tab routing
│   ├── main.tsx           Entry point (ReactDOM.createRoot)
│   └── index.css          Tailwind import, theme tokens, global styles
├── index.html             HTML shell
├── vite.config.ts         Vite + React + Tailwind plugins
├── tsconfig.json          Root tsconfig (references app + node)
├── tsconfig.app.json      Application TypeScript config
├── tsconfig.node.json     Build tooling TypeScript config
├── eslint.config.js       ESLint flat config
├── package.json           Dependencies and scripts
├── wrangler.jsonc         Cloudflare Workers deployment config
└── CLAUDE.md              AI assistant instructions
```

## Adding a New Feature

### 1. Calculation Logic → `src/lib/`

Add pure functions with no React dependencies. Follow existing patterns:
- Use 32-bit unsigned integers with `>>> 0` for all IPv4 math
- Export types and functions separately
- No side effects at module level (except lazy caching like `rfc-ranges.ts`)

### 2. State → `src/store/calculator-store.ts`

Add new state fields and actions to the `CalculatorState` interface:
- State fields go in the interface definition
- Actions go in the `create()` callback
- If the feature needs recalculation on change, follow the `recalcSplits` pattern

### 3. UI Components → `src/components/<domain>/`

Create a new directory under `components/` for the feature domain:
- Import from `@/store/calculator-store` to read state and call actions
- Import from `@/lib/` for any display formatting
- Use `AnimatedCard` from `shared/` for consistent card styling
- Use hardcoded Solarized hex values in Tailwind classes (e.g. `text-[#2aa198]`, `bg-[#073642]`) — see [Styling & Theming](../docs/styling.md) for the full palette
- Use `dark:` variants for theme support

### 4. Wire into App.tsx

- Add a new tab entry to the `TABS` array with an `id`, `label`, and `icon`
- Add the `id` value to the `AppTab` type union in `calculator-store.ts`
- Add a conditional render block for the new tab in the JSX

### 5. URL Sharing (optional)

If the feature should be shareable via URL:
1. Add a new mode to the `UrlState` type in `url-codec.ts`
2. Add encode/decode logic in `encodeState`/`decodeState`
3. Update the `useUrlSync` hook to handle the new mode
4. Update `initFromUrl` in the calculator store
5. Update documentation (`docs/`, `README.md`, `CLAUDE.md`) if applicable
