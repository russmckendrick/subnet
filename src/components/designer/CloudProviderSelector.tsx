import { useDesignerStore } from '@/store/designer-store'
import { CLOUD_THEMES, type CloudProvider } from '@/lib/cloud-theme'

const PROVIDERS: { id: CloudProvider; label: string }[] = [
  { id: 'generic', label: 'Generic' },
  { id: 'aws', label: 'AWS' },
  { id: 'azure', label: 'Azure' },
  { id: 'gcp', label: 'GCP' },
]

export function CloudProviderSelector() {
  const { cloudProvider, setCloudProvider } = useDesignerStore()

  return (
    <div className="flex gap-1" role="group" aria-label="Cloud provider">
      {PROVIDERS.map((provider) => {
        const isActive = cloudProvider === provider.id
        const theme = CLOUD_THEMES[provider.id]

        return (
          <button
            type="button"
            key={provider.id}
            onClick={() => setCloudProvider(provider.id)}
            aria-pressed={isActive}
            className={`flex-1 text-[10px] font-semibold py-1.5 rounded transition-colors ${
              isActive
                ? 'text-white shadow-sm'
                : 'text-[#93a1a1] dark:text-[#586e75] hover:text-[#586e75] dark:hover:text-[#93a1a1] bg-[#eee8d5]/50 dark:bg-[#073642]/50'
            }`}
            style={isActive ? { backgroundColor: theme.borderColor } : undefined}
          >
            {provider.label}
          </button>
        )
      })}
    </div>
  )
}
