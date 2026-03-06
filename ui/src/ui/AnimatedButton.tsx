import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode
}

export default function AnimatedButton({ children, className = '', ...props }: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.035, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 270, damping: 18 }}
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-xl shadow-fuchsia-300/35 transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_15%,rgba(255,255,255,0.55)_48%,transparent_82%)] opacity-0 transition duration-500 group-hover:translate-x-1 group-hover:opacity-100" />
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  )
}
