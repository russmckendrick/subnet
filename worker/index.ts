import { handleOgImage } from './og-image'
import { injectMetaTags } from './meta-tags'
import { handleSitemap } from './sitemap'

interface Env {
  ASSETS: {
    fetch: (request: Request | string) => Promise<Response>
  }
}

/** Check if a path looks like a static asset (has a file extension) */
function isStaticAsset(pathname: string): boolean {
  return /\.[a-zA-Z0-9]{1,10}$/.test(pathname) && !pathname.startsWith('/og/')
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    // 1. OG image generation
    if (pathname.startsWith('/og')) {
      return handleOgImage(request, env)
    }

    // 2. Sitemaps
    if (pathname === '/sitemap.xml' || pathname.startsWith('/sitemap-')) {
      return handleSitemap(pathname)
    }

    // 3. Static assets — pass through to Cloudflare Assets
    if (isStaticAsset(pathname)) {
      return env.ASSETS.fetch(request)
    }

    // 4. SPA routes — serve index.html with dynamic meta tags
    //    This replicates the "single-page-application" not_found_handling
    const indexRequest = new Request(new URL('/', request.url), request)
    const response = await env.ASSETS.fetch(indexRequest)

    // Inject dynamic meta tags via HTMLRewriter
    return injectMetaTags(response, url)
  },
}
