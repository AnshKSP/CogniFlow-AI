import { motion } from 'framer-motion'
import { useState } from 'react'
import { Download, Link2 } from 'lucide-react'
import { analyzeVideo, analyzeYouTubeVideo, uploadVideoReport, youtubeVideoReport } from '../services/api'
import type { EmotionAnalysisResult } from '../services/api'
import EmotionSummaryCard from '../components/EmotionSummaryCard'
import MovieRecommendationSection from '../components/MovieRecommendationSection'
import EmotionArcChart from '../components/charts/EmotionArcChart'
import { fadeUp } from '../animations/motion'
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      setError('Video report download failed. Please verify input and backend status.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <PageWrapper theme="sunset">
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <div className="inline-flex rounded-full border border-white/60 bg-white/60 p-1">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSourceType('upload')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
              sourceType === 'upload' ? 'bg-white text-slate-800 shadow-sm shadow-sky-200/45' : 'text-slate-600'
            }`}
          >
            Upload Video
          </motion.button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSourceType('youtube')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
              sourceType === 'youtube' ? 'bg-white text-slate-800 shadow-sm shadow-sky-200/45' : 'text-slate-600'
            }`}
          >
            YouTube Link
          </motion.button>
        </div>

        {sourceType === 'upload' ? (
          <Dropzone
            accept="video/*"
            title={file ? file.name : 'Drag & Drop Video or Click to Upload'}
            subtitle="Supports standard video files. Analysis starts after you click Analyze."
            onSelect={setFile}
          />
        ) : (
          <div className="rounded-2xl border border-white/65 bg-white/70 p-4 shadow-lg shadow-sky-200/25">
            <label className="mb-2 block text-sm font-medium text-slate-700">YouTube Video URL</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white/80 px-3 py-2">
              <Link2 className="h-4 w-4 text-slate-500" />
              <input
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">Paste any public YouTube link to analyze its emotional arc.</p>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-3">
        <AnimatedButton
          disabled={sourceType === 'upload' ? !file || loading : !youtubeUrl.trim() || loading}
          onClick={() => void (sourceType === 'upload' ? onAnalyzeFile() : onAnalyzeYoutube())}
        >
          {loading ? 'Analyzing...' : sourceType === 'upload' ? 'Analyze Video' : 'Analyze YouTube Link'}
        </AnimatedButton>
        <AnimatedButton
          className="bg-gradient-to-r from-emerald-500 to-cyan-500"
          disabled={sourceType === 'upload' ? !file || downloading || loading : !youtubeUrl.trim() || downloading || loading}
          onClick={() => void onDownloadReport()}
        >
          <Download className="mr-2 inline-block h-4 w-4" />
          {downloading ? 'Preparing Report...' : 'Download Report'}
        </AnimatedButton>
        {uploadProgress > 0 && (
          <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-200/90">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400"
              animate={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </motion.div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <motion.div variants={fadeUp} initial="initial" animate="animate" className="space-y-4">
          <EmotionSummaryCard result={result} />
          <EmotionArcChart arc={result.emotional_arc} />
          <MovieRecommendationSection recommendations={result.recommendations} mood={result.dominant_mood} />
        </motion.div>
      )}
    </PageWrapper>
  )
}
