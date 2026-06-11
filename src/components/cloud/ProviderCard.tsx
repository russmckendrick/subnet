import type { ReactNode } from 'react'
import type { CloudProviderResult } from '@/lib/cloud-providers'
import { SiAmazonwebservices, SiGooglecloud } from 'react-icons/si'
import { VscAzure } from 'react-icons/vsc'

const PROVIDER_ICONS: Record<string, ReactNode> = {
  aws: <SiAmazonwebservices className="w-4 h-4" />,
  azure: <VscAzure className="w-4 h-4" />,
  gcp: <SiGooglecloud className="w-4 h-4" />,
}

interface ProviderCardProps {
  data: CloudProviderResult
  prefix: number
}

export function ProviderCard({ data, prefix }: ProviderCardProps) {
  const { provider, usableHosts, isValidSubnet, tooSmall, tooLarge } = data
  const icon = PROVIDER_ICONS[provider.id]

  return (
    <div
      className="rounded-lg border p-4 transition-colors
        bg-well/50 border-line/15
        hover:border-[color:var(--provider-color)] hover:border-opacity-30"
      style={{ '--provider-color': provider.color } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon ? (
          <span style={{ color: provider.color }}>{icon}</span>
        ) : (
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: provider.color }}
          />
        )}
        <span className="text-sm font-semibold text-ink">
          {provider.shortName}
        </span>
        {!isValidSubnet && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sol-red/10 text-sol-red font-medium ml-auto">
            {tooSmall ? 'Too small' : tooLarge ? 'Too large' : 'Invalid'}
          </span>
        )}
      </div>

      {isValidSubnet ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-sol-base01">Usable hosts</span>
            <span className="font-mono font-semibold text-ink">
              {usableHosts.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-sol-base01">Reserved</span>
            <span className="font-mono text-ink">
              {provider.reservedAddresses} per subnet
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-sol-base01">Prefix range</span>
            <span className="font-mono text-ink">
              /{provider.minPrefix} to /{provider.maxPrefix}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-sol-base01">
          {tooSmall
            ? `Minimum subnet size: /${provider.maxPrefix}`
            : `Maximum VPC/VNet size: /${provider.minPrefix}`
          }
          <p className="mt-1 text-ink-muted">
            Current: /{prefix}
          </p>
        </div>
      )}

      {isValidSubnet && (
        <details className="mt-3">
          <summary className="text-[10px] text-ink-muted cursor-pointer hover:text-ink transition-colors">
            Reserved addresses
          </summary>
          <ul className="mt-1.5 space-y-0.5">
            {provider.reservedDescription.map((desc, i) => (
              <li key={i} className="text-[10px] text-ink-muted font-mono">
                {desc}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
