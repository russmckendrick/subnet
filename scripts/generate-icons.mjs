#!/usr/bin/env node

/**
 * SVG → TSX Icon Generator + Raw SVG String Map Generator
 *
 * Auto-discovers SVGs in icons/{provider}/ and generates:
 * 1. React TSX components in src/components/designer/icons/{provider}/
 * 2. Raw SVG string maps in src/lib/drawio-svg-strings/{provider}.ts (for draw.io export)
 *
 * Usage:
 *   node scripts/generate-icons.mjs          # all providers
 *   node scripts/generate-icons.mjs azure    # one provider
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ICONS_SRC = join(ROOT, 'icons')
const ICONS_DST = join(ROOT, 'src', 'components', 'designer', 'icons')
const SVG_STRINGS_DST = join(ROOT, 'src', 'lib', 'drawio-svg-strings')

const PROVIDERS = ['aws', 'azure', 'gcp']

// ── Attribute conversion ────────────────────────────────────────────────

const KEBAB_ATTRS = {
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'fill-rule': 'fillRule',
  'fill-opacity': 'fillOpacity',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'font-size': 'fontSize',
  'font-family': 'fontFamily',
  'font-weight': 'fontWeight',
  'text-anchor': 'textAnchor',
  'dominant-baseline': 'dominantBaseline',
  'alignment-baseline': 'alignmentBaseline',
  'baseline-shift': 'baselineShift',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'lighting-color': 'lightingColor',
  'shape-rendering': 'shapeRendering',
  'image-rendering': 'imageRendering',
  'pointer-events': 'pointerEvents',
  'enable-background': 'enableBackground',
  'gradient-units': 'gradientUnits',
  'gradient-transform': 'gradientTransform',
  'spread-method': 'spreadMethod',
  'pattern-units': 'patternUnits',
  'pattern-transform': 'patternTransform',
  'marker-start': 'markerStart',
  'marker-mid': 'markerMid',
  'marker-end': 'markerEnd',
  'xlink:href': 'xlinkHref',
}

// Attributes to strip from the root <svg>
const STRIP_ROOT_ATTRS = ['xmlns:xlink', 'id', 'width', 'height']

// ── Name derivation ─────────────────────────────────────────────────────

/**
 * Derive component name and resource key from SVG filename.
 * Examples:
 *   AzureFirewall.svg    → { component: 'AzureFirewallIcon',  key: 'azure-firewall' }
 *   AzureVmIcon.svg      → { component: 'AzureVmIcon',        key: 'azure-vm' }
 *   AzureFilesIcons.svg  → { component: 'AzureFilesIcon',     key: 'azure-files' }
 *   AwsEc2Icon.svg       → { component: 'AwsEc2Icon',         key: 'aws-ec2' }
 */
function deriveNames(filename, provider) {
  let stem = basename(filename, '.svg')

  // Normalize "Icons" (plural) → "Icon" (singular)
  stem = stem.replace(/Icons$/, 'Icon')

  // Ensure it ends with "Icon"
  if (!stem.endsWith('Icon')) {
    stem += 'Icon'
  }

  const componentName = stem

  // Derive resource key: strip provider prefix + "Icon" suffix
  const providerPrefix = provider.charAt(0).toUpperCase() + provider.slice(1)
  let keyPart = stem

  // Remove provider prefix (e.g., "Azure", "Aws", "Gcp")
  if (keyPart.startsWith(providerPrefix)) {
    keyPart = keyPart.slice(providerPrefix.length)
  }

  // Remove "Icon" suffix
  if (keyPart.endsWith('Icon')) {
    keyPart = keyPart.slice(0, -4)
  }

  // Convert PascalCase to lowercase (e.g., "AppGw" → "appgw", "VpnGw" → "vpngw")
  const resourceKey = `${provider}-${keyPart.toLowerCase()}`

  return { componentName, resourceKey }
}

// ── SVG Processing ──────────────────────────────────────────────────────

/**
 * Convert kebab-case SVG attributes to camelCase JSX attributes.
 */
function convertAttributes(svgContent) {
  let result = svgContent

  // Convert all known kebab-case attributes
  for (const [kebab, camel] of Object.entries(KEBAB_ATTRS)) {
    // Match attribute in tag context (preceded by space or start of attributes)
    const escaped = kebab.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(`\\b${escaped}=`, 'g'), `${camel}=`)
  }

  // Remove xmlns:xlink declarations
  result = result.replace(/\s+xmlns:xlink="[^"]*"/g, '')

  return result
}

/**
 * Strip elements and content that are invalid or unnecessary in JSX.
 */
