import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useDesignerStore } from '@/store/designer-store'
import { useThemeStore } from '@/store/theme-store'
import { useClipboard } from '@/hooks/use-clipboard'
import {
  diagramToPng,
  diagramToSvg,
  diagramToJson,
  diagramToDrawio,
  getDiagramsNetUrl,
  parseDiagramJson,
  getShareUrl,
} from '@/lib/export-diagram'
import { migrateDiagramState, type StorageState } from '@/lib/diagram-migration'
import { getSavedDiagrams, saveDiagram, loadSavedDiagram, deleteSavedDiagram } from '@/lib/diagram-saves'
import type { SaveEntry } from '@/lib/diagram-saves'
import { tokenize, getTokenColor, type Language } from '@/lib/syntax-highlight'
import type { CloudProvider } from '@/lib/cloud-theme'
import type { Node } from '@xyflow/react'
import type { DesignerNodeData } from '@/store/designer-store'
import { HiOutlineShare, HiOutlineCircleStack, HiOutlinePhoto } from 'react-icons/hi2'
import { SiDiagramsdotnet } from 'react-icons/si'

type ExportCategory = 'data' | 'share' | 'image' | 'drawio'

interface CategoryOption {
  id: ExportCategory
  label: string
  icon: React.ReactNode
}

const CATEGORIES: CategoryOption[] = [
  { id: 'data', label: 'Data', icon: <HiOutlineCircleStack className="w-3.5 h-3.5" /> },
  { id: 'share', label: 'Share', icon: <HiOutlineShare className="w-3.5 h-3.5" /> },
  { id: 'image', label: 'Image', icon: <HiOutlinePhoto className="w-3.5 h-3.5" /> },
  { id: 'drawio', label: 'Diagrams.net', icon: <SiDiagramsdotnet className="w-3.5 h-3.5" /> },
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

const btnBase = 'flex-1 flex items-center justify-center gap-2 text-xs font-medium text-[#586e75] dark:text-[#93a1a1] bg-[#fdf6e3] dark:bg-[#002b36] px-4 py-2.5 rounded-lg border border-[#93a1a1]/20 dark:border-[#586e75]/20 hover:border-[#2aa198]/30 hover:text-[#2aa198] transition-colors disabled:opacity-50'

export function DiagramExportModal() {
  const { nodes, edges, cloudProvider, isExportOpen, setExportOpen, importDiagram } = useDesignerStore()
  const { copy, isCopied } = useClipboard()
  const [category, setCategory] = useState<ExportCategory>('data')
  const [isExporting, setIsExporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [saveName, setSaveName] = useState('')
  const [saves, setSaves] = useState<SaveEntry[]>(() => getSavedDiagrams())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    setExportOpen(false)
    setImportError(null)
    setShareUrl(null)
  }, [setExportOpen])

  const handleExportPng = async () => {
    const element = document.querySelector('.react-flow') as HTMLElement | null
    if (!element) return

    setIsExporting(true)
    try {
      const blob = await diagramToPng(element)
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
      const blob = await diagramToSvg(element)
      downloadBlob(blob, 'network-diagram.svg')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = parseDiagramJson(reader.result as string)
        const migrated = migrateDiagramState(data as StorageState)
        importDiagram({
          nodes: migrated.nodes as Node<DesignerNodeData>[],
          edges: migrated.edges,
          cloudProvider: (migrated.cloudProvider as CloudProvider) ?? 'generic',
        })
        handleClose()
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Failed to import JSON')
      }
    }
    reader.readAsText(file)
    // Reset so the same file can be re-imported
    e.target.value = ''
  }

  const handleSave = () => {
    const name = saveName.trim()
    if (!name) return
    saveDiagram(name, nodes, edges, cloudProvider)
    setSaveName('')
    setSaves(getSavedDiagrams())
  }

  const handleLoadSave = (id: string) => {
    const data = loadSavedDiagram(id)
    if (!data) return
    const migrated = migrateDiagramState(data as StorageState)
    importDiagram({
      nodes: migrated.nodes as Node<DesignerNodeData>[],
      edges: migrated.edges,
      cloudProvider: (migrated.cloudProvider as CloudProvider) ?? 'generic',
    })
    handleClose()
  }

  const handleDeleteSave = (id: string) => {
    if (confirmDeleteId === id) {
      deleteSavedDiagram(id)
      setSaves(getSavedDiagrams())
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
    }
  }

  const handleGenerateShareUrl = () => {
    const url = getShareUrl(nodes, edges, cloudProvider)
    setShareUrl(url)
  }

  const jsonCode = diagramToJson(nodes, edges, cloudProvider)
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
              className="bg-[#eee8d5] dark:bg-[#073642] border border-[#93a1a1]/20 dark:border-[#586e75]/20 rounded-lg shadow-2xl w-full max-w-xl pointer-events-auto max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#93a1a1]/15 dark:border-[#586e75]/20 shrink-0">
                <h2 className="text-sm font-semibold text-[#586e75] dark:text-[#93a1a1]">
                  Export / Import
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
              <div className="flex gap-1.5 px-5 pt-4 pb-3 shrink-0">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border ${
                      category === cat.id
                        ? 'bg-[#2aa198]/10 text-[#2aa198] border-[#2aa198]/20'
                        : 'bg-[#fdf6e3]/50 dark:bg-[#002b36]/30 text-[#586e75] border-transparent hover:bg-[#fdf6e3] dark:hover:bg-[#002b36]/50'
                    }`}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="px-5 pb-5 overflow-y-auto">
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
                          Export the diagram canvas as a transparent image.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleExportPng}
                            disabled={isExporting}
                            className={btnBase}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003.75 21z" />
                            </svg>
                            Download PNG
                          </button>
                          <button
                            onClick={handleExportSvg}
                            disabled={isExporting}
                            className={btnBase}
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
                            Download or import diagram data as JSON.
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

                        {/* JSON download + import buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadText(jsonCode, 'network-diagram.json', 'application/json')}
                            className={btnBase}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Download JSON
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className={btnBase}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            Import JSON
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleImportJson}
                          />
                        </div>

                        <CodePreview code={jsonCode} language="json" />

                        {importError && (
                          <p className="text-xs text-[#dc322f]">{importError}</p>
                        )}

                        {/* Separator */}
                        <div className="border-t border-[#93a1a1]/15 dark:border-[#586e75]/20 pt-3">
                          <h3 className="text-xs font-semibold text-[#586e75] dark:text-[#93a1a1] mb-2">
                            Saved Diagrams
                          </h3>

                          {/* Save row */}
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={saveName}
                              onChange={(e) => setSaveName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                              placeholder="Name this diagram..."
                              className="flex-1 text-xs bg-[#fdf6e3] dark:bg-[#002b36] text-[#586e75] dark:text-[#93a1a1] px-3 py-2 rounded-lg border border-[#93a1a1]/20 dark:border-[#586e75]/20 placeholder:text-[#93a1a1]/50 dark:placeholder:text-[#586e75]/50 focus:outline-none focus:border-[#2aa198]/40"
                            />
                            <button
                              onClick={handleSave}
                              disabled={!saveName.trim()}
                              className="text-xs font-medium text-[#fdf6e3] bg-[#2aa198] px-4 py-2 rounded-lg hover:bg-[#2aa198]/80 transition-colors disabled:opacity-40"
                            >
                              Save
                            </button>
                          </div>

                          {/* Saved list */}
                          {saves.length > 0 ? (
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {saves.map((save) => (
                                <div
                                  key={save.id}
                                  className="flex items-center justify-between gap-2 bg-[#fdf6e3] dark:bg-[#002b36] px-3 py-2 rounded-lg border border-[#93a1a1]/10 dark:border-[#586e75]/10"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-[#586e75] dark:text-[#93a1a1] truncate">
                                      {save.name}
                                    </p>
                                    <p className="text-[10px] text-[#93a1a1] dark:text-[#586e75]">
                                      {save.nodeCount} nodes · {save.cloudProvider} · {new Date(save.updatedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <button
                                      onClick={() => handleLoadSave(save.id)}
                                      className="text-[10px] font-medium text-[#2aa198] px-2 py-1 rounded hover:bg-[#2aa198]/10 transition-colors"
                                    >
                                      Load
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSave(save.id)}
                                      className={`text-[10px] font-medium px-2 py-1 rounded transition-colors ${
                                        confirmDeleteId === save.id
                                          ? 'text-[#dc322f] bg-[#dc322f]/10'
                                          : 'text-[#93a1a1] dark:text-[#586e75] hover:text-[#dc322f] hover:bg-[#dc322f]/5'
                                      }`}
                                    >
                                      {confirmDeleteId === save.id ? 'Confirm' : 'Delete'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-[#93a1a1]/60 dark:text-[#586e75]/60 text-center py-3">
                              No saved diagrams yet.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {category === 'drawio' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#93a1a1] dark:text-[#586e75]">
                            Compatible with Diagrams.net.
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
                            className={btnBase}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Download .drawio
                          </button>
                          <button
                            onClick={() => window.open(getDiagramsNetUrl(drawioCode), '_blank')}
                            className={btnBase}
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

                    {category === 'share' && (
                      <div className="space-y-3">
                        <p className="text-xs text-[#93a1a1] dark:text-[#586e75]">
                          Generate a shareable URL that encodes the full diagram state.
                        </p>
                        {!shareUrl ? (
                          <button
                            onClick={handleGenerateShareUrl}
                            className={btnBase}
                          >
                            <HiOutlineShare className="w-4 h-4" />
                            Generate Share URL
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 text-xs font-mono bg-[#fdf6e3] dark:bg-[#002b36] text-[#586e75] dark:text-[#93a1a1] px-3 py-2 rounded-lg border border-[#93a1a1]/20 dark:border-[#586e75]/20 focus:outline-none"
                              />
                              <button
                                onClick={() => copy(shareUrl, 'share-url')}
                                className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors shrink-0 ${
                                  isCopied('share-url')
                                    ? 'bg-[#859900]/20 text-[#859900]'
                                    : 'bg-[#2aa198] text-[#fdf6e3] hover:bg-[#2aa198]/80'
                                }`}
                              >
                                {isCopied('share-url') ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            {shareUrl.length > 8000 && (
                              <p className="text-xs text-[#b58900]">
                                This URL is very long ({shareUrl.length.toLocaleString()} chars). For large diagrams, consider using JSON export instead.
                              </p>
                            )}
                          </div>
                        )}
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
