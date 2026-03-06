import { LayoutGroup, motion } from 'framer-motion'
import { BarChart3, Clapperboard, FileText, FileType2, MessageSquare, Film, Image } from 'lucide-react'
import type { AppPage } from './types'
import CogniFlowLogo from '../ui/CogniFlowLogo'

interface SidebarProps {
  activePage: AppPage
  onChange: (page: AppPage) => void
}

const navItems: Array<{ key: AppPage; label: string; icon: typeof BarChart3 }> = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'video', label: 'Video Analysis', icon: Clapperboard },
  { key: 'script', label: 'Script Analysis', icon: FileText },
  { key: 'pdf', label: 'PDF Analysis', icon: FileType2 },
  { key: 'image', label: 'Image Search', icon: Image },
  { key: 'recommendations', label: 'Movie Recommendations', icon: Film },
  { key: 'chat', label: 'Chatbot', icon: MessageSquare }
]

export default function Sidebar({ activePage, onChange }: SidebarProps) {
  return (
    <aside className="w-full shrink-0 border-b border-sky-300/45 bg-gradient-to-b from-white/90 via-sky-100/80 to-fuchsia-100/60 p-4 backdrop-blur-md lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="mb-6 flex items-center gap-3 px-2">
        <CogniFlowLogo size={40} />
        <div>
          <p className="text-sm font-semibold text-slate-800">CogniFlow AI</p>
          <p className="text-xs text-slate-600">Enterprise Console</p>
        </div>
      </div>
      <LayoutGroup>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.key === activePage
            return (
              <motion.button
                key={item.key}
                whileHover={{ x: 3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange(item.key)}
                className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'text-slate-900 shadow-lg shadow-cyan-300/35'
                  : 'text-slate-700 hover:bg-white/55'
              }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 -z-0 rounded-xl bg-gradient-to-r from-cyan-200/70 via-sky-200/70 to-pink-200/65 ring-1 ring-sky-300/45"
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  />
                )}
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </motion.button>
            )
          })}
        </div>
      </LayoutGroup>
    </aside>
  )
}
