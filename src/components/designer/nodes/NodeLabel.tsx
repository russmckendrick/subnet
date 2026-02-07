import { useState, useRef, useEffect } from 'react'
import { useDesignerStore } from '@/store/designer-store'

interface NodeLabelProps {
  nodeId: string
  label: string
  className?: string
}

export function NodeLabel({ nodeId, label, className = '' }: NodeLabelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)
  const updateNodeLabel = useDesignerStore((s) => s.updateNodeLabel)

  useEffect(() => {
    setValue(label)
  }, [label])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const commit = () => {
    const trimmed = value.trim()
    if (trimmed && trimmed !== label) {
      updateNodeLabel(nodeId, trimmed)
    } else {
      setValue(label)
    }
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') {
            setValue(label)
            setIsEditing(false)
          }
        }}
        className={`bg-transparent border-b border-[#2aa198]/40 focus:outline-none text-center w-full ${className}`}
        spellCheck={false}
      />
    )
  }

  return (
    <span
      onDoubleClick={() => setIsEditing(true)}
      className={`cursor-default select-none truncate block ${className}`}
      title="Double-click to edit"
    >
      {label}
    </span>
  )
}
