import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { useClipboard } from '@/hooks/use-clipboard'
import { toJSON, toCSV, toTerraform, toPulumi, toCloudFormation } from '@/lib/export'
import { AnimatedCard } from '@/components/shared/AnimatedCard'

type ExportFormat = 'json' | 'csv' | 'terraform' | 'pulumi' | 'cloudformation' | 'url'

interface ExportOption {
  id: ExportFormat
  label: string
  icon: string
}

const EXPORT_OPTIONS: ExportOption[] = [
  { id: 'json', label: 'JSON', icon: '{ }' },
  { id: 'csv', label: 'CSV', icon: ',' },
  { id: 'terraform', label: 'Terraform', icon: 'TF' },
  { id: 'pulumi', label: 'Pulumi', icon: 'PL' },
  { id: 'cloudformation', label: 'CloudFormation', icon: 'CF' },
  { id: 'url', label: 'Share URL', icon: '#' },
]

export function ExportMenu() {
  const { result, splits } = useCalculatorStore()
  const { copy, isCopied } = useClipboard()
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('terraform')

  if (!result) return null

  function getExportContent(format: ExportFormat): string {
    switch (format) {
      case 'json':
        return toJSON(result!, splits.length > 0 ? splits : undefined)
      case 'csv':
        return toCSV(result!, splits.length > 0 ? splits : undefined)
      case 'terraform':
        return toTerraform(result!, splits.length > 0 ? splits : undefined)
      case 'pulumi':
        return toPulumi(result!, splits.length > 0 ? splits : undefined)
      case 'cloudformation':
        return toCloudFormation(result!, splits.length > 0 ? splits : undefined)
      case 'url':
        return window.location.href
      default:
        return ''
    }
  }

  const content = getExportContent(selectedFormat)

  return (
    <AnimatedCard delay={0.6} className="p-5 mt-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Export
        </h3>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => copy(content, `export-${selectedFormat}`)}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
            isCopied(`export-${selectedFormat}`)
              ? 'bg-emerald-500/20 text-emerald-500'
              : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20'
          }`}
        >
          {isCopied(`export-${selectedFormat}`) ? 'Copied!' : 'Copy to clipboard'}
        </motion.button>
      </div>

      {/* Format selector */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {EXPORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedFormat(opt.id)}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border ${
              selectedFormat === opt.id
                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                : 'bg-black/[0.02] dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
            }`}
          >
            <span className="font-mono mr-1 opacity-50">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Code preview */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedFormat}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <pre className="bg-slate-950 text-slate-300 text-xs font-mono rounded-xl p-4 overflow-x-auto max-h-64 overflow-y-auto">
            <code>{content}</code>
          </pre>
        </motion.div>
      </AnimatePresence>
    </AnimatedCard>
  )
}
