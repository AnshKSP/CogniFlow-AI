import { Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { askIndexedContentQuestion, solveImageDirect, uploadImageForIndex } from '../services/api'
import type { ChatProvider, ResponseMode } from '../services/api'
import AnimatedButton from '../ui/AnimatedButton'
import Dropzone from '../ui/Dropzone'
import PageWrapper from '../ui/PageWrapper'

const controlClassName =
  'w-full rounded-[1.1rem] border border-[#ddd4c7] bg-[#fcf7ef] px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#d0bb9f]'

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
      <section className="rounded-[2.2rem] border border-[#e1d4c6] bg-[linear-gradient(135deg,#f5ecdf_0%,#efdfcb_42%,#faf5eb_100%)] p-5 shadow-[0_26px_60px_-42px_rgba(82,94,104,0.28)] sm:p-7">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Image search</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-800 sm:text-[2.6rem]">
            OCR-driven search in a warmer workspace that keeps the flow simple.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Upload a screenshot or document image, extract the text, then ask questions against the indexed content.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-[2rem] border border-[#dfd3c5] bg-[linear-gradient(180deg,#faf6ef_0%,#f2ebe0_100%)] p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.26)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">OCR intake</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-800">Index image text</h3>
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
            <select value={responseMode} onChange={(event) => setResponseMode(event.target.value as ResponseMode)} className={controlClassName}>
              <option value="strict">Strict</option>
              <option value="solve">Solve</option>
            </select>
            <select value={provider} onChange={(event) => setProvider(event.target.value as ChatProvider)} className={controlClassName}>
              <option value="local">Local</option>
              <option value="api">API</option>
            </select>
            {llmProvider === 'api' ? (
              <input
                type="password"
                placeholder="API key"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                className={controlClassName}
              />
            ) : (
              <div className="rounded-[1.1rem] border border-[#e0d5c8] bg-[#f7f1e8] px-3 py-2.5 text-xs text-slate-600">Using local model</div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <AnimatedButton disabled={!file || loading} onClick={() => void onIndex()}>
              {loading ? 'Processing...' : indexed ? 'Re-index Image' : 'Index Image Text'}
            </AnimatedButton>
            {indexed ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d7ddcf] bg-[#eff4ea] px-3 py-1 text-xs text-slate-700">
                <Sparkles className="h-3.5 w-3.5" />
                Image text indexed
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-4 rounded-[2rem] border border-[#dccfc3] bg-[linear-gradient(180deg,#faf6ef_0%,#f1eadf_100%)] p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.26)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Query lane</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-800">Ask from extracted text</h3>
          </div>
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
              className="flex-1 rounded-[1.3rem] border border-[#ddd4c7] bg-[#fcf7ef] px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#d0bb9f]"
            />
            <AnimatedButton disabled={loading || !question.trim() || !file} onClick={() => void onAsk()}>
              <Search className="h-4 w-4" />
            </AnimatedButton>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="min-h-[280px] rounded-[1.6rem] border border-[#dfd3c5] bg-[#fdf8f1] p-4 text-sm leading-7 text-slate-800">
            {answer ? answer : 'Answer will appear here after asking a question.'}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
