import type { CidrResult } from './cidr'
import type { SubnetSplit } from './subnet-math'

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

export function toTerraform(result: CidrResult, splits?: SubnetSplit[]): string {
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
      const safeName = split.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
      lines.push(`resource "aws_subnet" "${safeName}" {`)
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

export function toPulumi(result: CidrResult, splits?: SubnetSplit[]): string {
  const lines: string[] = []

  lines.push('import * as aws from "@pulumi/aws";')
  lines.push('')
  lines.push('const vpc = new aws.ec2.Vpc("main", {')
  lines.push(`  cidrBlock: "${result.networkAddress}/${result.prefixLength}",`)
  lines.push('  tags: { Name: "main" },')
  lines.push('});')

  if (splits && splits.length > 0) {
    lines.push('')
    for (const split of splits) {
      const safeName = split.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
      lines.push(`const ${safeName} = new aws.ec2.Subnet("${safeName}", {`)
      lines.push('  vpcId: vpc.id,')
      lines.push(`  cidrBlock: "${split.cidr}",`)
      lines.push(`  tags: { Name: "${split.label}" },`)
      lines.push('});')
      lines.push('')
    }
  }

  return lines.join('\n')
}

export function toCloudFormation(result: CidrResult, splits?: SubnetSplit[]): string {
  const template: Record<string, unknown> = {
    AWSTemplateFormatVersion: '2010-09-09',
    Description: `VPC with CIDR ${result.networkAddress}/${result.prefixLength}`,
    Resources: {
      VPC: {
        Type: 'AWS::EC2::VPC',
        Properties: {
          CidrBlock: `${result.networkAddress}/${result.prefixLength}`,
          Tags: [{ Key: 'Name', Value: 'main' }],
        },
      },
      ...(splits && splits.length > 0
        ? Object.fromEntries(
            splits.map((split) => {
              const safeName = split.label.replace(/[^a-zA-Z0-9]+/g, '')
              return [
                `Subnet${safeName}`,
                {
                  Type: 'AWS::EC2::Subnet',
                  Properties: {
                    VpcId: { Ref: 'VPC' },
                    CidrBlock: split.cidr,
                    Tags: [{ Key: 'Name', Value: split.label }],
                  },
                },
              ]
            }),
          )
        : {}),
    },
  }
  return JSON.stringify(template, null, 2)
}
