import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Clapperboard,
  FileSearch,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import type { AppPage } from '../layout/types'
import type { EmotionAnalysisResult } from '../services/api'
import EmotionArcChart from '../components/charts/EmotionArcChart'
import EmotionDonut from '../components/charts/EmotionDonut'
import GlowBadge from '../ui/GlowBadge'
import PageWrapper from '../ui/PageWrapper'
import TiltCard from '../ui/TiltCard'

interface DashboardPageProps {
  latestResult: EmotionAnalysisResult | null
  onNavigate: (page: AppPage) => void
}

const buildDistribution = (result: EmotionAnalysisResult | null) => {
  if (!result || result.emotional_arc.length === 0) return []
  const counter = new Map<string, number>()
  result.emotional_arc.forEach((point) => {
    const key = point.mood.toLowerCase()
    counter.set(key, (counter.get(key) || 0) + 1)
  })
  return Array.from(counter.entries()).map(([mood, value]) => ({ mood, value }))
}

const routeGroups: Array<{
  id: string
  title: string
  subtitle: string
  icon: typeof Sparkles
  tone: string
  primary: AppPage
  actions: Array<{ label: string; page: AppPage }>
}> = [
  {
    id: 'conversation',
    title: 'Conversational Core',
    subtitle: 'Talk to the assistant, load PDF context, or switch into OCR-backed image questioning.',
    icon: MessageSquare,
    tone: 'from-[#edf2f6] via-[#e4ebf1] to-[#f6f1e9]',
    primary: 'chat',
    actions: [
      { label: 'Open Chatbot', page: 'chat' },
      { label: 'PDF Analysis', page: 'pdf' },
      { label: 'Image Search', page: 'image' }
    ]
  },
  {
    id: 'narrative',
    title: 'Story Intelligence',
    subtitle: 'Analyze scripts, document arcs, and bridge directly into recommendation output.',
    icon: FileText,
    tone: 'from-[#f2e6e0] via-[#ebd8d0] to-[#f8f1e8]',
    primary: 'script',
    actions: [
      { label: 'Script Analysis', page: 'script' },
      { label: 'Movie Recommendations', page: 'recommendations' },
      { label: 'PDF Analysis', page: 'pdf' }
    ]
  },
  {
    id: 'video',
    title: 'Video Signal Lab',
    subtitle: 'Run uploads or YouTube links, then move into emotion curves and recommendation matches.',
    icon: Clapperboard,
    tone: 'from-[#e8efe9] via-[#dce7de] to-[#f5f0e7]',
    primary: 'video',
    actions: [
      { label: 'Video Analysis', page: 'video' },
      { label: 'YouTube Link', page: 'video' },
      { label: 'Movie Recommendations', page: 'recommendations' }
    ]
  }
]

const quickRoutes: Array<{ label: string; page: AppPage; icon: typeof Sparkles }> = [
  { label: 'Chatbot', page: 'chat', icon: MessageSquare },
  { label: 'Video', page: 'video', icon: Clapperboard },
  { label: 'Script', page: 'script', icon: FileText },
  { label: 'PDF', page: 'pdf', icon: FileSearch },
  { label: 'Image', page: 'image', icon: ImageIcon },
  { label: 'Recommendations', page: 'recommendations', icon: Sparkles }
]

const scrollReveal = {
  hidden: { opacity: 0.08, y: 18, scale: 0.992 },
  show: { opacity: 1, y: 0, scale: 1 }
}

const scrollViewport = { once: false, amount: 0.16, margin: '-10% 0px -10% 0px' }

const scrollTransition = {
  type: 'spring' as const,
  stiffness: 86,
  damping: 20,
  mass: 0.72
}

