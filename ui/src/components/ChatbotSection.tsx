import { useState, useRef, useEffect } from 'react'
import { Send, Upload, Bot, User, Loader2, CheckCircle } from 'lucide-react'
import { chatbotApi } from '../services/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatbotSectionProps {
  fullHeight?: boolean
}

export default function ChatbotSection({ fullHeight = false }: ChatbotSectionProps) {
  const [chatMode, setChatMode] = useState<'general' | 'pdf'>('general')
  const [responseMode, setResponseMode] = useState<'strict' | 'solve'>('solve')
  const [llmProvider, setLLMProvider] = useState<'local' | 'external'>('local')
  const [apiKey, setApiKey] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await chatbotApi.sendMessage({
        message: input,
        mode: chatMode,
        responseMode,
        provider: llmProvider,
        apiKey: llmProvider === 'external' ? apiKey : undefined,
        pdfContext: pdfFile
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
    }
  }

  return (
    <div className={`bg-slate-900/40 backdrop-blur-xl border border-blue-900/30 rounded-2xl overflow-hidden ${fullHeight ? 'h-[calc(100vh-220px)]' : 'h-[600px]'} flex flex-col`}>
      {/* Control Panel */}
      <div className="border-b border-blue-900/30 p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Chat Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-300/60 font-medium uppercase tracking-wider">Chat Mode</span>
            <div className="flex bg-slate-800/80 rounded-lg p-1">
              <button
                onClick={() => setChatMode('general')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  chatMode === 'general'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-300/70 hover:text-white'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setChatMode('pdf')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  chatMode === 'pdf'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-300/70 hover:text-white'
                }`}
              >
                PDF Context
              </button>
            </div>
          </div>

          {/* Response Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-300/60 font-medium uppercase tracking-wider">Response</span>
            <div className="flex bg-slate-800/80 rounded-lg p-1">
              <button
                onClick={() => setResponseMode('strict')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  responseMode === 'strict'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-300/70 hover:text-white'
                }`}
              >
                Strict
              </button>
              <button
                onClick={() => setResponseMode('solve')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  responseMode === 'solve'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-300/70 hover:text-white'
                }`}
              >
                Solve
              </button>
            </div>
          </div>

          {/* LLM Provider Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-300/60 font-medium uppercase tracking-wider">Provider</span>
            <div className="flex bg-slate-800/80 rounded-lg p-1">
              <button
                onClick={() => setLLMProvider('local')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  llmProvider === 'local'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-300/70 hover:text-white'
                }`}
              >
                Local
              </button>
              <button
                onClick={() => setLLMProvider('external')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  llmProvider === 'external'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-300/70 hover:text-white'
                }`}
              >
                External API
              </button>
            </div>
          </div>
        </div>

        {/* Conditional Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          {llmProvider === 'external' && (
            <div className="flex-1 min-w-[200px]">
              <input
                type="password"
                placeholder="Enter API Key (encrypted)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/80 border border-blue-900/30 rounded-lg text-sm text-white placeholder-blue-400/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          {chatMode === 'pdf' && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-dashed border-blue-500/40 rounded-lg cursor-pointer hover:border-blue-500/60 hover:bg-slate-800 transition-all">
                <Upload className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">
                  {pdfFile ? pdfFile.name : 'Upload PDF'}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
              {pdfFile && (
                <div className="flex items-center gap-1 text-emerald-400 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Ready
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                : 'bg-gradient-to-br from-cyan-500 to-blue-600'
            }`}>
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`max-w-[80%] ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}>
              <div className={`px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-md'
                  : 'bg-slate-800/80 border border-blue-900/30 text-blue-100 rounded-bl-md'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className={`text-xs text-blue-400/50 mt-1 ${
                message.role === 'user' ? 'text-right' : ''
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-800/80 border border-blue-900/30 rounded-bl-md">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-blue-900/30 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-3 bg-slate-800/80 border border-blue-900/30 rounded-xl text-white placeholder-blue-400/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  )
}