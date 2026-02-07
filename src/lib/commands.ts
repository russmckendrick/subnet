import { parseIPv4, parseIPv4WithCidr, ipv4ToString } from './ipv4'

export interface Command {
  id: string
  label: string
  description: string
  category: 'Navigate' | 'Tools' | 'Export' | 'Actions'
  keywords: string[]
  icon: 'globe' | 'book' | 'merge' | 'moon' | 'file' | 'code' | 'terminal' | 'link' | 'x' | 'reset' | 'toggle' | 'search' | 'terraform' | 'aws' | 'azure' | 'gcp'
  requiresResult?: boolean
  action: string
}

export const commands: Command[] = [
  // Navigate
  {
    id: 'focus-input',
    label: 'Focus Input',
    description: 'Focus the CIDR input field',
    category: 'Navigate',
    keywords: ['focus', 'input', 'type', 'search'],
    icon: 'search',
    action: 'focus-input',
  },
  {
    id: 'navigate:10.0.0.0/8',
    label: '10.0.0.0/8',
    description: 'RFC 1918 — Class A private network',
    category: 'Navigate',
    keywords: ['rfc1918', 'private', 'class a', '10'],
    icon: 'globe',
    action: 'navigate:10.0.0.0/8',
  },
  {
    id: 'navigate:172.16.0.0/12',
    label: '172.16.0.0/12',
    description: 'RFC 1918 — Class B private range',
    category: 'Navigate',
    keywords: ['rfc1918', 'private', 'class b', '172'],
    icon: 'globe',
    action: 'navigate:172.16.0.0/12',
  },
  {
    id: 'navigate:192.168.0.0/16',
    label: '192.168.0.0/16',
    description: 'RFC 1918 — Class C private range',
    category: 'Navigate',
    keywords: ['rfc1918', 'private', 'class c', '192.168'],
    icon: 'globe',
    action: 'navigate:192.168.0.0/16',
  },
  {
    id: 'navigate:192.168.1.0/24',
    label: '192.168.1.0/24',
    description: 'Common home network',
    category: 'Navigate',
    keywords: ['home', 'lan', 'common', '192.168.1'],
    icon: 'globe',
    action: 'navigate:192.168.1.0/24',
  },
  {
    id: 'navigate:10.0.0.0/16',
    label: '10.0.0.0/16',
    description: 'AWS default VPC CIDR',
    category: 'Navigate',
    keywords: ['aws', 'vpc', 'default', 'cloud'],
    icon: 'globe',
    action: 'navigate:10.0.0.0/16',
  },

  // Tools
  {
    id: 'open-reference',
    label: 'Open Reference',
    description: 'CIDR quick reference table',
    category: 'Tools',
    keywords: ['reference', 'table', 'cheatsheet', 'guide'],
    icon: 'book',
    action: 'open-reference',
  },
  {
    id: 'open-supernet',
    label: 'Open Supernet',
    description: 'Route aggregation / supernetting tool',
    category: 'Tools',
    keywords: ['supernet', 'aggregate', 'route', 'merge'],
    icon: 'merge',
    action: 'open-supernet',
  },
  {
    id: 'toggle-theme',
    label: 'Toggle Theme',
    description: 'Switch between dark and light mode',
    category: 'Tools',
    keywords: ['theme', 'dark', 'light', 'mode', 'appearance'],
    icon: 'moon',
    action: 'toggle-theme',
  },

  // Export (require result)
  {
    id: 'export:json',
    label: 'Export JSON',
    description: 'Copy subnet data as JSON',
    category: 'Export',
    keywords: ['json', 'export', 'copy', 'data'],
    icon: 'file',
    requiresResult: true,
    action: 'export:json',
  },
  {
    id: 'export:csv',
    label: 'Export CSV',
    description: 'Copy subnet data as CSV',
    category: 'Export',
    keywords: ['csv', 'export', 'copy', 'spreadsheet'],
    icon: 'file',
    requiresResult: true,
    action: 'export:csv',
  },
  {
    id: 'export:tf-aws',
    label: 'Terraform — AWS',
    description: 'Copy Terraform HCL for AWS VPC',
    category: 'Export',
    keywords: ['terraform', 'aws', 'hcl', 'infrastructure', 'iac'],
    icon: 'terraform',
    requiresResult: true,
    action: 'export:tf-aws',
  },
  {
    id: 'export:tf-azure',
    label: 'Terraform — Azure',
    description: 'Copy Terraform HCL for Azure VNet',
    category: 'Export',
    keywords: ['terraform', 'azure', 'hcl', 'infrastructure', 'iac'],
    icon: 'terraform',
    requiresResult: true,
    action: 'export:tf-azure',
  },
  {
    id: 'export:tf-gcp',
    label: 'Terraform — GCP',
    description: 'Copy Terraform HCL for GCP VPC',
    category: 'Export',
    keywords: ['terraform', 'gcp', 'google', 'hcl', 'infrastructure', 'iac'],
    icon: 'terraform',
    requiresResult: true,
    action: 'export:tf-gcp',
  },
  {
    id: 'export:cli-aws',
    label: 'CLI — AWS',
    description: 'Copy AWS CLI commands',
    category: 'Export',
    keywords: ['cli', 'aws', 'command', 'shell'],
    icon: 'aws',
    requiresResult: true,
    action: 'export:cli-aws',
  },
  {
    id: 'export:cli-azure',
    label: 'CLI — Azure',
    description: 'Copy Azure CLI commands',
    category: 'Export',
    keywords: ['cli', 'azure', 'az', 'command', 'shell'],
    icon: 'azure',
    requiresResult: true,
    action: 'export:cli-azure',
  },
  {
    id: 'export:cli-gcp',
    label: 'CLI — GCP',
    description: 'Copy gcloud CLI commands',
    category: 'Export',
    keywords: ['cli', 'gcp', 'gcloud', 'google', 'command', 'shell'],
    icon: 'gcp',
    requiresResult: true,
    action: 'export:cli-gcp',
  },
  {
    id: 'share-url',
    label: 'Copy Share URL',
    description: 'Copy the current page URL to clipboard',
    category: 'Export',
    keywords: ['share', 'url', 'link', 'copy'],
    icon: 'link',
    action: 'share-url',
  },

  // Actions
  {
    id: 'clear-input',
    label: 'Clear Input',
    description: 'Clear the current CIDR input',
    category: 'Actions',
    keywords: ['clear', 'reset', 'empty', 'remove'],
    icon: 'x',
    action: 'clear-input',
  },
  {
    id: 'reset-splits',
    label: 'Reset Splits',
    description: 'Remove all subnet splits',
    category: 'Actions',
    keywords: ['reset', 'splits', 'clear', 'subnets'],
    icon: 'reset',
    requiresResult: true,
    action: 'reset-splits',
  },
  {
    id: 'mode-guided',
    label: 'Switch to Guided Mode',
    description: 'Use the guided IP + prefix input',
    category: 'Actions',
    keywords: ['guided', 'mode', 'simple', 'dropdown'],
    icon: 'toggle',
    action: 'mode-guided',
  },
  {
    id: 'mode-cidr',
    label: 'Switch to CIDR Mode',
    description: 'Use the direct CIDR notation input',
    category: 'Actions',
    keywords: ['cidr', 'mode', 'advanced', 'notation'],
    icon: 'toggle',
    action: 'mode-cidr',
  },
]

