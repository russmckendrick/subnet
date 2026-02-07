import { toPng, toSvg } from 'html-to-image'
import type { Node, Edge } from '@xyflow/react'

export async function diagramToPng(element: HTMLElement, isDark: boolean): Promise<Blob> {
  const dataUrl = await toPng(element, {
    backgroundColor: isDark ? '#002b36' : '#fdf6e3',
    pixelRatio: 2,
  })

  const res = await fetch(dataUrl)
  return res.blob()
}

export async function diagramToSvg(element: HTMLElement, isDark: boolean): Promise<Blob> {
  const dataUrl = await toSvg(element, {
    backgroundColor: isDark ? '#002b36' : '#fdf6e3',
  })

  const res = await fetch(dataUrl)
  return res.blob()
}

export function diagramToJson(nodes: Node[], edges: Edge[]): string {
  return JSON.stringify({ nodes, edges, version: 1 }, null, 2)
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
}

export function diagramToDrawio(nodes: Node[], edges: Edge[]): string {
  let cellId = 2 // 0 and 1 are reserved in draw.io

  const cells: string[] = []

  // Root cells required by draw.io
  cells.push('      <mxCell id="0" />')
  cells.push('      <mxCell id="1" parent="0" />')

  const nodeIdMap = new Map<string, number>()

  for (const node of nodes) {
    const id = cellId++
    nodeIdMap.set(node.id, id)

    const x = Math.round(node.position.x)
    const y = Math.round(node.position.y)

    if (node.data && (node.data as Record<string, unknown>).type === 'subnet') {
      const data = node.data as { cidr: string; label: string; color: string }
      const label = escapeXml(`${data.label}\n${data.cidr}`)
      const fillColor = data.color || '#2aa198'

      cells.push(
        `      <mxCell id="${id}" value="${label}" style="rounded=1;whiteSpace=wrap;fillColor=${fillColor};fontColor=#ffffff;strokeColor=none;" vertex="1" parent="1">`,
        `        <mxGeometry x="${x}" y="${y}" width="200" height="80" as="geometry" />`,
        '      </mxCell>',
      )
    } else {
      const data = node.data as { resourceType: string; label: string }
      const label = escapeXml(data.label)
      const shape = DRAWIO_SHAPES[data.resourceType] || ''
      const style = shape
        ? `shape=${shape};whiteSpace=wrap;fillColor=#073642;fontColor=#93a1a1;strokeColor=#2aa198;`
        : `rounded=1;whiteSpace=wrap;fillColor=#073642;fontColor=#93a1a1;strokeColor=#2aa198;`

      cells.push(
        `      <mxCell id="${id}" value="${label}" style="${style}" vertex="1" parent="1">`,
        `        <mxGeometry x="${x}" y="${y}" width="120" height="60" as="geometry" />`,
        '      </mxCell>',
      )
    }
  }

  for (const edge of edges) {
    const id = cellId++
    const sourceId = nodeIdMap.get(edge.source)
    const targetId = nodeIdMap.get(edge.target)

    if (sourceId !== undefined && targetId !== undefined) {
      cells.push(
        `      <mxCell id="${id}" style="orthogonalEdgeStyle;rounded=1;strokeColor=#2aa198;strokeWidth=2;" edge="1" source="${sourceId}" target="${targetId}" parent="1">`,
        '        <mxGeometry relative="1" as="geometry" />',
        '      </mxCell>',
      )
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<mxfile host="subnet.fit">',
    '  <diagram name="Network Diagram">',
    '    <mxGraphModel>',
    '      <root>',
    ...cells,
    '      </root>',
    '    </mxGraphModel>',
    '  </diagram>',
    '</mxfile>',
  ].join('\n')
}
