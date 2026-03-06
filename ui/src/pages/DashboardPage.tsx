import { motion } from 'framer-motion'
import { ArrowRight, Clapperboard, FileText, MessageSquare, Sparkles } from 'lucide-react'
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

const decks: Array<{
  id: string
  primary: AppPage
  title: string
  subtitle: string
  command: string
  icon: typeof Sparkles
  capsuleTone: string
  highlight: string
  links: Array<{ label: string; page: AppPage }>
}> = [
  {
    id: 'conversational-core',
    primary: 'chat',
    title: 'Conversational Core',
    subtitle: 'Chat orchestration with PDF context and image-based Q&A',
    command: 'Open conversational stack',
    icon: MessageSquare,
    capsuleTone: 'from-cyan-200/88 via-sky-200/80 to-indigo-200/72',
    highlight: 'bg-cyan-300/45',
    links: [
      { label: 'Chatbot', page: 'chat' },
      { label: 'PDF Analysis', page: 'pdf' },
      { label: 'Image Search', page: 'image' }
    ]
  },
  {
    id: 'story-intel',
    primary: 'script',
    title: 'Story Intelligence',
    subtitle: 'Script and document emotion traces plus recommendation pass',
    command: 'Run narrative analysis',
    icon: FileText,
    capsuleTone: 'from-fuchsia-200/88 via-rose-200/80 to-orange-200/72',
    highlight: 'bg-fuchsia-300/45',
    links: [
      { label: 'Script Analysis', page: 'script' },
      { label: 'Movie Recs', page: 'recommendations' },
      { label: 'PDF Analysis', page: 'pdf' }
    ]
  },
  {
    id: 'video-lab',
    primary: 'video',
    title: 'Video Signal Lab',
    subtitle: 'Video ingest or YouTube link + emotional arc extraction with recommendation output',
    command: 'Launch video pipeline',
    icon: Clapperboard,
    capsuleTone: 'from-emerald-200/88 via-teal-200/80 to-cyan-200/72',
    highlight: 'bg-emerald-300/45',
    links: [
      { label: 'Video Analysis', page: 'video' },
      { label: 'Movie Recs', page: 'recommendations' },
      { label: 'YouTube Link', page: 'video' }
    ]
  }
]

const scrollReveal = {
  hidden: { opacity: 0.06, y: 24, scale: 0.992 },
  show: { opacity: 1, y: 0, scale: 1 }
}

const scrollViewport = { once: false, amount: 0.15, margin: '-12% 0px -12% 0px' }

const scrollTransition = {
  type: 'spring' as const,
  stiffness: 88,
  damping: 20,
  mass: 0.7
}

