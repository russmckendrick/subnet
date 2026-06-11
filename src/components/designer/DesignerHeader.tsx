import { useDesignerStore } from '@/store/designer-store'
import { useCalculatorHref } from '@/hooks/use-calculator-href'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { HeaderBar } from '@/components/layout/HeaderBar'
import { ArrangeToolbar } from './ArrangeToolbar'
import { LayerToggle } from './LayerToggle'
import { FaFileExport, FaTrashAlt } from 'react-icons/fa'

export function DesignerHeader() {
  const { nodes, selectedNodeId, removeNode, clearDiagram, setExportOpen } = useDesignerStore()
  const calculatorHref = useCalculatorHref()

  return (
    <HeaderBar
      logoHref={calculatorHref}
      logoAriaLabel="Back to calculator"
      width="full"
      bordered
      title={
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-ink tracking-tight whitespace-nowrap truncate">
            <span className="hidden md:inline">Network </span>Designer
          </h1>
          {nodes.length > 0 && (
            <span className="hidden md:inline-flex">
              <Badge>{nodes.length} nodes</Badge>
            </span>
          )}
        </div>
      }
      actions={
        <>
          {nodes.length > 0 && <ArrangeToolbar />}
          {nodes.length > 0 && <LayerToggle />}

          {nodes.length > 0 && (
            <Button
              onClick={() => setExportOpen(true)}
              icon={<FaFileExport className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}

          {selectedNodeId && (
            <Button
              variant="danger"
              className="text-sol-orange hover:bg-sol-orange/10"
              onClick={() => removeNode(selectedNodeId)}
              icon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            >
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}

          {nodes.length > 0 && (
            <Button
              variant="danger"
              onClick={clearDiagram}
              icon={<FaTrashAlt className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}

          <div className="h-5 w-px bg-line/20" aria-hidden="true" />

          <ThemeToggle />
        </>
      }
    />
  )
}