const categoryOrder: Record<string, number> = {
  Navigate: 0,
  Tools: 1,
  Export: 2,
  Actions: 3,
}

export function filterCommands(
  cmds: Command[],
  query: string,
  hasResult: boolean,
): Command[] {
  const available = cmds.filter((c) => !c.requiresResult || hasResult)

  if (!query.trim()) return available

  const q = query.toLowerCase()
  const matches = available.filter((c) =>
    c.label.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.keywords.some((k) => k.includes(q)) ||
    c.category.toLowerCase().includes(q),
  )

  // Sort: exact label prefix first, then by category order
  return matches.sort((a, b) => {
    const aPrefix = a.label.toLowerCase().startsWith(q) ? 0 : 1
    const bPrefix = b.label.toLowerCase().startsWith(q) ? 0 : 1
    if (aPrefix !== bPrefix) return aPrefix - bPrefix
    return (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99)
  })
}

export function detectCidrInput(query: string): string | null {
  const trimmed = query.trim()

  // Try CIDR notation first (e.g. 10.0.0.0/24)
  if (trimmed.includes('/')) {
    const parsed = parseIPv4WithCidr(trimmed)
    if (!parsed) return null
    const { ip, prefix } = parsed
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
    const networkIp = (ip & mask) >>> 0
    return `${ipv4ToString(networkIp)}/${prefix}`
  }

  // Bare IP address (e.g. 1.1.2.2) → treat as /32
  const ip = parseIPv4(trimmed)
  if (ip !== null) return `${ipv4ToString(ip)}/32`

  return null
}
