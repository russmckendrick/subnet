import { toPng, toSvg } from 'html-to-image'
import type { Node, Edge } from '@xyflow/react'
import pako from 'pako'
import { CLOUD_THEMES, type CloudProvider } from './cloud-theme'
import { getDrawioSvgDataUri } from './drawio-icons'

/** Filter out React Flow chrome (background dots, controls, minimap) from image exports */
function excludeReactFlowChrome(node: HTMLElement): boolean {
  const cls = node.classList
  if (!cls) return true
  if (cls.contains('react-flow__background')) return false
  if (cls.contains('react-flow__controls')) return false
  if (cls.contains('react-flow__minimap')) return false
  if (cls.contains('react-flow__panel')) return false
  return true
}

export async function diagramToPng(element: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(element, {
    backgroundColor: 'transparent',
    pixelRatio: 2,
    filter: excludeReactFlowChrome,
  })

  const res = await fetch(dataUrl)
  return res.blob()
}

export async function diagramToSvg(element: HTMLElement): Promise<Blob> {
  const dataUrl = await toSvg(element, {
    backgroundColor: 'transparent',
    filter: excludeReactFlowChrome,
  })

  const res = await fetch(dataUrl)
  return res.blob()
}

export interface DiagramJsonData {
  nodes: Node[]
  edges: Edge[]
  version: number
  cloudProvider: string
}

export function diagramToJson(nodes: Node[], edges: Edge[], cloudProvider?: string): string {
  return JSON.stringify({ nodes, edges, cloudProvider: cloudProvider ?? 'generic', version: 2 }, null, 2)
}

export function parseDiagramJson(jsonStr: string): DiagramJsonData {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error('Invalid JSON format')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('JSON must be an object')
  }

  const obj = parsed as Record<string, unknown>

  if (!Array.isArray(obj.nodes)) {
    throw new Error('Missing or invalid "nodes" array')
  }

  if (!Array.isArray(obj.edges)) {
    throw new Error('Missing or invalid "edges" array')
  }

  for (const node of obj.nodes) {
    if (typeof node !== 'object' || node === null) {
      throw new Error('Each node must be an object')
    }
    const n = node as Record<string, unknown>
    if (typeof n.id !== 'string' || typeof n.position !== 'object' || typeof n.data !== 'object') {
      throw new Error('Each node must have id (string), position (object), and data (object)')
    }
  }

  return {
    nodes: obj.nodes as Node[],
    edges: obj.edges as Edge[],
    version: typeof obj.version === 'number' ? obj.version : 1,
    cloudProvider: typeof obj.cloudProvider === 'string' ? obj.cloudProvider : 'generic',
  }
}

export function compressDiagramState(nodes: Node[], edges: Edge[], cloudProvider?: string): string {
  const json = JSON.stringify({ nodes, edges, cloudProvider: cloudProvider ?? 'generic', version: 2 })
  const deflated = pako.deflateRaw(new TextEncoder().encode(json))
  // base64url encoding
  const base64 = btoa(String.fromCharCode.apply(null, deflated as unknown as number[]))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decompressDiagramState(compressed: string): DiagramJsonData | null {
  try {
    // Restore base64 from base64url
    let base64 = compressed.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4 !== 0) base64 += '='
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const inflated = pako.inflateRaw(bytes)
    const json = new TextDecoder().decode(inflated)
    return parseDiagramJson(json)
  } catch {
    return null
  }
}

