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

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function logoAndBrand(): string {
  return `<div style="display:flex;align-items:center;gap:16px">
    <img src="${LOGO_DATA_URI}" width="80" height="40" style="width:80px;height:40px" />
    <span style="font-family:'Schibsted Grotesk';font-weight:700;font-size:28px;color:${BASE1}">subnet.fit</span>
  </div>`
}

function rootContainer(...children: string[]): string {
  return `<div style="display:flex;flex-direction:column;width:1200px;height:630px;padding:48px;background-color:${BASE03}">
    ${children.join('')}
  </div>`
}

/** Homepage template */
export function homepageTemplate(): string {
  const pills = [
    { label: 'Calculate', color: CYAN },
    { label: 'Split', color: BLUE },
    { label: 'Design', color: VIOLET },
    { label: 'Export', color: ORANGE },
  ]

  return rootContainer(
    logoAndBrand(),
    `<div style="display:flex;flex-direction:column;margin-top:48px;gap:16px">
      <span style="font-family:'Schibsted Grotesk';font-weight:700;font-size:52px;color:${BASE1}">CIDR Calculator &amp;</span>
      <span style="font-family:'Schibsted Grotesk';font-weight:700;font-size:52px;color:${CYAN}">Network Planner</span>
    </div>`,
    `<div style="display:flex;margin-top:auto;gap:16px">
      ${pills.map(p => `<div style="display:flex;padding:12px 24px;border-radius:8px;background-color:${p.color}20;border:2px solid ${p.color}40">
        <span style="font-family:'Schibsted Grotesk';font-weight:600;font-size:22px;color:${p.color}">${p.label}</span>
      </div>`).join('')}
    </div>`,
  )
}

/** CIDR detail template */
export function cidrTemplate(result: CidrResult): string {
  const detailRows: [string, string][] = [
    ['Network', result.networkAddress],
    ['Broadcast', result.broadcastAddress],
    ['Netmask', result.netmask],
    ['First Host', result.firstHost],
    ['Last Host', result.lastHost],
  ]

  const rfcBadge = result.rfcType
    ? `<div style="display:flex;padding:4px 12px;border-radius:6px;background-color:${GREEN}30">
        <span style="font-family:'Schibsted Grotesk';font-size:16px;color:${GREEN}">${escapeHtml(result.rfcType.split(' — ')[1] || result.rfcType)}</span>
      </div>`
    : ''

  return rootContainer(
    logoAndBrand(),
    `<div style="display:flex;margin-top:32px">
      <span style="font-family:'Martian Mono';font-weight:400;font-size:56px;color:${BASE1}">${escapeHtml(result.input)}</span>
    </div>`,
    `<div style="display:flex;flex-direction:column;margin-top:24px;padding:24px 32px;background-color:${BASE02}e6;border-radius:12px;border:1px solid ${BASE1}20;gap:12px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <span style="font-family:'Martian Mono';font-size:32px;color:${CYAN}">${formatNumber(result.usableHosts)}</span>
        <span style="font-family:'Schibsted Grotesk';font-size:22px;color:${BASE0}">usable hosts</span>
        <div style="display:flex;margin-left:auto;gap:8px">
          <div style="display:flex;padding:4px 12px;border-radius:6px;background-color:${BLUE}30">
            <span style="font-family:'Schibsted Grotesk';font-size:16px;color:${BLUE}">Class ${result.ipClass}</span>
          </div>
          ${rfcBadge}
        </div>
      </div>
      ${detailRows.map(([label, value]) => `<div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:'Schibsted Grotesk';font-size:18px;color:${BASE0}">${label}</span>
        <span style="font-family:'Martian Mono';font-size:18px;color:${BASE1}">${escapeHtml(value)}</span>
      </div>`).join('')}
    </div>`,
  )
}

