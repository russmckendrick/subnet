import satori from 'satori'
// @ts-expect-error -- @cf-wasm/resvg/workerd handles WASM init for Cloudflare Workers
import { Resvg } from '@cf-wasm/resvg/workerd'
import { getFonts } from './fonts'
import { parseCidr } from '../src/lib/cidr'
import { decodeState } from '../src/lib/url-codec'
import { buildTemplate, homepageTemplate, designerTemplate } from './og-template'

let cachedBgBase64: string | null = null

const WIDTH = 1200
const HEIGHT = 630

/** Render an SVG string to PNG buffer using resvg */
async function svgToPng(svg: string): Promise<Uint8Array> {
  const resvg = await Resvg.async(svg, {
    fitTo: { mode: 'width', value: WIDTH },
  })
  const rendered = resvg.render()
  return rendered.asPng()
}

/** Fetch and render og-background.svg to base64 PNG, cached in module scope */
async function getBackgroundBase64(env: Env): Promise<string | null> {
  if (cachedBgBase64) return cachedBgBase64

  try {
    const res = await env.ASSETS.fetch(new Request('https://placeholder/og-background.svg'))
    if (!res.ok) return null

    const svgText = await res.text()
    const bgResvg = await Resvg.async(svgText, {
      fitTo: { mode: 'width', value: WIDTH },
      background: '#002b36',
    })
    const bgRendered = bgResvg.render()
    const bgPng = bgRendered.asPng()

    const base64 = arrayBufferToBase64(bgPng)
    cachedBgBase64 = `data:image/png;base64,${base64}`
    return cachedBgBase64
  } catch {
    return null
  }
}

function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i])
  }
  return btoa(binary)
}

interface Env {
  ASSETS: {
    fetch: (request: Request | string) => Promise<Response>
  }
}

export async function handleOgImage(
  request: Request,
  env: Env,
): Promise<Response> {
  try {
    const url = new URL(request.url)
    const ogPath = url.pathname.replace(/^\/og\/?/, '/')
    const search = url.search

    const bgBase64 = await getBackgroundBase64(env)

    let template

    if (ogPath.startsWith('/designer')) {
      template = designerTemplate(bgBase64)
    } else if (ogPath === '/') {
      template = homepageTemplate(bgBase64)
    } else {
      const state = decodeState(ogPath, search)
      const cidrResult = state?.cidr ? parseCidr(state.cidr) : null
      template = buildTemplate(bgBase64, state, cidrResult)
    }

    const fonts = getFonts()

    const svg = await satori(template as Parameters<typeof satori>[0], {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    })

    const png = await svgToPng(svg)

    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=604800, s-maxage=604800',
      },
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
