import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useDesignerStore } from '@/store/designer-store'
import { useThemeStore } from '@/store/theme-store'
import { useClipboard } from '@/hooks/use-clipboard'
import { diagramToPng, diagramToSvg, diagramToJson, diagramToDrawio, getDiagramsNetUrl } from '@/lib/export-diagram'
import { tokenize, getTokenColor, type Language } from '@/lib/syntax-highlight'

type ExportCategory = 'image' | 'data' | 'drawio'

interface CategoryOption {
  id: ExportCategory
  label: string
}

const CATEGORIES: CategoryOption[] = [
  { id: 'image', label: 'Image' },
  { id: 'data', label: 'JSON' },
  { id: 'drawio', label: 'draw.io' },
]

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function downloadText(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  downloadBlob(blob, filename)
}

function CodePreview({ code, language }: { code: string; language: Language }) {
  const theme = useThemeStore((s) => s.theme)
  const lines = tokenize(code, language)

  return (
    <pre className="bg-[#fdf6e3] dark:bg-[#002b36] text-[#657b83] dark:text-[#839496] text-xs font-mono rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
      <code>
        {lines.map((lineTokens, i) => (
          <span key={i}>
            {lineTokens.map((token, j) => (
              <span key={j} style={{ color: getTokenColor(token.type, theme) }}>
                {token.value}
              </span>
            ))}
            {i < lines.length - 1 ? '\n' : ''}
          </span>
        ))}
      </code>
    </pre>
  )
}

export function DiagramExportModal() {
  const { nodes, edges, isExportOpen, setExportOpen } = useDesignerStore()
  const theme = useThemeStore((s) => s.theme)
  const { copy, isCopied } = useClipboard()
  const [category, setCategory] = useState<ExportCategory>('image')
  const [isExporting, setIsExporting] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => setExportOpen(false), [setExportOpen])

  const handleExportPng = async () => {
    const element = document.querySelector('.react-flow') as HTMLElement | null
    if (!element) return

    setIsExporting(true)
    try {
      const blob = await diagramToPng(element, theme === 'dark')
      downloadBlob(blob, 'network-diagram.png')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportSvg = async () => {
    const element = document.querySelector('.react-flow') as HTMLElement | null
    if (!element) return

    setIsExporting(true)
    try {
      const blob = await diagramToSvg(element, theme === 'dark')
      downloadBlob(blob, 'network-diagram.svg')
    } finally {
      setIsExporting(false)
    }
  }

  const jsonCode = diagramToJson(nodes, edges)
  const drawioCode = diagramToDrawio(nodes, edges)

  return (
    <AnimatePresence>
      {isExportOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={backdropRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-[#eee8d5] dark:bg-[#073642] border border-[#93a1a1]/20 dark:border-[#586e75]/20 rounded-lg shadow-2xl w-full max-w-xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#93a1a1]/15 dark:border-[#586e75]/20">
                <h2 className="text-sm font-semibold text-[#586e75] dark:text-[#93a1a1]">
                  Export Diagram
                </h2>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-[#fdf6e3] dark:hover:bg-[#002b36] text-[#93a1a1] dark:text-[#586e75] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Category tabs */}
              <div className="flex gap-1.5 px-5 pt-4 pb-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border ${
                      category === cat.id
                        ? 'bg-[#2aa198]/10 text-[#2aa198] border-[#2aa198]/20'
                        : 'bg-[#fdf6e3]/50 dark:bg-[#002b36]/30 text-[#586e75] border-transparent hover:bg-[#fdf6e3] dark:hover:bg-[#002b36]/50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="px-5 pb-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={category}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    {category === 'image' && (
                      <div className="space-y-3">
                        <p className="text-xs text-[#93a1a1] dark:text-[#586e75]">
                          Export the diagram canvas as an image file.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleExportPng}
                            disabled={isExporting}
                            className="flex-1 flex items-center justify-center gap-2 text-xs font-medium text-[#586e75] dark:text-[#93a1a1] bg-[#fdf6e3] dark:bg-[#002b36] px-4 py-2.5 rounded-lg border border-[#93a1a1]/20 dark:border-[#586e75]/20 hover:border-[#2aa198]/30 hover:text-[#2aa198] transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003.75 21z" />
                            </svg>
                            Download PNG
                          </button>
                          <button
                            onClick={handleExportSvg}
                            disabled={isExporting}
                            className="flex-1 flex items-center justify-center gap-2 text-xs font-medium text-[#586e75] dark:text-[#93a1a1] bg-[#fdf6e3] dark:bg-[#002b36] px-4 py-2.5 rounded-lg border border-[#93a1a1]/20 dark:border-[#586e75]/20 hover:border-[#2aa198]/30 hover:text-[#2aa198] transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                            </svg>
                            Download SVG
                          </button>
                        </div>
                      </div>
                    )}

                    {category === 'data' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#93a1a1] dark:text-[#586e75]">
                            Diagram data as JSON.
                          </p>
                          <button
                            onClick={() => copy(jsonCode, 'diagram-json')}
                            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                              isCopied('diagram-json')
                                ? 'bg-[#859900]/20 text-[#859900]'
                                : 'bg-[#fdf6e3] dark:bg-[#002b36] text-[#93a1a1] dark:text-[#586e75] hover:text-[#586e75] dark:hover:text-[#93a1a1]'
                            }`}
                          >
                            {isCopied('diagram-json') ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <CodePreview code={jsonCode} language="json" />
                      </div>
                    )}

                    {category === 'drawio' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#93a1a1] dark:text-[#586e75]">
                            Compatible with draw.io / diagrams.net.
                          </p>
                          <button
                            onClick={() => copy(drawioCode, 'diagram-drawio')}
                            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                              isCopied('diagram-drawio')
                                ? 'bg-[#859900]/20 text-[#859900]'
                                : 'bg-[#fdf6e3] dark:bg-[#002b36] text-[#93a1a1] dark:text-[#586e75] hover:text-[#586e75] dark:hover:text-[#93a1a1]'
                            }`}
                          >
                            {isCopied('diagram-drawio') ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadText(drawioCode, 'network-diagram.drawio', 'application/xml')}
                            className="flex-1 flex items-center justify-center gap-2 text-xs font-medium text-[#586e75] dark:text-[#93a1a1] bg-[#fdf6e3] dark:bg-[#002b36] px-4 py-2.5 rounded-lg border border-[#93a1a1]/20 dark:border-[#586e75]/20 hover:border-[#2aa198]/30 hover:text-[#2aa198] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Download .drawio
                          </button>
                          <button
                            onClick={() => window.open(getDiagramsNetUrl(drawioCode), '_blank')}
                            className="flex-1 flex items-center justify-center gap-2 text-xs font-medium text-[#586e75] dark:text-[#93a1a1] bg-[#fdf6e3] dark:bg-[#002b36] px-4 py-2.5 rounded-lg border border-[#93a1a1]/20 dark:border-[#586e75]/20 hover:border-[#2aa198]/30 hover:text-[#2aa198] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                            Open in diagrams.net
                          </button>
                        </div>
                        <CodePreview code={drawioCode} language="xml" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