function stripNonJsxContent(content) {
  let result = content
  // Remove HTML comments (invalid in JSX)
  result = result.replace(/<!--[\s\S]*?-->/g, '')
  // Remove <title> elements
  result = result.replace(/<title>[^<]*<\/title>/g, '')
  // Remove <desc> elements
  result = result.replace(/<desc>[^<]*<\/desc>/g, '')
  // Remove decorative id attributes (on g, rect, path, circle, ellipse, line, polyline, polygon)
  // but keep functional ids (on linearGradient, radialGradient, clipPath, mask, filter, pattern, symbol, marker)
  result = result.replace(/<(g|rect|path|circle|ellipse|line|polyline|polygon)(\s)/g, (match, tag, space) => {
    return `<${tag}${space}`
  })
  // Remove id from decorative elements only
  result = result.replace(/(<(?:g|rect|path|circle|ellipse|line|polyline|polygon)\b[^>]*?)\s+id="[^"]*"/g, '$1')
  return result
}

/**
 * Namespace all id definitions and url(#...) references with a component-specific prefix
 * to avoid conflicts when multiple icons render on the same page.
 */
function namespaceIds(content, componentName) {
  // Collect all id values from functional elements (defs children)
  const idMatches = [...content.matchAll(/id="([^"]*)"/g)]
  const ids = [...new Set(idMatches.map((m) => m[1]))]

  if (ids.length === 0) return content

  // Create a short prefix from the component name (e.g., "AwsVpcIcon" → "awsvpc")
  const prefix = componentName.replace(/Icon$/, '').replace(/([A-Z])/g, (c) => c.toLowerCase())

  let result = content
  for (const id of ids) {
    const namespacedId = `${prefix}_${id}`
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Replace id definition
    result = result.replace(new RegExp(`id="${escapedId}"`, 'g'), `id="${namespacedId}"`)
    // Replace url(#...) references
    result = result.replace(new RegExp(`url\\(#${escapedId}\\)`, 'g'), `url(#${namespacedId})`)
    // Replace xlinkHref="#..." references
    result = result.replace(new RegExp(`xlinkHref="#${escapedId}"`, 'g'), `xlinkHref="#${namespacedId}"`)
    result = result.replace(new RegExp(`href="#${escapedId}"`, 'g'), `href="#${namespacedId}"`)
  }

  return result
}

/**
 * Extract viewBox and inner content from SVG string.
 */
function parseSvg(svgString, componentName) {
  // Extract viewBox
  const viewBoxMatch = svgString.match(/viewBox="([^"]*)"/)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 18 18'

  // Extract content between opening and closing svg tags
  const innerMatch = svgString.match(/<svg[^>]*>([\s\S]*)<\/svg>/)
  if (!innerMatch) {
    throw new Error('Could not parse SVG content')
  }

  let inner = innerMatch[1]

  // Strip comments, <title>, <desc>, decorative ids
  inner = stripNonJsxContent(inner)

  // Convert attributes
  inner = convertAttributes(inner)

  // Namespace remaining ids (gradients, clipPaths, etc.) to avoid cross-icon conflicts
  inner = namespaceIds(inner, componentName)

  return { viewBox, inner: inner.trim() }
}

/**
 * Remove root-level attributes that shouldn't be in the JSX output.
 */
function cleanRootSvg(svgString) {
  let result = svgString
  for (const attr of STRIP_ROOT_ATTRS) {
    const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(`\\s+${escaped}="[^"]*"`, 'g'), '')
  }
  return result
}

// ── Raw SVG Processing (for draw.io export) ─────────────────────────────

/**
 * Parse an SVG file for raw SVG string output (keeps kebab-case attributes,
 * strips comments/titles/desc/decorative ids, namespaces functional ids).
 * Returns a complete standalone SVG string suitable for data URI embedding.
 */
function parseSvgForRaw(svgString, componentName) {
  const viewBoxMatch = svgString.match(/viewBox="([^"]*)"/)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 18 18'

  const innerMatch = svgString.match(/<svg[^>]*>([\s\S]*)<\/svg>/)
  if (!innerMatch) {
    throw new Error('Could not parse SVG content for raw output')
  }

  let inner = innerMatch[1]

  // Strip comments, <title>, <desc>, decorative ids (same as JSX pipeline)
  inner = stripNonJsxContent(inner)

  // Namespace functional ids (gradients, clipPaths) — but keep kebab-case attributes
  inner = namespaceIds(inner, componentName)

  // Collapse whitespace into single line for safe embedding in string literals
  const singleLine = inner.trim().replace(/\s+/g, ' ').replace(/>\s+</g, '><')

  // Build a complete standalone SVG element
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${singleLine}</svg>`
}

/**
 * Generate a TypeScript file exporting a Record<string, string> of raw SVG strings.
 */
function generateSvgStringMapFile(provider, entries) {
  const sorted = [...entries].sort((a, b) => a.resourceKey.localeCompare(b.resourceKey))
  const providerUpper = provider.toUpperCase()

  const mapEntries = sorted
    .map((e) => `  '${e.resourceKey}': '${e.rawSvg.replace(/'/g, "\\'")}',`)
    .join('\n')

  return `// Auto-generated by scripts/generate-icons.mjs — do not edit manually
export const ${providerUpper}_SVG_STRINGS: Record<string, string> = {
${mapEntries}
}
`
}

