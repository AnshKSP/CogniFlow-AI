import { motion } from 'framer-motion'
import { Clapperboard, RefreshCw, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { RecommendationFilters } from '../services/api'
import { recommendMoviesByFilters } from '../services/api'
import AnimatedButton from '../ui/AnimatedButton'
import PageWrapper from '../ui/PageWrapper'
import MovieRecommendationSection from '../components/MovieRecommendationSection'

const genres = [
  { label: 'Action', value: 'action' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Animation', value: 'animation' },
  { label: 'Biography', value: 'biography' },
  { label: 'Drama', value: 'drama' },
  { label: 'Comedy', value: 'comedy' },
  { label: 'Crime', value: 'crime' },
  { label: 'Documentary', value: 'documentary' },
  { label: 'Family', value: 'family' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'History', value: 'history' },
  { label: 'Horror', value: 'horror' },
  { label: 'Music', value: 'music' },
  { label: 'Mystery', value: 'mystery' },
  { label: 'Thriller', value: 'thriller' },
  { label: 'Romance', value: 'romance' },
  { label: 'Sci-Fi', value: 'sci-fi' },
  { label: 'Sport', value: 'sport' },
  { label: 'War', value: 'war' }
]

const moods = ['energetic', 'intense', 'dark', 'calm', 'dramatic', 'uplifting', 'light', 'inspiring', 'emotional', 'suspenseful']
const intensities = ['low', 'medium', 'high']
const energies = ['low', 'medium', 'high']
const industries = [
  { label: 'Any', value: '' },
  { label: 'Hollywood', value: 'hollywood' },
  { label: 'Bollywood', value: 'bollywood' },
  { label: 'South Indian', value: 'south indian' },
  { label: 'International', value: 'international' }
]

const selectClassName =
  'w-full rounded-[1.1rem] border border-[#d7d0c4] bg-[#fcf8f1] px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#b8c6d2] focus:ring-2 focus:ring-[#d6e0e7]'

export default function RecommendationsPage() {
  const [filters, setFilters] = useState<RecommendationFilters>({
    dominant_genre: '',
    mood: '',
    intensity: '',
    energy_level: '',
    industry_preference: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recommendations, setRecommendations] = useState<Awaited<ReturnType<typeof recommendMoviesByFilters>>>([])

  const activeMood = filters.mood || 'calm'
  const activeFilters = useMemo(
    () =>
      [
        filters.dominant_genre ? `Genre: ${filters.dominant_genre}` : null,
        filters.mood ? `Mood: ${filters.mood}` : null,
        filters.intensity ? `Intensity: ${filters.intensity}` : null,
        filters.energy_level ? `Energy: ${filters.energy_level}` : null,
        filters.industry_preference ? `Industry: ${filters.industry_preference}` : null
      ].filter(Boolean) as string[],
    [filters]
  )

  const runRecommend = async () => {
    setLoading(true)
    setError('')
    try {
      const results = await recommendMoviesByFilters(filters)
      setRecommendations(results)
    } catch {
      setError('Failed to fetch recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      dominant_genre: '',
      mood: '',
      intensity: '',
      energy_level: '',
      industry_preference: ''
    })
    setRecommendations([])
    setError('')
  }

  return (
    <PageWrapper theme="ocean">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[2.2rem] border border-[#d7d0c4] bg-[linear-gradient(135deg,#eef3f6_0%,#e4ebf0_42%,#f6f2ea_100%)] p-5 shadow-[0_26px_60px_-42px_rgba(82,94,104,0.28)] sm:p-7"
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ced6de] bg-[#f7f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              <Clapperboard className="h-3.5 w-3.5" />
              Recommendation atlas
            </div>
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-semibold leading-tight text-slate-800 sm:text-[2.5rem]">
                A calmer film discovery flow with richer context, posters, and watch details.
              </h2>
              <p className="text-sm leading-7 text-slate-600 sm:text-base">
                Browse recommendations through emotional tone, energy, and genre. Each result now carries poster art,
                release timing, runtime, cast context, and where to look for the title.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.6rem] border border-[#d6dfe6] bg-[#f9f7f1] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Library size</p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">569</p>
              <p className="mt-1 text-sm text-slate-600">Expanded library across Hollywood, Bollywood, South Indian, and international films.</p>
            </div>
            <div className="rounded-[1.6rem] border border-[#ded5c7] bg-[#f9f5ec] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Current tone</p>
              <p className="mt-2 text-2xl font-semibold capitalize text-slate-800">{activeMood}</p>
              <p className="mt-1 text-sm text-slate-600">Use mood as the lead signal or mix with genre and intensity.</p>
            </div>
            <div className="rounded-[1.6rem] border border-[#d2ddd7] bg-[#f4f6ef] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Metadata</p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">Poster + watch info</p>
              <p className="mt-1 text-sm text-slate-600">Release date, runtime, cast, and availability notes included.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-[#d8d1c5] bg-[linear-gradient(180deg,#faf6ef_0%,#f1ece2_100%)] p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.26)]"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Filter stack</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-800">Shape the recommendation lane</h3>
            </div>
            <motion.button
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d0c4] bg-[#f8f3ea] px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </motion.button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Genre</label>
              <select
                value={filters.dominant_genre || ''}
                onChange={(event) => setFilters((prev) => ({ ...prev, dominant_genre: event.target.value }))}
                className={selectClassName}
              >
                <option value="">Any genre</option>
                {genres.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Mood</label>
              <div className="flex flex-wrap gap-2">
                {moods.map((item) => (
                  <motion.button
                    key={item}
                    whileHover={{ y: -1.5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilters((prev) => ({ ...prev, mood: prev.mood === item ? '' : item }))}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${
                      filters.mood === item
                        ? 'border-[#b9c7d4] bg-[#e9eff4] text-slate-800'
                        : 'border-[#ddd6ca] bg-[#f9f4ea] text-slate-600'
                    }`}
                  >
                    {item}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Intensity</label>
                <select
                  value={filters.intensity || ''}
                  onChange={(event) => setFilters((prev) => ({ ...prev, intensity: event.target.value }))}
                  className={selectClassName}
                >
                  <option value="">Any intensity</option>
                  {intensities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Energy</label>
                <select
                  value={filters.energy_level || ''}
                  onChange={(event) => setFilters((prev) => ({ ...prev, energy_level: event.target.value }))}
                  className={selectClassName}
                >
                  <option value="">Any energy</option>
                  {energies.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Industry</label>
              <select
                value={filters.industry_preference || ''}
                onChange={(event) => setFilters((prev) => ({ ...prev, industry_preference: event.target.value }))}
                className={selectClassName}
              >
                {industries.map((item) => (
                  <option key={item.label} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <AnimatedButton onClick={() => void runRecommend()} disabled={loading}>
              {loading ? 'Curating titles...' : 'Get Recommendations'}
            </AnimatedButton>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        </motion.aside>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-5"
        >
          <div className="rounded-[2rem] border border-[#d9d2c6] bg-[linear-gradient(180deg,#fbf8f1_0%,#f3eee6_100%)] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#8f6a55]" />
              <span className="text-sm font-medium text-slate-700">Active filters</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeFilters.length > 0 ? (
                activeFilters.map((item) => (
                  <span key={item} className="rounded-full border border-[#d4dce4] bg-[#edf1f4] px-3 py-1.5 text-xs font-medium text-slate-700">
                    {item}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-[#ddd6ca] bg-[#f8f3ea] px-3 py-1.5 text-xs font-medium text-slate-600">
                  No filters selected. Showing mood-flexible results after search.
                </span>
              )}
            </div>
          </div>

          <MovieRecommendationSection recommendations={recommendations} mood={activeMood} />
        </motion.section>
      </div>
    </PageWrapper>
  )
}
