import { motion } from 'motion/react'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-[#eee8d5] dark:bg-[#073642]/60 overflow-x-auto whitespace-nowrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${activeTab === tab.id
              ? 'text-[#586e75] dark:text-[#93a1a1]'
              : 'text-[#93a1a1] dark:text-[#586e75] hover:text-[#586e75] dark:hover:text-[#93a1a1]'
            }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-[#fdf6e3] dark:bg-[#002b36] rounded-md shadow-sm"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  )
}
