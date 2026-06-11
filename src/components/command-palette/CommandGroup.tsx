import { SectionLabel } from '@/components/shared/LabelValue'

interface CommandGroupProps {
  label: string
}

export function CommandGroup({ label }: CommandGroupProps) {
  return (
    <div className="px-3 pt-3 pb-1.5">
      <SectionLabel>{label}</SectionLabel>
    </div>
  )
}
