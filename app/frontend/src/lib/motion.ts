import type { Variants } from 'motion/react'

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

export const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

export const itemCard: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
}