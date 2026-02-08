import { useDesignerStore } from '@/store/designer-store'

export function PendingDropBanner() {
  const { pendingDrop, setPendingDrop } = useDesignerStore()

  if (!pendingDrop) return null

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2 rounded-lg bg-[#2aa198]/10 border border-[#2aa198]/30 text-[#2aa198]">
      <span className="text-xs font-medium">
        Tap canvas to place <span className="font-semibold">{pendingDrop.label}</span>
      </span>
      <button
        onClick={() => setPendingDrop(null)}
        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#2aa198]/15 hover:bg-[#2aa198]/25 transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
