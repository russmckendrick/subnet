import type { CloudProviderResult } from '@/lib/cloud-providers'

interface ProviderCardProps {
  data: CloudProviderResult
  prefix: number
}

export function ProviderCard({ data, prefix }: ProviderCardProps) {
  const { provider, usableHosts, isValidSubnet, tooSmall, tooLarge } = data

  return (
    <div
      className="rounded-lg border p-4 transition-colors
        bg-[#fdf6e3]/50 dark:bg-[#002b36]/30 border-[#586e75]/15
        hover:border-[color:var(--provider-color)] hover:border-opacity-30"
      style={{ '--provider-color': provider.color } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: provider.color }}
        />
        <span className="text-sm font-semibold text-[#586e75] dark:text-[#93a1a1]">
          {provider.shortName}
        </span>
        {!isValidSubnet && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#dc322f]/10 text-[#dc322f] font-medium ml-auto">
            {tooSmall ? 'Too small' : tooLarge ? 'Too large' : 'Invalid'}
          </span>
        )}
      </div>

      {isValidSubnet ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#586e75]">Usable hosts</span>
            <span className="font-mono font-semibold text-[#586e75] dark:text-[#93a1a1]">
              {usableHosts.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#586e75]">Reserved</span>
            <span className="font-mono text-[#586e75] dark:text-[#93a1a1]">
              {provider.reservedAddresses} per subnet
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#586e75]">Prefix range</span>
            <span className="font-mono text-[#586e75] dark:text-[#93a1a1]">
              /{provider.minPrefix} to /{provider.maxPrefix}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-[#586e75]">
          {tooSmall
            ? `Minimum subnet size: /${provider.maxPrefix}`
            : `Maximum VPC/VNet size: /${provider.minPrefix}`
          }
          <p className="mt-1 text-[#93a1a1] dark:text-[#586e75]">
            Current: /{prefix}
          </p>
        </div>
      )}

      {isValidSubnet && (
        <details className="mt-3">
          <summary className="text-[10px] text-[#93a1a1] dark:text-[#586e75] cursor-pointer hover:text-[#586e75] dark:hover:text-[#93a1a1] transition-colors">
            Reserved addresses
          </summary>
          <ul className="mt-1.5 space-y-0.5">
            {provider.reservedDescription.map((desc, i) => (
              <li key={i} className="text-[10px] text-[#93a1a1] dark:text-[#586e75] font-mono">
                {desc}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
