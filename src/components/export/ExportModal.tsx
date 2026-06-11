import { useCalculatorStore } from '@/store/calculator-store'
import { Modal } from '@/components/shared/Modal'
import { ExportMenuContent } from './ExportMenu'

/** Calculator export dialog — same Modal chrome as the designer's export. */
export function ExportModal() {
  const { exportModalOpen, setExportModalOpen, result } = useCalculatorStore()

  return (
    <Modal
      isOpen={exportModalOpen && result !== null}
      onClose={() => setExportModalOpen(false)}
      title="Export & Share"
      size="lg"
    >
      <div className="px-5 py-4 overflow-y-auto">
        <ExportMenuContent />
      </div>
    </Modal>
  )
}
