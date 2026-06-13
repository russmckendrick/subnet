import { create } from 'zustand'
import { parseCidr, type CidrResult } from '@/lib/cidr'
import { allocateSubnets, buildSplitsFromCidrs, getRemainingSpace, getAvailablePrefixes, type SubnetSplit } from '@/lib/subnet-math'
import { findSmallestContainingCidr } from '@/lib/subnet-math'
import { config } from '@/lib/config'

interface CalculatorState {
  // Unified input
  rawInput: string
  result: CidrResult | null

  // Input mode
  inputMode: 'guided' | 'cidr'

  // Splitter (uses rawInput as parent CIDR)
  splitPrefixes: number[]
  splitLabels: string[]
  splits: SubnetSplit[]
  remainingSpace: number
  availablePrefixes: number[]
  /**
   * When set, the splitter is in "explicit" mode: subnets keep these exact CIDRs
   * (from the designer handoff) instead of being re-packed contiguously from the base.
   * Cleared (null) by any action that changes the subnet set — add/remove/reset/CIDR edit.
   */
  explicitCidrs: string[] | null

  // Supernet
  supernetInputs: string
  supernetResult: string | null

  // Drawer state
  activeDrawer: 'none' | 'supernet' | 'reference'

  // Command palette
  commandPaletteOpen: boolean

  // Export modal
  exportModalOpen: boolean

  // Supernet → calculator handoff (shows an undo notice in the input)
  handoff: { previous: string; next: string } | null

  // Actions
  setRawInput: (input: string) => void
  loadSupernetResult: (cidr: string) => void
  restoreHandoff: () => void
  dismissHandoff: () => void
  setInputMode: (mode: 'guided' | 'cidr') => void
  addSplit: (prefix: number) => void
  removeSplit: (index: number) => void
  updateSplitLabel: (index: number, label: string) => void
  updateSplitColor: (index: number, color: string) => void
  resetSplits: () => void
  setSupernetInputs: (inputs: string) => void
  setActiveDrawer: (drawer: 'none' | 'supernet' | 'reference') => void
  setCommandPaletteOpen: (open: boolean) => void
  setExportModalOpen: (open: boolean) => void
  initFromUrl: (cidr: string, splits?: number[], labels?: string[], cidrs?: string[]) => void
}

function recalcSplits(parentCidr: string, prefixes: number[], labels: string[]) {
  // Sort largest-first (ascending prefix = larger subnet) for optimal VLSM packing
  const indices = prefixes.map((_, i) => i)
  indices.sort((a, b) => prefixes[a] - prefixes[b])
  const sortedPrefixes = indices.map((i) => prefixes[i])
  const sortedLabels = indices.map((i) => labels[i])

  const splits = allocateSubnets(parentCidr, sortedPrefixes, sortedLabels)
  const remaining = splits ? getRemainingSpace(parentCidr, splits) : 0
  const available = getAvailablePrefixes(parentCidr, splits ?? [])
  return { splitPrefixes: sortedPrefixes, splitLabels: sortedLabels, splits: splits ?? [], remainingSpace: remaining, availablePrefixes: available, explicitCidrs: null as string[] | null }
}

/**
 * Build splitter state from explicit subnet CIDRs (the designer handoff), preserving
 * each subnet's exact address. Falls back to VLSM packing if any CIDR fails to parse.
 */
function recalcSplitsExplicit(parentCidr: string, cidrs: string[], labels: string[]) {
  const splits = buildSplitsFromCidrs(cidrs, labels)
  if (!splits) return recalcSplits(parentCidr, cidrs.map((c) => Number(c.slice(c.lastIndexOf('/') + 1))), labels)

  const remaining = getRemainingSpace(parentCidr, splits)
  const available = getAvailablePrefixes(parentCidr, splits)
  return {
    splitPrefixes: splits.map((s) => s.prefixLength),
    splitLabels: splits.map((s) => s.label),
    splits,
    remainingSpace: remaining,
    availablePrefixes: available,
    explicitCidrs: splits.map((s) => s.cidr),
  }
}

