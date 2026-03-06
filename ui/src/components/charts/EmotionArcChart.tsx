import { motion } from 'framer-motion'
import type { EmotionArcPoint } from '../../services/api'

interface EmotionArcChartProps {
  arc: EmotionArcPoint[]
}

const valueFromMood = (mood: string | undefined) => {
  const key = (mood || 'neutral').toLowerCase()
  if (key === 'intense') return 92
  if (key === 'energetic') return 84
  if (key === 'dramatic') return 72
  if (key === 'dark') return 63
  if (key === 'calm') return 46
  return 55
}

export default function EmotionArcChart({ arc }: EmotionArcChartProps) {
  const coordinates = arc.map((entry, index) => {
    const x = arc.length === 1 ? 50 : (index / (arc.length - 1)) * 90 + 5
    const y = 100 - valueFromMood(entry.mood)
    return { x, y }
  })
  const pathD = coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  return (
    <div className="rounded-2xl border border-blue-300/45 bg-gradient-to-br from-white/90 via-blue-100/75 to-indigo-100/70 p-4 shadow-xl shadow-cyan-300/30">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">Emotional Arc</h3>
      {arc.length === 0 ? (
        <p className="text-xs text-slate-600">No emotional arc data yet.</p>
      ) : (
        <svg viewBox="0 0 100 100" className="h-48 w-full">
          <defs>
            <linearGradient id="arcStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <linearGradient id="arcFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(129, 140, 248, 0.33)" />
              <stop offset="100%" stopColor="rgba(129, 140, 248, 0.06)" />
            </linearGradient>
          </defs>
          <line x1="5" y1="78" x2="95" y2="78" stroke="rgba(148,163,184,0.35)" strokeWidth="0.4" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(148,163,184,0.25)" strokeWidth="0.4" />
          <line x1="5" y1="22" x2="95" y2="22" stroke="rgba(148,163,184,0.2)" strokeWidth="0.4" />

          {arc.length > 1 && (
            <>
              <path d={`${pathD} L 95 100 L 5 100 Z`} fill="url(#arcFill)" />
              <path d={pathD} fill="none" stroke="url(#arcStroke)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}

          {coordinates.map((point, index) => {
            return (
              <motion.circle
                key={`${point.x}-${point.y}-${index}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.04 }}
                cx={point.x}
                cy={point.y}
                r="2"
                fill="#a5b4fc"
              />
            )
          })}
        </svg>
      )}
    </div>
  )
}
