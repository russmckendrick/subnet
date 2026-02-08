# Features Guide

subnet.fit provides four main tabs — Calculator, Splitter, Supernet, and Reference — plus cross-cutting features like cloud provider context, IaC export, keyboard shortcuts, theming, and shareable URLs.

## Calculator Tab

The default view. Enter any IPv4 address in CIDR notation (e.g. `10.0.0.0/16`) to see a full breakdown.

### CIDR Input

Two input modes, toggled via an inline Guided/CIDR switch at the trailing edge of the input row:

- **Guided mode** (default) — Separate IP address field and prefix length dropdown, ideal for interactive exploration. When a valid IP is entered, the prefix dropdown auto-adjusts based on the IP's trailing-zero structure (e.g. `10.0.0.0` → `/8`, `192.168.1.0` → `/24`, `8.8.8.8` → `/32`). The user can always override the inferred prefix via the dropdown.
- **CIDR mode** — Single free-text field accepting full CIDR notation (e.g. `10.0.0.0/16`). Bare IPs without a prefix are also accepted and use the same smart prefix inference.

Both modes support:
- Smart prefix defaulting from trailing-zero structure when no explicit prefix is provided
- Real-time parsing and validation with green/red border feedback
- `↑↓` arrow keys while focused to increment/decrement the prefix length
- `/` from anywhere to focus the input
- The default input mode is configurable via `config.defaultInputMode`

### Results Panel

Displays eight information cards:

| Card | Description |
|------|-------------|
| Network Address | The first address in the range (e.g. `10.0.0.0`) |
| Broadcast Address | The last address in the range (e.g. `10.0.255.255`) |
| Netmask | The subnet mask (e.g. `255.255.0.0`) |
| Wildcard Mask | Inverse of the netmask (e.g. `0.0.255.255`) |
| First Host | First usable host address |
| Last Host | Last usable host address |
| Total Addresses | Total IPs in the range (2^(32-prefix)) |
| Usable Hosts | Total minus network and broadcast (except /31 and /32) |

Additional metadata shown: IP class (A–E), private/public status, and RFC type (e.g. RFC 1918).

### Binary Breakdown

Visual representation of the IP address in binary, with each bit color-coded:
- **Blue** bits = network portion (determined by prefix length)
- **Magenta** bits = host portion

Bits are grouped into four octets separated by dots, matching dotted-decimal notation.

### RDAP / WHOIS Lookup

For public IP addresses, an expandable RDAP section queries the `rdap.org` bootstrap server to display registration data:

- **RIR** — Which Regional Internet Registry manages the allocation (ARIN, RIPE NCC, APNIC, LACNIC, AFRINIC)
- **Country** — Country code of the allocation
- **Network Name** — The registered network name (e.g. `GOOGLE`)
- **Organization** — Registrant organization name and handle
- **Allocated Range** — The CIDR block allocated by the RIR
- **Start/End Address** — Boundaries of the allocated range
- **Registration & Last Updated** — Dates from the RDAP record

For reserved/private addresses (RFC 1918, loopback, link-local, CGNAT, multicast, etc.) the section shows a muted message instead of making an API call.

Results are cached in-memory and localStorage (24h TTL, max 100 entries) for instant repeat lookups. A 500ms debounce prevents excessive requests during typing.

### Cloud Provider Context

Shows how the current subnet would behave on each major cloud provider:

- **AWS** — 5 reserved addresses (.0 network, .1 VPC router, .2 DNS, .3 future use, .255 broadcast). Valid prefix range: /16–/28.
- **Azure** — 5 reserved addresses (.0 network, .1 default gateway, .2–.3 DNS mapping, .255 broadcast). Valid prefix range: /8–/29.
- **GCP** — 4 reserved addresses (.0 network, .1 default gateway, second-to-last and last for broadcast). Valid prefix range: /8–/29.

Each provider card shows usable hosts after reserved addresses are subtracted, and warns if the prefix is outside the provider's allowed range.

### Address Space Visualization

A proportional visual map of the subnet showing address space distribution. Displays a gradient bar from the network address (blue) to the broadcast address (magenta) with sub-block grid and legend.

This section is only visible when no subnet splits are allocated — when splits exist, the visualization is integrated directly into the Subnet Splitting section below to avoid duplication.

### Export Menu

Generate infrastructure-as-code and data exports:

Two-tier navigation organizes exports into four categories:

**Data** — JSON and CSV formats:
| Format | Output |
|--------|--------|
| JSON | Structured object with all CIDR properties and optional subnets |
| CSV | Property/value pairs, or subnet table when splits are present |

**CLI** — Cloud provider CLI commands (AWS, Azure, GCP):
| Provider | Commands |
|----------|----------|
| AWS CLI | `aws ec2 create-vpc` + `create-subnet` per split |
| Azure CLI | `az network vnet create` + `subnet create` per split |
| gcloud | `gcloud compute networks create` + `subnets create` per split |

