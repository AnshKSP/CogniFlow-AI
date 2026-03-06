import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useState } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
}

export default function TiltCard({ children, className = '' }: TiltCardProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  return (
    <motion.div
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = (event.clientY - rect.top - rect.height / 2) / 16
        const y = (event.clientX - rect.left - rect.width / 2) / 16
        setRotate({ x: -x, y })
      }}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      whileHover={{ scale: 1.012 }}
      transition={{ type: 'spring', stiffness: 180, damping: 16 }}
      style={{ transformStyle: 'preserve-3d' }}
      className={`rounded-2xl border border-sky-300/45 bg-gradient-to-br from-white/88 via-sky-100/80 to-rose-100/70 shadow-xl shadow-sky-200/40 backdrop-blur-sm ${className}`}
    >
      {children}
    </motion.div>
  )
}
