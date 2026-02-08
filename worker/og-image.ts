import { ImageResponse } from 'workers-og'
import { getFonts } from './fonts'
import { parseCidr } from '../src/lib/cidr'
import { decodeState } from '../src/lib/url-codec'
import { buildTemplate, homepageTemplate, designerTemplate } from './og-template'

const WIDTH = 1200
const HEIGHT = 630

interface Env {
  ASSETS: {
    fetch: (request: Request | string) => Promise<Response>
  }
}

export async function handleOgImage(
  request: Request,
  _env: Env,
): Promise<Response> {
  try {
    const url = new URL(request.url)
    const ogPath = url.pathname.replace(/^\/og\/?/, '/')
    const search = url.search

    let template

    if (ogPath.startsWith('/designer')) {
      template = designerTemplate()
    } else if (ogPath === '/') {
      template = homepageTemplate()
    } else {
      const state = decodeState(ogPath, search)
      const cidrResult = state?.cidr ? parseCidr(state.cidr) : null
      template = buildTemplate(state, cidrResult)
    }

    const fonts = getFonts()

    const response = new ImageResponse(template, {
      width: WIDTH,
      height: HEIGHT,
      fonts: fonts.map(f => ({
        name: f.name,
        data: f.data,
        weight: f.weight as 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
        style: f.style as 'normal' | 'italic',
      })),
    })

    // Add cache headers
    const headers = new Headers(response.headers)
    headers.set('Cache-Control', 'public, max-age=604800, s-maxage=604800')

    return new Response(response.body, {
      status: response.status,
      headers,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const stack = e instanceof Error ? e.stack : ''
    return new Response(`OG image generation failed: ${msg}\n${stack}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}
