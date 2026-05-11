import type { ReactNode } from 'react'
import { SiAmazonwebservices, SiGooglecloud } from 'react-icons/si'
import { VscAzure } from 'react-icons/vsc'

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
    <div className="flex gap-1.5" role="group" aria-label="Cloud provider">
      {PROVIDERS.map((p) => (
        <button
          type="button"
          key={p.id}
          onClick={() => onChange(p.id)}
          aria-pressed={selected === p.id}
          className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border flex items-center gap-1.5 ${
            selected === p.id
              ? 'border-current/20'
              : 'bg-[#fdf6e3]/50 dark:bg-[#002b36]/30 text-[#586e75] border-transparent hover:bg-[#fdf6e3] dark:hover:bg-[#002b36]/50'
          }`}
          style={selected === p.id ? { color: p.color, backgroundColor: `${p.color}10`, borderColor: `${p.color}33` } : undefined}
        >
          <span style={{ color: p.color }}>{p.icon}</span>
          {p.label}
        </button>
      ))}
    </div>
  )
}
