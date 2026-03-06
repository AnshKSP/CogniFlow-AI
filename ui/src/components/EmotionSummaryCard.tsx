import type { EmotionAnalysisResult } from '../services/api'
import GlowBadge from '../ui/GlowBadge'
import TiltCard from '../ui/TiltCard'

interface EmotionSummaryCardProps {
  result: EmotionAnalysisResult
}

export default function EmotionSummaryCard({ result }: EmotionSummaryCardProps) {
  const topEmotions = (result.top_emotions || []).slice(0, 3)
  const dominanceGap = typeof result.dominance_gap === 'number' ? result.dominance_gap : 0

  return (
    <TiltCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Emotion Summary</h3>
        <GlowBadge label={result.dominant_mood} mood={result.dominant_mood} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/60 bg-white/65 p-3">
          <p className="text-xs text-slate-500">Dominant Mood</p>
          <p className="mt-1 text-lg font-semibold capitalize text-slate-800">{result.dominant_mood}</p>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/65 p-3">
          <p className="text-xs text-slate-500">Intensity</p>
          <p className="mt-1 text-lg font-semibold capitalize text-slate-800">{result.intensity_level}</p>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/65 p-3">
          <p className="text-xs text-slate-500">Confidence</p>
          <p className="mt-1 text-lg font-semibold text-slate-800">{result.confidence}%</p>
        </div>
      </div>
      {(topEmotions.length > 0 || dominanceGap > 0) && (
        <div className="mt-3 rounded-xl border border-white/60 bg-white/65 p-3 text-xs text-slate-600">
          {topEmotions.length > 0 && (
            <p>
              <span className="font-semibold text-slate-700">Top Emotions:</span>{' '}
              {topEmotions.map((entry) => `${entry.emotion} (${entry.score}%)`).join(', ')}
            </p>
          )}
          {dominanceGap > 0 && (
            <p className="mt-1">
              <span className="font-semibold text-slate-700">Dominance Gap:</span> {dominanceGap}%
            </p>
          )}
        </div>
      )}
    </TiltCard>
  )
}
