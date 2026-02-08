import type { CidrResult } from '../src/lib/cidr'

const BASE_URL = 'https://subnet.fit'

interface UrlState {
  mode: 'network' | 'supernet'
  cidr: string
  splits?: number[]
  splitLabels?: string[]
  supernetInputs?: string[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function webAppSchema(overrides: Record<string, any>): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'subnet.fit',
    url: BASE_URL,
    applicationCategory: 'NetworkingApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    ...overrides,
  }
}

function faqSchema(): Record<string, any> {
  const faqs = [
    {
      q: 'What is CIDR notation?',
      a: 'CIDR (Classless Inter-Domain Routing) notation represents IP networks using an IP address followed by a slash and prefix length (e.g., 10.0.0.0/16). The prefix length indicates how many leading bits define the network portion of the address.',
    },
    {
      q: 'How do I calculate the number of hosts in a subnet?',
      a: 'The number of usable hosts in a subnet is 2^(32 - prefix length) - 2. The subtracted 2 accounts for the network address and broadcast address. For example, a /24 subnet has 2^8 - 2 = 254 usable host addresses.',
    },
    {
      q: 'What are RFC 1918 private IP ranges?',
      a: 'RFC 1918 defines three private IP ranges: 10.0.0.0/8 (16.7M addresses), 172.16.0.0/12 (1M addresses), and 192.168.0.0/16 (65K addresses). These ranges are reserved for internal networks and are not routable on the public internet.',
    },
    {
      q: 'What is subnet splitting and why is it useful?',
      a: 'Subnet splitting (or subnetting) divides a larger network into smaller sub-networks. This improves security through network segmentation, reduces broadcast domains, and allows more efficient IP address allocation across departments, environments, or availability zones.',
    },
    {
      q: 'How many IP addresses does AWS reserve per subnet?',
      a: 'AWS reserves 5 IP addresses per VPC subnet: the network address, VPC router (.1), DNS server (.2), future use (.3), and the broadcast address. For example, in a /24 subnet with 256 total addresses, only 251 are available for use.',
    },
    {
      q: 'What is supernetting (CIDR aggregation)?',
      a: 'Supernetting combines multiple contiguous networks into a single larger CIDR block. This simplifies routing tables by replacing multiple specific routes with one summary route. For example, four /24 networks (10.0.0.0-10.0.3.0) can be aggregated into 10.0.0.0/22.',
    },
    {
      q: 'What is the difference between a netmask and a wildcard mask?',
      a: 'A netmask (e.g., 255.255.255.0) has 1-bits for the network portion and 0-bits for the host portion. A wildcard mask is the bitwise inverse (e.g., 0.0.0.255). Netmasks are used in subnet configuration while wildcard masks are used in ACLs and routing protocols like OSPF.',
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  }
}

export function computeJsonLd(
  url: URL,
  state: UrlState | null,
  result: CidrResult | null,
): string {
  const pathname = url.pathname

  // Homepage
  if (!state && !pathname.startsWith('/designer')) {
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        { ...webAppSchema({
          name: 'subnet.fit — Subnet Calculator',
          description:
            'Free online subnet calculator and CIDR tool. Calculate IP ranges and netmasks, split subnets visually, design cloud architectures for AWS, Azure and GCP, and export to Terraform, CLI and JSON.',
          featureList: [
            'CIDR calculator with full subnet details',
            'Visual subnet splitter with named allocations',
            'Supernet and CIDR aggregation calculator',
            'Cloud architecture designer for AWS, Azure and GCP',
            'Terraform, AWS CLI, Azure CLI and gcloud export',
            'RDAP/WHOIS lookup for public IPs',
            'Dark and light mode with Solarized theme',
          ],
        }), '@context': undefined },
        { ...faqSchema(), '@context': undefined },
      ],
    }
    return JSON.stringify(schema)
  }

  // Designer
  if (pathname.startsWith('/designer')) {
    return JSON.stringify(
      webAppSchema({
        name: 'Network Designer — subnet.fit',
        url: `${BASE_URL}/designer`,
        description:
          'Design cloud network architectures visually with AWS, Azure and GCP support. Drag-and-drop subnet planning with export to draw.io, PNG, SVG and shareable URLs.',
        applicationCategory: 'DesignApplication',
      }),
    )
  }

  // Supernet
  if (state?.mode === 'supernet') {
    const nets = state.supernetInputs ?? []
    return JSON.stringify(
      webAppSchema({
        name: `Supernet Calculator — Aggregate ${nets.length} Networks | subnet.fit`,
        url: `${BASE_URL}${pathname}${url.search}`,
        description: `Aggregate ${nets.length} networks into the smallest covering CIDR block. Free route aggregation calculator.`,
      }),
    )
  }

  // Splitter
  if (state?.splits && state.splits.length > 0 && result) {
    return JSON.stringify(
      webAppSchema({
        name: `${result.input} Split into ${state.splits.length} Subnets | subnet.fit`,
        url: `${BASE_URL}${pathname}${url.search}`,
        description: `Split ${result.input} into ${state.splits.length} subnets with visual allocation, Terraform export, and cloud provider context.`,
      }),
    )
  }

  // Plain CIDR
  if (result) {
    return JSON.stringify(
      webAppSchema({
        name: `${result.input} Subnet Details | subnet.fit`,
        url: `${BASE_URL}/${result.networkAddress}/${result.prefixLength}`,
        description: `${result.input}: ${result.usableHosts.toLocaleString('en-US')} usable hosts, netmask ${result.netmask}, Class ${result.ipClass}. Free subnet calculator with splitting and IaC export.`,
      }),
    )
  }

  // Fallback
  return JSON.stringify(
    webAppSchema({
      description:
        'Free online CIDR calculator with subnet splitting, visual network diagrams, cloud provider context, and infrastructure-as-code export.',
    }),
  )
}
