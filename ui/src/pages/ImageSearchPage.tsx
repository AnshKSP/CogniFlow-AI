import { Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { askIndexedContentQuestion, solveImageDirect, uploadImageForIndex } from '../services/api'
import type { ChatProvider, ResponseMode } from '../services/api'
import AnimatedButton from '../ui/AnimatedButton'
import Dropzone from '../ui/Dropzone'
import PageWrapper from '../ui/PageWrapper'

export default function ImageSearchPage() {
  const [file, setFile] = useState<File | null>(null)
  const [indexed, setIndexed] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [responseMode, setResponseMode] = useState<ResponseMode>('solve')
  const [provider, setProvider] = useState<ChatProvider>('local')
  const [apiKey, setApiKey] = useState('')

  const llmProvider: 'local' | 'api' = provider === 'api' || provider === 'external' ? 'api' : 'local'

  const onIndex = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setAnswer('')
    try {
      await uploadImageForIndex(file)
      setIndexed(true)
    } catch {
      setError('Image indexing failed. Please upload a valid PNG/JPG image.')
    } finally {
      setLoading(false)
    }
  }

  const onAsk = async () => {
    if (!question.trim()) return
    setLoading(true)
    setError('')
    try {
      if (!indexed && file) {
        const direct = await solveImageDirect(file, llmProvider, apiKey || undefined)
        setAnswer(direct.answer || direct.note || 'No answer generated from image.')
      } else {
        const result = await askIndexedContentQuestion({
          question: question.trim(),
          mode: responseMode,
          provider: llmProvider,
          api_key: llmProvider === 'api' ? apiKey || undefined : undefined
        })
        setAnswer(result)
      }
    } catch {
      setError('Image question answering failed. Make sure image is indexed first.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper theme="candy">
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-cyan-300/45 bg-gradient-to-br from-white/90 via-cyan-100/75 to-sky-100/70 p-5 shadow-[0_20px_56px_-28px_rgba(34,211,238,0.45)]">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Image OCR Search</h2>
            <p className="text-sm text-slate-600">
              Upload image, extract text via OCR, then ask natural-language questions.
            </p>
          </div>
          <Dropzone
            accept=".png,.jpg,.jpeg"
            title={file ? file.name : 'Upload image for OCR-based search'}
            subtitle="Supported: PNG, JPG, JPEG"
            onSelect={(selected) => {
              setFile(selected)
              setIndexed(false)
              setAnswer('')
              setError('')
            }}
          />

          <div className="grid gap-3 md:grid-cols-3">
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
            {llmProvider === 'api' ? (
              <input
                type="password"
                placeholder="API key"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                className="rounded-lg border border-slate-300/70 bg-white/80 px-3 py-2 text-sm text-slate-800"
              />
            ) : (
              <div className="rounded-lg border border-white/60 bg-white/65 px-3 py-2 text-xs text-slate-600">
                Using local model
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <AnimatedButton disabled={!file || loading} onClick={() => void onIndex()}>
              {loading ? 'Processing...' : indexed ? 'Re-index Image' : 'Index Image Text'}
            </AnimatedButton>
            {indexed && (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-200/40 px-3 py-1 text-xs text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Image text indexed
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-sky-300/45 bg-gradient-to-br from-white/90 via-sky-100/75 to-indigo-100/70 p-5 shadow-[0_20px_56px_-28px_rgba(56,189,248,0.4)]">
          <h3 className="text-sm font-semibold text-slate-800">Ask from Extracted Image Text</h3>
          <div className="flex gap-2">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void onAsk()
                }
              }}
              placeholder="What does this image text say about ...?"
              className="flex-1 rounded-xl border border-slate-300/70 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none focus:border-cyan-400/70"
            />
            <AnimatedButton disabled={loading || !question.trim() || !file} onClick={() => void onAsk()}>
              <Search className="h-4 w-4" />
            </AnimatedButton>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="min-h-[220px] rounded-xl border border-white/60 bg-white/65 p-4 text-sm text-slate-800">
            {answer ? answer : 'Answer will appear here after asking a question.'}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
