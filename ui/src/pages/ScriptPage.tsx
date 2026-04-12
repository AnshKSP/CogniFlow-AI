import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Download, FileText } from 'lucide-react'
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
    } catch {
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
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[2.2rem] border border-[#ddcfc8] bg-[linear-gradient(135deg,#f5e8e1_0%,#eedcd5_48%,#f7f1e8_100%)] p-5 shadow-[0_26px_60px_-42px_rgba(82,94,104,0.28)] sm:p-7"
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e0d1c9] bg-[#faf3ec] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              <FileText className="h-3.5 w-3.5" />
              Story intelligence
            </div>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold leading-tight text-slate-800 sm:text-[2.5rem]">
                Drop in a scene, dialogue block, or full screenplay and read the emotional curve clearly.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                This new script workspace is designed more like an editorial desk: writing on one side, emotional signal
                and recommendation output on the other.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-[#e0d1c9] bg-[#faf3ec] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Best for</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">Scenes, dialogue, synopsis</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#e4d8cf] bg-[#f8f1e7] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Output</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">Mood, arc, recommendation lane</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#d8d1c5] bg-[#f9f5ec] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Export</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">Instant PDF report</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-[#dfd1c9] bg-[linear-gradient(180deg,#faf5ee_0%,#f3ece3_100%)] p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.26)]"
        >
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Script input</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-800">Compose or paste text</h3>
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste screenplay or dialogue here..."
            className="h-[360px] w-full rounded-[1.6rem] border border-[#e0d1c9] bg-[#fdf8f1] p-4 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-500 focus:border-[#c6b1a8]"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <AnimatedButton disabled={loading || !text.trim()} onClick={() => void onAnalyze()}>
              {loading ? 'Analyzing...' : 'Analyze Script'}
            </AnimatedButton>
            <AnimatedButton disabled={!text.trim()} onClick={() => void onDownload()}>
              <Download className="mr-2 inline-block h-4 w-4" />
              Download Report
            </AnimatedButton>
          </div>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-[#ddcfc8] bg-[linear-gradient(180deg,#f8f2ea_0%,#f2e6de_100%)] p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.26)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Live readout</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-800">Narrative signal board</h3>
          {result ? (
            <div className="mt-4 space-y-4">
              <EmotionSummaryCard result={result} />
              <EmotionArcChart arc={result.emotional_arc} />
            </div>
          ) : (
            <div className="mt-4 rounded-[1.6rem] border border-dashed border-[#d9c9c1] bg-[#fbf6ef] p-6 text-sm leading-7 text-slate-600">
              Run an analysis to populate the dominant mood, confidence, emotional arc, and film recommendations.
            </div>
          )}
        </motion.section>
      </div>

      {result ? (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <div className="rounded-[2rem] border border-[#dfd1c9] bg-[linear-gradient(180deg,#faf5ee_0%,#f2ebe3_100%)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Sentence timeline</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-800">Segment-by-segment emotion trace</h3>
            <div className="mt-4 max-h-72 overflow-auto rounded-[1.4rem] border border-[#e0d1c9] bg-[#fdf8f1]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f2e5de] text-slate-700">
                  <tr>
                    <th className="px-3 py-3">#</th>
                    <th className="px-3 py-3">Range</th>
                    <th className="px-3 py-3">Mood</th>
                    <th className="px-3 py-3">Snippet</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((segment) => (
                    <tr key={segment.id} className="border-t border-[#ebe0d7] text-slate-700">
                      <td className="px-3 py-2.5">{segment.id}</td>
                      <td className="px-3 py-2.5">{segment.range}</td>
                      <td className="px-3 py-2.5 capitalize">{segment.mood}</td>
                      <td className="max-w-md truncate px-3 py-2.5 text-slate-600">{segment.text || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <MovieRecommendationSection recommendations={result.recommendations} mood={result.dominant_mood} />
        </motion.section>
      ) : null}
    </PageWrapper>
  )
}