export default function DashboardPage({ latestResult, onNavigate }: DashboardPageProps) {
  const distribution = buildDistribution(latestResult)
  const mood = latestResult?.dominant_mood || 'calm'
  const intensity = latestResult?.intensity_level || 'n/a'
  const confidence = latestResult?.confidence ?? 0
  const segmentCount = latestResult?.emotional_arc.length ?? 0

  return (
    <PageWrapper theme="aurora">
      <motion.section
        variants={scrollReveal}
        initial="hidden"
        whileInView="show"
        viewport={scrollViewport}
        transition={scrollTransition}
        className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-[2.2rem] border border-[#d8d1c5] bg-[linear-gradient(135deg,#f7f3eb_0%,#eceff4_48%,#f8f4ec_100%)] p-6 shadow-[0_28px_64px_-44px_rgba(82,94,104,0.28)] sm:p-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d8d0c4] bg-[#faf5ee] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            <Sparkles className="h-3.5 w-3.5" />
            Command deck
          </div>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-slate-800 sm:text-[2.7rem]">
            A quieter dashboard for moving between chat, analysis, documents, and recommendation workflows.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            The structure is simpler now: compact routes, a cleaner signal board, and direct access to every existing
            function without the oversized pod layout.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {quickRoutes.map((route) => {
              const Icon = route.icon
              return (
                <motion.button
                  key={route.page}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(route.page)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d6dfe6] bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_14px_28px_-24px_rgba(82,94,104,0.32)]"
                >
                  <Icon className="h-4 w-4" />
                  {route.label}
                </motion.button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <TiltCard className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Current state</p>
            <p className="mt-3 text-2xl font-semibold capitalize text-slate-800">{mood}</p>
            <div className="mt-3">
              <GlowBadge label="Live emotion state" mood={mood} />
            </div>
          </TiltCard>
          <TiltCard className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Intensity</p>
            <p className="mt-3 text-2xl font-semibold capitalize text-slate-800">{intensity}</p>
            <p className="mt-2 text-sm text-slate-600">Latest processed result from the active workspace.</p>
          </TiltCard>
          <TiltCard className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Confidence</p>
            <p className="mt-3 text-2xl font-semibold text-slate-800">{confidence}%</p>
            <p className="mt-2 text-sm text-slate-600">{segmentCount} emotion segment{segmentCount === 1 ? '' : 's'} mapped.</p>
          </TiltCard>
        </div>
      </motion.section>

      <motion.section
        variants={scrollReveal}
        initial="hidden"
        whileInView="show"
        viewport={scrollViewport}
        transition={{ ...scrollTransition, delay: 0.04 }}
        className="grid gap-4 xl:grid-cols-3"
      >
        {routeGroups.map((group, index) => {
          const Icon = group.icon
          return (
            <motion.article
              key={group.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.24 }}
              className={`rounded-[1.9rem] border border-[#d8d1c5] bg-gradient-to-br ${group.tone} p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.24)]`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex rounded-[1.2rem] border border-[#d8d1c5] bg-[#faf5ee] p-2.5">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>
                <div className="rounded-full border border-[#d7d0c4] bg-[#f8f3ea] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Lane {index + 1}
                </div>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-slate-800">{group.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{group.subtitle}</p>

              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onNavigate(group.primary)}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                Open workspace
                <ArrowUpRight className="h-4 w-4" />
              </motion.button>

              <div className="mt-5 flex flex-wrap gap-2">
                {group.actions.map((action) => (
                  <motion.button
                    key={`${group.id}-${action.page}-${action.label}`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate(action.page)}
                    className="rounded-full border border-[#d8d1c5] bg-[#faf5ee] px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </motion.article>
          )
        })}
      </motion.section>

      <motion.section
        variants={scrollReveal}
        initial="hidden"
        whileInView="show"
        viewport={scrollViewport}
        transition={{ ...scrollTransition, delay: 0.08 }}
        className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]"
      >
        <div className="space-y-4">
          <div className="rounded-[2rem] border border-[#d8d1c5] bg-[#faf5ee] p-5 shadow-[0_20px_44px_-34px_rgba(82,94,104,0.22)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Signal board</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-800">Latest emotional pattern</h3>
              </div>
              <div className="rounded-full border border-[#d8d1c5] bg-[#f5efe6] px-3 py-1.5 text-xs font-medium text-slate-600">
                {latestResult ? 'Using the latest analysis result' : 'Waiting for the first analysis run'}
              </div>
            </div>
          </div>
          <EmotionArcChart arc={latestResult?.emotional_arc || []} />
        </div>
        <EmotionDonut distribution={distribution} />
      </motion.section>
    </PageWrapper>
  )
}
