interface CommandGroupProps {
  label: string
}

export function CommandGroup({ label }: CommandGroupProps) {
  return (
    <div className="px-3 pt-3 pb-1.5">
      <span className="text-[10px] font-medium text-[#586e75] uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