// ── Code Generation ─────────────────────────────────────────────────────

/**
 * Generate TSX component source for a single icon.
 */
function generateTsx(componentName, viewBox, innerContent) {
  return `interface IconProps {
  className?: string
  color?: string
}

export function ${componentName}({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" className={className}>
      ${innerContent}
    </svg>
  )
}
`
}

/**
 * Generate barrel index.ts with sorted imports and icon map.
 */
function generateBarrel(provider, entries) {
  // Sort by component name
  const sorted = [...entries].sort((a, b) => a.componentName.localeCompare(b.componentName))

  const providerUpper = provider.toUpperCase()

  const imports = sorted
    .map((e) => `import { ${e.componentName} } from './${e.componentName}'`)
    .join('\n')

  const mapEntries = sorted
    .map((e) => `  '${e.resourceKey}': ${e.componentName},`)
    .join('\n')

  return `${imports}

export const ${providerUpper}_ICON_MAP: Record<string, React.ComponentType<{ className?: string; color?: string }>> = {
${mapEntries}
}
`
}

// ── Main ────────────────────────────────────────────────────────────────

function processProvider(provider) {
  const srcDir = join(ICONS_SRC, provider)
  const dstDir = join(ICONS_DST, provider)

  if (!existsSync(srcDir)) {
    console.log(`  ⏭  No icons/${provider}/ directory found, skipping`)
    return
  }

  const svgFiles = readdirSync(srcDir).filter((f) => f.endsWith('.svg')).sort()

  if (svgFiles.length === 0) {
    console.log(`  ⏭  No SVG files in icons/${provider}/`)
    return
  }

  // Ensure output directories exist
  if (!existsSync(dstDir)) {
    mkdirSync(dstDir, { recursive: true })
  }
  if (!existsSync(SVG_STRINGS_DST)) {
    mkdirSync(SVG_STRINGS_DST, { recursive: true })
  }

  console.log(`  Processing ${svgFiles.length} SVGs...`)

  const entries = []

  for (const file of svgFiles) {
    const svgPath = join(srcDir, file)
    const svgRaw = readFileSync(svgPath, 'utf-8')

    const { componentName, resourceKey } = deriveNames(file, provider)
    const { viewBox, inner } = parseSvg(svgRaw, componentName)

    const tsx = generateTsx(componentName, viewBox, inner)
    const tsxPath = join(dstDir, `${componentName}.tsx`)
    writeFileSync(tsxPath, tsx, 'utf-8')

    // Also generate raw SVG string for draw.io export
    const rawSvg = parseSvgForRaw(svgRaw, componentName)

    entries.push({ componentName, resourceKey, rawSvg })
    console.log(`    ✓ ${file} → ${componentName}.tsx (${resourceKey})`)
  }

  // Generate barrel index.ts
  const barrel = generateBarrel(provider, entries)
  writeFileSync(join(dstDir, 'index.ts'), barrel, 'utf-8')
  console.log(`    ✓ index.ts (${entries.length} icons)`)

  // Generate raw SVG string map for draw.io export
  const svgStringMap = generateSvgStringMapFile(provider, entries)
  const svgStringPath = join(SVG_STRINGS_DST, `${provider}.ts`)
  writeFileSync(svgStringPath, svgStringMap, 'utf-8')
  console.log(`    ✓ drawio-svg-strings/${provider}.ts (${entries.length} SVG strings)`)
}

// CLI
const args = process.argv.slice(2)
const providers = args.length > 0 ? args.filter((a) => PROVIDERS.includes(a)) : PROVIDERS

if (args.length > 0 && providers.length === 0) {
  console.error(`Unknown provider(s): ${args.join(', ')}. Valid: ${PROVIDERS.join(', ')}`)
  process.exit(1)
}

console.log(`Generating icons for: ${providers.join(', ')}`)
for (const provider of providers) {
  console.log(`\n${provider.toUpperCase()}:`)
  processProvider(provider)
}
console.log('\nDone!')
