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
    <div className="flex gap-1 p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors
            ${activeTab === tab.id
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white dark:bg-white/[0.12] rounded-lg shadow-sm"
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
