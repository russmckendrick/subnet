import { useCalculatorStore, type AppTab } from '@/store/calculator-store'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CopyButton } from '@/components/shared/CopyButton'
import { parseCidr } from '@/lib/cidr'

const EXAMPLE_CIDRS = '10.0.0.0/24\n10.0.1.0/24\n10.0.2.0/24'

export function SupernetTool() {
  const { supernetInputs, setSupernetInputs, supernetResult, setRawInput, setActiveTab } = useCalculatorStore()

  const lines = supernetInputs.split('\n').map((l) => l.trim()).filter(Boolean)
  const parsedLines = lines.map((l) => ({ input: l, valid: parseCidr(l) !== null }))
  const hasEnoughInputs = parsedLines.filter(l => l.valid).length >= 2

  return (
    <div className="space-y-4">
      <AnimatedCard className="p-5">
        <h3 className="text-xs font-medium text-[#586e75] uppercase tracking-wider mb-1">
          Supernet / Route Aggregation
        </h3>
        <p className="text-xs text-[#93a1a1] dark:text-[#586e75] mb-4">
          Enter multiple CIDRs (one per line) to find the smallest containing network.
        </p>

        <textarea
          value={supernetInputs}
          onChange={(e) => setSupernetInputs(e.target.value)}
          placeholder={'10.0.0.0/24\n10.0.1.0/24\n10.0.2.0/24'}
          rows={6}
          className="w-full bg-[#fdf6e3] dark:bg-[#002b36] rounded-lg px-4 py-3 font-mono text-sm
            text-[#586e75] dark:text-[#93a1a1] placeholder:text-[#93a1a1]/40 dark:placeholder:text-[#586e75]/40
            border border-[#93a1a1]/20 dark:border-[#586e75]/30 focus:outline-none focus:border-[#2aa198]/40
            resize-y"
          spellCheck={false}
        />

        {parsedLines.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {parsedLines.map((line, i) => (
              <span
                key={i}
                className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                  line.valid
                    ? 'bg-[#859900]/10 text-[#859900] border-[#859900]/20'
                    : 'bg-[#dc322f]/10 text-[#dc322f] border-[#dc322f]/20'
                }`}
              >
                {line.input}
              </span>
            ))}
          </div>
        )}

        {/* Example state when no valid input */}
        {!hasEnoughInputs && lines.length === 0 && (
          <div className="mt-4 pt-4 border-t border-[#586e75]/20">
            <p className="text-xs text-[#93a1a1] dark:text-[#586e75] mb-3">
              Supernetting finds the smallest single CIDR block that contains all input networks. Useful for route aggregation and summarization.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] text-[#586e75] uppercase tracking-wider font-medium">
                Try example:
              </span>
              {['10.0.0.0/24', '10.0.1.0/24', '10.0.2.0/24'].map((cidr) => (
                <span
                  key={cidr}
                  className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#2aa198]/10 text-[#2aa198] border border-[#2aa198]/20"
                >
                  {cidr}
                </span>
              ))}
              <button
                onClick={() => setSupernetInputs(EXAMPLE_CIDRS)}
                className="text-xs font-medium text-[#2aa198] hover:text-[#2aa198]/80 transition-colors px-2.5 py-1 rounded-lg hover:bg-[#2aa198]/5"
              >
                Load example
              </button>
            </div>
          </div>
        )}
      </AnimatedCard>

      {supernetResult && (
        <AnimatedCard delay={0.1} className="p-5">
          <h3 className="text-xs font-medium text-[#586e75] uppercase tracking-wider mb-3">
            Aggregated Result
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono font-bold text-[#586e75] dark:text-[#93a1a1]">
              {supernetResult}
            </span>
            <CopyButton text={supernetResult} copyKey="supernet" label="Copy" />
          </div>
          {(() => {
            const result = parseCidr(supernetResult)
            if (!result) return null
            return (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#586e75]">Network</span>
                  <div className="font-mono text-[#586e75] dark:text-[#93a1a1]">{result.networkAddress}</div>
                </div>
                <div>
                  <span className="text-[#586e75]">Broadcast</span>
                  <div className="font-mono text-[#586e75] dark:text-[#93a1a1]">{result.broadcastAddress}</div>
                </div>
                <div>
                  <span className="text-[#586e75]">Total addresses</span>
                  <div className="font-mono text-[#586e75] dark:text-[#93a1a1]">{result.totalAddresses.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[#586e75]">Usable hosts</span>
                  <div className="font-mono text-[#586e75] dark:text-[#93a1a1]">{result.usableHosts.toLocaleString()}</div>
                </div>
              </div>
            )
          })()}
          {/* Cross-tab: View in Calculator */}
          <div className="mt-3 pt-3 border-t border-[#586e75]/20 flex justify-end">
            <button
              onClick={() => {
                setRawInput(supernetResult)
                setActiveTab('calculator' as AppTab)
              }}
              className="text-xs font-medium text-[#2aa198] hover:text-[#2aa198]/80 transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#2aa198]/5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              View in Calculator
            </button>
          </div>
        </AnimatedCard>
      )}
    </div>
  )
}
