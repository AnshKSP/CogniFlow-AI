import { motion } from 'framer-motion'
import type { MovieRecommendation } from '../services/api'
import TiltCard from '../ui/TiltCard'
import { getMoodStyle } from '../ui/mood'

interface MovieRecommendationCardProps {
  movie: MovieRecommendation
  mood: string
}

export default function MovieRecommendationCard({ movie, mood }: MovieRecommendationCardProps) {
  const style = getMoodStyle(mood)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <TiltCard className={`h-full overflow-hidden ring-1 ${style.ring} ${style.glow}`}>
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} className="h-48 w-full object-cover" />
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-sky-100/80 to-indigo-100/80" />
        )}
        <div className="space-y-2 p-4">
          <h4 className="line-clamp-1 text-base font-semibold text-slate-800">{movie.title}</h4>
          <p className="text-xs text-slate-600">{[movie.year, movie.genre].filter(Boolean).join(' | ') || 'Recommended pick'}</p>
          <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">
            {movie.description || 'No description provided by the backend response.'}
          </p>
        </div>
      </TiltCard>
    </motion.div>
  )
}
