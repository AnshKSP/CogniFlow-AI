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
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7f95a7]" />
              <p className="text-sm leading-relaxed">{bulletMatch[1]}</p>
            </div>
          )
        }

        if (numberedMatch) {
          const marker = line.split('.')[0]
          return (
            <div key={`n-${index}`} className="flex items-start gap-2">
              <span className="min-w-[1.25rem] text-sm font-medium text-[#6f879b]">{marker}.</span>
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

const selectClassName =
  'w-full rounded-[1.1rem] border border-[#d4dde4] bg-[#f8f5ee] px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#afbfcc] focus:ring-2 focus:ring-[#dce4ea]'

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
    } catch {
      setError('Chat request failed. Please verify API provider settings.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper theme="cosmic">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[2.2rem] border border-[#d2dbe3] bg-[linear-gradient(135deg,#eef2f5_0%,#e2e8ee_44%,#f5f1ea_100%)] p-5 shadow-[0_26px_60px_-42px_rgba(82,94,104,0.3)] sm:p-7"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Conversational core</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-800 sm:text-[2.6rem]">
            A cleaner chat workspace for live questions, PDF context, and guided answers.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Switch between general reasoning and document-grounded chat without leaving the page. The layout is calmer,
            more structured, and built around the conversation itself.
          </p>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-[#d4dde4] bg-[linear-gradient(180deg,#f8f6ef_0%,#eef1f4_100%)] p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.26)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Control deck</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-800">Tune the assistant</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Choose the conversation mode, reasoning style, and provider before sending a prompt.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Mode</label>
              <select value={mode} onChange={(event) => setMode(event.target.value as ChatMode)} className={selectClassName}>
                <option value="general">General</option>
                <option value="pdf">PDF context</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Response style</label>
              <select
                value={responseMode}
                onChange={(event) => setResponseMode(event.target.value as ResponseMode)}
                className={selectClassName}
              >
                <option value="strict">Strict</option>
                <option value="solve">Solve</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Provider</label>
              <select
                value={provider}
                onChange={(event) => setProvider(event.target.value as ChatProvider)}
                className={selectClassName}
              >
                <option value="local">Local</option>
                <option value="api">API</option>
              </select>
            </div>

            {provider === 'api' ? (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">API key</label>
                <input
                  type="password"
                  placeholder="Enter API key"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  className={selectClassName}
                />
              </div>
            ) : (
              <div className="rounded-[1.4rem] border border-[#d7dfe5] bg-[#f7f4ed] p-3 text-sm text-slate-600">
                Running with the local provider.
              </div>
            )}

            {mode === 'pdf' ? (
              <motion.label
                whileHover={{ y: -1, scale: 1.005 }}
                whileTap={{ scale: 0.99 }}
                className="flex cursor-pointer items-center gap-3 rounded-[1.4rem] border border-dashed border-[#c7d2dd] bg-[#f5f1e9] px-4 py-3 text-sm text-slate-700"
              >
                <Upload className="h-4 w-4" />
                <div>
                  <p className="font-medium">{pdfFile ? pdfFile.name : 'Upload PDF context'}</p>
                  <p className="text-xs text-slate-500">The assistant will index this file before answering.</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(event) => setPdfFile(event.target.files?.[0] || null)}
                />
              </motion.label>
            ) : null}
          </div>
        </motion.aside>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-[#d6dfe5] bg-[linear-gradient(180deg,#faf6ef_0%,#edf2f5_100%)] p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.26)]"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Conversation stage</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-800">Ask the assistant</h3>
            </div>
            <div className="rounded-full border border-[#d6dfe5] bg-[#f8f5ee] px-3 py-1.5 text-xs font-medium text-slate-600">
              {messages.length - 1} message{messages.length - 1 === 1 ? '' : 's'}
            </div>
          </div>

          <div className="h-[420px] space-y-3 overflow-y-auto rounded-[1.6rem] border border-[#d8d1c5] bg-[#f8f4ed] p-4 pr-3">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[88%] rounded-[1.5rem] px-4 py-3 ${
                  message.role === 'user'
                    ? 'ml-auto border border-[#cbd8e2] bg-[#e9eff4] text-slate-800'
                    : 'border border-[#ddd5c9] bg-[#fbf7ef] text-slate-800'
                }`}
              >
                <div className="break-words whitespace-pre-wrap">{renderMessageContent(message.content)}</div>
              </motion.div>
            ))}
            {loading ? (
              <div className="inline-flex items-center gap-2 rounded-[1.2rem] border border-[#d8d1c5] bg-[#fbf7ef] px-3 py-2 text-xs text-slate-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Thinking...
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <div className="mt-4 rounded-[1.8rem] border border-[#d7d0c4] bg-[#f9f5ee] p-3">
            <div className="flex flex-col gap-3 sm:flex-row">
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
                className="min-h-[52px] flex-1 rounded-[1.3rem] border border-[#d4dde4] bg-[#fcf8f1] px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-500 focus:border-[#afbfcc]"
              />
              <AnimatedButton disabled={loading || !question.trim()} onClick={() => void onSend()}>
                <Send className="h-4 w-4" />
              </AnimatedButton>
            </div>
            {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
          </div>
        </motion.section>
      </div>
    </PageWrapper>
  )
}