export default function DashboardPage({ latestResult, onNavigate }: DashboardPageProps) {
  const distribution = buildDistribution(latestResult)
  const mood = latestResult?.dominant_mood || 'calm'
  const intensity = latestResult?.intensity_level || 'n/a'
  const confidence = latestResult?.confidence ?? 0
  const handleShortcut = (page: AppPage) => onNavigate(page)

  return (
    <PageWrapper theme="aurora">
      <div className="snap-y snap-mandatory space-y-8">
        {decks.map((deck, index) => {
          const Icon = deck.icon
          return (
            <motion.section
              key={deck.id}
              variants={scrollReveal}
              initial="hidden"
              whileInView="show"
              viewport={scrollViewport}
              transition={{ ...scrollTransition, delay: index * 0.05 }}
              className="snap-start space-y-4"
            >
              <motion.button
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleShortcut(deck.primary)}
                className={`group relative w-full overflow-hidden rounded-[2.8rem] border border-white/70 bg-gradient-to-br ${deck.capsuleTone} px-6 py-7 text-left shadow-xl shadow-sky-200/35 sm:px-8 sm:py-8`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.6),transparent_42%)]" />
                <motion.div
                  className={`absolute -right-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full blur-2xl ${deck.highlight}`}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 4.8 + index, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 inline-flex rounded-2xl border border-white/70 bg-white/65 p-2.5">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 sm:text-2xl">{deck.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">{deck.subtitle}</p>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-600 transition group-hover:translate-x-1" />
                </div>
                <p className="relative z-10 mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{deck.command}</p>
                <div className="relative z-10 mt-4 overflow-hidden rounded-full border border-white/65 bg-white/60 px-3 py-1.5 text-[11px] font-medium text-slate-600">
                  <motion.div
                    className="absolute inset-y-0 left-0 origin-left rounded-full bg-gradient-to-r from-cyan-300/50 via-fuchsia-300/45 to-amber-300/40"
                    initial={{ scaleX: 0, opacity: 0.4 }}
                    whileInView={{ scaleX: 1, opacity: 0.9 }}
                    viewport={{ once: false, amount: 0.75, margin: '-10% 0px -10% 0px' }}
                    transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <span className="relative">Loading modules...</span>
                </div>
              </motion.button>

              <div className="flex flex-wrap gap-3">
                {deck.links.map((link) => (
                  <motion.button
                    key={`${deck.id}-${link.page}`}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleShortcut(link.page)}
                    className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-xs font-medium text-slate-700 shadow-md shadow-sky-200/30"
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div variants={scrollReveal} initial="hidden" whileInView="show" viewport={scrollViewport} transition={scrollTransition}>
          <TiltCard className="p-4">
            <p className="text-xs text-slate-500">Dominant Mood</p>
            <p className="mt-2 text-2xl font-semibold capitalize text-slate-800">{mood}</p>
            <div className="mt-3">
              <GlowBadge label="Live emotion state" mood={mood} />
            </div>
          </TiltCard>
        </motion.div>
        <motion.div variants={scrollReveal} initial="hidden" whileInView="show" viewport={scrollViewport} transition={{ ...scrollTransition, delay: 0.07 }}>
          <TiltCard className="p-4">
            <p className="text-xs text-slate-500">Intensity Level</p>
            <p className="mt-2 text-2xl font-semibold capitalize text-slate-800">{intensity}</p>
          </TiltCard>
        </motion.div>
        <motion.div variants={scrollReveal} initial="hidden" whileInView="show" viewport={scrollViewport} transition={{ ...scrollTransition, delay: 0.14 }}>
          <TiltCard className="p-4">
            <p className="text-xs text-slate-500">Confidence</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{confidence}%</p>
          </TiltCard>
        </motion.div>
      </div>

      <motion.div
        variants={scrollReveal}
        initial="hidden"
        whileInView="show"
        viewport={scrollViewport}
        transition={scrollTransition}
        className="grid gap-4 xl:grid-cols-3"
      >
        <div className="xl:col-span-2">
          <EmotionArcChart arc={latestResult?.emotional_arc || []} />
        </div>
        <EmotionDonut distribution={distribution} />
      </motion.div>

      <motion.div
        variants={scrollReveal}
        initial="hidden"
        whileInView="show"
        viewport={scrollViewport}
        transition={scrollTransition}
        className="rounded-[2rem] border border-white/65 bg-white/68 p-5 text-sm text-slate-600 shadow-lg shadow-sky-200/30"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Sparkles className="h-4 w-4 text-fuchsia-500" />
          <span>Quick route:</span>
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleShortcut('chat')}
            className="rounded-full border border-white/70 bg-white/80 px-4 py-1.5 text-xs font-medium text-slate-700"
          >
            Start with Chatbot
          </motion.button>
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleShortcut('video')}
            className="rounded-full border border-white/70 bg-white/80 px-4 py-1.5 text-xs font-medium text-slate-700"
          >
            Start with Video
          </motion.button>
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleShortcut('recommendations')}
            className="rounded-full border border-white/70 bg-white/80 px-4 py-1.5 text-xs font-medium text-slate-700"
          >
            Start with Recommendations
          </motion.button>
        </div>
      </motion.div>
    </PageWrapper>
  )
}
