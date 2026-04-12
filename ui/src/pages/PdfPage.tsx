import { motion } from 'framer-motion'
import { useState } from 'react'
import { Download, FileSearch } from 'lucide-react'
import { analyzePdf, uploadPdfReport } from '../services/api'
import type { EmotionAnalysisResult } from '../services/api'
import EmotionSummaryCard from '../components/EmotionSummaryCard'
import EmotionArcChart from '../components/charts/EmotionArcChart'
import MovieRecommendationSection from '../components/MovieRecommendationSection'
import AnimatedButton from '../ui/AnimatedButton'
import Dropzone from '../ui/Dropzone'
import PageWrapper from '../ui/PageWrapper'

interface PdfPageProps {
  onResult: (result: EmotionAnalysisResult) => void
}

export default function PdfPage({ onResult }: PdfPageProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<EmotionAnalysisResult | null>(null)

  const onAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const response = await analyzePdf(file)
      setResult(response)
      onResult(response)
    } catch {
      setError('PDF analysis failed. Please upload a valid file.')
    } finally {
      setLoading(false)
    }
  }

  const onDownloadPdfReport = async () => {
    if (!file) return
    const blob = await uploadPdfReport(file)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pdf_emotion_report.pdf'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageWrapper theme="forest">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[2.2rem] border border-[#d2dacb] bg-[linear-gradient(135deg,#eef2ea_0%,#e1e8db_48%,#f7f2ea_100%)] p-5 shadow-[0_26px_60px_-42px_rgba(82,94,104,0.28)] sm:p-7"
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d6ddcf] bg-[#f7f4ed] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              <FileSearch className="h-3.5 w-3.5" />
              PDF analysis
            </div>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold leading-tight text-slate-800 sm:text-[2.5rem]">
                Read the emotional shape of a document with a cleaner, softer workspace.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Upload the file once, inspect the extracted mood profile, and export the PDF report from the same page.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-[#d6ddcf] bg-[#f4f6ef] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Input</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">PDF upload</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#d8d1c5] bg-[#f9f5ec] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Output</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">Mood summary + recommendations</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#d2d9d0] bg-[#f0f4ed] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Export</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">PDF report</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[2rem] border border-[#d4dbce] bg-[linear-gradient(180deg,#faf6ef_0%,#edf1ea_100%)] p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.26)]"
      >
        <Dropzone
          accept=".pdf"
          title={file ? file.name : 'Drag and drop a PDF or click to upload'}
          subtitle="The document will be analyzed for emotional trajectory and recommendation output."
          onSelect={setFile}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <AnimatedButton disabled={!file || loading} onClick={() => void onAnalyze()}>
            {loading ? 'Analyzing...' : 'Analyze PDF'}
          </AnimatedButton>
          <AnimatedButton disabled={!file} onClick={() => void onDownloadPdfReport()}>
            <Download className="mr-2 inline-block h-4 w-4" />
            Download PDF Report
          </AnimatedButton>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </motion.section>

      {result ? (
        <div className="space-y-4">
          <EmotionSummaryCard result={result} />
          <EmotionArcChart arc={result.emotional_arc} />
          <MovieRecommendationSection recommendations={result.recommendations} mood={result.dominant_mood} />
        </div>
      ) : null}
    </PageWrapper>
  )
}
