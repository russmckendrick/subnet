import { useState, useRef, useCallback } from 'react'
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
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { SegmentedControl } from '@/components/shared/SegmentedControl'
import { CopyButton } from '@/components/shared/CopyButton'
import { HiOutlineShare, HiOutlineCircleStack, HiOutlinePhoto } from 'react-icons/hi2'
import { SiDiagramsdotnet } from 'react-icons/si'

type ExportCategory = 'data' | 'image' | 'drawio' | 'share'

const CATEGORIES = [
  { value: 'data' as ExportCategory, label: 'Data', icon: <HiOutlineCircleStack className="w-3.5 h-3.5" /> },
  { value: 'image' as ExportCategory, label: 'Image', icon: <HiOutlinePhoto className="w-3.5 h-3.5" /> },
  { value: 'drawio' as ExportCategory, label: 'Diagrams.net', icon: <SiDiagramsdotnet className="w-3.5 h-3.5" /> },
  { value: 'share' as ExportCategory, label: 'Share', icon: <HiOutlineShare className="w-3.5 h-3.5" /> },
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
    <pre className="bg-well text-ink-body text-xs font-mono rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
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
    <Modal isOpen={isExportOpen} onClose={handleClose} title="Export & Share" size="lg">
      {/* Category tabs */}
      <div className="px-5 pt-4 pb-3 shrink-0">
        <SegmentedControl
          options={CATEGORIES}
          value={category}
          onChange={setCategory}
          ariaLabel="Diagram export category"
          role="tablist"
        />
      </div>

      {/* Content */}
      <div className="px-5 pb-5 overflow-y-auto">
        {category === 'data' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-muted">
                Download or import diagram data as JSON.
              </p>
              <CopyButton text={jsonCode} copyKey="diagram-json" label="Copy" />
            </div>

            {/* JSON download + import buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => downloadText(jsonCode, 'network-diagram.json', 'application/json')}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                }
              >
                Download JSON
              </Button>
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                }
              >
                Import JSON
              </Button>
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
              <p className="text-xs text-sol-red">{importError}</p>
            )}

            {/* Saved diagrams */}
            <div className="border-t border-line/15 pt-3">
              <h3 className="text-xs font-semibold text-ink mb-2">
                Saved Diagrams
              </h3>

              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  name="diagram-save-name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="Name this diagram…"
                  className="flex-1 text-xs"
                />
                <Button variant="primary" size="md" onClick={handleSave} disabled={!saveName.trim()}>
                  Save
                </Button>
              </div>

              {saves.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {saves.map((save) => (
                    <div
                      key={save.id}
                      className="flex items-center justify-between gap-2 bg-well px-3 py-2 rounded-lg border border-line/10"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink truncate">
                          {save.name}
                        </p>
                        <p className="text-[10px] text-ink-muted">
                          {save.nodeCount} nodes · {save.cloudProvider} · {new Date(save.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLoadSave(save.id)}
                          className="text-[10px] font-medium text-sol-cyan px-2 py-1 rounded-lg hover:bg-sol-cyan/10 transition-colors cursor-pointer"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSave(save.id)}
                          className={`text-[10px] font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                            confirmDeleteId === save.id
                              ? 'text-sol-red bg-sol-red/10'
                              : 'text-ink-muted hover:text-sol-red hover:bg-sol-red/5'
                          }`}
                        >
                          {confirmDeleteId === save.id ? 'Confirm' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink-muted/60 text-center py-3">
                  No saved diagrams yet.
                </p>
              )}
            </div>
          </div>
        )}

        {category === 'image' && (
          <div className="space-y-3">
            <p className="text-xs text-ink-muted">
              Export the diagram canvas as a transparent image.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={handleExportPng}
                disabled={isExporting}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                }
              >
                Download PNG
              </Button>
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={handleExportSvg}
                disabled={isExporting}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                }
              >
                Download SVG
              </Button>
            </div>
          </div>
        )}

        {category === 'drawio' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-muted">
                Compatible with Diagrams.net.
              </p>
              <CopyButton text={drawioCode} copyKey="diagram-drawio" label="Copy" />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => downloadText(drawioCode, 'network-diagram.drawio', 'application/xml')}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                }
              >
                Download .drawio
              </Button>
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => window.open(getDiagramsNetUrl(drawioCode), '_blank')}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                }
              >
                Open in diagrams.net
              </Button>
            </div>
            <CodePreview code={drawioCode} language="xml" />
          </div>
        )}

        {category === 'share' && (
          <div className="space-y-3">
            <p className="text-xs text-ink-muted">
              Generate a shareable URL that encodes the full diagram state.
            </p>
            {!shareUrl ? (
              <Button
                variant="outline"
                size="md"
                className="flex-1 w-full"
                onClick={handleGenerateShareUrl}
                icon={<HiOutlineShare className="w-4 h-4" />}
              >
                Generate Share URL
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    name="diagram-share-url"
                    readOnly
                    mono
                    value={shareUrl}
                    className="flex-1 text-xs"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    className={isCopied('share-url') ? 'bg-sol-green/20 !text-sol-green hover:bg-sol-green/20' : ''}
                    onClick={() => copy(shareUrl, 'share-url')}
                  >
                    {isCopied('share-url') ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                {shareUrl.length > 8000 && (
                  <p className="text-xs text-sol-yellow">
                    This URL is very long ({shareUrl.length.toLocaleString()} chars). For large diagrams, consider using JSON export instead.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
