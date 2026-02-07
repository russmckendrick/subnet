import type { CidrResult } from './cidr'
import type { SubnetSplit } from './subnet-math'

function safeName(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function toAwsCli(result: CidrResult, splits?: SubnetSplit[]): string {
  const cidr = `${result.networkAddress}/${result.prefixLength}`
  const lines: string[] = []

  lines.push('# Create VPC')
  lines.push(`VPC_ID=$(aws ec2 create-vpc \\`)
  lines.push(`  --cidr-block ${cidr} \\`)
  lines.push(`  --query 'Vpc.VpcId' \\`)
  lines.push(`  --output text)`)
  lines.push('')
  lines.push('# Tag the VPC')
  lines.push(`aws ec2 create-tags \\`)
  lines.push(`  --resources $VPC_ID \\`)
  lines.push(`  --tags Key=Name,Value=main`)

  if (splits && splits.length > 0) {
    for (const split of splits) {
      const name = safeName(split.label)
      lines.push('')
      lines.push(`# Create subnet: ${split.label}`)
      lines.push(`${name.toUpperCase().replace(/-/g, '_')}_ID=$(aws ec2 create-subnet \\`)
      lines.push(`  --vpc-id $VPC_ID \\`)
      lines.push(`  --cidr-block ${split.cidr} \\`)
      lines.push(`  --query 'Subnet.SubnetId' \\`)
      lines.push(`  --output text)`)
      lines.push('')
      lines.push(`aws ec2 create-tags \\`)
      lines.push(`  --resources $${name.toUpperCase().replace(/-/g, '_')}_ID \\`)
      lines.push(`  --tags Key=Name,Value=${name}`)
    }
  }

  return lines.join('\n')
}

export function toAzureCli(result: CidrResult, splits?: SubnetSplit[]): string {
  const cidr = `${result.networkAddress}/${result.prefixLength}`
  const lines: string[] = []

  lines.push('# Create resource group')
  lines.push(`az group create \\`)
  lines.push(`  --name main-rg \\`)
  lines.push(`  --location eastus`)
  lines.push('')
  lines.push('# Create virtual network')
  lines.push(`az network vnet create \\`)
  lines.push(`  --resource-group main-rg \\`)
  lines.push(`  --name main-vnet \\`)
  lines.push(`  --address-prefix ${cidr} \\`)
  lines.push(`  --location eastus`)

  if (splits && splits.length > 0) {
    for (const split of splits) {
      const name = safeName(split.label)
      lines.push('')
      lines.push(`# Create subnet: ${split.label}`)
      lines.push(`az network vnet subnet create \\`)
      lines.push(`  --resource-group main-rg \\`)
      lines.push(`  --vnet-name main-vnet \\`)
      lines.push(`  --name ${name} \\`)
      lines.push(`  --address-prefix ${split.cidr}`)
    }
  }

  return lines.join('\n')
}

export function toGcloudCli(result: CidrResult, splits?: SubnetSplit[]): string {
  const cidr = `${result.networkAddress}/${result.prefixLength}`
  const lines: string[] = []

  lines.push('# Create VPC network (custom mode)')
  lines.push(`gcloud compute networks create main-network \\`)
  lines.push(`  --subnet-mode=custom`)

  if (splits && splits.length > 0) {
    for (const split of splits) {
      const name = safeName(split.label)
      lines.push('')
      lines.push(`# Create subnet: ${split.label}`)
      lines.push(`gcloud compute networks subnets create ${name} \\`)
      lines.push(`  --network=main-network \\`)
      lines.push(`  --range=${split.cidr} \\`)
      lines.push(`  --region=us-central1`)
    }
  } else {
    lines.push('')
    lines.push('# Create subnet')
    lines.push(`gcloud compute networks subnets create main-subnet \\`)
    lines.push(`  --network=main-network \\`)
    lines.push(`  --range=${cidr} \\`)
    lines.push(`  --region=us-central1`)
  }

  return lines.join('\n')
}
