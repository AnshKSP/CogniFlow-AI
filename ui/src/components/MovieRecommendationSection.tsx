import { motion } from 'framer-motion'
import type { MovieRecommendation } from '../services/api'
import MovieRecommendationCard from './MovieRecommendationCard'

interface MovieRecommendationSectionProps {
  recommendations: MovieRecommendation[]
  mood: string
}

export default function MovieRecommendationSection({ recommendations, mood }: MovieRecommendationSectionProps) {
  const [featured, ...rest] = recommendations

  return (
    <div className="rounded-[2rem] border border-[#d8d2c8] bg-[linear-gradient(180deg,#faf6ef_0%,#f3eee4_100%)] p-5 shadow-[0_24px_54px_-38px_rgba(82,94,104,0.28)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Recommendation stack</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-800">Film matches for the current emotional profile</h3>
          <p className="mt-1 text-sm text-slate-600">
            Curated results keyed to <span className="font-medium capitalize text-slate-700">{mood}</span> mood patterns.
          </p>
        </div>
        <div className="rounded-full border border-[#d7d0c4] bg-[#f8f3ea] px-3 py-1.5 text-xs font-medium text-slate-600">
          {recommendations.length} titles available
        </div>
      </div>
      {recommendations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="rounded-[1.6rem] border border-dashed border-[#c8d0d8] bg-[#f3efe7] p-6 text-center text-sm text-slate-600"
        >
          No recommendations returned for this analysis.
        </motion.div>
      ) : (
        <div className="space-y-5">
          {featured ? <MovieRecommendationCard movie={featured} mood={mood} featured /> : null}
          {rest.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {rest.map((movie, index) => (
                <MovieRecommendationCard key={`${movie.title}-${index + 1}`} movie={movie} mood={mood} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
