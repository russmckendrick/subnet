import type { CidrResult } from './cidr'
import type { SubnetSplit } from './subnet-math'

function safeName(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

export function toJSON(result: CidrResult, splits?: SubnetSplit[]): string {
  const data = {
    network: result.networkAddress,
    broadcast: result.broadcastAddress,
    netmask: result.netmask,
    wildcardMask: result.wildcardMask,
    prefix: result.prefixLength,
    cidr: `${result.networkAddress}/${result.prefixLength}`,
    firstHost: result.firstHost,
    lastHost: result.lastHost,
    totalAddresses: result.totalAddresses,
    usableHosts: result.usableHosts,
    ipClass: result.ipClass,
    isPrivate: result.isPrivate,
    rfcType: result.rfcType,
    ...(splits && splits.length > 0
      ? {
          subnets: splits.map((s) => ({
            label: s.label,
            cidr: s.cidr,
            network: s.networkAddress,
            broadcast: s.broadcastAddress,
            firstHost: s.firstHost,
            lastHost: s.lastHost,
            size: s.size,
            usableHosts: s.usableHosts,
          })),
        }
      : {}),
  }
  return JSON.stringify(data, null, 2)
}

export function toCSV(result: CidrResult, splits?: SubnetSplit[]): string {
  if (splits && splits.length > 0) {
    const header = 'Label,CIDR,Network,Broadcast,First Host,Last Host,Size,Usable Hosts'
    const rows = splits.map(
      (s) => `${s.label},${s.cidr},${s.networkAddress},${s.broadcastAddress},${s.firstHost},${s.lastHost},${s.size},${s.usableHosts}`,
    )
    return [header, ...rows].join('\n')
  }

  const header = 'Property,Value'
  const rows = [
    `Network,${result.networkAddress}`,
    `Broadcast,${result.broadcastAddress}`,
    `Netmask,${result.netmask}`,
    `Wildcard Mask,${result.wildcardMask}`,
    `CIDR,${result.networkAddress}/${result.prefixLength}`,
    `First Host,${result.firstHost}`,
    `Last Host,${result.lastHost}`,
    `Total Addresses,${result.totalAddresses}`,
    `Usable Hosts,${result.usableHosts}`,
    `IP Class,${result.ipClass}`,
    `Private,${result.isPrivate}`,
    `RFC Type,${result.rfcType ?? 'Public'}`,
  ]
  return [header, ...rows].join('\n')
}

export function toTerraformAws(result: CidrResult, splits?: SubnetSplit[]): string {
  const lines: string[] = []

  lines.push(`resource "aws_vpc" "main" {`)
  lines.push(`  cidr_block = "${result.networkAddress}/${result.prefixLength}"`)
  lines.push('')
  lines.push('  tags = {')
  lines.push('    Name = "main"')
  lines.push('  }')
  lines.push('}')

  if (splits && splits.length > 0) {
    lines.push('')
    for (const split of splits) {
      const name = safeName(split.label)
      lines.push(`resource "aws_subnet" "${name}" {`)
      lines.push('  vpc_id     = aws_vpc.main.id')
      lines.push(`  cidr_block = "${split.cidr}"`)
      lines.push('')
      lines.push('  tags = {')
      lines.push(`    Name = "${split.label}"`)
      lines.push('  }')
      lines.push('}')
      lines.push('')
    }
  }

  return lines.join('\n')
}

export function toTerraformAzure(result: CidrResult, splits?: SubnetSplit[]): string {
  const lines: string[] = []

  lines.push(`resource "azurerm_resource_group" "main" {`)
  lines.push('  name     = "main-rg"')
  lines.push('  location = "eastus"')
  lines.push('}')
  lines.push('')
  lines.push(`resource "azurerm_virtual_network" "main" {`)
  lines.push('  name                = "main-vnet"')
  lines.push(`  address_space       = ["${result.networkAddress}/${result.prefixLength}"]`)
  lines.push('  location            = azurerm_resource_group.main.location')
  lines.push('  resource_group_name = azurerm_resource_group.main.name')
  lines.push('}')

  if (splits && splits.length > 0) {
    lines.push('')
    for (const split of splits) {
      const name = safeName(split.label)
      lines.push(`resource "azurerm_subnet" "${name}" {`)
      lines.push('  name                 = "' + name + '"')
      lines.push('  resource_group_name  = azurerm_resource_group.main.name')
      lines.push('  virtual_network_name = azurerm_virtual_network.main.name')
      lines.push(`  address_prefixes     = ["${split.cidr}"]`)
      lines.push('}')
      lines.push('')
    }
  }

  return lines.join('\n')
}

export function toTerraformGcp(result: CidrResult, splits?: SubnetSplit[]): string {
  const cidr = `${result.networkAddress}/${result.prefixLength}`
  const lines: string[] = []

  lines.push(`resource "google_compute_network" "main" {`)
  lines.push('  name                    = "main-network"')
  lines.push('  auto_create_subnetworks = false')
  lines.push('}')

  if (splits && splits.length > 0) {
    lines.push('')
    for (const split of splits) {
      const name = safeName(split.label)
      lines.push(`resource "google_compute_subnetwork" "${name}" {`)
      lines.push(`  name          = "${name}"`)
      lines.push(`  ip_cidr_range = "${split.cidr}"`)
      lines.push('  region        = "us-central1"')
      lines.push('  network       = google_compute_network.main.id')
      lines.push('}')
      lines.push('')
    }
  } else {
    lines.push('')
    lines.push(`resource "google_compute_subnetwork" "main" {`)
    lines.push('  name          = "main-subnet"')
    lines.push(`  ip_cidr_range = "${cidr}"`)
    lines.push('  region        = "us-central1"')
    lines.push('  network       = google_compute_network.main.id')
    lines.push('}')
  }

  return lines.join('\n')
}
