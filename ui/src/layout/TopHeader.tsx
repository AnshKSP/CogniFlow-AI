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

const pageShells: Record<AppPage, string> = {
  dashboard: 'from-[#ebe7f3] via-[#d8d4e7] to-[#f3f0e9]',
  video: 'from-[#dce9e2] via-[#cadacf] to-[#eef3ee]',
  script: 'from-[#f0ddd7] via-[#e8cec6] to-[#f5efe8]',
  pdf: 'from-[#dbe2d4] via-[#cbd5c5] to-[#eff2ea]',
  image: 'from-[#f2e6d6] via-[#ead9c0] to-[#f6f1e8]',
  recommendations: 'from-[#dce5ef] via-[#ccd8e4] to-[#f1eee8]',
  chat: 'from-[#dde4eb] via-[#c8d3df] to-[#f1efe9]'
}

export default function TopHeader({ page, onNavigate }: TopHeaderProps) {
  const isDashboard = page === 'dashboard'

  return (
    <header className={`relative mb-6 overflow-hidden rounded-[2.2rem] border border-[#ddd7cb] bg-gradient-to-r ${pageShells[page]} px-4 py-5 sm:px-6 sm:py-7`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_0,rgba(255,255,255,0.16)_1px,transparent_1px,transparent_84px)] opacity-35" />
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <motion.button
          whileHover={isDashboard ? undefined : { y: -2, scale: 1.02 }}
          whileTap={isDashboard ? undefined : { scale: 0.97 }}
          onClick={() => onNavigate('dashboard')}
          disabled={isDashboard}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            isDashboard
              ? 'cursor-default border-[#cfc7bb] bg-[#f3eee5] text-slate-500'
              : 'border-[#c8d0d7] bg-[#faf6ef] text-slate-700 shadow-[0_12px_24px_-18px_rgba(82,94,104,0.28)]'
          }`}
        >
          <House className="h-3.5 w-3.5" />
          Main Dashboard
        </motion.button>
      </div>

      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#cfc8bc] bg-[#faf7f1] px-3 py-1.5 text-xs font-medium text-slate-700">
          <Sparkles className="h-3.5 w-3.5 text-[#8d6b59]" />
          {pageTitle[page]}
        </div>
      </div>

      <div className="relative mx-auto mt-8 flex max-w-xl flex-col items-center justify-center text-center sm:mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="rounded-[1.6rem] border border-[#d8d1c5] bg-[#faf6ef] p-2.5 shadow-[0_20px_40px_-30px_rgba(82,94,104,0.34)]"
        >
          <CogniFlowLogo size={58} />
        </motion.div>
        <h1 className="mt-3 text-2xl font-semibold text-slate-800 sm:text-3xl">CogniFlow AI</h1>
        <p className="mt-1 text-sm text-slate-600">A lighter, focused workspace for multimodal analysis.</p>
      </div>

      <div className="mt-5 flex items-center justify-center">
        <div className="rounded-full border border-[#d8d1c5] bg-[#f8f4eb] px-3 py-1.5 text-xs font-medium text-slate-600">
          {pageTitle[page]}
        </div>
      </div>

      <motion.div
        className="mx-auto mt-4 h-px w-full max-w-3xl rounded-full bg-[linear-gradient(90deg,transparent,#9fafbc,#d3b4a4,#c7bfae,transparent)]"
        initial={{ scaleX: 0.3, opacity: 0.4 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      />
    </header>
  )
}
