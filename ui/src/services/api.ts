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
export type ChatProvider = 'local' | 'api' | 'external'

export interface ChatPayload {
  question: string
  mode: ChatMode
  response_mode: ResponseMode
  provider: 'local' | 'api'
  api_key?: string
}

export interface ChatResponse {
  response: string
}

export interface MovieRecommendation {
  title: string
  year?: number
  release_date?: string
  genres?: string[]
  genre?: string
  description?: string
  poster?: string
  director?: string
  cast?: string[]
  runtime?: string
  language?: string
  certificate?: string
  rating?: number
  where_to_watch?: string[]
  availability_note?: string
}

export interface RecommendationFilters {
  dominant_genre?: string
  mood?: string
  intensity?: string
  energy_level?: string
  industry_preference?: string
}

export interface EmotionArcPoint {
  start: number
  end: number
  mood: string
  confidence?: number
  text?: string
}

export interface EmotionTopEntry {
  emotion: string
  score: number
}

export interface EmotionAnalysisResult {
  dominant_mood: string
  intensity_level: string
  confidence: number
  emotional_arc: EmotionArcPoint[]
  recommendations: MovieRecommendation[]
  emotion_label?: string
  emotion_summary?: string
  script_preview?: string
  top_emotions?: EmotionTopEntry[]
  dominance_gap?: number
}

export interface ImageSearchResult {
  indexed: boolean
  answer?: string
  note?: string
}

export interface VideoUploadResponse {
  language_detected?: string
  confidence?: number | null
  top_emotions?: EmotionTopEntry[]
  dominance_gap?: number | null
  transcript_preview?: string
  audio_emotion?: {
    dominant_mood?: string
    emotional_arc?: EmotionArcPoint[]
  }
  script_emotion?: {
    emotion_label?: string
    confidence?: number | null
    top_emotions?: EmotionTopEntry[]
    dominance_gap?: number | null
    dominant_mood?: string
    emotional_arc?: EmotionArcPoint[]
  }
  dominant_mood?: string
  intensity_level?: string
  emotional_arc?: EmotionArcPoint[]
  recommendations?: MovieRecommendation[]
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

const normalizeProvider = (provider: ChatProvider): 'local' | 'api' =>
  provider === 'api' || provider === 'external' ? 'api' : 'local'

const normalizeConfidence = (value: unknown): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return value <= 1 ? Math.round(value * 100) : Math.round(value)
}

const normalizeMoodLabel = (raw: unknown): string => {
  const value = String(raw || 'neutral').toLowerCase().trim()

  const emotionToMood: Record<string, string> = {
    joy: 'energetic',
    anger: 'intense',
    sadness: 'dark',
    fear: 'dramatic',
    surprise: 'dramatic',
    disgust: 'dark',
    neutral: 'calm'
  }

  if (value in emotionToMood) return emotionToMood[value]
  return value || 'calm'
}

const normalizeArc = (rawArc: unknown): EmotionArcPoint[] => {
  if (!Array.isArray(rawArc)) return []

  return rawArc.map((entry, index) => {
    const item = (entry || {}) as Record<string, unknown>
    const start = typeof item.start === 'number' ? item.start : index * 2
    const end = typeof item.end === 'number' ? item.end : start + 2
    const moodRaw = item.mood ?? item.emotion ?? 'neutral'
    const text = typeof item.text === 'string' ? item.text : undefined
    const confidence = normalizeConfidence(item.confidence)

    return {
      start,
      end,
      mood: normalizeMoodLabel(moodRaw),
      confidence,
      text
    }
  })
}

const inferIntensity = (confidencePercent: number): string => {
  if (confidencePercent >= 80) return 'high'
  if (confidencePercent >= 60) return 'medium'
  return 'low'
}

const normalizeTopEmotions = (raw: unknown): EmotionTopEntry[] => {
  if (!Array.isArray(raw)) return []
  return raw
    .map((entry) => {
      const item = (entry || {}) as Record<string, unknown>
      return {
        emotion: String(item.emotion || item.label || 'neutral').toLowerCase(),
        score: normalizeConfidence(item.score)
      }
    })
    .filter((entry) => entry.score > 0)
    .slice(0, 3)
}

const mapVideoResponse = (data: VideoUploadResponse): EmotionAnalysisResult => {
  const arc = normalizeArc(data.emotional_arc || data.audio_emotion?.emotional_arc || [])
  const dominantMood = data.dominant_mood || data.audio_emotion?.dominant_mood || data.script_emotion?.dominant_mood || 'calm'
  const confidence = normalizeConfidence(data.confidence ?? 0)
  const topEmotions = normalizeTopEmotions(data.top_emotions || data.script_emotion?.top_emotions || [])
  const dominanceGap = normalizeConfidence(data.dominance_gap ?? data.script_emotion?.dominance_gap ?? 0)

  return {
    dominant_mood: dominantMood,
    intensity_level: data.intensity_level || inferIntensity(confidence),
    confidence,
    emotional_arc: arc,
    recommendations: data.recommendations || [],
    top_emotions: topEmotions,
    dominance_gap: dominanceGap
  }
}

