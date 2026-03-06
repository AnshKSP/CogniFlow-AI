import { motion } from 'framer-motion'
import { Loader2, Send, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { chatbotApi } from '../services/api'
import type { ChatMode, ChatProvider, ResponseMode } from '../services/api'
import AnimatedButton from '../ui/AnimatedButton'
import PageWrapper from '../ui/PageWrapper'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function renderMessageContent(content: string) {
  const lines = content.split('\n').map((line) => line.trimEnd())
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        if (!line.trim()) {
          return <div key={`sp-${index}`} className="h-2" />
        }

        const bulletMatch = line.match(/^[-*]\s+(.*)$/)
        const numberedMatch = line.match(/^\d+\.\s+(.*)$/)

        if (bulletMatch) {
          return (
            <div key={`b-${index}`} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500/90" />
              <p className="text-sm leading-relaxed">{bulletMatch[1]}</p>
            </div>
          )
        }

        if (numberedMatch) {
          const marker = line.split('.')[0]
          return (
            <div key={`n-${index}`} className="flex items-start gap-2">
              <span className="min-w-[1.25rem] text-sm font-medium text-sky-600">{marker}.</span>
              <p className="text-sm leading-relaxed">{numberedMatch[1]}</p>
            </div>
          )
        }

        return (
          <p key={`p-${index}`} className="text-sm leading-relaxed">
            {line}
          </p>
        )
      })}
    </div>
  )
}

export default function ChatbotPage() {
  const [mode, setMode] = useState<ChatMode>('general')
  const [responseMode, setResponseMode] = useState<ResponseMode>('solve')
  const [provider, setProvider] = useState<ChatProvider>('local')
  const [apiKey, setApiKey] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: 'Ready. Ask anything, or switch to PDF context mode.' }
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const onSend = async () => {
    if (!question.trim()) return
    setError('')
    const userMessage: Message = { id: `${Date.now()}-u`, role: 'user', content: question.trim() }
    setMessages((prev) => [...prev, userMessage])
    const q = question.trim()
    setQuestion('')
    setLoading(true)
    try {
      const response = await chatbotApi.sendMessage({
        message: q,
        mode,
        responseMode,
        provider,
        apiKey: provider === 'api' ? apiKey : undefined,
        pdfContext: mode === 'pdf' ? pdfFile : undefined
      })
      setMessages((prev) => [...prev, { id: `${Date.now()}-a`, role: 'assistant', content: response.response }])
    } catch (err: unknown) {
      setError('Chat request failed. Please verify API provider settings.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper theme="cosmic">
      <div className="rounded-2xl border border-indigo-300/45 bg-gradient-to-br from-white/90 via-indigo-100/75 to-sky-100/70 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as ChatMode)}
            className="rounded-lg border border-slate-300/70 bg-white/80 px-3 py-2 text-sm text-slate-800"
          >
            <option value="general">General</option>
            <option value="pdf">PDF</option>
          </select>
          <select
            value={responseMode}
            onChange={(event) => setResponseMode(event.target.value as ResponseMode)}
            className="rounded-lg border border-slate-300/70 bg-white/80 px-3 py-2 text-sm text-slate-800"
          >
            <option value="strict">Strict</option>
            <option value="solve">Solve</option>
          </select>
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value as ChatProvider)}
            className="rounded-lg border border-slate-300/70 bg-white/80 px-3 py-2 text-sm text-slate-800"
          >
            <option value="local">Local</option>
            <option value="api">API</option>
          </select>
          {provider === 'api' ? (
            <input
              type="password"
              placeholder="API key"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              className="rounded-lg border border-slate-300/70 bg-white/80 px-3 py-2 text-sm text-slate-800"
            />
          ) : (
            <div className="rounded-lg border border-white/60 bg-white/65 px-3 py-2 text-xs text-slate-600">
              Local provider selected
            </div>
          )}
        </div>
        {mode === 'pdf' && (
          <motion.label
            whileHover={{ y: -1, scale: 1.005 }}
            whileTap={{ scale: 0.99 }}
            className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-indigo-300/45 bg-white/45 px-3 py-2 text-xs text-slate-700 hover:bg-indigo-100/55"
          >
            <Upload className="h-3.5 w-3.5" />
            {pdfFile ? pdfFile.name : 'Upload PDF Context'}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(event) => setPdfFile(event.target.files?.[0] || null)}
            />
          </motion.label>
        )}
      </div>

      <div className="rounded-2xl border border-indigo-300/45 bg-gradient-to-br from-white/90 via-indigo-100/75 to-sky-100/70 p-4">
        <div className="h-[380px] space-y-3 overflow-y-auto pr-2">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'ml-auto bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 text-slate-900 shadow-lg shadow-fuchsia-300/35'
                  : 'border border-white/70 bg-white/75 text-slate-800 shadow-lg shadow-sky-200/35'
              }`}
            >
              <div className="break-words whitespace-pre-wrap">
                {renderMessageContent(message.content)}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-xs text-slate-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void onSend()
              }
            }}
            placeholder="Ask CogniFlow AI..."
            className="flex-1 rounded-xl border border-slate-300/70 bg-white/85 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400/70"
          />
          <AnimatedButton disabled={loading || !question.trim()} onClick={() => void onSend()}>
            <Send className="h-4 w-4" />
          </AnimatedButton>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </PageWrapper>
  )
}
