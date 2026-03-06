import { AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import TopHeader from './TopHeader'
import type { AppPage } from './types'

interface AppLayoutProps {
  activePage: AppPage
  onChangePage: (page: AppPage) => void
  children: ReactNode
}

export default function AppLayout({ activePage, onChangePage, children }: AppLayoutProps) {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-[1380px]">
        <TopHeader page={activePage} onNavigate={onChangePage} />
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </div>
    </main>
  )
}
