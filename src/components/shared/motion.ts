import type { Transition } from 'motion/react'

/** Shared easing curve used across all entrance/exit animations. */
export const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

/** Standard durations — pick one instead of inventing a new number. */
export const DUR = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
} as const

/** Simple opacity fade (backdrops, tab content swaps). */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DUR.fast },
}

/** Card entrance — rises from below. */
export const cardEntrance = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DUR.slow, delay, ease: EASE },
})

/** Modal/popover entrance — subtle scale pop. */
export const modalPop = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: DUR.fast },
}

/** Height collapse for expandable sections. */
export const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: DUR.base, ease: EASE },
}

/** Spring used by slide-in drawers. */
export const drawerSpring: Transition = { type: 'spring', damping: 30, stiffness: 300 }
