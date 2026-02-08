import { parseCidr } from '../src/lib/cidr'
import { decodeState } from '../src/lib/url-codec'

interface MetaTags {
  title: string
  description: string
  ogImage: string
  ogUrl: string
}

const BASE_URL = 'https://subnet.fit'
const DEFAULT_DESCRIPTION = 'A modern subnet calculator with visual network mapping, cloud provider context, and infrastructure-as-code export.'

function computeMetaTags(url: URL): MetaTags {
  const pathname = url.pathname
  const search = url.search

  // Designer
  if (pathname.startsWith('/designer')) {
    return {
      title: 'Network Designer — subnet.fit',
      description: 'Visual cloud architecture diagrams with AWS, Azure & GCP support. Drag-and-drop network design with export to draw.io, PNG, SVG, and shareable URLs.',
      ogImage: `${BASE_URL}/og/designer`,
      ogUrl: `${BASE_URL}${pathname}${search}`,
    }
  }

  // Try to decode as calculator state
  const state = decodeState(pathname, search)

  if (!state) {
    return {
      title: 'subnet.fit — CIDR Calculator & Network Planner',
      description: DEFAULT_DESCRIPTION,
      ogImage: `${BASE_URL}/og/`,
      ogUrl: BASE_URL,
    }
  }

  // Supernet mode
  if (state.mode === 'supernet') {
    const nets = state.supernetInputs ?? []
    const count = nets.length
    return {
      title: 'Supernet Calculator — subnet.fit',
      description: `Route aggregation for ${count} network${count !== 1 ? 's' : ''}. Calculate the smallest CIDR that contains all input networks.`,
      ogImage: `${BASE_URL}/og${pathname}${search}`,
      ogUrl: `${BASE_URL}${pathname}${search}`,
    }
  }

  // Network mode with CIDR
  const result = parseCidr(state.cidr)
  if (!result) {
    return {
      title: 'subnet.fit — CIDR Calculator & Network Planner',
      description: DEFAULT_DESCRIPTION,
      ogImage: `${BASE_URL}/og/`,
      ogUrl: BASE_URL,
    }
  }

  // Splitter mode
  if (state.splits && state.splits.length > 0) {
    const splitCount = state.splits.length
    return {
      title: `${result.input} Subnet Splitter — subnet.fit`,
      description: `Split ${result.input} into ${splitCount} subnet${splitCount > 1 ? 's' : ''} (${result.usableHosts.toLocaleString('en-US')} usable hosts, Class ${result.ipClass}).`,
      ogImage: `${BASE_URL}/og${pathname}${search}`,
      ogUrl: `${BASE_URL}${pathname}${search}`,
    }
  }

  // Plain CIDR
  return {
    title: `${result.input} — subnet.fit`,
    description: `${result.input}: ${result.usableHosts.toLocaleString('en-US')} usable hosts, netmask ${result.netmask}, Class ${result.ipClass}${result.rfcType ? ` (${result.rfcType.split(' — ')[1]})` : ''}.`,
    ogImage: `${BASE_URL}/og${pathname}`,
    ogUrl: `${BASE_URL}${pathname}`,
  }
}

/** HTMLRewriter handler that replaces <title> inner content */
class TitleHandler implements HTMLRewriterElementContentHandlers {
  private title: string
  constructor(title: string) {
    this.title = title
  }
  text(text: Text) {
    if (text.text.trim()) {
      text.replace(this.title)
    }
  }
}

/** HTMLRewriter handler that updates meta tag content attributes */
class MetaHandler implements HTMLRewriterElementContentHandlers {
  private tags: MetaTags
  constructor(tags: MetaTags) {
    this.tags = tags
  }
  element(element: Element) {
    const property = element.getAttribute('property')
    const name = element.getAttribute('name')

    const attr = property || name
    if (!attr) return

    switch (attr) {
      case 'og:title':
      case 'twitter:title':
        element.setAttribute('content', this.tags.title)
        break
      case 'og:description':
      case 'twitter:description':
        element.setAttribute('content', this.tags.description)
        break
      case 'og:image':
      case 'twitter:image':
        element.setAttribute('content', this.tags.ogImage)
        break
      case 'og:url':
        element.setAttribute('content', this.tags.ogUrl)
        break
      case 'description':
        element.setAttribute('content', this.tags.description)
        break
    }
  }
}

interface HTMLRewriterElementContentHandlers {
  text?(text: Text): void | Promise<void>
  element?(element: Element): void | Promise<void>
}

/** Apply meta tag transformations to an HTML response */
export function injectMetaTags(response: Response, url: URL): Response {
  const tags = computeMetaTags(url)

  return new HTMLRewriter()
    .on('title', new TitleHandler(tags.title))
    .on('meta[property="og:title"]', new MetaHandler(tags))
    .on('meta[property="og:description"]', new MetaHandler(tags))
    .on('meta[property="og:image"]', new MetaHandler(tags))
    .on('meta[property="og:url"]', new MetaHandler(tags))
    .on('meta[name="twitter:title"]', new MetaHandler(tags))
    .on('meta[name="twitter:description"]', new MetaHandler(tags))
    .on('meta[name="twitter:image"]', new MetaHandler(tags))
    .on('meta[name="description"]', new MetaHandler(tags))
    .transform(response)
}
