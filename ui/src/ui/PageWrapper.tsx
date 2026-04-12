import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { pageTransition } from '../animations/motion'
import PrismaticScene from './PrismaticScene'

interface PageWrapperProps {
  children: ReactNode
  theme?: 'ocean' | 'sunset' | 'neon' | 'forest' | 'cosmic' | 'candy' | 'aurora'
}

export default function PageWrapper({ children, theme = 'ocean' }: PageWrapperProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        const nextX = x * 2 - 1
        const nextY = y * 2 - 1
        if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
        frameRef.current = window.requestAnimationFrame(() => {
          setMouse((prev) => {
            if (Math.abs(prev.x - nextX) < 0.02 && Math.abs(prev.y - nextY) < 0.02) return prev
            return { x: nextX, y: nextY }
          })
        })
      }}
      className="relative overflow-hidden rounded-[2.4rem] border border-[#ded7cc] bg-[linear-gradient(180deg,rgba(251,248,241,0.92)_0%,rgba(244,239,230,0.92)_100%)] px-4 py-5 shadow-[0_24px_60px_-42px_rgba(82,94,104,0.34)] sm:px-5 sm:py-6 lg:px-6"
    >
      <PrismaticScene theme={theme} mouseX={mouse.x} mouseY={mouse.y} />
      <div className="pointer-events-none absolute inset-0 rounded-[2.4rem] border border-white/40" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,#c7ccd1,transparent)]" />
      <div className="relative z-10 space-y-6">{children}</div>
    </motion.div>
  )
}
