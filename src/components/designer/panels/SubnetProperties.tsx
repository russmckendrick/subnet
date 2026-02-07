import { useDesignerStore, type SubnetNodeData } from '@/store/designer-store'

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
      <div>
        <label className="block text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider mb-1.5">
          CIDR
        </label>
        <div className="font-mono text-sm font-bold text-[#586e75] dark:text-[#93a1a1] bg-[#eee8d5] dark:bg-[#073642] px-3 py-2 rounded-lg">
          {data.cidr}
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="block text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider mb-1.5">
          Label
        </label>
        <input
          type="text"
          value={data.label}
          onChange={(e) => updateNodeLabel(nodeId, e.target.value)}
          className="w-full text-sm text-[#586e75] dark:text-[#93a1a1] bg-[#eee8d5] dark:bg-[#073642] border border-[#93a1a1]/20 dark:border-[#586e75]/30 px-3 py-2 rounded-lg outline-none focus:border-[#2aa198] transition-colors"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider mb-1.5">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {SOLARIZED_ACCENTS.map((accent) => (
            <button
              key={accent.hex}
              onClick={() => updateNodeColor(nodeId, accent.hex)}
              className={`w-8 h-8 rounded-full transition-all ${
                data.color === accent.hex
                  ? 'ring-2 ring-offset-2 ring-offset-[#fdf6e3] dark:ring-offset-[#002b36]'
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
      <div className="space-y-3 pt-2 border-t border-[#93a1a1]/15 dark:border-[#586e75]/20">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider">
            Usable Hosts
          </span>
          <span className="font-mono text-sm text-[#586e75] dark:text-[#93a1a1]">
            {data.hosts.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider">
            Network Address
          </span>
          <span className="font-mono text-xs text-[#586e75] dark:text-[#93a1a1]">
            {data.networkAddress}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider">
            Broadcast Address
          </span>
          <span className="font-mono text-xs text-[#586e75] dark:text-[#93a1a1]">
            {data.broadcastAddress}
          </span>
        </div>
      </div>
    </div>
  )
}
