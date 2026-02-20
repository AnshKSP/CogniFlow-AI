import { useState } from 'react'
import { Brain, Activity, MessageSquare, BarChart3, Settings, Bell, Search } from 'lucide-react'
import ChatbotSection from './components/ChatbotSection'
import EmotionAnalysisSection from './components/EmotionAnalysisSection'
import KPICards from './components/KPICards'

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chatbot' | 'emotion'>('dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-blue-900/30 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">CogniFlow AI</h1>
                <p className="text-xs text-blue-400/70 font-medium">Enterprise Intelligence Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-slate-900/50 border border-blue-900/30 rounded-lg text-sm text-white placeholder-blue-400/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 w-64"
                />
              </div>
              
              <button className="relative p-2 text-blue-400/70 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button className="p-2 text-blue-400/70 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-blue-900/30 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                activeTab === 'dashboard'
                  ? 'text-blue-400 border-blue-500 bg-blue-500/5'
                  : 'text-blue-300/50 border-transparent hover:text-blue-300 hover:bg-blue-500/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </div>
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                activeTab === 'chatbot'
                  ? 'text-blue-400 border-blue-500 bg-blue-500/5'
                  : 'text-blue-300/50 border-transparent hover:text-blue-300 hover:bg-blue-500/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                AI Chatbot
              </div>
            </button>
            <button
              onClick={() => setActiveTab('emotion')}
              className={`px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                activeTab === 'emotion'
                  ? 'text-blue-400 border-blue-500 bg-blue-500/5'
                  : 'text-blue-300/50 border-transparent hover:text-blue-300 hover:bg-blue-500/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Emotion Analysis
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back, John</h2>
              <p className="text-blue-300/60">Here's what's happening with your AI operations today.</p>
            </div>
            
            <KPICards />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChatbotSection />
              <EmotionAnalysisSection />
            </div>
          </div>
        )}
        
        {activeTab === 'chatbot' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">AI Chatbot</h2>
              <p className="text-blue-300/60">Interact with our advanced AI assistant powered by multiple LLM providers.</p>
            </div>
            <ChatbotSection fullHeight />
          </div>
        )}
        
        {activeTab === 'emotion' && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Emotion Analysis</h2>
              <p className="text-blue-300/60">Analyze emotions from videos, scripts, and PDFs using advanced AI models.</p>
            </div>
            <EmotionAnalysisSection fullHeight />
          </div>
        )}
      </main>
    </div>
  )
}

export default App