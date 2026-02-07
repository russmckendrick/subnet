import { useEffect, useRef } from 'react'
import { SiTerraform, SiAmazonwebservices, SiGooglecloud } from 'react-icons/si'
import { VscAzure } from 'react-icons/vsc'
import type { Command } from '@/lib/commands'

interface CommandItemProps {
  command: Command
  isActive: boolean
  onSelect: () => void
  onMouseEnter: () => void
  id: string
}

function CommandIcon({ icon }: { icon: Command['icon'] }) {
  const cls = "w-4 h-4 shrink-0"
  const props = { className: cls, fill: "none" as const, viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 }

  switch (icon) {
    case 'globe':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      )
    case 'book':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      )
    case 'merge':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      )
    case 'file':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      )
    case 'code':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      )
    case 'terminal':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
        </svg>
      )
    case 'link':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      )
    case 'x':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    case 'reset':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
        </svg>
      )
    case 'toggle':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
      )
    case 'search':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      )
    case 'diagram':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M12 8.25v7.5m3.75-3.75H8.25" />
        </svg>
      )
    case 'terraform':
      return <SiTerraform className={cls} style={{ color: '#7B42BC' }} />
    case 'aws':
      return <SiAmazonwebservices className={cls} style={{ color: '#cb4b16' }} />
    case 'azure':
      return <VscAzure className={cls} style={{ color: '#268bd2' }} />
    case 'gcp':
      return <SiGooglecloud className={cls} style={{ color: '#6c71c4' }} />
  }
}

export function CommandItem({ command, isActive, onSelect, onMouseEnter, id }: CommandItemProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest' })
    }
  }, [isActive])

  return (
    <div
      ref={ref}
      id={id}
      role="option"
      aria-selected={isActive}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={`flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-md cursor-pointer transition-colors ${
        isActive
          ? 'bg-[#2aa198]/10 text-[#2aa198]'
          : 'text-[#586e75] dark:text-[#93a1a1] hover:bg-[#eee8d5]/50 dark:hover:bg-[#073642]/50'
      }`}
    >
      <CommandIcon icon={command.icon} />
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium ${isActive ? 'text-[#2aa198]' : ''}`}>
          {command.label}
        </span>
        <span className={`ml-2 text-xs ${isActive ? 'text-[#2aa198]/60' : 'text-[#93a1a1] dark:text-[#586e75]'}`}>
          {command.description}
        </span>
      </div>
      <span className={`text-[10px] uppercase tracking-wider shrink-0 ${
        isActive ? 'text-[#2aa198]/50' : 'text-[#93a1a1]/60 dark:text-[#586e75]/60'
      }`}>
        {command.category}
      </span>
    </div>
  )
}
