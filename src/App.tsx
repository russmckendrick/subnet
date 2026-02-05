import { Layout } from '@/components/layout/Layout'
import { CidrInput } from '@/components/calculator/CidrInput'
import { ResultsPanel } from '@/components/calculator/ResultsPanel'
import { BinaryBreakdown } from '@/components/calculator/BinaryBreakdown'
import { QuickReference } from '@/components/calculator/QuickReference'
import { CloudContext } from '@/components/cloud/CloudContext'
import { SubnetMap } from '@/components/visual-map/SubnetMap'
import { SubnetSplitter } from '@/components/splitter/SubnetSplitter'
import { SupernetTool } from '@/components/tools/SupernetTool'
import { ExportMenu } from '@/components/export/ExportMenu'
import { Tabs } from '@/components/shared/Tabs'
import { useCalculatorStore, type AppTab } from '@/store/calculator-store'
import { useUrlSync } from '@/hooks/use-url-sync'

const TABS = [
  {
    id: 'calculator' as const,
    label: 'Calculator',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
      </svg>
    ),
  },
  {
    id: 'splitter' as const,
    label: 'Splitter',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: 'supernet' as const,
    label: 'Supernet',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    id: 'reference' as const,
    label: 'Reference',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
]

function App() {
  const { activeTab, setActiveTab } = useCalculatorStore()
  useUrlSync()

  return (
    <Layout>
      <div className="py-4">
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <Tabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as AppTab)}
          />
        </div>

        {/* Tab content */}
        {activeTab === 'calculator' && (
          <div>
            <CidrInput />
            <ResultsPanel />
            <CloudContext />
            <SubnetMap />
            <BinaryBreakdown />
            <ExportMenu />
          </div>
        )}

        {activeTab === 'splitter' && <SubnetSplitter />}

        {activeTab === 'supernet' && <SupernetTool />}

        {activeTab === 'reference' && (
          <div className="max-w-3xl mx-auto">
            <QuickReference />
          </div>
        )}
      </div>
    </Layout>
  )
}

export default App