**Terraform** — Multi-cloud HCL (AWS, Azure, GCP):
| Provider | Resources |
|----------|-----------|
| AWS | `aws_vpc` + `aws_subnet` |
| Azure | `azurerm_resource_group` + `azurerm_virtual_network` + `azurerm_subnet` |
| GCP | `google_compute_network` + `google_compute_subnetwork` |

**Share** — Enhanced URL card with color-coded URL breakdown, state badges, copy button, and QR code.

Code blocks use Solarized syntax highlighting. CLI commands render in a macOS-style terminal frame. For IaC and CLI formats, subnet labels are sanitized to valid identifiers.

## Splitter Tab

Divide a parent network into sequentially allocated subnets.

### Parent Network Input

Enter the parent CIDR (e.g. `10.0.0.0/16`) that will contain all child subnets.

### Adding Subnets

Select a prefix length from the available options. Only prefix lengths that fit in the remaining space are offered. Each new subnet is allocated sequentially, aligned to proper subnet boundaries.

### Labels

Each subnet gets an editable label (defaults to "Subnet 1", "Subnet 2", etc.). Labels are preserved in shareable URLs.

### Visualization

A proportional bar visualization (h-16) shows each subnet's relative size within the parent network, color-coded per subnet. Each segment displays the subnet label (when wide enough), prefix length, and address count. Hovering reveals a detailed tooltip with CIDR, address range, usable host count, and percentage of parent space. Remaining unallocated space is shown with a striped pattern.

When splits are present, the separate "Address Space Visualization" collapsible in the details section is hidden, so all visualization is consolidated in this single section.

### Allocation Table

Displays each subnet's CIDR, network/broadcast addresses, host range, size, and usable host count.

### Detail Cards

Below the allocation table, a responsive grid of summary cards shows each subnet's label, CIDR, usable host count, and percentage of the parent space. An "Unallocated" card with a dashed border appears when space remains.

## Supernet Tab

Find the smallest CIDR that contains all provided networks.

### Input

Enter one CIDR per line (minimum two). Each line is validated independently — invalid entries show per-line errors.

### Result

Displays the smallest single CIDR block that encompasses all input CIDRs. Useful for route aggregation and summarization.

## Reference Tab

A collapsible lookup table covering every prefix length from /0 to /32.

Each row shows:
- Prefix length (e.g. `/24`)
- Netmask (e.g. `255.255.255.0`)
- Wildcard mask (e.g. `0.0.0.255`)
- Total addresses
- Usable hosts

## Network Designer

A visual drag-and-drop network topology editor at `/designer`. See the [full Network Designer documentation](network-designer.md) for architectural details.

### Canvas

The React Flow canvas supports:
- Panning and zooming with mouse/trackpad
- Multi-node selection with Shift+click or drag selection
- Node deletion with Delete/Backspace keys
- Node-to-node connections by dragging between handles with 20px snap radius
- Drag-and-drop from the resource palette to add new nodes
- Tap-to-place mode on touch devices (iPad) — tap a palette item, then tap the canvas
- MiniMap for navigation and zoom controls
- Container nodes (VPC, Subnet) are resizable when selected via drag handles

### Node Types

Two node types are available:

- **Subnet Nodes** — Represent network subnets with CIDR notation, label, color bar, host count, and network address
- **Resource Nodes** — Represent network infrastructure (routers, switches, firewalls, servers, databases, load balancers, internet gateways, VPCs, cloud resources) with icons and labels. Cloud provider icons (Azure: 24, AWS: 18, GCP: 17) are auto-generated from official SVGs via `pnpm generate-icons` — Azure uses multicolor gradient icons, while AWS/GCP use stroke-based placeholders until official SVGs are added

### Layer System

Toggle between viewing modes using the segmented control in the header or keyboard shortcuts:
- **All** (key `1`) — All nodes visible and interactive
- **Infrastructure** (key `2`) — Containers (VPC, Subnet) active; resources dimmed and non-interactive
- **Resources** (key `3`) — Resources active; containers dimmed and non-interactive

### Properties Panel

Click any node to open an inline right sidebar (not an overlay) for editing. The panel includes a Delete Node button in the footer:
- **Subnet nodes** — View CIDR (read-only), edit label, change color via an 8-swatch Solarized accent picker, view host count and network/broadcast addresses
- **Resource nodes** — View icon and type (read-only), edit label. Resource type labels are centralised in `src/lib/resource-labels.ts` for easy editing without touching component code

### Arrange Tools

The "Arrange" dropdown in the header provides:
- **Auto Layout** — Rearranges all nodes into a hierarchical layout using BFS from root nodes, placed in a 3-column grid
- **Align** (2+ nodes selected) — Snap selected nodes to left, right, top, bottom, center-horizontal, or center-vertical
- **Distribute** (3+ nodes selected) — Space selected nodes evenly along horizontal or vertical axis

### Export

Export the diagram in four formats via the export modal (header button, floating toolbar, or `Cmd/Ctrl+E`):
- **PNG** — High-resolution (2x pixel ratio) raster image with theme-appropriate background
- **SVG** — Vector image
- **JSON** — Structured data with all node positions, data, and edge connections
- **draw.io** — High-fidelity XML file compatible with draw.io / diagrams.net, with rich HTML labels (provider badges, CIDR, host counts), embedded SVG cloud resource icons, and provider-specific container styling

