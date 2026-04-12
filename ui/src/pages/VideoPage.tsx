import { motion } from 'framer-motion'
import { useState } from 'react'
import { Download, Link2, PlaySquare } from 'lucide-react'
import { analyzeVideo, analyzeYouTubeVideo, uploadVideoReport, youtubeVideoReport } from '../services/api'
import type { EmotionAnalysisResult } from '../services/api'
import EmotionSummaryCard from '../components/EmotionSummaryCard'
import MovieRecommendationSection from '../components/MovieRecommendationSection'
import EmotionArcChart from '../components/charts/EmotionArcChart'
import AnimatedButton from '../ui/AnimatedButton'
import Dropzone from '../ui/Dropzone'
import PageWrapper from '../ui/PageWrapper'

interface VideoPageProps {
  onResult: (result: EmotionAnalysisResult) => void
}

export default function VideoPage({ onResult }: VideoPageProps) {
  const [file, setFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [sourceType, setSourceType] = useState<'upload' | 'youtube'>('upload')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<EmotionAnalysisResult | null>(null)

  const runProgress = () =>
    setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? prev : prev + 10))
    }, 180)

  const onAnalyzeFile = async () => {
    if (!file) return
    setError('')
    setLoading(true)
    setUploadProgress(20)
    try {
      const timer = runProgress()
      const response = await analyzeVideo(file)
      clearInterval(timer)
      setUploadProgress(100)
      setResult(response)
      onResult(response)
    } catch {
      setError('Video analysis failed. Please verify file format and backend status.')
    } finally {
      setLoading(false)
      setTimeout(() => setUploadProgress(0), 500)
    }
  }

  const onAnalyzeYoutube = async () => {
    const input = youtubeUrl.trim()
    if (!input) return

    const isValidYoutube = /(youtube\.com|youtu\.be)/i.test(input)
    if (!isValidYoutube) {
      setError('Please enter a valid YouTube URL (youtube.com or youtu.be).')
      return
    }

    setError('')
    setLoading(true)
    setUploadProgress(20)
    try {
      const timer = runProgress()
      const response = await analyzeYouTubeVideo(input)
      clearInterval(timer)
      setUploadProgress(100)
      setResult(response)
      onResult(response)
    } catch {
      setError('YouTube analysis failed. Please verify the link and backend status.')
    } finally {
      setLoading(false)
      setTimeout(() => setUploadProgress(0), 500)
    }
  }

  const onDownloadReport = async () => {
    setError('')
    setDownloading(true)

    try {
      if (sourceType === 'upload') {
        if (!file) return
        const blob = await uploadVideoReport(file)
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'video_emotion_report.pdf'
        link.click()
        URL.revokeObjectURL(url)
        return
      }

      const input = youtubeUrl.trim()
      if (!input) return

      const isValidYoutube = /(youtube\.com|youtu\.be)/i.test(input)
      if (!isValidYoutube) {
        setError('Please enter a valid YouTube URL (youtube.com or youtu.be).')
        return
      }

      const blob = await youtubeVideoReport(input)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'youtube_video_emotion_report.pdf'
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Video report download failed. Please verify input and backend status.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <PageWrapper theme="sunset">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[2.2rem] border border-[#d1ddd6] bg-[linear-gradient(135deg,#edf3ef_0%,#e1ece4_46%,#f6f2ea_100%)] p-5 shadow-[0_26px_60px_-42px_rgba(82,94,104,0.28)] sm:p-7"
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4ddd7] bg-[#f6f4ed] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              <PlaySquare className="h-3.5 w-3.5" />
              Video signal lab
            </div>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold leading-tight text-slate-800 sm:text-[2.5rem]">
                Upload a clip or paste a YouTube link and map the emotional arc without the old clutter.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                The page is now organized as a source deck on the left and a result canvas on the right, with the same
                light gradient family running through the whole experience.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-[#d3ddd7] bg-[#f4f6ef] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Sources</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">Upload or YouTube</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#d8d1c5] bg-[#f9f5ec] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Output</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">Emotion arc + recommendations</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#cfdbe4] bg-[#f1f5f7] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Export</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">PDF report download</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-[#d1ddd6] bg-[linear-gradient(180deg,#f8f6ef_0%,#ecf2ee_100%)] p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.26)]"
        >
          <div className="mb-4 flex flex-wrap gap-2 rounded-full border border-[#d5ddd8] bg-[#f6f3ec] p-1">
            {(['upload', 'youtube'] as const).map((type) => (
              <motion.button
                key={type}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSourceType(type)}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  sourceType === type ? 'bg-[#ecf2f5] text-slate-800 shadow-sm' : 'text-slate-600'
                }`}
              >
                {type === 'upload' ? 'Upload Video' : 'YouTube Link'}
              </motion.button>
            ))}
          </div>

          {sourceType === 'upload' ? (
            <Dropzone
              accept="video/*"
              title={file ? file.name : 'Drag and drop a video or click to upload'}
              subtitle="Supports standard video files. Start analysis when you are ready."
              onSelect={setFile}
            />
          ) : (
            <div className="rounded-[1.7rem] border border-[#cfdae3] bg-[#f9f6ef] p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">YouTube URL</label>
              <div className="flex items-center gap-2 rounded-[1.2rem] border border-[#d4dde4] bg-[#fcf8f1] px-3 py-3">
                <Link2 className="h-4 w-4 text-slate-500" />
                <input
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
                />
              </div>
              <p className="mt-2 text-sm text-slate-600">Paste any public YouTube link to analyze its emotional arc.</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <AnimatedButton
              disabled={sourceType === 'upload' ? !file || loading : !youtubeUrl.trim() || loading}
              onClick={() => void (sourceType === 'upload' ? onAnalyzeFile() : onAnalyzeYoutube())}
            >
              {loading ? 'Analyzing...' : sourceType === 'upload' ? 'Analyze Video' : 'Analyze YouTube Link'}
            </AnimatedButton>
            <AnimatedButton
              disabled={sourceType === 'upload' ? !file || downloading || loading : !youtubeUrl.trim() || downloading || loading}
              onClick={() => void onDownloadReport()}
            >
              <Download className="mr-2 inline-block h-4 w-4" />
              {downloading ? 'Preparing Report...' : 'Download Report'}
            </AnimatedButton>
          </div>

          {uploadProgress > 0 ? (
            <div className="mt-4 overflow-hidden rounded-full border border-[#d5ddd8] bg-[#f5f1e9]">
              <motion.div
                className="h-3 origin-left bg-[linear-gradient(90deg,#c9d8e4_0%,#d8d0c4_50%,#c6d8cf_100%)]"
                animate={{ scaleX: uploadProgress / 100 }}
              />
            </div>
          ) : null}

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-[#d4ddd8] bg-[linear-gradient(180deg,#faf6ef_0%,#eef3f0_100%)] p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.26)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Analysis canvas</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-800">Live video readout</h3>
          {result ? (
            <div className="mt-4 space-y-4">
              <EmotionSummaryCard result={result} />
              <EmotionArcChart arc={result.emotional_arc} />
            </div>
          ) : (
            <div className="mt-4 rounded-[1.6rem] border border-dashed border-[#cfd9d4] bg-[#f8f5ee] p-6 text-sm leading-7 text-slate-600">
              Run a video or YouTube analysis to populate the transcript summary, emotional arc, and recommendation lane.
            </div>
          )}
        </motion.section>
      </div>

      {result ? <MovieRecommendationSection recommendations={result.recommendations} mood={result.dominant_mood} /> : null}
    </PageWrapper>
  )
}