const initialSplitCalc = recalcSplits(config.defaultCidr, [], [])

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  rawInput: config.defaultCidr,
  result: parseCidr(config.defaultCidr),
  inputMode: config.defaultInputMode,
  splitPrefixes: [],
  splitLabels: [],
  splits: initialSplitCalc.splits,
  remainingSpace: initialSplitCalc.remainingSpace,
  availablePrefixes: initialSplitCalc.availablePrefixes,
  explicitCidrs: initialSplitCalc.explicitCidrs,
  supernetInputs: '',
  supernetResult: null,
  activeDrawer: 'none',
  commandPaletteOpen: false,
  exportModalOpen: false,
  handoff: null,

  setRawInput: (input) => {
    const result = parseCidr(input)
    const { splitPrefixes, splitLabels, handoff } = get()

    // Manual edits clear any pending supernet-handoff notice
    if (handoff && input !== handoff.next) {
      set({ handoff: null })
    }

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
      set({ rawInput: input, result, ...freshCalc })
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

  setInputMode: (mode) => set({ inputMode: mode }),

  addSplit: (prefix) => {
    const { rawInput, splitPrefixes, splitLabels } = get()
    const newPrefixes = [...splitPrefixes, prefix]
    const newLabels = [...splitLabels, `Subnet ${newPrefixes.length}`]
    const calc = recalcSplits(rawInput, newPrefixes, newLabels)
    set(calc)
  },

  removeSplit: (index) => {
    const { rawInput, splitPrefixes, splitLabels } = get()
    const newPrefixes = splitPrefixes.filter((_, i) => i !== index)
    const newLabels = splitLabels.filter((_, i) => i !== index)
    const calc = recalcSplits(rawInput, newPrefixes, newLabels)
    set(calc)
  },

  updateSplitLabel: (index, label) => {
    const { splitLabels, splits } = get()
    const newLabels = [...splitLabels]
    newLabels[index] = label
    const newSplits = splits.map((s, i) => (i === index ? { ...s, label } : s))
    set({ splitLabels: newLabels, splits: newSplits })
  },

  updateSplitColor: (index, color) => {
    const { splits } = get()
    const newSplits = splits.map((s, i) => (i === index ? { ...s, color } : s))
    set({ splits: newSplits })
  },

  resetSplits: () => {
    const { rawInput } = get()
    const calc = recalcSplits(rawInput, [], [])
    set(calc)
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
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setExportModalOpen: (open) => set({ exportModalOpen: open }),

  loadSupernetResult: (cidr) => {
    const { rawInput } = get()
    get().setRawInput(cidr)
    // Record after setRawInput so its handoff-clearing logic doesn't wipe this
    set({ handoff: { previous: rawInput, next: cidr } })
  },

  restoreHandoff: () => {
    const { handoff } = get()
    if (!handoff) return
    set({ handoff: null })
    get().setRawInput(handoff.previous)
  },

  dismissHandoff: () => set({ handoff: null }),

  initFromUrl: (cidr, splits, labels, cidrs) => {
    const result = parseCidr(cidr)
    const state: Partial<CalculatorState> = {
      rawInput: cidr,
      result,
    }
    if (cidrs && cidrs.length > 0) {
      // Explicit CIDRs (designer handoff) — preserve exact subnet addresses.
      const splitLabels = labels ?? cidrs.map((_, i) => `Subnet ${i + 1}`)
      const calc = recalcSplitsExplicit(cidr, cidrs, splitLabels)
      Object.assign(state, calc)
    } else if (splits && splits.length > 0) {
      const splitLabels = labels ?? splits.map((_, i) => `Subnet ${i + 1}`)
      const calc = recalcSplits(cidr, splits, splitLabels)
      Object.assign(state, calc)
    } else if (result) {
      const calc = recalcSplits(cidr, [], [])
      Object.assign(state, calc)
    }
    set(state)
  },
}))
