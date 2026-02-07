import { motion } from 'motion/react'
import { useThemeStore } from '@/store/theme-store'
import { useDesignerStore } from '@/store/designer-store'
import { ArrangeToolbar } from './ArrangeToolbar'

export function DesignerHeader() {
  const { theme, toggleTheme } = useThemeStore()
  const { nodes, selectedNodeId, removeNode, clearDiagram, setExportOpen } = useDesignerStore()

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-[#93a1a1]/15 dark:border-[#586e75]/20 bg-[#fdf6e3] dark:bg-[#002b36]">
      <div className="flex items-center gap-3">
        {/* Back to calculator */}
        <a
          href="/"
          className="flex items-center gap-2 text-[#586e75] hover:text-[#2aa198] transition-colors"
        >
          <img
            src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
            alt="subnet.fit logo"
            className="h-7 w-auto"
          />
        </a>

        <div className="h-5 w-px bg-[#93a1a1]/20 dark:bg-[#586e75]/20" />

        <h1 className="text-sm font-semibold text-[#586e75] dark:text-[#93a1a1]">
          Network Designer
        </h1>

        {nodes.length > 0 && (
          <span className="text-[10px] font-mono text-[#93a1a1] dark:text-[#586e75] bg-[#eee8d5] dark:bg-[#073642] px-1.5 py-0.5 rounded">
            {nodes.length} nodes
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Arrange tools */}
        {nodes.length > 0 && <ArrangeToolbar />}

        {/* Export */}
        {nodes.length > 0 && (
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 text-xs text-[#586e75] bg-[#eee8d5] dark:bg-[#073642] px-2.5 py-1.5 rounded-lg hover:bg-[#eee8d5]/80 dark:hover:bg-[#073642]/80 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="hidden sm:inline">Export</span>
          </button>
        )}

        {/* Delete selected node */}
        {selectedNodeId && (
          <button
            onClick={() => removeNode(selectedNodeId)}
            className="flex items-center gap-1.5 text-xs text-[#cb4b16] bg-[#eee8d5] dark:bg-[#073642] px-2.5 py-1.5 rounded-lg hover:bg-[#cb4b16]/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}

        {/* Clear diagram */}
        {nodes.length > 0 && (
          <button
            onClick={clearDiagram}
            className="flex items-center gap-1.5 text-xs text-[#dc322f] bg-[#eee8d5] dark:bg-[#073642] px-2.5 py-1.5 rounded-lg hover:bg-[#dc322f]/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}

        {/* Back to calculator */}
        <a
          href="/"
          className="flex items-center gap-1.5 text-xs text-[#586e75] bg-[#eee8d5] dark:bg-[#073642] px-2.5 py-1.5 rounded-lg hover:bg-[#eee8d5]/80 dark:hover:bg-[#073642]/80 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden sm:inline">Calculator</span>
        </a>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-[#eee8d5] dark:bg-[#073642] hover:bg-[#eee8d5]/80 dark:hover:bg-[#073642]/80 transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4 text-[#b58900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#586e75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </motion.div>
        </button>
      </div>
    </header>
  )
}
