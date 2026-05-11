import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SiTerraform } from 'react-icons/si'
import { HiOutlineCodeBracketSquare, HiOutlineCommandLine, HiOutlineShare } from 'react-icons/hi2'
import { useCalculatorStore } from '@/store/calculator-store'
import { toJSON, toCSV, toTerraformAws, toTerraformAzure, toTerraformGcp } from '@/lib/export'
import { toAwsCli, toAzureCli, toGcloudCli } from '@/lib/export-cli'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { CodeBlock } from './CodeBlock'
import { TerminalFrame } from './TerminalFrame'
import { ProviderSelector, type CloudProvider } from './ProviderSelector'
import { ShareCard } from './ShareCard'

type Category = 'data' | 'cli' | 'terraform' | 'share'
type DataFormat = 'json' | 'csv'

interface CategoryOption {
  id: Category
  label: string
  icon: ReactNode
}

const CATEGORIES: CategoryOption[] = [
  { id: 'data', label: 'Data', icon: <HiOutlineCodeBracketSquare className="w-3.5 h-3.5" /> },
  { id: 'cli', label: 'CLI', icon: <HiOutlineCommandLine className="w-3.5 h-3.5" /> },
  { id: 'terraform', label: 'Terraform', icon: <SiTerraform className="w-3 h-3" style={{ color: '#7B42BC' }} /> },
  { id: 'share', label: 'Share', icon: <HiOutlineShare className="w-3.5 h-3.5" /> },
]

const PROVIDER_LABELS: Record<CloudProvider, { name: string; color: string }> = {
  aws: { name: 'AWS CLI', color: '#cb4b16' },
  azure: { name: 'Azure CLI', color: '#268bd2' },
  gcp: { name: 'Google Cloud CLI', color: '#6c71c4' },
}

function ExportMenuInner() {
  const { result, splits } = useCalculatorStore()
  const [category, setCategory] = useState<Category>('data')
  const [provider, setProvider] = useState<CloudProvider>('aws')
  const [dataFormat, setDataFormat] = useState<DataFormat>('json')

  if (!result) return null

  const splitArg = splits.length > 0 ? splits : undefined

  function renderContent() {
    switch (category) {
      case 'data': {
        const code = dataFormat === 'json'
          ? toJSON(result!, splitArg)
          : toCSV(result!, splitArg)
        return (
          <CodeBlock
            code={code}
            language={dataFormat === 'json' ? 'json' : 'csv'}
            copyKey={`export-${dataFormat}`}
          />
        )
      }
      case 'cli': {
        const generators = { aws: toAwsCli, azure: toAzureCli, gcp: toGcloudCli }
        const code = generators[provider](result!, splitArg)
        const info = PROVIDER_LABELS[provider]
        return (
          <TerminalFrame
            title={info.name}
            providerColor={info.color}
            code={code}
            copyKey={`export-cli-${provider}`}
          />
        )
      }
      case 'terraform': {
        const generators = { aws: toTerraformAws, azure: toTerraformAzure, gcp: toTerraformGcp }
        const code = generators[provider](result!, splitArg)
        return (
          <CodeBlock
            code={code}
            language="hcl"
            copyKey={`export-tf-${provider}`}
          />
        )
      }
      case 'share':
        return <ShareCard />
      default:
        return null
    }
  }

  return (
    <div>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3 rounded-lg border border-[#586e75]/10 bg-[#fdf6e3]/35 p-1 dark:bg-[#002b36]/25" role="tablist" aria-label="Export category">
        {CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            role="tab"
            aria-selected={category === cat.id}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border inline-flex items-center gap-1.5 ${
              category === cat.id
                ? 'bg-[#2aa198]/10 text-[#2aa198] border-[#2aa198]/20'
                : 'bg-[#fdf6e3]/50 dark:bg-[#002b36]/30 text-[#586e75] border-transparent hover:bg-[#fdf6e3] dark:hover:bg-[#002b36]/50'
            }`}
          >
            <span className="opacity-50 flex items-center">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Second row — contextual controls */}
      {category === 'data' && (
        <div className="flex gap-1.5 mb-3" role="group" aria-label="Data export format">
          {(['json', 'csv'] as DataFormat[]).map((fmt) => (
            <button
              type="button"
              key={fmt}
              onClick={() => setDataFormat(fmt)}
              aria-pressed={dataFormat === fmt}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border ${
                dataFormat === fmt
                  ? 'bg-[#2aa198]/10 text-[#2aa198] border-[#2aa198]/20'
                  : 'bg-[#fdf6e3]/50 dark:bg-[#002b36]/30 text-[#586e75] border-transparent hover:bg-[#fdf6e3] dark:hover:bg-[#002b36]/50'
              }`}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {(category === 'cli' || category === 'terraform') && (
        <div className="mb-3">
          <ProviderSelector selected={provider} onChange={setProvider} />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${category}-${category === 'data' ? dataFormat : ''}-${(category === 'cli' || category === 'terraform') ? provider : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/** Content-only export for use in tabbed panels */
export function ExportMenuContent() {
  return <ExportMenuInner />
}

export function ExportMenu() {
  const { result } = useCalculatorStore()
  if (!result) return null

  return (
    <CollapsibleSection title="Export" defaultOpen={false} delay={0.45}>
      <ExportMenuInner />
    </CollapsibleSection>
  )
}
