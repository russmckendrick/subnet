import type { CloudProviderResult } from '@/lib/cloud-providers'

interface ProviderCardProps {
  data: CloudProviderResult
  prefix: number
}

export function ProviderCard({ data, prefix }: ProviderCardProps) {
  const { provider, usableHosts, isValidSubnet, tooSmall, tooLarge } = data

  return (
    <div
      className="rounded-xl border p-4 transition-colors
        bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.04] dark:border-white/[0.06]
        hover:border-[color:var(--provider-color)] hover:border-opacity-30"
      style={{ '--provider-color': provider.color } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: provider.color }}
        />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {provider.shortName}
        </span>
        {!isValidSubnet && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-medium ml-auto">
            {tooSmall ? 'Too small' : tooLarge ? 'Too large' : 'Invalid'}
          </span>
        )}
      </div>

      {isValidSubnet ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Usable hosts</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
              {usableHosts.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Reserved</span>
            <span className="font-mono text-slate-700 dark:text-slate-200">
              {provider.reservedAddresses} per subnet
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Prefix range</span>
            <span className="font-mono text-slate-700 dark:text-slate-200">
              /{provider.minPrefix} to /{provider.maxPrefix}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {tooSmall
            ? `Minimum subnet size: /${provider.maxPrefix}`
            : `Maximum VPC/VNet size: /${provider.minPrefix}`
          }
          <p className="mt-1 text-slate-400 dark:text-slate-500">
            Current: /{prefix}
          </p>
        </div>
      )}

      {isValidSubnet && (
        <details className="mt-3">
          <summary className="text-[10px] text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            Reserved addresses
          </summary>
          <ul className="mt-1.5 space-y-0.5">
            {provider.reservedDescription.map((desc, i) => (
              <li key={i} className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {desc}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
