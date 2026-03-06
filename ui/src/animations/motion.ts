export const fadeUp = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const pageTransition = {
  initial: { opacity: 0, y: 14, scale: 0.995 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12, scale: 0.995 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }
}

export const softPulse = {
  animate: {
    scale: [1, 1.02, 1],
    opacity: [0.85, 1, 0.85]
  },
  transition: {
    duration: 2.8,
    repeat: Infinity,
    ease: 'easeInOut' as const
  }
}
