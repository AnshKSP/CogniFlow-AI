import { motion } from 'framer-motion'
import type { MovieRecommendation } from '../services/api'
import MovieRecommendationCard from './MovieRecommendationCard'

interface MovieRecommendationSectionProps {
  recommendations: MovieRecommendation[]
  mood: string
}

export default function MovieRecommendationSection({ recommendations, mood }: MovieRecommendationSectionProps) {
  return (
    <div className="rounded-2xl border border-indigo-300/45 bg-gradient-to-br from-white/90 via-indigo-100/75 to-sky-100/70 p-5 shadow-[0_16px_48px_-26px_rgba(99,102,241,0.42)]">
      <h3 className="mb-4 text-sm font-semibold text-slate-800">Movie Recommendations</h3>
      {recommendations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="rounded-xl border border-dashed border-slate-300/65 bg-white/55 p-6 text-center text-sm text-slate-600"
        >
          No recommendations returned for this analysis.
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((movie, index) => (
            <MovieRecommendationCard key={`${movie.title}-${index}`} movie={movie} mood={mood} />
          ))}
        </div>
      )}
    </div>
  )
}
