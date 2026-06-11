import { useState, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useDesignerUrlSync } from '@/hooks/use-designer-url-sync'
import { useDiagramPersistence } from '@/hooks/use-diagram-persistence'
import { useDesignerShortcuts } from '@/hooks/use-designer-shortcuts'
import { useDesignerStore } from '@/store/designer-store'
import { Drawer } from '@/components/shared/Drawer'
import { DesignerHeader } from './DesignerHeader'
import { DesignerCanvas } from './DesignerCanvas'
import { ResourcePalette } from './ResourcePalette'
import { PropertiesPanel } from './PropertiesPanel'
import { DiagramExportModal } from './DiagramExportModal'
import './designer-theme.css'

const PHONE_BANNER_KEY = 'subnet-designer-phone-banner-dismissed'

function DesignerContent() {
  useDesignerUrlSync()
  useDiagramPersistence()
  useDesignerShortcuts()

  useEffect(() => {
    document.title = 'Network Designer — subnet.fit'
  }, [])

  // Below md the sidebars become overlay sheets (tap-to-place handles adding)
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  const [isPhone, setIsPhone] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 480 : false
  )

  useEffect(() => {
    const check = () => {
      setIsCompact(window.innerWidth < 768)
      setIsPhone(window.innerWidth < 480)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const [paletteSheetOpen, setPaletteSheetOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(PHONE_BANNER_KEY) === '1'
    } catch {
      return true
    }
  })

  // After picking a resource in the sheet, close it so the canvas is tappable
  useEffect(() => {
    return useDesignerStore.subscribe((state, prev) => {
      if (state.pendingDrop && !prev.pendingDrop) {
        setPaletteSheetOpen(false)
      }
    })
  }, [])

  const dismissBanner = () => {
    setBannerDismissed(true)
    try {
      sessionStorage.setItem(PHONE_BANNER_KEY, '1')
    } catch {
      /* noop */
    }
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-canvas">
        <DesignerHeader />

        {isPhone && !bannerDismissed && (
          <div className="flex items-center gap-2 px-4 py-2 bg-sol-yellow/10 border-b border-sol-yellow/20 text-xs text-ink">
            <svg className="w-3.5 h-3.5 text-sol-yellow shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="min-w-0">The designer works best on a larger screen — tap-to-place is enabled.</span>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Dismiss"
              className="ml-auto shrink-0 p-0.5 rounded text-ink-muted hover:text-ink transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          {!isCompact && <ResourcePalette />}
          <DesignerCanvas />
          {!isCompact && <PropertiesPanel />}

          {/* Compact: floating Add button opens the palette sheet */}
          {isCompact && (
            <button
              type="button"
              onClick={() => setPaletteSheetOpen(true)}
              aria-label="Add resource"
              className="absolute bottom-6 left-4 z-10 flex items-center gap-1.5 text-xs font-medium text-sol-base3 bg-sol-cyan px-3 py-2.5 rounded-full shadow-lg hover:bg-sol-cyan/90 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add
            </button>
          )}
        </div>

        {isCompact && (
          <>
            <Drawer
              isOpen={paletteSheetOpen}
              onClose={() => setPaletteSheetOpen(false)}
              title="Resources"
            >
              <ResourcePalette variant="sheet" />
            </Drawer>
            <PropertiesPanel variant="overlay" />
          </>
        )}

        <DiagramExportModal />
      </div>
    </ReactFlowProvider>
  )
}

export function DesignerPage() {
  return <DesignerContent />
}
