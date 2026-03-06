import { motion } from 'framer-motion'
import { House, Sparkles } from 'lucide-react'
import type { AppPage } from './types'
import CogniFlowLogo from '../ui/CogniFlowLogo'

interface TopHeaderProps {
  page: AppPage
  onNavigate: (page: AppPage) => void
}

const pageTitle: Record<AppPage, string> = {
  dashboard: 'Dashboard',
  video: 'Video Analysis',
  script: 'Script Analysis',
  pdf: 'PDF Analysis',
  image: 'Image Search Q&A',
  recommendations: 'Movie Recommendations',
  chat: 'AI Chatbot'
}

export default function TopHeader({ page, onNavigate }: TopHeaderProps) {
  const isDashboard = page === 'dashboard'

  return (
    <header className="relative mb-6 rounded-[2rem] border border-sky-300/45 bg-gradient-to-r from-white/90 via-sky-100/80 to-pink-100/75 px-4 py-5 backdrop-blur-md sm:px-6 sm:py-7">
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <motion.button
          whileHover={isDashboard ? undefined : { y: -2, scale: 1.02 }}
          whileTap={isDashboard ? undefined : { scale: 0.97 }}
          onClick={() => onNavigate('dashboard')}
          disabled={isDashboard}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            isDashboard
              ? 'cursor-default border-slate-300/60 bg-white/55 text-slate-500'
              : 'border-sky-300/65 bg-white/80 text-slate-700 shadow-md shadow-sky-200/40'
          }`}
        >
          <House className="h-3.5 w-3.5" />
          Main Dashboard
        </motion.button>
      </div>

      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/55 bg-white/75 px-3 py-1.5 text-xs font-medium text-slate-700">
          <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
          {pageTitle[page]}
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl flex-col items-center justify-center text-center sm:mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="rounded-3xl border border-white/70 bg-white/75 p-2.5 shadow-lg shadow-sky-200/45"
        >
          <CogniFlowLogo size={58} />
        </motion.div>
        <h1 className="mt-3 text-2xl font-semibold text-slate-800 sm:text-3xl">CogniFlow AI</h1>
        <p className="mt-1 text-sm text-slate-600">What do you want to analyze today?</p>
      </div>

      <div className="mt-5 flex items-center justify-center">
        <div className="rounded-full border border-white/65 bg-white/68 px-3 py-1.5 text-xs font-medium text-slate-600">
          {pageTitle[page]}
        </div>
      </div>

      <motion.div
        className="mx-auto mt-4 h-0.5 w-full max-w-3xl rounded-full bg-gradient-to-r from-cyan-400/95 via-fuchsia-400/90 to-amber-400/95"
        initial={{ scaleX: 0.3, opacity: 0.4 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      />
    </header>
  )
}
