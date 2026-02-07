# subnet.fit

A client-side CIDR/subnet calculator and network planner. All computation happens in the browser — no backend required.

## Features

- **CIDR Calculator** — Parse any IPv4 CIDR notation and get network address, broadcast, netmask, wildcard mask, host range, IP class, RFC type, and binary representations
- **Subnet Splitter** — Divide a parent network into multiple subnets with custom prefix lengths and labels, with proportional visual mapping
- **Supernet Calculator** — Aggregate multiple CIDRs into the smallest containing supernet
- **Reference Table** — Collapsible lookup table for all prefix lengths (/0–/32) with masks, wildcards, and host counts
- **Cloud Provider Context** — See AWS, Azure, and GCP reserved addresses, prefix limits, and usable host calculations for any subnet
- **IaC Export** — Generate Terraform HCL, Pulumi TypeScript, CloudFormation JSON, plus JSON and CSV from calculator results
- **Keyboard Shortcuts** — `/` to focus input, `↑↓` to adjust prefix length, `Escape` to blur
- **Dark/Light Mode** — Toggle with system preference detection and localStorage persistence
- **Shareable URLs** — Hash-based encoding for calculator, splitter, and supernet state

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| State | Zustand 5 |
| Animation | Motion (Framer Motion) |
| Build | Vite 7 |

## Quick Start

```bash
git clone https://github.com/russmckendrick/subnet.git
cd subnet
pnpm install
pnpm dev          # http://localhost:5173
```

## Scripts

```bash
pnpm dev          # Start Vite dev server
pnpm build        # TypeScript type-check + Vite production build
pnpm lint         # ESLint with flat config
pnpm preview      # Preview production build
```

## Project Structure

```
src/
├── lib/            Pure calculation functions (zero React)
│   └── config.ts     Centralised app defaults (CIDR, theme, input mode)
├── store/          Zustand stores (calculator + theme)
├── hooks/          Side-effect hooks (URL sync, keyboard, clipboard)
├── components/     UI organized by feature domain
│   ├── calculator/   CIDR input, results, binary breakdown, reference
│   ├── splitter/     Subnet splitting interface
│   ├── visual-map/   Proportional subnet visualization
│   ├── cloud/        Cloud provider context cards
│   ├── tools/        Supernet calculator
│   ├── export/       IaC and data export menu
│   ├── shared/       Reusable components (tabs, cards, badges)
│   └── layout/       Header, footer, page layout
└── index.css       Tailwind config, theme tokens, global styles
```

## Documentation

See the [`docs/`](docs/) folder for detailed documentation:

- [Features Guide](docs/features.md) — Walkthrough of every feature
- [Architecture](docs/architecture.md) — Layers, data flow, component hierarchy
- [Calculation Engine](docs/calculation-engine.md) — IPv4 math, CIDR parsing, subnet allocation
- [State Management](docs/state-management.md) — Zustand stores, actions, URL sync
- [Styling & Theming](docs/styling.md) — Tailwind v4, dark mode, custom theme tokens
- [URL Sharing](docs/url-sharing.md) — Hash format, state persistence
- [Development Guide](docs/development.md) — Setup, tooling, adding new features
