import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { analyzeScript, generateReport } from '../services/api'
import type { EmotionAnalysisResult } from '../services/api'
import AnimatedButton from '../ui/AnimatedButton'
import EmotionSummaryCard from '../components/EmotionSummaryCard'
import EmotionArcChart from '../components/charts/EmotionArcChart'
import MovieRecommendationSection from '../components/MovieRecommendationSection'
import PageWrapper from '../ui/PageWrapper'

interface ScriptPageProps {
  onResult: (result: EmotionAnalysisResult) => void
}

export default function ScriptPage({ onResult }: ScriptPageProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<EmotionAnalysisResult | null>(null)

  const segments = useMemo(
    () =>
      (result?.emotional_arc || []).map((entry, index) => ({
        id: index + 1,
        range: `${entry.start ?? index * 2}s - ${entry.end ?? index * 2 + 2}s`,
        mood: entry.mood || 'neutral',
        text: entry.text || ''
      })),
    [result]
  )

  const onAnalyze = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    try {
      const response = await analyzeScript(text)
      setResult(response)
      onResult(response)
    } catch (err: unknown) {
      setError('Script analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onDownload = async () => {
    if (!text.trim()) return
    const blob = await generateReport(text)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'script_emotion_report.pdf'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageWrapper theme="neon">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-fuchsia-300/45 bg-gradient-to-br from-white/90 via-fuchsia-100/75 to-rose-100/70 p-4"
      >
        <label className="mb-2 block text-sm font-medium text-slate-700">Script Text</label>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste screenplay or dialogue here..."
          className="h-44 w-full rounded-xl border border-slate-300/70 bg-white/80 p-3 text-sm text-slate-800 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-400/70"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <AnimatedButton disabled={loading || !text.trim()} onClick={() => void onAnalyze()}>
            {loading ? 'Analyzing...' : 'Analyze Script'}
          </AnimatedButton>
          <AnimatedButton className="bg-gradient-to-r from-emerald-500 to-cyan-500" disabled={!text.trim()} onClick={() => void onDownload()}>
            <Download className="mr-2 inline-block h-4 w-4" />
            Download Report
          </AnimatedButton>
        </div>
      </motion.div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="space-y-4">
          <EmotionSummaryCard result={result} />
          <EmotionArcChart arc={result.emotional_arc} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-fuchsia-300/45 bg-gradient-to-br from-white/90 via-fuchsia-100/75 to-rose-100/70 p-4"
          >
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Sentence-Level Emotion Timeline</h3>
            <div className="max-h-56 overflow-auto rounded-xl border border-white/60 bg-white/55">
              <table className="w-full text-left text-xs">
                <thead className="bg-fuchsia-200/40 text-slate-700">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Range</th>
                    <th className="px-3 py-2">Mood</th>
                    <th className="px-3 py-2">Snippet</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((segment) => (
                    <tr key={segment.id} className="border-t border-white/55 text-slate-700">
                      <td className="px-3 py-2">{segment.id}</td>
                      <td className="px-3 py-2">{segment.range}</td>
                      <td className="px-3 py-2 capitalize">{segment.mood}</td>
                      <td className="max-w-md truncate px-3 py-2 text-slate-600">{segment.text || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
          <MovieRecommendationSection recommendations={result.recommendations} mood={result.dominant_mood} />
        </div>
      )}
    </PageWrapper>
  )
}
