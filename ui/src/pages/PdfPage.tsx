import { motion } from 'framer-motion'
import { useState } from 'react'
import { Download } from 'lucide-react'
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
    } catch (err: unknown) {
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
      <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Dropzone
          accept=".pdf"
          title={file ? file.name : 'Drag & Drop PDF or Click to Upload'}
          subtitle="Document will be analyzed for emotional trajectory and recommendations."
          onSelect={setFile}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap items-center gap-3"
      >
        <AnimatedButton disabled={!file || loading} onClick={() => void onAnalyze()}>
          {loading ? 'Analyzing...' : 'Analyze PDF'}
        </AnimatedButton>
        <AnimatedButton
          className="bg-gradient-to-r from-emerald-500 to-cyan-500"
          disabled={!file}
          onClick={() => void onDownloadPdfReport()}
        >
          <Download className="mr-2 inline-block h-4 w-4" />
          Download PDF Report
        </AnimatedButton>
      </motion.div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="space-y-4">
          <EmotionSummaryCard result={result} />
          <EmotionArcChart arc={result.emotional_arc} />
          <MovieRecommendationSection recommendations={result.recommendations} mood={result.dominant_mood} />
        </div>
      )}
    </PageWrapper>
  )
}
