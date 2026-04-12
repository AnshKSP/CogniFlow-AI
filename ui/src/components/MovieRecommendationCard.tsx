import { motion } from 'framer-motion'
import type { MovieRecommendation } from '../services/api'
import { CalendarDays, Clock3, Film, Star } from 'lucide-react'
import TiltCard from '../ui/TiltCard'
import { getMoodStyle } from '../ui/mood'

interface MovieRecommendationCardProps {
  movie: MovieRecommendation
  mood: string
  featured?: boolean
}

export default function MovieRecommendationCard({ movie, mood, featured = false }: MovieRecommendationCardProps) {
  const style = getMoodStyle(mood)
  const releaseLabel = movie.release_date || movie.year?.toString()
  const watchPlatforms = movie.where_to_watch || []
  const metadata = [movie.genre, movie.language, movie.certificate].filter(Boolean).join(' | ') || 'Recommended pick'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <TiltCard className={`h-full overflow-hidden ring-1 ${style.ring} ${style.glow}`}>
        <div className={`grid h-full gap-0 ${featured ? 'xl:grid-cols-[300px_1fr]' : 'md:grid-cols-[180px_1fr]'}`}>
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              className={`${featured ? 'h-72 xl:h-full' : 'h-60 md:h-full'} w-full object-cover`}
            />
          ) : (
            <div
              className={`flex items-center justify-center bg-[linear-gradient(180deg,#e3e8ee_0%,#d8dfd4_100%)] ${
                featured ? 'h-72 xl:h-full' : 'h-60 md:h-full'
              }`}
            >
              <Film className="h-8 w-8 text-slate-500" />
            </div>
          )}
          <div className={`flex h-full flex-col ${featured ? 'gap-4 p-5 sm:p-6' : 'gap-3 p-4'}`}>
            <div className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {featured ? 'Featured recommendation' : 'Recommended pick'}
                  </p>
                  <h4 className={`${featured ? 'text-2xl sm:text-[1.75rem]' : 'text-lg'} line-clamp-2 font-semibold text-slate-800`}>
                    {movie.title}
                  </h4>
                </div>
                {movie.rating ? (
                  <div className="inline-flex items-center gap-1 rounded-full border border-[#d7cfbf] bg-[#f6f1e7] px-2.5 py-1 text-xs font-medium text-slate-700">
                    <Star className="h-3.5 w-3.5 fill-current text-[#c48a5a]" />
                    {movie.rating.toFixed(1)}
                  </div>
                ) : null}
              </div>
              <p className="text-xs text-slate-500">{metadata}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              {releaseLabel ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#ddd7cb] bg-[#f7f3eb] px-2.5 py-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {releaseLabel}
                </span>
              ) : null}
              {movie.runtime ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#ddd7cb] bg-[#f7f3eb] px-2.5 py-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {movie.runtime}
                </span>
              ) : null}
            </div>

            {movie.director ? (
              <p className="text-sm text-slate-700">
                Directed by <span className="font-medium">{movie.director}</span>
              </p>
            ) : null}

            {movie.cast && movie.cast.length > 0 ? (
              <p className="text-xs text-slate-500">Cast: {movie.cast.join(', ')}</p>
            ) : null}

            <p className="line-clamp-4 text-sm leading-relaxed text-slate-600">
              {movie.description || 'No description provided by the backend response.'}
            </p>

            {watchPlatforms.length > 0 ? (
              <div className="mt-auto space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Where to check</p>
                <div className="flex flex-wrap gap-2">
                  {watchPlatforms.map((platform) => (
                    <span
                      key={`${movie.title}-${platform}`}
                      className="rounded-full border border-[#cfd7de] bg-[#eef2f5] px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
                {movie.availability_note ? <p className="text-[11px] text-slate-500">{movie.availability_note}</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      </TiltCard>
    </motion.div>
  )
}
