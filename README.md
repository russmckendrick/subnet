<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/logo-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="public/logo-light.svg" />
    <img alt="subnet.fit" src="public/logo-dark.svg" width="280" />
  </picture>
</p>

<p align="center">A client-side CIDR/subnet calculator and network planner. All computation happens in the browser — no backend required.</p>

## Features

- **CIDR Calculator** — Parse any IPv4 CIDR notation and get network address, broadcast, netmask, wildcard mask, host range, IP class, RFC type, and binary representations
- **Subnet Splitter** — Divide a parent network into multiple subnets with custom prefix lengths and labels, with integrated proportional visualization bar and detail cards
- **Supernet Calculator** — Aggregate multiple CIDRs into the smallest containing supernet
- **Reference Table** — Collapsible lookup table for all prefix lengths (/0–/32) with masks, wildcards, and host counts
- **RDAP / WHOIS Lookup** — Query `rdap.org` for public IP registration data including RIR, country, organization, and allocated range (with in-memory + localStorage caching)
- **Cloud Provider Context** — See AWS, Azure, and GCP reserved addresses, prefix limits, and usable host calculations for any subnet
- **Export** — Data (JSON, CSV), CLI commands (AWS, Azure, GCP), Terraform HCL (AWS, Azure, GCP), and enhanced Share URL with QR code
- **Keyboard Shortcuts** — `/` to focus input, `↑↓` to adjust prefix length, `Escape` to blur
- **Dark/Light Mode** — Toggle with system preference detection and localStorage persistence
- **Shareable URLs** — Clean path-based URLs for calculator, splitter, and supernet state (with legacy hash URL migration)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| State | Zustand 5 |
| Animation | Motion (Framer Motion) |
| Build | Vite 7 |
| Hosting | Cloudflare Workers |

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
│   ├── splitter/     Subnet splitting with integrated visualization
│   ├── visual-map/   Address space visualization (calculator mode)
│   ├── cloud/        Cloud provider context cards
│   ├── whois/        RDAP / WHOIS lookup section
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
- [URL Sharing](docs/url-sharing.md) — Path-based URL format, state persistence, legacy hash migration
- [Development Guide](docs/development.md) — Setup, tooling, adding new features

## Deployment

The site is deployed to **Cloudflare Workers** via GitHub Actions. The workflow triggers on pushes to `main` and pull requests, running build + deploy automatically.

**Required GitHub secrets:**
- `CLOUDFLARE_API_TOKEN` — API token with Workers Scripts: Edit permission
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID

The `wrangler.jsonc` config uses `single-page-application` fallback so all paths (e.g. `/10.0.0.0/16`) serve `index.html`.
