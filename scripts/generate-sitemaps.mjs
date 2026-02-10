/**
 * Generate static sitemap XML files into dist/ after Vite build.
 * Replaces dynamic Worker-based sitemap generation so files are served
 * as plain static assets through Cloudflare Assets.
 */
import { writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DIST = join(import.meta.dirname, '..', 'dist')
const BASE_URL = 'https://subnet.fit'

if (!existsSync(DIST)) {
  console.error('dist/ directory not found — run vite build first')
  process.exit(1)
}

// ─── Inlined IPv4 helpers (from src/lib/ipv4.ts & cidr.ts) ──────

function ipv4ToString(num) {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join('.')
}

function getNetmask(prefix) {
  if (prefix === 0) return 0
  return (~0 << (32 - prefix)) >>> 0
}

function getNetworkAddress(ip, prefix) {
  return (ip & getNetmask(prefix)) >>> 0
}

// ─── Sitemap helpers ─────────────────────────────────────────────

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>'

function urlEntry(loc, priority, changefreq = 'weekly') {
  return `<url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
}

function cidrPath(networkNum, prefix) {
  return `${BASE_URL}/${ipv4ToString(networkNum)}/${prefix}`
}

function* iterateRange(baseIp, parentPrefix, childPrefix) {
  const step = Math.pow(2, 32 - childPrefix) >>> 0
  const endIp = (getNetworkAddress(baseIp, parentPrefix) + Math.pow(2, 32 - parentPrefix)) >>> 0
  let current = getNetworkAddress(baseIp, parentPrefix) >>> 0
  while ((current >>> 0) < (endIp >>> 0) && (current >>> 0) >= (getNetworkAddress(baseIp, parentPrefix) >>> 0)) {
    yield current >>> 0
    const next = (current + step) >>> 0
    if (next <= current && current !== 0) break
    current = next
  }
}

// ─── RFC 1918 ranges ─────────────────────────────────────────────

const RFC1918_10 = { base: 0x0a000000, prefix: 8 }
const RFC1918_172 = { base: 0xac100000, prefix: 12 }
const RFC1918_192 = { base: 0xc0a80000, prefix: 16 }

function generateTier1Urls() {
  const urls = []
  const ranges = [RFC1918_10, RFC1918_172, RFC1918_192]
  for (const range of ranges) {
    const maxChild = 20
    for (let prefix = range.prefix; prefix <= maxChild; prefix++) {
      for (const networkNum of iterateRange(range.base, range.prefix, prefix)) {
        urls.push(urlEntry(cidrPath(networkNum, prefix), '0.9'))
      }
    }
  }
  return urls
}

// ─── Tier 2: Popular /16 blocks with /21 through /24 ────────────

const TIER2_BLOCKS = [
  { base: 0x0a000000, prefix: 16 },
  { base: 0x0a010000, prefix: 16 },
  { base: 0x0a0a0000, prefix: 16 },
  { base: 0x0a640000, prefix: 16 },
  { base: 0xac100000, prefix: 16 },
  { base: 0xac140000, prefix: 16 },
  { base: 0xc0a80000, prefix: 16 },
]

function generateTier2Urls() {
  const urls = []
  for (const block of TIER2_BLOCKS) {
    for (let prefix = 21; prefix <= 24; prefix++) {
      for (const networkNum of iterateRange(block.base, block.prefix, prefix)) {
        urls.push(urlEntry(cidrPath(networkNum, prefix), '0.7'))
      }
    }
  }
  return urls
}

// ─── Tier 3: Curated popular CIDRs /25 through /28 ──────────────

const TIER3_CIDRS = [
  { base: 0xc0a80100, prefix: 24 }, { base: 0xc0a80100, prefix: 25 },
  { base: 0xc0a80180, prefix: 25 }, { base: 0xc0a80100, prefix: 26 },
  { base: 0xc0a80140, prefix: 26 }, { base: 0xc0a80180, prefix: 26 },
  { base: 0xc0a801c0, prefix: 26 }, { base: 0xc0a80100, prefix: 27 },
  { base: 0xc0a80100, prefix: 28 }, { base: 0xc0a80000, prefix: 25 },
  { base: 0xc0a80080, prefix: 25 }, { base: 0xc0a80000, prefix: 26 },
  { base: 0xc0a80000, prefix: 27 }, { base: 0xc0a80000, prefix: 28 },
  { base: 0x0a000000, prefix: 25 }, { base: 0x0a000080, prefix: 25 },
  { base: 0x0a000000, prefix: 26 }, { base: 0x0a000000, prefix: 27 },
  { base: 0x0a000000, prefix: 28 }, { base: 0x0a000100, prefix: 25 },
  { base: 0x0a000100, prefix: 26 }, { base: 0x0a000100, prefix: 27 },
  { base: 0x0a000100, prefix: 28 }, { base: 0xac100000, prefix: 25 },
  { base: 0xac100000, prefix: 26 }, { base: 0xac100000, prefix: 27 },
  { base: 0xac100000, prefix: 28 }, { base: 0x0a000200, prefix: 25 },
  { base: 0x0a000200, prefix: 26 }, { base: 0x0a000300, prefix: 25 },
  { base: 0x0a000300, prefix: 26 }, { base: 0xc0a80a00, prefix: 25 },
  { base: 0xc0a80a00, prefix: 26 }, { base: 0xc0a80a00, prefix: 27 },
  { base: 0xc0a86400, prefix: 25 }, { base: 0xc0a86400, prefix: 26 },
  { base: 0xc0a86400, prefix: 27 },
]

function generateTier3Urls() {
  return TIER3_CIDRS.map(({ base, prefix }) => urlEntry(cidrPath(base, prefix), '0.5'))
}

// ─── Splitter URLs ───────────────────────────────────────────────

const SPLITTER_EXAMPLES = [
  { cidr: '10.0.0.0/16', split: '24~Web,24~App,24~Database' },
  { cidr: '10.0.0.0/16', split: '24~Public,24~Private,24~Data' },
  { cidr: '10.0.0.0/16', split: '22~Production,22~Staging,24~Dev' },
  { cidr: '10.0.0.0/16', split: '20~Workloads,24~Management,24~DMZ' },
  { cidr: '172.16.0.0/16', split: '24~Web,24~App,24~Database' },
  { cidr: '172.16.0.0/16', split: '24~Frontend,24~Backend,24~Storage' },
  { cidr: '192.168.0.0/16', split: '24~Web,24~App,24~Database' },
  { cidr: '192.168.1.0/24', split: '26~Servers,26~Clients,26~IoT' },
  { cidr: '192.168.1.0/24', split: '25~Wired,25~Wireless' },
  { cidr: '192.168.0.0/24', split: '26~LAN,26~WiFi,26~Guest' },
  { cidr: '10.0.0.0/16', split: '24~Public-AZ1,24~Public-AZ2,24~Private-AZ1,24~Private-AZ2' },
  { cidr: '10.0.0.0/16', split: '19~AZ1,19~AZ2,19~AZ3' },
  { cidr: '10.1.0.0/16', split: '24~Web,24~App,24~Cache,24~Database' },
  { cidr: '10.0.0.0/16', split: '24~GatewaySubnet,24~AppSubnet,24~DataSubnet' },
  { cidr: '172.16.0.0/12', split: '16~Prod,16~Dev,16~Test' },
  { cidr: '192.168.1.0/24', split: '27~Servers,27~Printers,26~Workstations,27~WiFi' },
  { cidr: '192.168.10.0/24', split: '26~Office,26~Lab,27~Management,27~Guest' },
  { cidr: '10.0.0.0/24', split: '26~A,26~B,26~C,26~D' },
  { cidr: '10.0.0.0/24', split: '25~Left,25~Right' },
  { cidr: '10.0.0.0/16', split: '18~A,18~B,18~C,18~D' },
  { cidr: '10.0.0.0/24', split: '28~Web,28~App,28~DB,28~Cache,28~Queue' },
  { cidr: '192.168.0.0/24', split: '28~VLAN10,28~VLAN20,28~VLAN30,28~VLAN40' },
  { cidr: '10.0.0.0/16', split: '24~NAT-Gateway,24~Load-Balancers,24~App-Tier,24~Database-Tier,24~Cache-Tier' },
  { cidr: '10.100.0.0/16', split: '20~Production,22~Staging,24~Development,24~CI-CD' },
]

function generateSplitterUrls() {
  return SPLITTER_EXAMPLES.map(({ cidr, split }) =>
    urlEntry(`${BASE_URL}/${cidr}?split=${split}`, '0.6')
  )
}

// ─── Supernet URLs ───────────────────────────────────────────────

const SUPERNET_EXAMPLES = [
  '10.0.0.0/24,10.0.1.0/24',
  '10.0.0.0/24,10.0.1.0/24,10.0.2.0/24,10.0.3.0/24',
  '192.168.0.0/24,192.168.1.0/24',
  '192.168.0.0/24,192.168.1.0/24,192.168.2.0/24,192.168.3.0/24',
  '172.16.0.0/24,172.16.1.0/24',
  '172.16.0.0/24,172.16.1.0/24,172.16.2.0/24,172.16.3.0/24',
  '10.0.0.0/16,10.1.0.0/16',
  '10.0.0.0/16,10.1.0.0/16,10.2.0.0/16,10.3.0.0/16',
  '172.16.0.0/16,172.17.0.0/16',
  '10.0.0.0/24,10.0.1.0/25,10.0.1.128/25',
  '192.168.1.0/25,192.168.1.128/25',
  '10.10.0.0/24,10.10.1.0/24,10.10.2.0/24,10.10.3.0/24',
  '10.0.0.0/24,10.0.1.0/24,10.0.2.0/24',
  '10.100.0.0/24,10.100.1.0/24,10.100.2.0/24,10.100.3.0/24',
  '172.16.0.0/20,172.16.16.0/20',
  '10.0.0.0/8,172.16.0.0/12,192.168.0.0/16',
  '10.0.0.0/24,10.0.1.0/24,10.0.2.0/23',
  '192.168.10.0/24,192.168.11.0/24,192.168.12.0/24,192.168.13.0/24',
  '10.0.0.0/28,10.0.0.16/28',
  '192.168.1.0/26,192.168.1.64/26,192.168.1.128/26,192.168.1.192/26',
]

function generateSupernetUrls() {
  return SUPERNET_EXAMPLES.map(nets =>
    urlEntry(`${BASE_URL}/super?nets=${nets}`, '0.5')
  )
}

// ─── Generate all sitemaps ───────────────────────────────────────

function wrapUrlset(urls) {
  return `${XML_HEADER}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
}

const sitemaps = {
  'sitemap.xml': `${XML_HEADER}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${BASE_URL}/sitemap-pages.xml</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-cidr.xml</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-splitter.xml</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-supernet.xml</loc></sitemap>
</sitemapindex>`,

  'sitemap-pages.xml': wrapUrlset([
    urlEntry(BASE_URL + '/', '1.0', 'daily'),
    urlEntry(BASE_URL + '/designer', '0.8', 'weekly'),
  ]),

  'sitemap-cidr.xml': wrapUrlset([
    ...generateTier1Urls(),
    ...generateTier2Urls(),
    ...generateTier3Urls(),
  ]),

  'sitemap-splitter.xml': wrapUrlset(generateSplitterUrls()),

  'sitemap-supernet.xml': wrapUrlset(generateSupernetUrls()),
}

// ─── Write files ─────────────────────────────────────────────────

let totalUrls = 0
for (const [filename, content] of Object.entries(sitemaps)) {
  const path = join(DIST, filename)
  writeFileSync(path, content, 'utf-8')
  const urlCount = (content.match(/<url>/g) || []).length
  totalUrls += urlCount
  const size = (Buffer.byteLength(content) / 1024).toFixed(1)
  console.log(`  ${filename} (${urlCount > 0 ? `${urlCount} URLs, ` : ''}${size} KB)`)
}
console.log(`\nGenerated ${Object.keys(sitemaps).length} sitemaps with ${totalUrls} total URLs`)
