import type { CidrResult } from '../src/lib/cidr'
import type { UrlState } from '../src/lib/url-codec'
import { LOGO_DATA_URI } from './logo'

// Solarized palette
const BASE03 = '#002b36'
const BASE02 = '#073642'
const BASE0 = '#839496'
const BASE1 = '#93a1a1'
const CYAN = '#2aa198'
const BLUE = '#268bd2'
const MAGENTA = '#d33682'
const GREEN = '#859900'
const YELLOW = '#b58900'
const ORANGE = '#cb4b16'
const VIOLET = '#6c71c4'

const WIDTH = 1200
const HEIGHT = 630

type SatoriNode = {
  type: string
  props: Record<string, unknown> & { children?: (SatoriNode | string)[] }
}

function div(style: Record<string, unknown>, ...children: (SatoriNode | string)[]): SatoriNode {
  return { type: 'div', props: { style, children } }
}

function span(style: Record<string, unknown>, text: string): SatoriNode {
  return { type: 'span', props: { style, children: [text] } }
}

function img(style: Record<string, unknown>, src: string): SatoriNode {
  return { type: 'img', props: { style, src, width: style.width as number, height: style.height as number } }
}

function logoAndBrand(): SatoriNode {
  return div(
    { display: 'flex', alignItems: 'center', gap: '16px' },
    img({ width: 80, height: 40 }, LOGO_DATA_URI),
    span(
      { fontFamily: 'Schibsted Grotesk', fontWeight: 700, fontSize: '28px', color: BASE1 },
      'subnet.fit'
    ),
  )
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

/** Root wrapper with background */
function rootContainer(bgBase64: string | null, ...children: SatoriNode[]): SatoriNode {
  const bgStyle: Record<string, unknown> = bgBase64
    ? { backgroundImage: `url(${bgBase64})`, backgroundSize: `${WIDTH}px ${HEIGHT}px` }
    : { backgroundColor: BASE03 }

  return div(
    {
      display: 'flex',
      flexDirection: 'column',
      width: `${WIDTH}px`,
      height: `${HEIGHT}px`,
      padding: '48px',
      ...bgStyle,
    },
    ...children
  )
}

/** Homepage template */
export function homepageTemplate(bgBase64: string | null): SatoriNode {
  const pills = [
    { label: 'Calculate', color: CYAN },
    { label: 'Split', color: BLUE },
    { label: 'Design', color: VIOLET },
    { label: 'Export', color: ORANGE },
  ]

  return rootContainer(
    bgBase64,
    logoAndBrand(),
    div(
      { display: 'flex', flexDirection: 'column', marginTop: '48px', gap: '16px' },
      span(
        { fontFamily: 'Schibsted Grotesk', fontWeight: 700, fontSize: '52px', color: BASE1 },
        'CIDR Calculator &'
      ),
      span(
        { fontFamily: 'Schibsted Grotesk', fontWeight: 700, fontSize: '52px', color: CYAN },
        'Network Planner'
      ),
    ),
    div(
      { display: 'flex', marginTop: 'auto', gap: '16px' },
      ...pills.map(p =>
        div(
          {
            display: 'flex',
            padding: '12px 24px',
            borderRadius: '8px',
            backgroundColor: `${p.color}20`,
            border: `2px solid ${p.color}40`,
          },
          span(
            { fontFamily: 'Schibsted Grotesk', fontWeight: 600, fontSize: '22px', color: p.color },
            p.label
          ),
        )
      ),
    ),
  )
}

/** CIDR detail template */
export function cidrTemplate(bgBase64: string | null, result: CidrResult): SatoriNode {
  const detailRows: [string, string][] = [
    ['Network', result.networkAddress],
    ['Broadcast', result.broadcastAddress],
    ['Netmask', result.netmask],
    ['First Host', result.firstHost],
    ['Last Host', result.lastHost],
  ]

  return rootContainer(
    bgBase64,
    logoAndBrand(),
    // Large CIDR display
    div(
      { display: 'flex', marginTop: '32px' },
      span(
        { fontFamily: 'Martian Mono', fontWeight: 400, fontSize: '56px', color: BASE1 },
        result.input
      ),
    ),
    // Details card
    div(
      {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '24px',
        padding: '24px 32px',
        backgroundColor: `${BASE02}e6`,
        borderRadius: '12px',
        border: `1px solid ${BASE1}20`,
        gap: '12px',
      },
      // Host count highlight
      div(
        { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
        span(
          { fontFamily: 'Martian Mono', fontSize: '32px', color: CYAN },
          formatNumber(result.usableHosts)
        ),
        span(
          { fontFamily: 'Schibsted Grotesk', fontSize: '22px', color: BASE0 },
          'usable hosts'
        ),
        // Class + RFC badge
        div(
          { display: 'flex', marginLeft: 'auto', gap: '8px' },
          div(
            {
              display: 'flex',
              padding: '4px 12px',
              borderRadius: '6px',
              backgroundColor: `${BLUE}30`,
            },
            span(
              { fontFamily: 'Schibsted Grotesk', fontSize: '16px', color: BLUE },
              `Class ${result.ipClass}`
            ),
          ),
          ...(result.rfcType ? [
            div(
              {
                display: 'flex',
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor: `${GREEN}30`,
              },
              span(
                { fontFamily: 'Schibsted Grotesk', fontSize: '16px', color: GREEN },
                result.rfcType.split(' — ')[1] || result.rfcType
              ),
            ),
          ] : []),
        ),
      ),
      // Detail rows
      ...detailRows.map(([label, value]) =>
        div(
          { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
          span(
            { fontFamily: 'Schibsted Grotesk', fontSize: '18px', color: BASE0 },
            label
          ),
          span(
            { fontFamily: 'Martian Mono', fontSize: '18px', color: BASE1 },
            value
          ),
        )
      ),
    ),
  )
}

/** Splitter template */
export function splitterTemplate(
  bgBase64: string | null,
  cidr: string,
  splits: { prefix: number; label: string; hosts: number }[],
): SatoriNode {
  const colors = [CYAN, VIOLET, YELLOW, GREEN, MAGENTA, ORANGE, BLUE]
  const maxDisplay = 6
  const displaySplits = splits.slice(0, maxDisplay)
  const remaining = splits.length - maxDisplay

  return rootContainer(
    bgBase64,
    logoAndBrand(),
    // Parent CIDR + "Subnet Splitter" label
    div(
      { display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' },
      span(
        { fontFamily: 'Martian Mono', fontWeight: 400, fontSize: '42px', color: BASE1 },
        cidr
      ),
      div(
        {
          display: 'flex',
          padding: '6px 16px',
          borderRadius: '6px',
          backgroundColor: `${VIOLET}30`,
        },
        span(
          { fontFamily: 'Schibsted Grotesk', fontSize: '18px', color: VIOLET },
          'Subnet Splitter'
        ),
      ),
    ),
    // Split rows
    div(
      {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '24px',
        padding: '20px 28px',
        backgroundColor: `${BASE02}e6`,
        borderRadius: '12px',
        border: `1px solid ${BASE1}20`,
        gap: '10px',
      },
      ...displaySplits.map((s, i) => {
        const color = colors[i % colors.length]
        return div(
          { display: 'flex', alignItems: 'center', gap: '12px' },
          // Color dot
          div(
            {
              display: 'flex',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: color,
            },
          ),
          // Label
          span(
            { fontFamily: 'Schibsted Grotesk', fontSize: '20px', color: BASE1, flex: '1' },
            s.label
          ),
          // Prefix
          span(
            { fontFamily: 'Martian Mono', fontSize: '18px', color: BASE0 },
            `/${s.prefix}`
          ),
          // Host count
          span(
            { fontFamily: 'Martian Mono', fontSize: '16px', color: CYAN },
            `${formatNumber(s.hosts)} hosts`
          ),
        )
      }),
      ...(remaining > 0 ? [
        span(
          { fontFamily: 'Schibsted Grotesk', fontSize: '18px', color: BASE0 },
          `+${remaining} more subnet${remaining > 1 ? 's' : ''}...`
        ),
      ] : []),
    ),
  )
}

/** Supernet template */
export function supernetTemplate(
  bgBase64: string | null,
  inputs: string[],
  resultCidr: string | null,
): SatoriNode {
  return rootContainer(
    bgBase64,
    logoAndBrand(),
    div(
      { display: 'flex', alignItems: 'center', gap: '16px', marginTop: '32px' },
      span(
        { fontFamily: 'Schibsted Grotesk', fontWeight: 700, fontSize: '44px', color: BASE1 },
        'Supernet Calculator'
      ),
    ),
    // Input networks
    div(
      {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '24px',
        padding: '20px 28px',
        backgroundColor: `${BASE02}e6`,
        borderRadius: '12px',
        border: `1px solid ${BASE1}20`,
        gap: '8px',
      },
      span(
        { fontFamily: 'Schibsted Grotesk', fontSize: '16px', color: BASE0 },
        'Input Networks'
      ),
      ...inputs.slice(0, 6).map(net =>
        span(
          { fontFamily: 'Martian Mono', fontSize: '20px', color: BASE1 },
          net
        )
      ),
      ...(inputs.length > 6 ? [
        span(
          { fontFamily: 'Schibsted Grotesk', fontSize: '16px', color: BASE0 },
          `+${inputs.length - 6} more...`
        ),
      ] : []),
    ),
    // Result
    ...(resultCidr ? [
      div(
        { display: 'flex', alignItems: 'center', gap: '16px', marginTop: 'auto' },
        span(
          { fontFamily: 'Schibsted Grotesk', fontSize: '20px', color: BASE0 },
          'Aggregated Result:'
        ),
        span(
          { fontFamily: 'Martian Mono', fontSize: '32px', color: CYAN },
          resultCidr
        ),
      ),
    ] : []),
  )
}

/** Designer template */
export function designerTemplate(bgBase64: string | null): SatoriNode {
  return rootContainer(
    bgBase64,
    logoAndBrand(),
    div(
      { display: 'flex', flexDirection: 'column', marginTop: '48px', gap: '16px' },
      span(
        { fontFamily: 'Schibsted Grotesk', fontWeight: 700, fontSize: '52px', color: BASE1 },
        'Network Designer'
      ),
      span(
        { fontFamily: 'Schibsted Grotesk', fontSize: '24px', color: BASE0 },
        'Visual cloud architecture diagrams with AWS, Azure & GCP support'
      ),
    ),
    div(
      { display: 'flex', marginTop: 'auto', gap: '16px' },
      ...['AWS', 'Azure', 'GCP'].map((label, i) => {
        const colors = [ORANGE, BLUE, VIOLET]
        return div(
          {
            display: 'flex',
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: `${colors[i]}20`,
            border: `2px solid ${colors[i]}40`,
          },
          span(
            { fontFamily: 'Schibsted Grotesk', fontWeight: 600, fontSize: '20px', color: colors[i] },
            label
          ),
        )
      }),
    ),
  )
}

/** Build the appropriate template for a URL state */
export function buildTemplate(
  bgBase64: string | null,
  state: UrlState | null,
  cidrResult: CidrResult | null,
): SatoriNode {
  // Designer
  // (handled separately in og-image.ts based on path)

  if (!state) {
    return homepageTemplate(bgBase64)
  }

  if (state.mode === 'supernet') {
    const inputs = state.supernetInputs ?? []
    // We can't easily compute supernet result without more complex logic,
    // so just show inputs
    return supernetTemplate(bgBase64, inputs, null)
  }

  // Network mode
  if (!cidrResult) {
    return homepageTemplate(bgBase64)
  }

  if (state.splits && state.splits.length > 0) {
    const splits = state.splits.map((prefix, i) => {
      const label = state.splitLabels?.[i] ?? `Subnet ${i + 1}`
      const hosts = prefix >= 31 ? (prefix === 32 ? 1 : 2) : Math.pow(2, 32 - prefix) - 2
      return { prefix, label, hosts }
    })
    return splitterTemplate(bgBase64, cidrResult.input, splits)
  }

  return cidrTemplate(bgBase64, cidrResult)
}
