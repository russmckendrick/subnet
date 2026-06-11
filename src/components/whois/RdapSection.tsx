import { useCalculatorStore } from '@/store/calculator-store'
import { useRdapLookup } from '@/hooks/use-rdap-lookup'
import { LabelValue } from '@/components/shared/LabelValue'
import { clearCacheEntry } from '@/lib/rdap-cache'
import type { RdapResult } from '@/lib/rdap'

function DataField({ label, value, copyKey }: { label: string; value: string | null; copyKey?: string }) {
  if (!value) return null
  return (
    <LabelValue label={label} copyText={copyKey ? value : undefined} copyKey={copyKey} mono>
      {value}
    </LabelValue>
  )
}

function RdapData({ data }: { data: RdapResult }) {
  const formattedRegDate = data.registrationDate
    ? new Date(data.registrationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null
  const formattedLastChanged = data.lastChanged
    ? new Date(data.lastChanged).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {data.rir && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sol-cyan/10 text-sol-cyan font-semibold uppercase tracking-wider">
            {data.rir}
          </span>
        )}
        {data.country && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sol-base01/10 text-ink font-semibold uppercase tracking-wider">
            {data.country}
          </span>
        )}
        {data.networkName && (
          <span className="text-sm font-bold font-mono text-ink">
            {data.networkName}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
        <DataField label="Organization" value={data.organizationName} />
        <DataField label="Handle" value={data.handle} />
        <DataField label="Allocated Range" value={data.cidr} copyKey="rdap-cidr" />
        <DataField label="Start Address" value={data.startAddress} copyKey="rdap-start" />
        <DataField label="End Address" value={data.endAddress} copyKey="rdap-end" />
        <DataField label="Registered" value={formattedRegDate} />
        <DataField label="Last Updated" value={formattedLastChanged} />
        <DataField label="Org Handle" value={data.organizationHandle} />
      </div>

      <a
        href={data.rdapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-sol-cyan hover:underline"
      >
        View full RDAP record
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  )
}

function RdapSectionInner() {
  const { result } = useCalculatorStore()
  const state = useRdapLookup(
    result?.networkAddress ?? null,
    result?.rfcType ?? null,
  )

  if (state.status === 'idle') return null

  if (state.status === 'private') {
    return (
      <div className="flex items-center gap-2 text-xs text-sol-base01">
        <svg className="w-4 h-4 text-sol-base01 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        RDAP lookup not available for reserved addresses
      </div>
    )
  }

  if (state.status === 'loading') {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-line/15" />
          <div className="h-5 w-10 rounded-full bg-line/15" />
          <div className="h-5 w-28 rounded bg-line/15" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-16 rounded bg-line/10" />
              <div className="h-4 w-24 rounded bg-line/15" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg bg-sol-yellow/10 border border-sol-yellow/20 px-3 py-2">
        <span className="text-xs text-sol-yellow">{state.message}</span>
        <button
          onClick={() => {
            if (result?.networkAddress) {
              clearCacheEntry(result.networkAddress)
              // Force re-render by toggling the input
              const current = result.input
              const store = useCalculatorStore.getState()
              store.setRawInput(current + ' ')
              requestAnimationFrame(() => store.setRawInput(current))
            }
          }}
          className="text-[10px] font-medium px-2 py-1 rounded-lg bg-sol-yellow/15 text-sol-yellow hover:bg-sol-yellow/25 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    )
  }

  return <RdapData data={state.data} />
}

export function RdapSectionContent() {
  return <RdapSectionInner />
}
