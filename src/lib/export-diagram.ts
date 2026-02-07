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
  return JSON.stringify({ nodes, edges, version: 2 }, null, 2)
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
      const label = escapeXml(`${data.label as string}`)
      const width = Math.round((node.style?.width as number) || 600)
      const height = Math.round((node.style?.height as number) || 400)
      const borderColor = (data.cloudProvider === 'aws') ? '#FF9900'
        : (data.cloudProvider === 'azure') ? '#0078D4'
        : (data.cloudProvider === 'gcp') ? '#4285F4'
        : '#2aa198'

      cells.push(
        `      <mxCell id="${id}" value="${label}" style="rounded=1;whiteSpace=wrap;container=1;collapsible=0;fillColor=none;strokeColor=${borderColor};dashed=1;dashPattern=8 4;strokeWidth=2;fontColor=#586e75;verticalAlign=top;align=left;spacingLeft=10;spacingTop=5;" vertex="1" parent="${parentDrawioId}">`,
        `        <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />`,
        '      </mxCell>',
      )
    } else if (data.type === 'subnet-container') {
      const label = escapeXml(`${data.label as string}\n${data.cidr as string}`)
      const width = Math.round((node.style?.width as number) || 260)
      const height = Math.round((node.style?.height as number) || 160)
      const color = (data.color as string) || '#2aa198'

      cells.push(
        `      <mxCell id="${id}" value="${label}" style="rounded=1;whiteSpace=wrap;container=1;collapsible=0;fillColor=none;strokeColor=${color};dashed=1;dashPattern=4 2;strokeWidth=1.5;fontColor=#586e75;verticalAlign=top;align=left;spacingLeft=10;spacingTop=5;" vertex="1" parent="${parentDrawioId}">`,
        `        <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />`,
        '      </mxCell>',
      )
    } else if (data.type === 'subnet') {
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

      cells.push(
        `      <mxCell id="${id}" value="${label}" style="rounded=1;whiteSpace=wrap;fillColor=#073642;fontColor=#93a1a1;strokeColor=#2aa198;" vertex="1" parent="${parentDrawioId}">`,
        `        <mxGeometry x="${x}" y="${y}" width="100" height="50" as="geometry" />`,
        '      </mxCell>',
      )
    } else {
      // resource type (legacy)
      const resData = data as { resourceType: string; label: string }
      const label = escapeXml(resData.label)
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