### Persistence

Diagrams are auto-saved to localStorage with a 1-second debounce. On return to `/designer` (without URL parameters), the last saved diagram is restored automatically. Manual save is available via `Cmd/Ctrl+S` or the floating toolbar save button.

### Auto-Generation from Splitter

Navigate to `/designer?from=10.0.0.0/16&split=24~Web,25~API` to auto-generate a diagram with:
- Internet Gateway node at the top
- VPC node with the parent CIDR
- Subnet nodes in a 3-column grid, connected to the VPC

URL parameters take precedence over localStorage.

### Bidirectional State-Preserving Navigation

All navigation links between the calculator and designer preserve state, enabling seamless round-trips:

- **Calculator → Designer**: The "Designer" link in the Header, the "Open Designer" command in the command palette, and the "Open in Designer" button in the SplitterToolbar always carry the current CIDR and splits as `?from=` and `&split=` URL parameters. When a saved diagram exists with the same VPC CIDR, `useDesignerUrlSync` **merges** new subnets into the existing diagram — preserving all existing nodes, resources, positions, and edges. If no saved diagram exists or the CIDR differs, a fresh layout is generated.
- **Designer → Calculator**: The logo, "Calculator" button, and mobile fallback link all extract the current CIDR from the VPC container node and subnet splits from subnet container nodes, encoding them into a calculator URL (e.g. `/10.0.0.0/16?split=24~Web,25~API`).
- **Empty state**: When no CIDR is loaded in the calculator, the designer link goes to bare `/designer`. When the designer has no VPC node, the back link goes to bare `/`.

### Floating Toolbar

A compact bar at the bottom-center of the canvas with:
- **Fit View** — Centers and scales to fit all nodes
- **Export** — Opens the export modal
- **Save** — Manual save to localStorage
- **Clear** — Removes all nodes, edges, and saved data

## Keyboard Shortcuts

### Calculator Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| `/` | Anywhere (not in an input) | Focus the CIDR input and select all text |
| `↑` | CIDR input focused | Increment prefix length by 1 (max 32) |
| `↓` | CIDR input focused | Decrement prefix length by 1 (min 0) |
| `Escape` | CIDR input focused | Blur the input |

### Designer Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| `Escape` | Designer | Close export modal (if open), otherwise deselect all nodes |
| `Cmd/Ctrl+E` | Designer | Toggle the export modal |
| `Cmd/Ctrl+S` | Designer | Save diagram to localStorage |
| `1` | Designer | Switch to All layers |
| `2` | Designer | Switch to Infrastructure layer |
| `3` | Designer | Switch to Resources layer |
| `Delete` / `Backspace` | Designer, node selected | Delete the selected node(s) |

## Dark/Light Mode

- Toggle via the sun/moon button in the header
- Detection cascade: localStorage → `config.defaultTheme` (resolved via system preference when set to `'system'`)
- Persisted to `localStorage` under a key defined by `config.themeStorageKey`
- Applied by toggling the `dark` class on `<html>`

## Shareable URLs

State is encoded in the URL path and query string, making every configuration shareable by copying the URL. Legacy hash-based URLs are automatically redirected to the new format on load.

| Mode | Format | Example |
|------|--------|---------|
| Calculator | `/<cidr>` | `/10.0.0.0/16` |
| Calculator (bare IP) | `/<ip>` | `/8.8.8.8` (infers `/32`) |
| Splitter | `/<cidr>?split=<prefix~label,...>` | `/10.0.0.0/16?split=24~Web,25~API` |
| Supernet | `/super?nets=<cidr>,<cidr>,...` | `/super?nets=10.0.0.0/24,10.0.1.0/24` |

Bare IP URLs are normalized on load to include the inferred prefix (e.g. `/10.0.0.0` → `/10.0.0.0/8`). See [URL Sharing](url-sharing.md) for the full specification.

## OpenGraph & Social Previews

Shared links display rich previews on Twitter, Slack, LinkedIn, Discord, and other platforms. A Cloudflare Worker generates dynamic OG images and meta tags for every page:

| Page | OG Image | Title |
|------|----------|-------|
| Homepage | Logo + feature pills | subnet.fit — CIDR Calculator & Network Planner |
| CIDR (`/10.0.0.0/24`) | CIDR + network details card | 10.0.0.0/24 — subnet.fit |
| Splitter (`/10.0.0.0/16?split=...`) | Parent CIDR + split rows | 10.0.0.0/16 Subnet Splitter — subnet.fit |
| Supernet (`/super?nets=...`) | Input networks list | Supernet Calculator — subnet.fit |
| Designer (`/designer`) | Cloud provider tagline | Network Designer — subnet.fit |

OG images are 1200x630 PNGs rendered on-the-fly using satori + resvg-wasm, cached for 7 days. The page `<title>` is also updated client-side via `useDocumentTitle()`.
