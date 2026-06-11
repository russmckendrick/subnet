import { useCalculatorStore } from '@/store/calculator-store'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CopyButton } from '@/components/shared/CopyButton'
import { Textarea } from '@/components/shared/Input'
import { SectionLabel, LabelValue } from '@/components/shared/LabelValue'
import { parseCidr } from '@/lib/cidr'

const EXAMPLE_CIDRS = '10.0.0.0/24\n10.0.1.0/24\n10.0.2.0/24'

export function SupernetTool() {
  const { supernetInputs, setSupernetInputs, supernetResult, loadSupernetResult, setActiveDrawer } = useCalculatorStore()

  const lines = supernetInputs
    .split('\n')
    .map((line, index) => ({ input: line.trim(), lineNumber: index + 1 }))
    .filter((line) => line.input)
  const parsedLines = lines.map((line) => ({ ...line, valid: parseCidr(line.input) !== null }))
  const hasEnoughInputs = parsedLines.filter(l => l.valid).length >= 2
  const invalidLines = parsedLines.filter((line) => !line.valid)

  return (
    <div className="space-y-4">
      <AnimatedCard className="p-4">
        <h3 className="text-xs font-medium text-sol-base01 uppercase tracking-wider mb-1">
          Supernet / Route Aggregation
        </h3>
        <p className="text-xs text-ink-muted mb-4">
          Enter multiple CIDRs (one per line) to find the smallest containing network.
        </p>

        <Textarea
          value={supernetInputs}
          onChange={(e) => setSupernetInputs(e.target.value)}
          placeholder={'10.0.0.0/24\n10.0.1.0/24\n10.0.2.0/24'}
          aria-label="CIDRs to aggregate"
          name="supernet-cidrs"
          rows={6}
          mono
          spellCheck={false}
        />

        {parsedLines.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {parsedLines.map((line, i) => (
              <span
                key={i}
                className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                  line.valid
                    ? 'bg-sol-green/10 text-sol-green border-sol-green/20'
                    : 'bg-sol-red/10 text-sol-red border-sol-red/20'
                }`}
              >
                {line.input}
              </span>
            ))}
          </div>
        )}

        {invalidLines.length > 0 && (
          <p className="mt-2 text-xs text-sol-red" aria-live="polite">
            Fix {invalidLines.length} invalid CIDR{invalidLines.length === 1 ? '' : 's'} before aggregation: {invalidLines.map((line) => `line ${line.lineNumber}: ${line.input}`).join(', ')}
          </p>
        )}

        {/* Example state when no valid input */}
        {!hasEnoughInputs && lines.length === 0 && (
          <div className="mt-4 pt-4 border-t border-line/20">
            <p className="text-xs text-ink-muted mb-3">
              Supernetting finds the smallest single CIDR block that contains all input networks. Useful for route aggregation and summarization.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <SectionLabel>Try example:</SectionLabel>
              {['10.0.0.0/24', '10.0.1.0/24', '10.0.2.0/24'].map((cidr) => (
                <span
                  key={cidr}
                  className="text-xs font-mono px-2 py-0.5 rounded-full bg-sol-cyan/10 text-sol-cyan border border-sol-cyan/20"
                >
                  {cidr}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSupernetInputs(EXAMPLE_CIDRS)}
                className="text-xs font-medium text-sol-cyan hover:text-sol-cyan/80 transition-colors px-2.5 py-1 rounded-lg hover:bg-sol-cyan/5"
              >
                Load example
              </button>
            </div>
          </div>
        )}
      </AnimatedCard>

      {supernetResult && (
        <AnimatedCard delay={0.1} className="p-4">
          <h3 className="text-xs font-medium text-sol-base01 uppercase tracking-wider mb-3">
            Aggregated Result
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono font-bold text-ink">
              {supernetResult}
            </span>
            <CopyButton text={supernetResult} copyKey="supernet" label="Copy" />
          </div>
          {(() => {
            const result = parseCidr(supernetResult)
            if (!result) return null
            return (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <LabelValue label="Network">{result.networkAddress}</LabelValue>
                <LabelValue label="Broadcast">{result.broadcastAddress}</LabelValue>
                <LabelValue label="Total addresses">{result.totalAddresses.toLocaleString()}</LabelValue>
                <LabelValue label="Usable hosts">{result.usableHosts.toLocaleString()}</LabelValue>
              </div>
            )
          })()}
          {/* View details: closes drawer and updates input */}
          <div className="mt-3 pt-3 border-t border-line/20 flex justify-end">
            <button
              type="button"
              onClick={() => {
                loadSupernetResult(supernetResult)
                setActiveDrawer('none')
              }}
              className="text-xs font-medium text-sol-cyan hover:text-sol-cyan/80 transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-sol-cyan/5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              View details
            </button>
          </div>
        </AnimatedCard>
      )}
    </div>
  )
}
