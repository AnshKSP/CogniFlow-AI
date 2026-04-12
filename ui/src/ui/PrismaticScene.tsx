import { motion } from 'framer-motion'

type SceneTheme = 'ocean' | 'sunset' | 'neon' | 'forest' | 'cosmic' | 'candy' | 'aurora'

interface PrismaticSceneProps {
  theme: SceneTheme
  mouseX: number
  mouseY: number
}

const themeGradients: Record<SceneTheme, string[]> = {
  ocean: ['from-[#d9e4ee]/85 to-[#c7d5e1]/70', 'from-[#e6edf2]/82 to-[#d1dbe4]/72', 'from-[#d5e0ea]/78 to-[#c0cedc]/68'],
  sunset: ['from-[#dbe7df]/85 to-[#c6d7cf]/72', 'from-[#e7efe8]/82 to-[#cfded4]/70', 'from-[#d4e2d9]/78 to-[#bfcdc4]/68'],
  neon: ['from-[#edd6d1]/85 to-[#e2c2bc]/72', 'from-[#f3e3df]/82 to-[#e7ccc5]/70', 'from-[#ead5cf]/78 to-[#dcb9b2]/68'],
  forest: ['from-[#d9e1d3]/85 to-[#c5d0bf]/72', 'from-[#e8ede3]/82 to-[#d3dbc9]/70', 'from-[#d6ddd0]/78 to-[#c0cbb9]/68'],
  cosmic: ['from-[#d8e0e8]/85 to-[#becad8]/72', 'from-[#e4e9ef]/82 to-[#ccd6e1]/70', 'from-[#d4dce4]/78 to-[#bfc9d3]/68'],
  candy: ['from-[#efe2d0]/85 to-[#e4ceb3]/72', 'from-[#f6ecdf]/82 to-[#ead9c4]/70', 'from-[#ecdcc9]/78 to-[#e1c9ad]/68'],
  aurora: ['from-[#e2e1ef]/85 to-[#cbc8e1]/72', 'from-[#ecebf5]/82 to-[#d7d4e8]/70', 'from-[#dfdeec]/78 to-[#c6c4db]/68']
}

const blobs = [
  { left: '6%', top: '8%', size: 146, duration: 9, delay: 0 },
  { left: '20%', top: '18%', size: 94, duration: 7.5, delay: 0.3 },
  { left: '72%', top: '12%', size: 172, duration: 10.4, delay: 0.6 },
  { left: '84%', top: '33%', size: 112, duration: 8.2, delay: 0.2 },
  { left: '10%', top: '54%', size: 132, duration: 11, delay: 0.8 },
  { left: '34%', top: '66%', size: 96, duration: 7.2, delay: 0.4 },
  { left: '58%', top: '58%', size: 148, duration: 10, delay: 0.1 },
  { left: '78%', top: '74%', size: 82, duration: 6.6, delay: 0.7 },
  { left: '45%', top: '12%', size: 70, duration: 6.2, delay: 0.35 },
  { left: '62%', top: '30%', size: 88, duration: 7.9, delay: 0.18 },
  { left: '24%', top: '76%', size: 74, duration: 6.8, delay: 0.55 }
]

export default function PrismaticScene({ theme, mouseX, mouseY }: PrismaticSceneProps) {
  const gradients = themeGradients[theme]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.72),transparent_42%),radial-gradient(circle_at_88%_20%,rgba(255,255,255,0.36),transparent_34%)]" />
      {blobs.map((blob, index) => (
        <motion.div
          key={`${blob.left}-${blob.top}-${index}`}
          className={`absolute rounded-[2rem] border border-white/50 bg-gradient-to-br ${gradients[index % gradients.length]}`}
          style={{
            left: blob.left,
            top: blob.top,
            width: blob.size,
            height: blob.size,
            transform: `perspective(900px) rotateX(${8 + mouseY * 6}deg) rotateY(${-12 + mouseX * 8}deg)`
          }}
          animate={{
            y: [0, -14, 0],
            rotate: [-8, 10, -8],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: blob.duration,
            delay: blob.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
      <motion.div
        className="absolute left-[12%] top-[16%] h-36 w-36 rounded-full border border-white/60"
        animate={{ rotate: [0, 360], scale: [1, 1.08, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute right-[14%] top-[52%] h-44 w-44 rounded-full border border-white/50"
        animate={{ rotate: [360, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'linear' }}
      />
      {Array.from({ length: 12 }).map((_, index) => (
        <motion.span
          key={`twinkle-${index}`}
          className="absolute h-1.5 w-1.5 rounded-full bg-white/75"
          style={{ left: `${6 + index * 7.5}%`, top: `${14 + ((index * 11) % 74)}%` }}
          animate={{ y: [0, -8, 0], opacity: [0.15, 1, 0.15], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 3.4 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <motion.div
        className="absolute -bottom-[4.5rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/35 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.36, 0.18] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_35%,rgba(255,255,255,0.08)_70%,transparent)]" />
    </div>
  )
}
