import { useDesignerStore } from '@/store/designer-store'
import type { CloudProvider } from '@/lib/cloud-theme'
import { SegmentedControl, type SegmentedOption } from '@/components/shared/SegmentedControl'

const PROVIDER_OPTIONS: SegmentedOption<CloudProvider>[] = [
  { value: 'generic', label: 'Generic' },
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'gcp', label: 'GCP' },
]

export function CloudProviderSelector() {
  const { cloudProvider, setCloudProvider } = useDesignerStore()

  return (
    <SegmentedControl
      options={PROVIDER_OPTIONS}
      value={cloudProvider}
      onChange={setCloudProvider}
      size="xs"
      ariaLabel="Cloud provider"
      role="radiogroup"
      className="w-full justify-between"
    />
  )
}
