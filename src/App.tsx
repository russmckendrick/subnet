import { Layout } from '@/components/layout/Layout'
import { CidrInput } from '@/components/calculator/CidrInput'
import { ResultsPanel } from '@/components/calculator/ResultsPanel'
import { AddressSpaceSection } from '@/components/calculator/DetailsSection'
import { DetailsSection } from '@/components/calculator/DetailsSection'
import { SubnetSplittingSection } from '@/components/splitter/SubnetSplittingSection'
import { QuickReference } from '@/components/calculator/QuickReference'
import { SupernetTool } from '@/components/tools/SupernetTool'
import { Drawer } from '@/components/shared/Drawer'
import { CommandPalette } from '@/components/command-palette/CommandPalette'
import { useCalculatorStore } from '@/store/calculator-store'
import { useUrlSync } from '@/hooks/use-url-sync'
import { DesignerPage } from '@/components/designer/DesignerPage'

function Calculator() {
  const { result, activeDrawer, setActiveDrawer } = useCalculatorStore()
  useUrlSync()

  return (
    <Layout>
      <div className="py-4">
        <CidrInput />
        {result && <ResultsPanel />}
        {result && <AddressSpaceSection />}
        {result && <SubnetSplittingSection />}
        {result && <DetailsSection />}
      </div>

      <Drawer
        isOpen={activeDrawer === 'reference'}
        onClose={() => setActiveDrawer('none')}
        title="CIDR Reference"
      >
        <QuickReference />
      </Drawer>

      <Drawer
        isOpen={activeDrawer === 'supernet'}
        onClose={() => setActiveDrawer('none')}
        title="Supernet / Route Aggregation"
      >
        <SupernetTool />
      </Drawer>

      <CommandPalette />
    </Layout>
  )
}

function App() {
  const isDesigner = window.location.pathname.startsWith('/designer')

  if (isDesigner) {
    return <DesignerPage />
  }

  return <Calculator />
}

export default App
