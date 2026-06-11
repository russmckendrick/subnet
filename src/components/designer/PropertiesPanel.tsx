import { motion, AnimatePresence } from 'motion/react'
import { useDesignerStore } from '@/store/designer-store'
import { Button, IconButton } from '@/components/shared/Button'
import { Drawer } from '@/components/shared/Drawer'
import { SubnetProperties } from './panels/SubnetProperties'
import { ResourceProperties } from './panels/ResourceProperties'
import { VpcProperties } from './panels/VpcProperties'
import { SubnetContainerProperties } from './panels/SubnetContainerProperties'
import { CloudResourceProperties } from './panels/CloudResourceProperties'

interface PropertiesPanelProps {
  /** "overlay" renders inside a Drawer (tablet/mobile) instead of the inline column. */
  variant?: 'inline' | 'overlay'
}

export function PropertiesPanel({ variant = 'inline' }: PropertiesPanelProps) {
  const { nodes, selectedNodeId, setSelectedNodeId, removeNode } = useDesignerStore()

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : null

  const isOpen = selectedNode !== null && selectedNode !== undefined

  if (variant === 'overlay') {
    return (
      <Drawer isOpen={isOpen} onClose={() => setSelectedNodeId(null)} title="Properties">
        {selectedNode && (
          <div className="flex flex-col gap-4">
            {selectedNode.data.type === 'subnet' && (
              <SubnetProperties nodeId={selectedNode.id} data={selectedNode.data} />
            )}
            {selectedNode.data.type === 'resource' && (
              <ResourceProperties nodeId={selectedNode.id} data={selectedNode.data} />
            )}
            {selectedNode.data.type === 'vpc-container' && (
              <VpcProperties nodeId={selectedNode.id} data={selectedNode.data} />
            )}
            {selectedNode.data.type === 'subnet-container' && (
              <SubnetContainerProperties nodeId={selectedNode.id} data={selectedNode.data} />
            )}
            {selectedNode.data.type === 'cloud-resource' && (
              <CloudResourceProperties nodeId={selectedNode.id} data={selectedNode.data} />
            )}
            <div className="pt-3 border-t border-line/15">
              <Button
                variant="danger"
                className="w-full"
                onClick={() => {
                  if (selectedNodeId) {
                    removeNode(selectedNodeId)
                    setSelectedNodeId(null)
                  }
                }}
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                }
              >
                Delete Node
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="shrink-0 border-l border-line/15 bg-canvas overflow-hidden flex flex-col h-full"
        >
          <div className="w-[320px] flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-line/15">
              <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                Properties
              </span>
              <IconButton
                size="sm"
                variant="ghost"
                onClick={() => setSelectedNodeId(null)}
                aria-label="Close properties"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </IconButton>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-3">
              {selectedNode?.data.type === 'subnet' && (
                <SubnetProperties nodeId={selectedNode.id} data={selectedNode.data} />
              )}
              {selectedNode?.data.type === 'resource' && (
                <ResourceProperties nodeId={selectedNode.id} data={selectedNode.data} />
              )}
              {selectedNode?.data.type === 'vpc-container' && (
                <VpcProperties nodeId={selectedNode.id} data={selectedNode.data} />
              )}
              {selectedNode?.data.type === 'subnet-container' && (
                <SubnetContainerProperties nodeId={selectedNode.id} data={selectedNode.data} />
              )}
              {selectedNode?.data.type === 'cloud-resource' && (
                <CloudResourceProperties nodeId={selectedNode.id} data={selectedNode.data} />
              )}
            </div>

            {/* Footer — Delete button */}
            <div className="px-3 py-2.5 border-t border-line/15">
              <Button
                variant="danger"
                className="w-full"
                onClick={() => {
                  if (selectedNodeId) {
                    removeNode(selectedNodeId)
                    setSelectedNodeId(null)
                  }
                }}
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                }
              >
                Delete Node
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
