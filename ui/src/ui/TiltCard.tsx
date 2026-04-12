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
      className={`rounded-[1.8rem] border border-[#ddd7cb] bg-[linear-gradient(180deg,#fbf8f1_0%,#f3efe6_100%)] shadow-[0_18px_40px_-30px_rgba(82,94,104,0.3)] ${className}`}
    >
      {children}
    </motion.div>
  )
}
