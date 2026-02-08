import { parseCidr } from '../src/lib/cidr'
import { decodeState } from '../src/lib/url-codec'
import { computeJsonLd } from './json-ld'

interface MetaTags {
  title: string
  description: string
  ogImage: string
  ogUrl: string
  canonical: string
  jsonLd: string
}

const BASE_URL = 'https://subnet.fit'
const DEFAULT_DESCRIPTION = 'Free online subnet calculator and CIDR tool. Calculate IP ranges and netmasks, split subnets visually, design cloud architectures for AWS, Azure & GCP, and export to Terraform, CLI & JSON.'

function computeMetaTags(url: URL): MetaTags {
  const pathname = url.pathname
  const search = url.search

  // Designer
  if (pathname.startsWith('/designer')) {
    const tags = {
      title: 'Network Designer — Visual Cloud Architecture | subnet.fit',
      description: 'Design cloud network architectures visually with AWS, Azure & GCP support. Drag-and-drop subnet planning with export to draw.io, PNG, SVG & shareable URLs.',
      ogImage: `${BASE_URL}/og/designer`,
      ogUrl: `${BASE_URL}${pathname}${search}`,
      canonical: `${BASE_URL}/designer`,
      jsonLd: '',
    }
    tags.jsonLd = computeJsonLd(url, null, null)
    return tags
  }

  // Try to decode as calculator state
  const state = decodeState(pathname, search)

  if (!state) {
    const tags = {
      title: 'Subnet Calculator Online — Free CIDR Calculator & IP Planner | subnet.fit',
      description: DEFAULT_DESCRIPTION,
      ogImage: `${BASE_URL}/og/`,
      ogUrl: BASE_URL,
      canonical: `${BASE_URL}/`,
      jsonLd: '',
    }
    tags.jsonLd = computeJsonLd(url, null, null)
    return tags
  }

  // Supernet mode
  if (state.mode === 'supernet') {
    const nets = state.supernetInputs ?? []
    const count = nets.length
    const tags = {
      title: `Supernet Calculator — Aggregate ${count} Network${count !== 1 ? 's' : ''} | subnet.fit`,
      description: `Free route aggregation calculator. Aggregate ${count} network${count !== 1 ? 's' : ''} into the smallest covering CIDR. Supernet calculator for route summarization, CIDR aggregation & network planning.`,
      ogImage: `${BASE_URL}/og${pathname}${search}`,
      ogUrl: `${BASE_URL}${pathname}${search}`,
      canonical: `${BASE_URL}${pathname}${search}`,
      jsonLd: '',
    }
    tags.jsonLd = computeJsonLd(url, state, null)
    return tags
  }

  // Network mode with CIDR
  const result = parseCidr(state.cidr)
  if (!result) {
    const tags = {
      title: 'Subnet Calculator Online — Free CIDR Calculator & IP Planner | subnet.fit',
      description: DEFAULT_DESCRIPTION,
      ogImage: `${BASE_URL}/og/`,
      ogUrl: BASE_URL,
      canonical: `${BASE_URL}/`,
      jsonLd: '',
    }
    tags.jsonLd = computeJsonLd(url, null, null)
    return tags
  }

  // Normalize canonical to network address
  const canonicalCidr = `${result.networkAddress}/${result.prefixLength}`

  // Splitter mode
  if (state.splits && state.splits.length > 0) {
    const splitCount = state.splits.length
    const splitParam = search
    const tags = {
      title: `${result.input} Split into ${splitCount} Subnet${splitCount > 1 ? 's' : ''} — Splitter | subnet.fit`,
      description: `Free subnet splitter tool. Split ${result.input} into ${splitCount} subnet${splitCount > 1 ? 's' : ''} (${result.usableHosts.toLocaleString('en-US')} usable hosts, Class ${result.ipClass}). Visual subnet allocator with Terraform, CLI & JSON export for AWS, Azure & GCP.`,
      ogImage: `${BASE_URL}/og${pathname}${search}`,
      ogUrl: `${BASE_URL}${pathname}${search}`,
      canonical: `${BASE_URL}/${canonicalCidr}${splitParam}`,
      jsonLd: '',
    }
    tags.jsonLd = computeJsonLd(url, state, result)
    return tags
  }

  // Plain CIDR
  const tags = {
    title: `${result.input} Subnet Details — CIDR Calculator | subnet.fit`,
    description: `${result.input}: ${result.usableHosts.toLocaleString('en-US')} usable hosts, netmask ${result.netmask}, range ${result.firstHost}–${result.lastHost}, Class ${result.ipClass}${result.rfcType ? ` (${result.rfcType.split(' — ')[1]})` : ''}. Online subnet calculator with splitting, cloud context & IaC export.`,
    ogImage: `${BASE_URL}/og${pathname}`,
    ogUrl: `${BASE_URL}${pathname}`,
    canonical: `${BASE_URL}/${canonicalCidr}`,
    jsonLd: '',
  }
  tags.jsonLd = computeJsonLd(url, state, result)
  return tags
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

/** HTMLRewriter handler that sets canonical URL href */
class CanonicalHandler implements HTMLRewriterElementContentHandlers {
  private canonical: string
  constructor(canonical: string) {
    this.canonical = canonical
  }
  element(element: Element) {
    element.setAttribute('href', this.canonical)
  }
}

/** HTMLRewriter handler that sets JSON-LD script content */
class JsonLdHandler implements HTMLRewriterElementContentHandlers {
  private jsonLd: string
  constructor(jsonLd: string) {
    this.jsonLd = jsonLd
  }
  element(element: Element) {
    element.setInnerContent(this.jsonLd, { html: true })
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
    .on('link[rel="canonical"]', new CanonicalHandler(tags.canonical))
    .on('script#json-ld', new JsonLdHandler(tags.jsonLd))
    .transform(response)
}
