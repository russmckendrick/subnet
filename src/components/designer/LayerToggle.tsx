import { useDesignerStore } from '@/store/designer-store'
import type { ActiveLayer } from '@/store/designer-store'
import { SegmentedControl, type SegmentedOption } from '@/components/shared/SegmentedControl'

const LAYER_OPTIONS: SegmentedOption<ActiveLayer>[] = [
  { value: 'all', label: 'All', title: 'Show all layers (1)' },
  { value: 'infrastructure', label: 'Infra', title: 'Infrastructure layer (2)' },
  { value: 'resources', label: 'Resources', title: 'Resources layer (3)' },
]

export function LayerToggle() {
  const { activeLayer, setActiveLayer } = useDesignerStore()

  return (
    <SegmentedControl
      options={LAYER_OPTIONS}
      value={activeLayer}
      onChange={setActiveLayer}
      size="xs"
      ariaLabel="Designer layer filter"
      role="radiogroup"
    />
  )
}
