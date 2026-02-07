import { create } from 'zustand'
import { parseCidr, type CidrResult } from '@/lib/cidr'
import { allocateSubnets, getRemainingSpace, getAvailablePrefixes, type SubnetSplit } from '@/lib/subnet-math'
import { findSmallestContainingCidr } from '@/lib/subnet-math'
import { config } from '@/lib/config'

interface CalculatorState {
  // Unified input
  rawInput: string
  result: CidrResult | null

  // Splitter (uses rawInput as parent CIDR)
  splitPrefixes: number[]
  splitLabels: string[]
  splits: SubnetSplit[]
  remainingSpace: number
  availablePrefixes: number[]

  // Supernet
  supernetInputs: string
  supernetResult: string | null

  // Drawer state
  activeDrawer: 'none' | 'supernet' | 'reference'

  // Actions
  setRawInput: (input: string) => void
  addSplit: (prefix: number) => void
  removeSplit: (index: number) => void
  updateSplitLabel: (index: number, label: string) => void
  resetSplits: () => void
  setSupernetInputs: (inputs: string) => void
  setActiveDrawer: (drawer: 'none' | 'supernet' | 'reference') => void
  initFromHash: (cidr: string, splits?: number[], labels?: string[]) => void
}

function recalcSplits(parentCidr: string, prefixes: number[], labels: string[]) {
  const splits = allocateSubnets(parentCidr, prefixes, labels)
  const remaining = splits ? getRemainingSpace(parentCidr, splits) : 0
  const available = getAvailablePrefixes(parentCidr, splits ?? [])
  return { splits: splits ?? [], remainingSpace: remaining, availablePrefixes: available }
}

const initialSplitCalc = recalcSplits(config.defaultCidr, [], [])

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  rawInput: config.defaultCidr,
  result: parseCidr(config.defaultCidr),
  splitPrefixes: [],
  splitLabels: [],
  splits: initialSplitCalc.splits,
  remainingSpace: initialSplitCalc.remainingSpace,
  availablePrefixes: initialSplitCalc.availablePrefixes,
  supernetInputs: '',
  supernetResult: null,
  activeDrawer: 'none',

  setRawInput: (input) => {
    const result = parseCidr(input)
    const { splitPrefixes, splitLabels } = get()

    // If there are existing splits and the CIDR changed, try to recalculate
    if (splitPrefixes.length > 0 && result) {
      const calc = recalcSplits(input, splitPrefixes, splitLabels)
      // If splits are compatible with new CIDR, keep them
      if (calc.splits.length === splitPrefixes.length) {
        set({ rawInput: input, result, ...calc })
        return
      }
      // Incompatible — clear splits
      const freshCalc = recalcSplits(input, [], [])
      set({ rawInput: input, result, splitPrefixes: [], splitLabels: [], ...freshCalc })
      return
    }

    // No splits or invalid input — just update rawInput + result + available prefixes
    if (result) {
      const calc = recalcSplits(input, [], [])
      set({ rawInput: input, result, ...calc })
    } else {
      set({ rawInput: input, result })
    }
  },

  addSplit: (prefix) => {
    const { rawInput, splitPrefixes, splitLabels } = get()
    const newPrefixes = [...splitPrefixes, prefix]
    const newLabels = [...splitLabels, `Subnet ${newPrefixes.length}`]
    const calc = recalcSplits(rawInput, newPrefixes, newLabels)
    set({ splitPrefixes: newPrefixes, splitLabels: newLabels, ...calc })
  },

  removeSplit: (index) => {
    const { rawInput, splitPrefixes, splitLabels } = get()
    const newPrefixes = splitPrefixes.filter((_, i) => i !== index)
    const newLabels = splitLabels.filter((_, i) => i !== index)
    const calc = recalcSplits(rawInput, newPrefixes, newLabels)
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
    const { rawInput } = get()
    const calc = recalcSplits(rawInput, [], [])
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

  setActiveDrawer: (drawer) => set({ activeDrawer: drawer }),

  initFromHash: (cidr, splits, labels) => {
    const result = parseCidr(cidr)
    const state: Partial<CalculatorState> = {
      rawInput: cidr,
      result,
    }
    if (splits && splits.length > 0) {
      state.splitPrefixes = splits
      state.splitLabels = labels ?? splits.map((_, i) => `Subnet ${i + 1}`)
      const calc = recalcSplits(cidr, splits, state.splitLabels!)
      Object.assign(state, calc)
    } else if (result) {
      const calc = recalcSplits(cidr, [], [])
      Object.assign(state, calc)
    }
    set(state)
  },
}))
