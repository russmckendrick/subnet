import { useDesignerStore } from '@/store/designer-store'
import { Button } from '@/components/shared/Button'

export function PendingDropBanner() {
  const { pendingDrop, setPendingDrop } = useDesignerStore()

  if (!pendingDrop) return null

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2 rounded-lg bg-sol-cyan/10 border border-sol-cyan/30 text-sol-cyan">
      <span className="text-xs font-medium">
        Tap canvas to place <span className="font-semibold">{pendingDrop.label}</span>
      </span>
      <Button
        size="xs"
        active
        onClick={() => setPendingDrop(null)}
        className="uppercase tracking-wider text-[10px] font-semibold"
      >
        Cancel
      </Button>
    </div>
  )
}
