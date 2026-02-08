import satori from 'satori'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
// @ts-expect-error -- wasm binary import handled by wrangler CompiledWasm rule
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'
import { getFonts } from './fonts'
import { parseCidr } from '../src/lib/cidr'
import { decodeState } from '../src/lib/url-codec'
import { buildTemplate, homepageTemplate, designerTemplate } from './og-template'

let wasmInitialized = false
let wasmFailed = false
let cachedBgBase64: string | null = null

const WIDTH = 1200
const HEIGHT = 630

async function ensureWasm(): Promise<boolean> {
  if (wasmInitialized) return true
  if (wasmFailed) return false

  try {
    await initWasm(resvgWasm)
    wasmInitialized = true
    return true
  } catch (e) {
    console.error('Failed to initialize resvg WASM:', e)
    wasmFailed = true
    return false
  }
}

/** Render an SVG string to PNG buffer using resvg */
function svgToPng(svg: string): Uint8Array {
  const resvg = new Resvg(svg, {
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
    const bgResvg = new Resvg(svgText, {
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
  const wasmReady = await ensureWasm()
  if (!wasmReady) {
    return new Response('OG image generation unavailable', { status: 503 })
  }

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

  const png = svgToPng(svg)

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=604800, s-maxage=604800',
    },
  })
}
