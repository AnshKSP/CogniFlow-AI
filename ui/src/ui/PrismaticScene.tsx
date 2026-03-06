import { motion } from 'framer-motion'

type SceneTheme = 'ocean' | 'sunset' | 'neon' | 'forest' | 'cosmic' | 'candy' | 'aurora'

interface PrismaticSceneProps {
  theme: SceneTheme
  mouseX: number
  mouseY: number
}

const themeGradients: Record<SceneTheme, string[]> = {
  ocean: ['from-cyan-200/65 to-blue-300/45', 'from-sky-200/60 to-indigo-200/45', 'from-blue-200/55 to-cyan-300/45'],
  sunset: ['from-orange-200/65 to-pink-300/45', 'from-amber-200/60 to-rose-300/45', 'from-rose-200/55 to-orange-300/45'],
  neon: ['from-fuchsia-200/65 to-violet-300/45', 'from-cyan-200/60 to-purple-300/45', 'from-indigo-200/60 to-fuchsia-300/45'],
  forest: ['from-emerald-200/65 to-teal-300/45', 'from-lime-200/60 to-emerald-300/45', 'from-green-200/55 to-cyan-300/45'],
  cosmic: ['from-violet-200/65 to-indigo-300/45', 'from-fuchsia-200/60 to-blue-300/45', 'from-cyan-200/55 to-violet-300/45'],
  candy: ['from-pink-200/65 to-cyan-300/45', 'from-rose-200/60 to-violet-300/45', 'from-fuchsia-200/55 to-blue-300/45'],
  aurora: ['from-cyan-200/65 to-emerald-300/45', 'from-purple-200/60 to-blue-300/45', 'from-teal-200/60 to-violet-300/45']
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.88),transparent_42%),radial-gradient(circle_at_88%_20%,rgba(255,255,255,0.55),transparent_34%)]" />
      {blobs.map((blob, index) => (
        <motion.div
          key={`${blob.left}-${blob.top}-${index}`}
          className={`absolute rounded-[2rem] border border-white/60 bg-gradient-to-br ${gradients[index % gradients.length]}`}
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
        className="absolute -bottom-[4.5rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-200/45 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.28),transparent_35%,rgba(255,255,255,0.18)_70%,transparent)]" />
    </div>
  )
}
