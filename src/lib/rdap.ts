export interface RdapResult {
  networkName: string | null
  handle: string | null
  cidr: string | null
  startAddress: string | null
  endAddress: string | null
  country: string | null
  rir: string | null
  organizationName: string | null
  organizationHandle: string | null
  registrationDate: string | null
  lastChanged: string | null
  port43: string | null
  rdapUrl: string
}

export type RdapLookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: RdapResult }
  | { status: 'error'; message: string }
  | { status: 'private' }

const RIR_MAP: Record<string, string> = {
  'whois.arin.net': 'ARIN',
  'whois.ripe.net': 'RIPE NCC',
  'whois.apnic.net': 'APNIC',
  'whois.lacnic.net': 'LACNIC',
  'whois.afrinic.net': 'AFRINIC',
}

function extractRir(port43: string | undefined): string | null {
  if (!port43) return null
  return RIR_MAP[port43] ?? port43
}

function extractOrganization(entities: unknown[] | undefined): { name: string | null; handle: string | null } {
  if (!Array.isArray(entities)) return { name: null, handle: null }

  for (const entity of entities) {
    const e = entity as Record<string, unknown>
    const roles = e?.roles as string[] | undefined
    if (!roles?.includes('registrant')) continue

    const handle = (e?.handle as string) ?? null
    const vcardArray = e?.vcardArray as unknown[] | undefined
    if (!Array.isArray(vcardArray) || vcardArray.length < 2) return { name: null, handle }

    const vcard = vcardArray[1] as unknown[][]
    if (!Array.isArray(vcard)) return { name: null, handle }

    for (const field of vcard) {
      if (Array.isArray(field) && field[0] === 'fn') {
        return { name: (field[3] as string) ?? null, handle }
      }
    }
    return { name: null, handle }
  }

  // Fallback: try any entity with a vcardArray
  for (const entity of entities) {
    const e = entity as Record<string, unknown>
    const vcardArray = e?.vcardArray as unknown[] | undefined
    if (!Array.isArray(vcardArray) || vcardArray.length < 2) continue

    const vcard = vcardArray[1] as unknown[][]
    if (!Array.isArray(vcard)) continue

    for (const field of vcard) {
      if (Array.isArray(field) && field[0] === 'fn') {
        return { name: (field[3] as string) ?? null, handle: (e?.handle as string) ?? null }
      }
    }
  }

  return { name: null, handle: null }
}

function extractEventDate(events: unknown[] | undefined, action: string): string | null {
  if (!Array.isArray(events)) return null
  for (const event of events) {
    const e = event as Record<string, unknown>
    if (e?.eventAction === action) {
      return (e?.eventDate as string) ?? null
    }
  }
  return null
}

export function parseRdapResponse(json: Record<string, unknown>, queryUrl: string): RdapResult {
  const cidr0 = (json.cidr0_cidrs as Array<{ v4prefix?: string; length?: number }> | undefined)?.[0]
  const cidrStr = cidr0?.v4prefix && cidr0?.length != null
    ? `${cidr0.v4prefix}/${cidr0.length}`
    : (json.startAddress as string) ?? null

  const org = extractOrganization(json.entities as unknown[] | undefined)

  return {
    networkName: (json.name as string) ?? null,
    handle: (json.handle as string) ?? null,
    cidr: cidrStr,
    startAddress: (json.startAddress as string) ?? null,
    endAddress: (json.endAddress as string) ?? null,
    country: (json.country as string) ?? null,
    rir: extractRir(json.port43 as string | undefined),
    organizationName: org.name,
    organizationHandle: org.handle,
    registrationDate: extractEventDate(json.events as unknown[] | undefined, 'registration'),
    lastChanged: extractEventDate(json.events as unknown[] | undefined, 'last changed'),
    port43: (json.port43 as string) ?? null,
    rdapUrl: queryUrl,
  }
}
