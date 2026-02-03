import { useCalculatorStore } from '@/store/calculator-store'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CopyButton } from '@/components/shared/CopyButton'
import { parseCidr } from '@/lib/cidr'

export function SupernetTool() {
  const { supernetInputs, setSupernetInputs, supernetResult } = useCalculatorStore()

  const lines = supernetInputs.split('\n').map((l) => l.trim()).filter(Boolean)
  const parsedLines = lines.map((l) => ({ input: l, valid: parseCidr(l) !== null }))

  return (
    <div className="space-y-4">
      <AnimatedCard className="p-5">
        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Supernet / Route Aggregation
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          Enter multiple CIDRs (one per line) to find the smallest containing network.
        </p>

        <textarea
          value={supernetInputs}
          onChange={(e) => setSupernetInputs(e.target.value)}
          placeholder={'10.0.0.0/24\n10.0.1.0/24\n10.0.2.0/24'}
          rows={6}
          className="w-full bg-black/[0.03] dark:bg-white/[0.05] rounded-xl px-4 py-3 font-mono text-sm
            text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600
            border border-black/[0.04] dark:border-white/[0.06] focus:outline-none focus:border-cyan-500/40
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
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                }`}
              >
                {line.input}
              </span>
            ))}
          </div>
        )}
      </AnimatedCard>

      {supernetResult && (
        <AnimatedCard delay={0.1} className="p-5">
          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Aggregated Result
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
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
                  <span className="text-slate-400 dark:text-slate-500">Network</span>
                  <div className="font-mono text-slate-700 dark:text-slate-200">{result.networkAddress}</div>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Broadcast</span>
                  <div className="font-mono text-slate-700 dark:text-slate-200">{result.broadcastAddress}</div>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Total addresses</span>
                  <div className="font-mono text-slate-700 dark:text-slate-200">{result.totalAddresses.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Usable hosts</span>
                  <div className="font-mono text-slate-700 dark:text-slate-200">{result.usableHosts.toLocaleString()}</div>
                </div>
              </div>
            )
          })()}
        </AnimatedCard>
      )}
    </div>
  )
}
