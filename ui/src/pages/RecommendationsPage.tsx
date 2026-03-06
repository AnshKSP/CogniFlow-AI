import { useState } from 'react'
import type { RecommendationFilters } from '../services/api'
import { recommendMoviesByFilters } from '../services/api'
import AnimatedButton from '../ui/AnimatedButton'
import GlowBadge from '../ui/GlowBadge'
import PageWrapper from '../ui/PageWrapper'
import MovieRecommendationSection from '../components/MovieRecommendationSection'

const genres = [
  { label: 'Action', value: 'action' },
  { label: 'Drama', value: 'drama' },
  { label: 'Comedy', value: 'comedy' },
  { label: 'Thriller', value: 'thriller' },
  { label: 'Romance', value: 'romance' },
  { label: 'Sci-Fi', value: 'sci-fi' },
  { label: 'Horror', value: 'horror' },
  { label: 'Animation', value: 'animation' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Crime', value: 'crime' },
  { label: 'Biography', value: 'biography' },
  { label: 'Family', value: 'family' },
  { label: 'Adventure', value: 'adventure' }
]
const moods = ['energetic', 'intense', 'dark', 'calm', 'dramatic', 'uplifting', 'light', 'inspiring', 'emotional', 'suspenseful']
const intensities = ['low', 'medium', 'high']
const energies = ['low', 'medium', 'high']
const industries = [
  { label: 'Any', value: '' },
  { label: 'Hollywood', value: 'hollywood' },
  { label: 'Bollywood', value: 'bollywood' },
  { label: 'International', value: 'international' }
]

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

  const runRecommend = async () => {
    setLoading(true)
    setError('')
    try {
      const results = await recommendMoviesByFilters(filters)
      setRecommendations(results)
    } catch (err: unknown) {
      setError('Failed to fetch recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const activeMood = filters.mood || 'calm'

  return (
    <PageWrapper theme="ocean">
      <div className="rounded-2xl border border-indigo-300/45 bg-gradient-to-br from-white/90 via-indigo-100/75 to-sky-100/70 p-5 shadow-[0_18px_52px_-26px_rgba(99,102,241,0.45)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Movie Recommendation Engine</h2>
            <p className="text-sm text-slate-600">This section calls backend `/recommend` using your movie DB.</p>
          </div>
          <GlowBadge label={filters.mood || 'mood not selected'} mood={activeMood} />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select
            value={filters.dominant_genre || ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, dominant_genre: event.target.value }))}
            className="rounded-lg border border-slate-300/70 bg-white/80 px-3 py-2 text-sm text-slate-800"
          >
            <option value="">Genre</option>
            {genres.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={filters.mood || ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, mood: event.target.value }))}
            className="rounded-lg border border-slate-300/70 bg-white/80 px-3 py-2 text-sm text-slate-800"
          >
            <option value="">Mood</option>
            {moods.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={filters.intensity || ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, intensity: event.target.value }))}
            className="rounded-lg border border-slate-300/70 bg-white/80 px-3 py-2 text-sm text-slate-800"
          >
            <option value="">Intensity</option>
            {intensities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={filters.energy_level || ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, energy_level: event.target.value }))}
            className="rounded-lg border border-slate-300/70 bg-white/80 px-3 py-2 text-sm text-slate-800"
          >
            <option value="">Energy</option>
            {energies.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={filters.industry_preference || ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, industry_preference: event.target.value }))}
            className="rounded-lg border border-slate-300/70 bg-white/80 px-3 py-2 text-sm text-slate-800"
          >
            <option value="">Industry</option>
            {industries.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <AnimatedButton onClick={() => void runRecommend()} disabled={loading}>
            {loading ? 'Finding Movies...' : 'Get Recommendations'}
          </AnimatedButton>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      <MovieRecommendationSection recommendations={recommendations} mood={activeMood} />
    </PageWrapper>
  )
}