/** Splitter template */
export function splitterTemplate(
  cidr: string,
  splits: { prefix: number; label: string; hosts: number }[],
): string {
  const colors = [CYAN, VIOLET, YELLOW, GREEN, MAGENTA, ORANGE, BLUE]
  const maxDisplay = 6
  const displaySplits = splits.slice(0, maxDisplay)
  const remaining = splits.length - maxDisplay

  return rootContainer(
    logoAndBrand(),
    `<div style="display:flex;align-items:center;gap:16px;margin-top:24px">
      <span style="font-family:'Martian Mono';font-weight:400;font-size:42px;color:${BASE1}">${escapeHtml(cidr)}</span>
      <div style="display:flex;padding:6px 16px;border-radius:6px;background-color:${VIOLET}30">
        <span style="font-family:'Schibsted Grotesk';font-size:18px;color:${VIOLET}">Subnet Splitter</span>
      </div>
    </div>`,
    `<div style="display:flex;flex-direction:column;margin-top:24px;padding:20px 28px;background-color:${BASE02}e6;border-radius:12px;border:1px solid ${BASE1}20;gap:10px">
      ${displaySplits.map((s, i) => {
        const color = colors[i % colors.length]
        return `<div style="display:flex;align-items:center;gap:12px">
          <div style="display:flex;width:12px;height:12px;border-radius:50%;background-color:${color}"></div>
          <span style="font-family:'Schibsted Grotesk';font-size:20px;color:${BASE1};flex:1">${escapeHtml(s.label)}</span>
          <span style="font-family:'Martian Mono';font-size:18px;color:${BASE0}">/${s.prefix}</span>
          <span style="font-family:'Martian Mono';font-size:16px;color:${CYAN}">${formatNumber(s.hosts)} hosts</span>
        </div>`
      }).join('')}
      ${remaining > 0 ? `<span style="font-family:'Schibsted Grotesk';font-size:18px;color:${BASE0}">+${remaining} more subnet${remaining > 1 ? 's' : ''}...</span>` : ''}
    </div>`,
  )
}

/** Supernet template */
export function supernetTemplate(inputs: string[]): string {
  return rootContainer(
    logoAndBrand(),
    `<div style="display:flex;align-items:center;gap:16px;margin-top:32px">
      <span style="font-family:'Schibsted Grotesk';font-weight:700;font-size:44px;color:${BASE1}">Supernet Calculator</span>
    </div>`,
    `<div style="display:flex;flex-direction:column;margin-top:24px;padding:20px 28px;background-color:${BASE02}e6;border-radius:12px;border:1px solid ${BASE1}20;gap:8px">
      <span style="font-family:'Schibsted Grotesk';font-size:16px;color:${BASE0}">Input Networks</span>
      ${inputs.slice(0, 6).map(net => `<span style="font-family:'Martian Mono';font-size:20px;color:${BASE1}">${escapeHtml(net)}</span>`).join('')}
      ${inputs.length > 6 ? `<span style="font-family:'Schibsted Grotesk';font-size:16px;color:${BASE0}">+${inputs.length - 6} more...</span>` : ''}
    </div>`,
  )
}

/** Designer template */
export function designerTemplate(): string {
  const providerPills = [
    { label: 'AWS', color: ORANGE },
    { label: 'Azure', color: BLUE },
    { label: 'GCP', color: VIOLET },
  ]

  return rootContainer(
    logoAndBrand(),
    `<div style="display:flex;flex-direction:column;margin-top:48px;gap:16px">
      <span style="font-family:'Schibsted Grotesk';font-weight:700;font-size:52px;color:${BASE1}">Network Designer</span>
      <span style="font-family:'Schibsted Grotesk';font-size:24px;color:${BASE0}">Visual cloud architecture diagrams with AWS, Azure &amp; GCP support</span>
    </div>`,
    `<div style="display:flex;margin-top:auto;gap:16px">
      ${providerPills.map(p => `<div style="display:flex;padding:10px 20px;border-radius:8px;background-color:${p.color}20;border:2px solid ${p.color}40">
        <span style="font-family:'Schibsted Grotesk';font-weight:600;font-size:20px;color:${p.color}">${p.label}</span>
      </div>`).join('')}
    </div>`,
  )
}

/** Build the appropriate template for a URL state */
export function buildTemplate(
  state: UrlState | null,
  cidrResult: CidrResult | null,
): string {
  if (!state) {
    return homepageTemplate()
  }

  if (state.mode === 'supernet') {
    const inputs = state.supernetInputs ?? []
    return supernetTemplate(inputs)
  }

  if (!cidrResult) {
    return homepageTemplate()
  }

  if (state.splits && state.splits.length > 0) {
    const splits = state.splits.map((prefix, i) => {
      const label = state.splitLabels?.[i] ?? `Subnet ${i + 1}`
      const hosts = prefix >= 31 ? (prefix === 32 ? 1 : 2) : Math.pow(2, 32 - prefix) - 2
      return { prefix, label, hosts }
    })
    return splitterTemplate(cidrResult.input, splits)
  }

  return cidrTemplate(cidrResult)
}
