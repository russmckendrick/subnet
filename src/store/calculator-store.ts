import { create } from 'zustand'
import { parseCidr, type CidrResult } from '@/lib/cidr'
import { allocateSubnets, getRemainingSpace, getAvailablePrefixes, type SubnetSplit } from '@/lib/subnet-math'
import { findSmallestContainingCidr } from '@/lib/subnet-math'

export type AppTab = 'calculator' | 'splitter' | 'supernet' | 'reference'

interface CalculatorState {
  // Active tab
  activeTab: AppTab

  // Calculator
  rawInput: string
  result: CidrResult | null

  // Splitter
  parentCidr: string
  splitPrefixes: number[]
  splitLabels: string[]
  splits: SubnetSplit[]
  remainingSpace: number
  availablePrefixes: number[]

  // Supernet
  supernetInputs: string
  supernetResult: string | null

  // Actions
  setActiveTab: (tab: AppTab) => void
  setRawInput: (input: string) => void
  setParentCidr: (cidr: string) => void
  addSplit: (prefix: number) => void
  removeSplit: (index: number) => void
  updateSplitLabel: (index: number, label: string) => void
  resetSplits: () => void
  setSupernetInputs: (inputs: string) => void
  initFromHash: (cidr: string, tab?: AppTab, splits?: number[], labels?: string[]) => void
}

function recalcSplits(parentCidr: string, prefixes: number[], labels: string[]) {
  const splits = allocateSubnets(parentCidr, prefixes, labels)
  const remaining = splits ? getRemainingSpace(parentCidr, splits) : 0
  const available = getAvailablePrefixes(parentCidr, splits ?? [])
  return { splits: splits ?? [], remainingSpace: remaining, availablePrefixes: available }
}

const initialSplitCalc = recalcSplits('10.0.0.0/16', [], [])

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  activeTab: 'calculator',
  rawInput: '10.0.0.0/16',
  result: parseCidr('10.0.0.0/16'),
  parentCidr: '10.0.0.0/16',
  splitPrefixes: [],
  splitLabels: [],
  splits: initialSplitCalc.splits,
  remainingSpace: initialSplitCalc.remainingSpace,
  availablePrefixes: initialSplitCalc.availablePrefixes,
  supernetInputs: '',
  supernetResult: null,

  setActiveTab: (tab) => {
    const { rawInput, splitPrefixes } = get()
    const update: Partial<CalculatorState> = { activeTab: tab }
    // Auto-sync Calculator CIDR into Splitter when switching to splitter with no allocations
    if (tab === 'splitter' && splitPrefixes.length === 0 && rawInput.trim()) {
      const result = parseCidr(rawInput)
      if (result) {
        const calc = recalcSplits(rawInput, [], [])
        Object.assign(update, { parentCidr: rawInput, splitPrefixes: [], splitLabels: [], ...calc })
      }
    }
    set(update)
  },

  setRawInput: (input) => {
    const result = parseCidr(input)
    set({ rawInput: input, result })
  },

  setParentCidr: (cidr) => {
    const result = parseCidr(cidr)
    if (result) {
      const calc = recalcSplits(cidr, [], [])
      set({
        parentCidr: cidr,
        splitPrefixes: [],
        splitLabels: [],
        ...calc,
      })
    }
    set({ parentCidr: cidr })
  },

  addSplit: (prefix) => {
    const { parentCidr, splitPrefixes, splitLabels } = get()
    const newPrefixes = [...splitPrefixes, prefix]
    const newLabels = [...splitLabels, `Subnet ${newPrefixes.length}`]
    const calc = recalcSplits(parentCidr, newPrefixes, newLabels)
    set({ splitPrefixes: newPrefixes, splitLabels: newLabels, ...calc })
  },

  removeSplit: (index) => {
    const { parentCidr, splitPrefixes, splitLabels } = get()
    const newPrefixes = splitPrefixes.filter((_, i) => i !== index)
    const newLabels = splitLabels.filter((_, i) => i !== index)
    const calc = recalcSplits(parentCidr, newPrefixes, newLabels)
    set({ splitPrefixes: newPrefixes, splitLabels: newLabels, ...calc })
  },

  updateSplitLabel: (index, label) => {
    const { splitLabels, splits } = get()
    const newLabels = [...splitLabels]
    newLabels[index] = label
    const newSplits = splits.map((s, i) => (i === index ? { ...s, label } : s))
    set({ splitLabels: newLabels, splits: newSplits })
  },

  resetSplits: () => {
    const { parentCidr } = get()
    const calc = recalcSplits(parentCidr, [], [])
    set({ splitPrefixes: [], splitLabels: [], ...calc })
  },

  setSupernetInputs: (inputs) => {
    const cidrs = inputs
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const supernetResult = cidrs.length >= 2 ? findSmallestContainingCidr(cidrs) : null
    set({ supernetInputs: inputs, supernetResult })
  },

  initFromHash: (cidr, tab, splits, labels) => {
    const result = parseCidr(cidr)
    const state: Partial<CalculatorState> = {
      rawInput: cidr,
      result,
      activeTab: tab ?? 'calculator',
    }
    if (tab === 'splitter' && splits) {
      state.parentCidr = cidr
      state.splitPrefixes = splits
      state.splitLabels = labels ?? splits.map((_, i) => `Subnet ${i + 1}`)
      const calc = recalcSplits(cidr, splits, state.splitLabels)
      Object.assign(state, calc)
    }
    set(state)
  },
}))
