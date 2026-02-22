import { useEffect, useMemo, useState } from 'react'
import { Brain, Activity, MessageSquare, BarChart3, Settings, Search, UserCircle, LogOut } from 'lucide-react'
import ChatbotSection from './components/ChatbotSection'
import EmotionAnalysisSection from './components/EmotionAnalysisSection'
import KPICards from './components/KPICards'
import {
  clearAuthToken,
  getAuthToken,
  getCurrentUser,
  login,
  logout,
  setAuthToken,
  signup
} from './services/api'

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chatbot' | 'emotion'>('dashboard')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [loginName, setLoginName] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [apiBaseUrl, setApiBaseUrl] = useState('http://127.0.0.1:8000')

  useEffect(() => {
    const savedApiBase = localStorage.getItem('cogniflow_api_base') || 'http://127.0.0.1:8000'
    setApiBaseUrl(savedApiBase)

    const token = getAuthToken()
    if (!token) return

    getCurrentUser()
      .then((user) => {
        setUserName(user.full_name)
        setUserEmail(user.email)
      })
      .catch(() => {
        clearAuthToken()
        setUserName('')
        setUserEmail('')
      })
  }, [])

  const initials = useMemo(() => {
    const parts = userName.trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return 'U'
    return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('')
  }, [userName])

  const handleAuthSubmit = async () => {
    setAuthError('')
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError('Email and password are required.')
      return
    }
    if (authMode === 'signup' && loginName.trim().length < 2) {
      setAuthError('Full name must be at least 2 characters.')
      return
    }

    setIsAuthLoading(true)
    try {
      const response =
        authMode === 'signup'
          ? await signup(loginName.trim(), loginEmail.trim(), loginPassword)
          : await login(loginEmail.trim(), loginPassword)

      setAuthToken(response.token)
      setUserName(response.full_name)
      setUserEmail(response.email)
      setIsLoginOpen(false)
      setLoginPassword('')
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Authentication failed.'
      setAuthError(message)
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Do local cleanup even if backend session already expired.
    }
    clearAuthToken()
    setUserName('')
    setUserEmail('')
    setIsProfileOpen(false)
  }

  const saveSettings = () => {
    localStorage.setItem('cogniflow_api_base', apiBaseUrl.trim() || 'http://127.0.0.1:8000')
    setIsSettingsOpen(false)
  }

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
              
              <button
                onClick={() => setIsSettingsOpen((prev) => !prev)}
                className="p-2 text-blue-400/70 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              {userName ? (
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg"
                  title={userName}
                >
                  {initials}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('login')
                    setAuthError('')
                    setIsLoginOpen(true)
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                >
                  Login
                </button>
              )}
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
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {userName || 'User'}</h2>
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

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-blue-900/40 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
            <label className="text-sm text-blue-200/80 block mb-2">Backend API URL</label>
            <input
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="w-full px-4 py-2 bg-slate-800 border border-blue-900/40 rounded-lg text-white text-sm mb-4 focus:outline-none focus:border-blue-500/60"
            />
            <p className="text-xs text-blue-300/60 mb-4">
              Save this value, then set the same URL in `ui/.env` as `VITE_API_BASE` and restart frontend.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-blue-100 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div className="fixed top-20 right-6 z-50">
          <div className="w-56 bg-slate-900 border border-blue-900/40 rounded-xl shadow-xl p-3">
            <div className="flex items-center gap-2 px-2 py-2 border-b border-blue-900/30 mb-2">
              <UserCircle className="w-5 h-5 text-blue-300" />
              <div className="text-sm">
                <p className="text-white font-medium">{userName}</p>
                <p className="text-blue-300/60 text-xs">{userEmail || 'Logged in'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-blue-900/40 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {authMode === 'login' ? 'Sign In' : 'Sign Up'}
              </h3>
              <button
                onClick={() => {
                  setAuthMode((prev) => (prev === 'login' ? 'signup' : 'login'))
                  setAuthError('')
                }}
                className="text-xs text-blue-300 hover:text-blue-200 underline underline-offset-4"
              >
                {authMode === 'login' ? 'Need an account?' : 'Have an account?'}
              </button>
            </div>
            <div className="space-y-3">
              {authMode === 'signup' && (
                <input
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-2 bg-slate-800 border border-blue-900/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/60"
                />
              )}
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2 bg-slate-800 border border-blue-900/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/60"
              />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 bg-slate-800 border border-blue-900/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/60"
              />
            </div>
            {authError && <p className="text-sm text-red-300 mt-3">{authError}</p>}
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setIsLoginOpen(false)}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-blue-100 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAuthSubmit}
                disabled={isAuthLoading}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {isAuthLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
