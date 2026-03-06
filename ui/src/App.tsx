import { useEffect, useRef, useState } from 'react'
import GradientBackground from './ui/GradientBackground'
import AppLayout from './layout/AppLayout'
import type { AppPage } from './layout/types'
import DashboardPage from './pages/DashboardPage'
import VideoPage from './pages/VideoPage'
import ScriptPage from './pages/ScriptPage'
import PdfPage from './pages/PdfPage'
import ImageSearchPage from './pages/ImageSearchPage'
import ChatbotPage from './pages/ChatbotPage'
import RecommendationsPage from './pages/RecommendationsPage'
import type { EmotionAnalysisResult } from './services/api'
import PageLoader from './ui/PageLoader'

function App() {
  const [activePage, setActivePage] = useState<AppPage>('dashboard')
  const [latestResult, setLatestResult] = useState<EmotionAnalysisResult | null>(null)
  const [loadingPage, setLoadingPage] = useState(false)
  const timerRef = useRef<number | null>(null)

  const navigateWithLoader = (page: AppPage) => {
    if (page === activePage || loadingPage) return
    setLoadingPage(true)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setActivePage(page)
      setLoadingPage(false)
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const renderPage = () => {
    if (activePage === 'video') {
      return <VideoPage key="video" onResult={setLatestResult} />
    }
    if (activePage === 'script') {
      return <ScriptPage key="script" onResult={setLatestResult} />
    }
    if (activePage === 'pdf') {
      return <PdfPage key="pdf" onResult={setLatestResult} />
    }
    if (activePage === 'image') {
      return <ImageSearchPage key="image" />
    }
    if (activePage === 'chat') {
      return <ChatbotPage key="chat" />
    }
    if (activePage === 'recommendations') {
      return <RecommendationsPage key="recommendations" />
    }
    return <DashboardPage key="dashboard" latestResult={latestResult} onNavigate={navigateWithLoader} />
  }

  return (
    <GradientBackground>
      <PageLoader loading={loadingPage} />
      <AppLayout activePage={activePage} onChangePage={navigateWithLoader}>
        {renderPage()}
      </AppLayout>
    </GradientBackground>
  )
}

export default App
