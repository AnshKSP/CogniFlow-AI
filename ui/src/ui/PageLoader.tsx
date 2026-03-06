import { AnimatePresence, motion } from 'framer-motion'
import CogniFlowLogo from './CogniFlowLogo'

interface PageLoaderProps {
  loading: boolean
}

export default function PageLoader({ loading }: PageLoaderProps) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-gradient-to-br from-sky-200/85 via-white/90 to-fuchsia-200/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0.6 }}
            animate={{ scale: [0.92, 1.04, 1], opacity: [0.65, 1, 0.9] }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-white/60 bg-white/70 px-8 py-6 shadow-xl shadow-sky-200/45"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
              className="rounded-2xl p-2"
            >
              <CogniFlowLogo size={64} />
            </motion.div>
            <p className="text-sm font-medium text-slate-700">Loading CogniFlow AI...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
