# Features Guide

subnet.fit provides four main tabs — Calculator, Splitter, Supernet, and Reference — plus cross-cutting features like cloud provider context, IaC export, keyboard shortcuts, theming, and shareable URLs.

## Calculator Tab

The default view. Enter any IPv4 address in CIDR notation (e.g. `10.0.0.0/16`) to see a full breakdown.

### CIDR Input

Two input modes, toggled via an inline Guided/CIDR switch at the trailing edge of the input row:

- **Guided mode** (default) — Separate IP address field and prefix length dropdown, ideal for interactive exploration
- **CIDR mode** — Single free-text field accepting full CIDR notation (e.g. `10.0.0.0/16`)

Both modes support:
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

### Cloud Provider Context

Shows how the current subnet would behave on each major cloud provider:

- **AWS** — 5 reserved addresses (.0 network, .1 VPC router, .2 DNS, .3 future use, .255 broadcast). Valid prefix range: /16–/28.
- **Azure** — 5 reserved addresses (.0 network, .1 default gateway, .2–.3 DNS mapping, .255 broadcast). Valid prefix range: /8–/29.
- **GCP** — 4 reserved addresses (.0 network, .1 default gateway, second-to-last and last for broadcast). Valid prefix range: /8–/29.

Each provider card shows usable hosts after reserved addresses are subtracted, and warns if the prefix is outside the provider's allowed range.

### Subnet Map

A proportional visual map of the subnet showing address space distribution.

### Export Menu

Generate infrastructure-as-code and data exports:

| Format | Output |
|--------|--------|
| JSON | Structured object with all CIDR properties and optional subnets |
| CSV | Property/value pairs, or subnet table when splits are present |
| Terraform | AWS VPC + Subnet HCL resources |
| Pulumi | AWS VPC + Subnet TypeScript resources |
| CloudFormation | AWS VPC + Subnet JSON template |

For IaC formats, subnet labels are sanitized to valid identifiers (lowercase, alphanumeric, underscores).

## Splitter Tab

Divide a parent network into sequentially allocated subnets.

### Parent Network Input

Enter the parent CIDR (e.g. `10.0.0.0/16`) that will contain all child subnets.

### Adding Subnets

Select a prefix length from the available options. Only prefix lengths that fit in the remaining space are offered. Each new subnet is allocated sequentially, aligned to proper subnet boundaries.

### Labels

Each subnet gets an editable label (defaults to "Subnet 1", "Subnet 2", etc.). Labels are preserved in shareable URLs.

### Visualization

A proportional bar visualization shows each subnet's relative size within the parent network, color-coded per subnet. Remaining unallocated space is shown in grey.

### Allocation Table

Displays each subnet's CIDR, network/broadcast addresses, host range, size, and usable host count.

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

## Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| `/` | Anywhere (not in an input) | Focus the CIDR input and select all text |
| `↑` | CIDR input focused | Increment prefix length by 1 (max 32) |
| `↓` | CIDR input focused | Decrement prefix length by 1 (min 0) |
| `Escape` | CIDR input focused | Blur the input |

## Dark/Light Mode

- Toggle via the sun/moon button in the header
- Detection cascade: localStorage → `config.defaultTheme` (resolved via system preference when set to `'system'`)
- Persisted to `localStorage` under a key defined by `config.themeStorageKey`
- Applied by toggling the `dark` class on `<html>`

## Shareable URLs

State is encoded in the URL hash, making every configuration shareable by copying the URL.

| Mode | Format | Example |
|------|--------|---------|
| Calculator | `#<cidr>` | `#10.0.0.0/16` |
| Splitter | `#split:<cidr>:<prefix~label,...>` | `#split:10.0.0.0/16:24~Web,25~API` |
| Supernet | `#super:<cidr>,<cidr>,...` | `#super:10.0.0.0/24,10.0.1.0/24` |

See [URL Sharing](url-sharing.md) for the full specification.
