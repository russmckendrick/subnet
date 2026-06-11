import type { ReactNode } from 'react'
import { SiAmazonwebservices, SiGooglecloud } from 'react-icons/si'
import { VscAzure } from 'react-icons/vsc'
import { SegmentedControl } from '@/components/shared/SegmentedControl'

export type CloudProvider = 'aws' | 'azure' | 'gcp'

interface ProviderOption {
  id: CloudProvider
  label: string
  color: string
  icon: ReactNode
}

const PROVIDERS: ProviderOption[] = [
  { id: 'aws', label: 'AWS', color: '#cb4b16', icon: <SiAmazonwebservices className="w-3.5 h-3.5" /> },
  { id: 'azure', label: 'Azure', color: '#268bd2', icon: <VscAzure className="w-3.5 h-3.5" /> },
  { id: 'gcp', label: 'GCP', color: '#6c71c4', icon: <SiGooglecloud className="w-3.5 h-3.5" /> },
]

interface ProviderSelectorProps {
  selected: CloudProvider
  onChange: (provider: CloudProvider) => void
}

export function ProviderSelector({ selected, onChange }: ProviderSelectorProps) {
  return (
    <SegmentedControl
      options={PROVIDERS.map((p) => ({
        value: p.id,
        label: p.label,
        icon: <span style={{ color: p.color }}>{p.icon}</span>,
      }))}
      value={selected}
      onChange={onChange}
      ariaLabel="Cloud provider"
    />
  )
}