export function getShareUrl(nodes: Node[], edges: Edge[], cloudProvider?: string): string {
  const compressed = compressDiagramState(nodes, edges, cloudProvider)
  return `${window.location.origin}/designer?d=${compressed}`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const DRAWIO_SHAPES: Record<string, string> = {
  'internet-gateway': 'ellipse',
  cloud: 'cloud',
  vpc: 'mxgraph.aws3.virtual_private_cloud',
  router: 'hexagon',
  switch: 'hexagon',
  firewall: 'trapezoid',
  server: '',
  database: 'cylinder3',
  'load-balancer': 'triangle',
  'nat-gateway': 'hexagon',
  dns: 'ellipse',
  cdn: 'ellipse',
}

/** Build rich HTML label for VPC container with provider badge, label, and CIDR */
function buildVpcLabel(
  label: string,
  cidr: string,
  provider: CloudProvider,
): string {
  const theme = CLOUD_THEMES[provider]
  return [
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;gap:8px;">',
    `<div style="display:flex;align-items:center;gap:6px;">`,
    `<span style="background:${theme.badgeBg};color:${theme.badgeColor};font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;letter-spacing:0.5px;">${escapeXml(theme.vpcLabel)}</span>`,
    `<span style="font-weight:600;font-size:12px;color:#93a1a1;">${escapeXml(label)}</span>`,
    '</div>',
    `<span style="font-family:monospace;font-size:10px;color:#586e75;">${escapeXml(cidr)}</span>`,
    '</div>',
  ].join('')
}

/** Build rich HTML label for subnet container with dot indicator, label, CIDR, and hosts badge */
function buildSubnetLabel(
  label: string,
  cidr: string,
  color: string,
  hosts: number | undefined,
  provider: CloudProvider,
): string {
  const theme = CLOUD_THEMES[provider]
  const hostsStr = hosts !== undefined ? hosts.toLocaleString() : '?'
  return [
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;gap:6px;">',
    '<div style="display:flex;align-items:center;gap:6px;">',
    `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>`,
    `<span style="font-weight:600;font-size:11px;color:#93a1a1;">${escapeXml(label)}</span>`,
    `<span style="font-family:monospace;font-size:10px;color:#586e75;">${escapeXml(cidr)}</span>`,
    '</div>',
    `<span style="background:${theme.badgeBg};color:${theme.badgeColor};font-size:9px;font-weight:600;padding:1px 5px;border-radius:3px;">${hostsStr} hosts</span>`,
    '</div>',
  ].join('')
}

/** Convert fill opacity percentage (0-100) to hex alpha for draw.io fillColor */
function opacityToHex(percent: number): string {
  const alpha = Math.round((percent / 100) * 255)
  return alpha.toString(16).padStart(2, '0')
}

export function diagramToDrawio(nodes: Node[], edges: Edge[]): string {
  let cellId = 2 // 0 and 1 are reserved in draw.io

  const cells: string[] = []

  // Root cells required by draw.io
  cells.push('      <mxCell id="0" />')
  cells.push('      <mxCell id="1" parent="0" />')

  const nodeIdMap = new Map<string, number>()

  // Process nodes — containers first, then children
  const topLevel = nodes.filter((n) => !n.parentId)
  const children = nodes.filter((n) => !!n.parentId)

  // Process all nodes
  for (const node of [...topLevel, ...children]) {
    const id = cellId++
    nodeIdMap.set(node.id, id)

    const x = Math.round(node.position.x)
    const y = Math.round(node.position.y)

    const data = node.data as Record<string, unknown>
    const parentDrawioId = node.parentId ? nodeIdMap.get(node.parentId) : 1

    if (data.type === 'vpc-container') {
      const provider = (data.cloudProvider as CloudProvider) || 'generic'
      const theme = CLOUD_THEMES[provider]
      const label = buildVpcLabel(
        data.label as string,
        (data.cidr as string) || '',
        provider,
      )
      const width = Math.round((node.style?.width as number) || 600)
      const height = Math.round((node.style?.height as number) || 400)
      const dashed = theme.borderStyle === 'solid' ? '0' : '1'
      const dashPattern = theme.borderStyle === 'solid' ? '' : 'dashPattern=8 4;'

      const style = [
        'html=1',
        'container=1',
        'collapsible=0',
        'rounded=1',
        `fillColor=${theme.borderColor}${opacityToHex(6)}`,
        `strokeColor=${theme.borderColor}`,
        `dashed=${dashed}`,
        dashPattern,
        'strokeWidth=2',
        'verticalAlign=top',
        'spacingLeft=0',
        'spacingTop=0',
        'overflow=hidden',
      ].filter(Boolean).join(';') + ';'

      cells.push(
        `      <mxCell id="${id}" value="${escapeXml(label)}" style="${style}" vertex="1" parent="${parentDrawioId}">`,
        `        <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />`,
        '      </mxCell>',
      )
    } else if (data.type === 'subnet-container') {
      const provider = (data.cloudProvider as CloudProvider) || 'generic'
      const color = (data.color as string) || '#2aa198'
      const hosts = data.hosts as number | undefined
      const label = buildSubnetLabel(
        data.label as string,
        (data.cidr as string) || '',
        color,
        hosts,
        provider,
      )
      const width = Math.round((node.style?.width as number) || 260)
      const height = Math.round((node.style?.height as number) || 160)

      const style = [
        'html=1',
        'container=1',
        'collapsible=0',
        'rounded=1',
        `fillColor=${color}${opacityToHex(3)}`,
        `strokeColor=${color}`,
        'dashed=1',
        'dashPattern=2 2',
        'strokeWidth=2',
        'verticalAlign=top',
        'spacingLeft=0',
        'spacingTop=0',
        'overflow=hidden',
      ].join(';') + ';'

      cells.push(
        `      <mxCell id="${id}" value="${escapeXml(label)}" style="${style}" vertex="1" parent="${parentDrawioId}">`,
        `        <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />`,
        '      </mxCell>',
      )
    } else if (data.type === 'subnet') {
      // Legacy flat subnet node
      const subData = data as { cidr: string; label: string; color: string }
      const label = escapeXml(`${subData.label}\n${subData.cidr}`)
      const fillColor = subData.color || '#2aa198'

      cells.push(
        `      <mxCell id="${id}" value="${label}" style="rounded=1;whiteSpace=wrap;fillColor=${fillColor};fontColor=#ffffff;strokeColor=none;" vertex="1" parent="${parentDrawioId}">`,
        `        <mxGeometry x="${x}" y="${y}" width="200" height="80" as="geometry" />`,
        '      </mxCell>',
      )
    } else if (data.type === 'cloud-resource') {
      const label = escapeXml(data.label as string)
      const provider = (data.cloudProvider as CloudProvider) || 'generic'
      const resourceType = (data.resourceType as string) || ''
      const iconUri = getDrawioSvgDataUri(provider, resourceType)

      if (iconUri) {
        const style = [
          'shape=image',
          'verticalLabelPosition=bottom',
          'verticalAlign=top',
          'imageAspect=0',
          `image=${iconUri}`,
          'labelBackgroundColor=none',
          'fontColor=#93a1a1',
          'fontSize=9',
          'fontStyle=1',
        ].join(';') + ';'

        cells.push(
          `      <mxCell id="${id}" value="${label}" style="${style}" vertex="1" parent="${parentDrawioId}">`,
          `        <mxGeometry x="${x}" y="${y}" width="48" height="48" as="geometry" />`,
          '      </mxCell>',
        )
      } else {
        // Fallback: styled rectangle
        cells.push(
          `      <mxCell id="${id}" value="${label}" style="rounded=1;whiteSpace=wrap;fillColor=#073642;fontColor=#93a1a1;strokeColor=#2aa198;fontSize=10;fontStyle=1;" vertex="1" parent="${parentDrawioId}">`,
          `        <mxGeometry x="${x}" y="${y}" width="100" height="50" as="geometry" />`,
          '      </mxCell>',
        )
      }
    } else {
      // Legacy resource node
      const resData = data as { resourceType: string; label: string }
      const label = escapeXml(resData.label)
      const iconUri = getDrawioSvgDataUri('generic', resData.resourceType)

      if (iconUri) {
        const style = [
          'shape=image',
          'verticalLabelPosition=bottom',
          'verticalAlign=top',
          'imageAspect=0',
          `image=${iconUri}`,
          'labelBackgroundColor=none',
          'fontColor=#93a1a1',
          'fontSize=9',
          'fontStyle=1',
        ].join(';') + ';'

        cells.push(
          `      <mxCell id="${id}" value="${label}" style="${style}" vertex="1" parent="${parentDrawioId}">`,
          `        <mxGeometry x="${x}" y="${y}" width="48" height="48" as="geometry" />`,
          '      </mxCell>',
        )
      } else {
        const shape = DRAWIO_SHAPES[resData.resourceType] || ''
        const style = shape
          ? `shape=${shape};whiteSpace=wrap;fillColor=#073642;fontColor=#93a1a1;strokeColor=#2aa198;`
          : `rounded=1;whiteSpace=wrap;fillColor=#073642;fontColor=#93a1a1;strokeColor=#2aa198;`

        cells.push(
          `      <mxCell id="${id}" value="${label}" style="${style}" vertex="1" parent="${parentDrawioId}">`,
          `        <mxGeometry x="${x}" y="${y}" width="120" height="60" as="geometry" />`,
          '      </mxCell>',
        )
      }
    }
  }

  for (const edge of edges) {
    const id = cellId++
    const sourceId = nodeIdMap.get(edge.source)
    const targetId = nodeIdMap.get(edge.target)

    if (sourceId !== undefined && targetId !== undefined) {
      cells.push(
        `      <mxCell id="${id}" style="rounded=1;orthogonalLoop=1;jettySize=auto;curved=1;strokeColor=#2aa198;strokeWidth=2;" edge="1" source="${sourceId}" target="${targetId}" parent="1">`,
        '        <mxGeometry relative="1" as="geometry" />',
        '      </mxCell>',
      )
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<mxfile host="subnet.fit">',
    '  <diagram name="Network Diagram">',
    '    <mxGraphModel background="#002b36">',
    '      <root>',
    ...cells,
    '      </root>',
    '    </mxGraphModel>',
    '  </diagram>',
    '</mxfile>',
  ].join('\n')
}

export function getDiagramsNetUrl(xml: string): string {
  // Strip background attribute so diagrams.net uses its own default
  const cleanXml = xml.replace(/ background="[^"]*"/, '')
  const uriEncoded = encodeURIComponent(cleanXml)
  const deflated = pako.deflateRaw(uriEncoded)
  const base64 = btoa(String.fromCharCode.apply(null, deflated as unknown as number[]))
  return `https://app.diagrams.net/#R${base64}`
}
