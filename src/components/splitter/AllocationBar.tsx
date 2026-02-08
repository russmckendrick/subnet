import { motion } from 'motion/react'
import type { SubnetSplit } from '@/lib/subnet-math'

interface AllocationBarProps {
  splits: SubnetSplit[]
  totalSize: number
  remainingSpace: number
  hoveredIndex?: number | null
  onHoverIndex?: (index: number | null) => void
}

export function AllocationBar({ splits, totalSize, remainingSpace, hoveredIndex, onHoverIndex }: AllocationBarProps) {
  return (
    <div className="flex h-16 rounded-lg overflow-hidden border border-[#586e75]/20 bg-[#fdf6e3] dark:bg-[#002b36]/50">
      {splits.map((split, i) => {
        const widthPercent = (split.size / totalSize) * 100
        const isHovered = hoveredIndex === i
        return (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: `${widthPercent}%` }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`relative group cursor-pointer border-r border-white/20 dark:border-black/20 last:border-r-0 overflow-hidden transition-shadow ${
              isHovered ? 'ring-2 ring-white/30 z-10' : ''
            }`}
            style={{ backgroundColor: split.color + '30' }}
            onMouseEnter={() => onHoverIndex?.(i)}
            onMouseLeave={() => onHoverIndex?.(null)}
          >
            <div
              className="absolute inset-x-0 bottom-0 h-1.5"
              style={{ backgroundColor: split.color }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
              <span className="text-[11px] font-semibold truncate max-w-full px-0.5"
                style={{ color: split.color }}>
                {widthPercent > 8 ? split.label : ''}
              </span>
              <span className="text-[11px] font-mono font-bold truncate"
                style={{ color: split.color }}>
                /{split.prefixLength}
              </span>
              {widthPercent > 12 && (
                <span className="text-[9px] text-[#586e75] dark:text-[#586e75] truncate">
                  {split.size.toLocaleString()} addr
                </span>
              )}
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-[#002b36] text-[#93a1a1] text-[10px] font-mono rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-[#586e75]/30">
                <div className="font-semibold text-[11px] text-[#93a1a1]">{split.label}</div>
                <div className="text-[#839496] mt-0.5">{split.cidr}</div>
                <div className="text-[#586e75]">{split.firstHost} — {split.lastHost}</div>
                <div className="text-[#586e75]">{split.usableHosts.toLocaleString()} usable hosts</div>
                <div className="text-[#586e75]">{((split.size / totalSize) * 100).toFixed(1)}% of parent</div>
              </div>
            </div>
          </motion.div>
        )
      })}
      {remainingSpace > 0 && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(remainingSpace / totalSize) * 100}%` }}
          transition={{ duration: 0.5, delay: splits.length * 0.1 }}
          className="flex items-center justify-center bg-[#eee8d5]/50 dark:bg-[#073642]/30"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(88,110,117,0.06) 4px, rgba(88,110,117,0.06) 8px)' }}
        >
          <span className="text-[10px] text-[#93a1a1] dark:text-[#586e75] font-mono">
            {(remainingSpace / totalSize * 100).toFixed(0)}% free
          </span>
        </motion.div>
      )}
    </div>
  )
}
