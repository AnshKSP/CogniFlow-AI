import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE as string | undefined

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_BASE is not set. Defaulting to http://127.0.0.1:8000')
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://127.0.0.1:8000'
})

const METRICS_KEY = 'cogniflow_metrics'
const METRICS_EVENT = 'cogniflow-metrics-updated'
const AUTH_TOKEN_KEY = 'cogniflow_auth_token'

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

export interface DashboardMetrics {
  totalConversations: number
  videosProcessed: number
  aiAccuracyScore: number
}

export interface AuthUser {
  full_name: string
  email: string
}

export interface AuthResponse {
  token: string
  full_name: string
  email: string
}

interface BackendIndexStats {
  total_chunks: number
  unique_documents: number
}

interface StoredMetrics {
  totalConversations: number
  videosProcessed: number
  analyzedCount: number
  analyzedConfidenceSum: number
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

const readMetrics = (): StoredMetrics => {
  try {
    const raw = localStorage.getItem(METRICS_KEY)
    if (!raw) {
      return {
        totalConversations: 0,
        videosProcessed: 0,
        analyzedCount: 0,
        analyzedConfidenceSum: 0
      }
    }
    return JSON.parse(raw) as StoredMetrics
  } catch {
    return {
      totalConversations: 0,
      videosProcessed: 0,
      analyzedCount: 0,
      analyzedConfidenceSum: 0
    }
  }
}

const writeMetrics = (next: StoredMetrics) => {
  localStorage.setItem(METRICS_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(METRICS_EVENT))
}

const incrementConversation = () => {
  const metrics = readMetrics()
  metrics.totalConversations += 1
  writeMetrics(metrics)
}

const incrementVideos = () => {
  const metrics = readMetrics()
  metrics.videosProcessed += 1
  writeMetrics(metrics)
}

const addAnalysisConfidence = (confidencePercent: number) => {
  const metrics = readMetrics()
  metrics.analyzedCount += 1
  metrics.analyzedConfidenceSum += confidencePercent
  writeMetrics(metrics)
}

export const getDashboardMetrics = (): DashboardMetrics => {
  const metrics = readMetrics()
  const aiAccuracyScore = metrics.analyzedCount
    ? metrics.analyzedConfidenceSum / metrics.analyzedCount
    : 0

  return {
    totalConversations: metrics.totalConversations,
    videosProcessed: metrics.videosProcessed,
    aiAccuracyScore
  }
}

export const getMetricsEventName = () => METRICS_EVENT

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY) || ''

export const setAuthToken = (token: string) => {
  if (!token) return
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

const authHeaders = () => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getIndexStats = async (): Promise<BackendIndexStats> => {
  const { data } = await apiClient.get<BackendIndexStats>('/index-stats')
  return data
}

export const signup = async (full_name: string, email: string, password: string): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/signup', { full_name, email, password })
  return data
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export const getCurrentUser = async (): Promise<AuthUser> => {
  const { data } = await apiClient.get<AuthUser>('/auth/me', { headers: authHeaders() })
  return data
}

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout', {}, { headers: authHeaders() })
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

export const analyzeYouTubeVideo = async (url: string): Promise<VideoUploadResponse> => {
  const encoded = encodeURIComponent(url)
  const { data } = await apiClient.post<VideoUploadResponse>(`/video/youtube?url=${encoded}`)
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
    incrementConversation()
    return { response: data.answer }
  }

  const chatRequest: BackendChatRequest = {
    message: payload.question,
    llm_type: normalizeProvider(payload.provider),
    api_key: payload.api_key
  }

  const { data } = await apiClient.post<ChatResponse>('/chat', chatRequest)
  incrementConversation()
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
      incrementVideos()
      addAnalysisConfidence(confidence)

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
      addAnalysisConfidence(confidence)

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
    addAnalysisConfidence(confidence)

    return {
      dominantMood: data.dominant_mood,
      intensity: inferIntensity(confidence),
      confidence,
      emotionalArc: data.emotional_arc.map((point) => Math.round((point.confidence ?? 0) * 100)),
      emotions: buildEmotionBreakdown(data.dominant_mood, confidence)
    }
  }
  ,
  async analyzeYouTube(url: string) {
    const data = await analyzeYouTubeVideo(url)
    const confidence = Math.round((data.confidence ?? 0) * 100)
    incrementVideos()
    addAnalysisConfidence(confidence)

    return {
      dominantMood: data.audio_emotion.dominant_mood,
      intensity: inferIntensity(confidence),
      confidence,
      emotionalArc: mapAudioArcToIntensitySeries(data.audio_emotion.emotional_arc),
      emotions: buildEmotionBreakdown(data.audio_emotion.dominant_mood, confidence)
    }
  }
}
