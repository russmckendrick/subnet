import { useDesignerStore } from '@/store/designer-store'
import { Drawer } from '@/components/shared/Drawer'
import { SubnetProperties } from './panels/SubnetProperties'
import { ResourceProperties } from './panels/ResourceProperties'

export function PropertiesPanel() {
  const { nodes, selectedNodeId, setSelectedNodeId } = useDesignerStore()

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : null

  const isOpen = selectedNode !== null && selectedNode !== undefined

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => setSelectedNodeId(null)}
      title="Properties"
    >
      {selectedNode?.data.type === 'subnet' && (
        <SubnetProperties nodeId={selectedNode.id} data={selectedNode.data} />
      )}
      {selectedNode?.data.type === 'resource' && (
        <ResourceProperties nodeId={selectedNode.id} data={selectedNode.data} />
      )}
    </Drawer>
  )
}
