import { useState, useRef, useEffect } from 'react'
import { useDesignerStore } from '@/store/designer-store'
import { autoLayout, alignNodes, distributeNodes, type AlignDirection } from '@/lib/diagram-arrange'

export function ArrangeToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { nodes, edges, selectedNodeIds, setNodes } = useDesignerStore()

  const hasSelection = selectedNodeIds.length >= 2
  const hasDistribute = selectedNodeIds.length >= 3

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const handleAutoLayout = () => {
    setNodes(autoLayout(nodes, edges))
    setIsOpen(false)
  }

  const handleAlign = (direction: AlignDirection) => {
    setNodes(alignNodes(nodes, selectedNodeIds, direction))
  }

  const handleDistribute = (axis: 'horizontal' | 'vertical') => {
    setNodes(distributeNodes(nodes, selectedNodeIds, axis))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-[#586e75] bg-[#eee8d5] dark:bg-[#073642] px-2.5 py-1.5 rounded-lg hover:bg-[#eee8d5]/80 dark:hover:bg-[#073642]/80 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
        <span className="hidden sm:inline">Arrange</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-56 bg-[#fdf6e3] dark:bg-[#002b36] border border-[#93a1a1]/20 dark:border-[#586e75]/20 rounded-lg shadow-lg z-50 p-3 space-y-3">
          {/* Auto Layout */}
          <button
            onClick={handleAutoLayout}
            className="w-full flex items-center gap-2 text-xs text-[#586e75] dark:text-[#93a1a1] hover:text-[#2aa198] px-2 py-1.5 rounded-lg hover:bg-[#eee8d5] dark:hover:bg-[#073642] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
            </svg>
            Auto Layout
          </button>

          <div className="border-t border-[#93a1a1]/15 dark:border-[#586e75]/20" />

          {/* Align */}
          <div>
            <span className={`block text-[10px] font-semibold uppercase tracking-wider mb-2 ${hasSelection ? 'text-[#93a1a1] dark:text-[#586e75]' : 'text-[#93a1a1]/40 dark:text-[#586e75]/40'}`}>
              Align {!hasSelection && '(select 2+)'}
            </span>
            <div className="grid grid-cols-3 gap-1">
              {([
                { dir: 'left' as AlignDirection, label: 'Left', path: 'M4 4v16M8 8h12M8 16h8' },
                { dir: 'center-h' as AlignDirection, label: 'Center H', path: 'M12 4v16M6 8h12M8 16h8' },
                { dir: 'right' as AlignDirection, label: 'Right', path: 'M20 4v16M4 8h12M8 16h8' },
                { dir: 'top' as AlignDirection, label: 'Top', path: 'M4 4h16M8 8v12M16 8v8' },
                { dir: 'center-v' as AlignDirection, label: 'Center V', path: 'M4 12h16M8 6v12M16 8v8' },
                { dir: 'bottom' as AlignDirection, label: 'Bottom', path: 'M4 20h16M8 4v12M16 8v8' },
              ]).map(({ dir, label, path }) => (
                <button
                  key={dir}
                  onClick={() => handleAlign(dir)}
                  disabled={!hasSelection}
                  className="p-1.5 rounded hover:bg-[#eee8d5] dark:hover:bg-[#073642] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={`Align ${label}`}
                >
                  <svg className="w-4 h-4 mx-auto text-[#586e75] dark:text-[#93a1a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#93a1a1]/15 dark:border-[#586e75]/20" />

          {/* Distribute */}
          <div>
            <span className={`block text-[10px] font-semibold uppercase tracking-wider mb-2 ${hasDistribute ? 'text-[#93a1a1] dark:text-[#586e75]' : 'text-[#93a1a1]/40 dark:text-[#586e75]/40'}`}>
              Distribute {!hasDistribute && '(select 3+)'}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handleDistribute('horizontal')}
                disabled={!hasDistribute}
                className="flex-1 flex items-center justify-center gap-1.5 text-[10px] text-[#586e75] dark:text-[#93a1a1] px-2 py-1.5 rounded hover:bg-[#eee8d5] dark:hover:bg-[#073642] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4v16M21 4v16M7 8h2v8H7zM11 8h2v8h-2zM15 8h2v8h-2z" />
                </svg>
                Horizontal
              </button>
              <button
                onClick={() => handleDistribute('vertical')}
                disabled={!hasDistribute}
                className="flex-1 flex items-center justify-center gap-1.5 text-[10px] text-[#586e75] dark:text-[#93a1a1] px-2 py-1.5 rounded hover:bg-[#eee8d5] dark:hover:bg-[#073642] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 3h16M4 21h16M8 7v2h8V7zM8 11v2h8v-2zM8 15v2h8v-2z" />
                </svg>
                Vertical
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
