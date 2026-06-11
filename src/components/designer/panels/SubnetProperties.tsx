import { useDesignerStore, type SubnetNodeData } from '@/store/designer-store'
import { Input } from '@/components/shared/Input'
import { SectionLabel, LabelValue } from '@/components/shared/LabelValue'

const SOLARIZED_ACCENTS = [
  { name: 'Cyan', hex: '#2aa198' },
  { name: 'Blue', hex: '#268bd2' },
  { name: 'Magenta', hex: '#d33682' },
  { name: 'Green', hex: '#859900' },
  { name: 'Yellow', hex: '#b58900' },
  { name: 'Violet', hex: '#6c71c4' },
  { name: 'Orange', hex: '#cb4b16' },
  { name: 'Red', hex: '#dc322f' },
]

interface SubnetPropertiesProps {
  nodeId: string
  data: SubnetNodeData
}

export function SubnetProperties({ nodeId, data }: SubnetPropertiesProps) {
  const { updateNodeLabel, updateNodeColor } = useDesignerStore()

  return (
    <div className="space-y-5">
      {/* CIDR */}
      <LabelValue label="CIDR">{data.cidr}</LabelValue>

      {/* Label */}
      <div>
        <SectionLabel className="mb-1.5">Label</SectionLabel>
        <Input
          type="text"
          value={data.label}
          onChange={(e) => updateNodeLabel(nodeId, e.target.value)}
        />
      </div>

      {/* Color */}
      <div>
        <SectionLabel className="mb-1.5">Color</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {SOLARIZED_ACCENTS.map((accent) => (
            <button
              key={accent.hex}
              onClick={() => updateNodeColor(nodeId, accent.hex)}
              className={`w-8 h-8 rounded-full transition-all ${
                data.color === accent.hex
                  ? 'ring-2 ring-offset-2 ring-offset-canvas'
                  : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: accent.hex,
              }}
              title={accent.name}
            />
          ))}
        </div>
      </div>

      {/* Network details */}
      <div className="space-y-3 pt-2 border-t border-line/15">
        <LabelValue label="Usable Hosts">{data.hosts.toLocaleString()}</LabelValue>
        <LabelValue label="Network Address">{data.networkAddress}</LabelValue>
        <LabelValue label="Broadcast Address">{data.broadcastAddress}</LabelValue>
      </div>
    </div>
  )
}
