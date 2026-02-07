import { useState, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useDesignerUrlSync } from '@/hooks/use-designer-url-sync'
import { DesignerHeader } from './DesignerHeader'
import { DesignerCanvas } from './DesignerCanvas'
import { ResourcePalette } from './ResourcePalette'
import './designer-theme.css'

function DesignerContent() {
  useDesignerUrlSync()

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#fdf6e3] dark:bg-[#002b36] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <svg className="w-12 h-12 mx-auto mb-4 text-[#93a1a1] dark:text-[#586e75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
          <h2 className="text-lg font-semibold text-[#586e75] dark:text-[#93a1a1] mb-2">
            Desktop Recommended
          </h2>
          <p className="text-sm text-[#93a1a1] dark:text-[#586e75] mb-4">
            The Network Designer works best on larger screens with drag-and-drop support.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#2aa198] hover:text-[#2aa198]/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Calculator
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#fdf6e3] dark:bg-[#002b36]">
      <DesignerHeader />
      <div className="flex flex-1 overflow-hidden">
        <ResourcePalette />
        <DesignerCanvas />
      </div>
    </div>
  )
}

export function DesignerPage() {
  return (
    <ReactFlowProvider>
      <DesignerContent />
    </ReactFlowProvider>
  )
}