const mapGenericResponse = (data: Record<string, unknown>): EmotionAnalysisResult => {
  const confidence = normalizeConfidence(data.confidence)
  const arc = normalizeArc(data.emotional_arc)
  const recommendations = Array.isArray(data.recommendations) ? (data.recommendations as MovieRecommendation[]) : []
  const topEmotions = normalizeTopEmotions(data.top_emotions)
  const dominanceGap = normalizeConfidence(data.dominance_gap)

  return {
    dominant_mood: String(data.dominant_mood || data.emotion_label || 'calm'),
    intensity_level: String(data.intensity_level || inferIntensity(confidence)),
    confidence,
    emotional_arc: arc,
    recommendations,
    emotion_label: typeof data.emotion_label === 'string' ? data.emotion_label : undefined,
    emotion_summary: typeof data.emotion_summary === 'string' ? data.emotion_summary : undefined,
    script_preview: typeof data.script_preview === 'string' ? data.script_preview : undefined,
    top_emotions: topEmotions,
    dominance_gap: dominanceGap
  }
}

export const recommendMovies = async (input: {
  dominant_mood: string
  intensity_level: string
}): Promise<MovieRecommendation[]> => {
  try {
    const { data } = await apiClient.post<{ recommendations?: MovieRecommendation[] }>('/recommend', {
      mood: input.dominant_mood,
      intensity: input.intensity_level
    })
    return data.recommendations || []
  } catch {
    return []
  }
}

export const recommendMoviesByFilters = async (filters: RecommendationFilters): Promise<MovieRecommendation[]> => {
  const payload: RecommendationFilters = {
    dominant_genre: filters.dominant_genre || undefined,
    mood: filters.mood || undefined,
    intensity: filters.intensity || undefined,
    energy_level: filters.energy_level || undefined,
    industry_preference: filters.industry_preference || undefined
  }

  const { data } = await apiClient.post<{ recommendations?: MovieRecommendation[] }>('/recommend', payload)
  return data.recommendations || []
}

const withRecommendations = async (result: EmotionAnalysisResult): Promise<EmotionAnalysisResult> => {
  if (result.recommendations.length > 0) return result
  const recommendations = await recommendMovies({
    dominant_mood: result.dominant_mood,
    intensity_level: result.intensity_level
  })
  return { ...result, recommendations }
}

export const analyzeVideo = async (file: File): Promise<EmotionAnalysisResult> => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post<VideoUploadResponse>('/video/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return withRecommendations(mapVideoResponse(data))
}

export const analyzeYouTubeVideo = async (url: string): Promise<EmotionAnalysisResult> => {
  const { data } = await apiClient.post<VideoUploadResponse>('/video/youtube', null, {
    params: { url }
  })
  return withRecommendations(mapVideoResponse(data))
}

export const uploadVideoReport = async (file: File): Promise<Blob> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post('/video/upload-report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob'
  })

  return response.data as Blob
}

export const youtubeVideoReport = async (url: string): Promise<Blob> => {
  const response = await apiClient.post('/video/youtube-report', null, {
    params: { url },
    responseType: 'blob'
  })

  return response.data as Blob
}

export const analyzeScript = async (text: string): Promise<EmotionAnalysisResult> => {
  const { data } = await apiClient.post<Record<string, unknown>>('/script/analyze', { text })
  return withRecommendations(mapGenericResponse(data))
}

export const analyzePdf = async (file: File): Promise<EmotionAnalysisResult> => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post<Record<string, unknown>>('/script/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return withRecommendations(mapGenericResponse(data))
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
      llm_type: payload.provider,
      api_key: payload.api_key
    }

    const { data } = await apiClient.post<{ answer: string }>('/rag-query', ragRequest)
    return { response: data.answer }
  }

  const chatRequest: BackendChatRequest = {
    message: payload.question,
    llm_type: payload.provider,
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

export const uploadImageForIndex = async (file: File): Promise<ImageSearchResult> => {
  const formData = new FormData()
  formData.append('file', file)
  await apiClient.post('/upload-image?mode=index&llm_type=local', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return { indexed: true }
}

export const solveImageDirect = async (file: File, provider: 'local' | 'api', apiKey?: string): Promise<ImageSearchResult> => {
  const formData = new FormData()
  formData.append('file', file)
  const apiQuery = apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : ''
  const { data } = await apiClient.post<{ answer?: string; note?: string }>(
    `/upload-image?mode=solve&llm_type=${provider}${apiQuery}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return { indexed: false, answer: data.answer, note: data.note }
}

export const askIndexedContentQuestion = async (input: {
  question: string
  mode: ResponseMode
  provider: 'local' | 'api'
  api_key?: string
}): Promise<string> => {
  const { data } = await apiClient.post<{ answer: string }>('/rag-query', {
    question: input.question,
    mode: input.mode,
    llm_type: input.provider,
    api_key: input.api_key
  })
  return data.answer
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
      provider: normalizeProvider(input.provider),
      api_key: input.apiKey
    })
  }
}
