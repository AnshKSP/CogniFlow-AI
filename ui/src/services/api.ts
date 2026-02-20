import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE as string | undefined

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_BASE is not set. Defaulting to http://127.0.0.1:8000')
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://127.0.0.1:8000'
})

export type ChatMode = 'general' | 'pdf'
export type ResponseMode = 'strict' | 'solve'
export type ChatProvider = 'local' | 'external'

export interface ChatPayload {
  question: string
  mode: ChatMode
  response_mode: ResponseMode
  provider: ChatProvider
  api_key?: string
}

export interface ChatResponse {
  response: string
}

export interface ScriptAnalysisResponse {
  emotion_label: string
  dominant_mood: string
  confidence: number
  emotional_arc: any[]
  emotion_summary: string
}

export interface VideoUploadResponse {
  language_detected: string
  confidence: number | null
  transcript_preview: string
  audio_emotion: {
    dominant_mood: string
    emotional_arc: { start: number; end: number; mood: string }[]
  }
  script_emotion: {
    dominant_mood: string
    emotional_arc: { start: number; end: number; mood: string }[]
  }
}

export interface PdfAnalysisResponse extends ScriptAnalysisResponse {
  script_preview?: string
}

interface BackendChatRequest {
  message: string
  llm_type: 'local' | 'api'
  api_key?: string
}

interface BackendRagRequest {
  question: string
  mode: ResponseMode
  llm_type: 'local' | 'api'
  api_key?: string
}

const mapAudioArcToIntensitySeries = (
  arc: { start: number; end: number; mood: string }[]
): number[] => {
  const moodToValue: Record<string, number> = {
    intense: 95,
    energetic: 85,
    dramatic: 80,
    dark: 70,
    calm: 40,
    neutral: 50
  }

  return arc.map((entry) => moodToValue[entry.mood] ?? 50)
}

const normalizeProvider = (provider: ChatProvider): 'local' | 'api' =>
  provider === 'external' ? 'api' : 'local'

export const analyzeScript = async (text: string): Promise<ScriptAnalysisResponse> => {
  const { data } = await apiClient.post<ScriptAnalysisResponse>('/script/analyze', { text })
  return data
}

export const uploadVideo = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await apiClient.post<VideoUploadResponse>('/video/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return data
}

export const uploadPDF = async (file: File): Promise<PdfAnalysisResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await apiClient.post<PdfAnalysisResponse>('/script/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return data
}

export const generateReport = async (text: string): Promise<Blob> => {
  const response = await apiClient.post('/script/generate-report', { text }, { responseType: 'blob' })
  return response.data as Blob
}

export const uploadPdfReport = async (file: File): Promise<Blob> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post('/script/upload-pdf-report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob'
  })

  return response.data as Blob
}

export const sendChat = async (payload: ChatPayload): Promise<ChatResponse> => {
  if (payload.mode === 'pdf') {
    const ragRequest: BackendRagRequest = {
      question: payload.question,
      mode: payload.response_mode,
      llm_type: normalizeProvider(payload.provider),
      api_key: payload.api_key
    }

    const { data } = await apiClient.post<{ answer: string }>('/rag-query', ragRequest)
    return { response: data.answer }
  }

  const chatRequest: BackendChatRequest = {
    message: payload.question,
    llm_type: normalizeProvider(payload.provider),
    api_key: payload.api_key
  }

  const { data } = await apiClient.post<ChatResponse>('/chat', chatRequest)
  return data
}

export const uploadChatPDF = async (file: File): Promise<void> => {
  const formData = new FormData()
  formData.append('file', file)

  await apiClient.post('/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

const inferIntensity = (confidencePercent: number): string => {
  if (confidencePercent >= 80) return 'High'
  if (confidencePercent >= 60) return 'Medium'
  return 'Low'
}

const buildEmotionBreakdown = (
  dominantMood: string,
  confidencePercent: number
): { name: string; value: number; color: string }[] => {
  const dominant = Math.max(20, Math.min(95, Math.round(confidencePercent)))
  const secondary = Math.max(5, Math.round((100 - dominant) * 0.6))
  const tertiary = Math.max(5, 100 - dominant - secondary)

  return [
    { name: dominantMood, value: dominant, color: '#3b82f6' },
    { name: 'Secondary', value: secondary, color: '#8b5cf6' },
    { name: 'Residual', value: tertiary, color: '#22c55e' }
  ]
}

export const chatbotApi = {
  async sendMessage(input: {
    message: string
    mode: ChatMode
    responseMode: ResponseMode
    provider: ChatProvider
    apiKey?: string
    pdfContext?: File | null
  }): Promise<ChatResponse> {
    if (input.mode === 'pdf' && input.pdfContext) {
      await uploadChatPDF(input.pdfContext)
    }

    return sendChat({
      question: input.message,
      mode: input.mode,
      response_mode: input.responseMode,
      provider: input.provider,
      api_key: input.apiKey
    })
  }
}

export const emotionApi = {
  async analyze(file: File, type: 'video' | 'script' | 'pdf') {
    if (type === 'video') {
      const data = await uploadVideo(file)
      const confidence = Math.round((data.confidence ?? 0) * 100)

      return {
        dominantMood: data.audio_emotion.dominant_mood,
        intensity: inferIntensity(confidence),
        confidence,
        emotionalArc: mapAudioArcToIntensitySeries(data.audio_emotion.emotional_arc),
        emotions: buildEmotionBreakdown(data.audio_emotion.dominant_mood, confidence)
      }
    }

    if (type === 'pdf') {
      const data = await uploadPDF(file)
      const confidence = Math.round(data.confidence * 100)

      return {
        dominantMood: data.dominant_mood,
        intensity: inferIntensity(confidence),
        confidence,
        emotionalArc: data.emotional_arc.map((point) => Math.round((point.confidence ?? 0) * 100)),
        emotions: buildEmotionBreakdown(data.dominant_mood, confidence)
      }
    }

    const scriptText = await file.text()
    if (!scriptText.trim()) {
      throw new Error('Script file is empty.')
    }

    const data = await analyzeScript(scriptText)
    const confidence = Math.round(data.confidence * 100)

    return {
      dominantMood: data.dominant_mood,
      intensity: inferIntensity(confidence),
      confidence,
      emotionalArc: data.emotional_arc.map((point) => Math.round((point.confidence ?? 0) * 100)),
      emotions: buildEmotionBreakdown(data.dominant_mood, confidence)
    }
  }
}
