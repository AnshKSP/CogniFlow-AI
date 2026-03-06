export type MoodKey = 'energetic' | 'intense' | 'dark' | 'calm' | 'dramatic' | 'neutral'

const MOOD_STYLES: Record<MoodKey, { glow: string; ring: string; dot: string }> = {
  energetic: {
    glow: 'shadow-[0_0_35px_rgba(251,146,60,0.35)]',
    ring: 'ring-orange-400/40',
    dot: 'bg-orange-400'
  },
  intense: {
    glow: 'shadow-[0_0_35px_rgba(248,113,113,0.35)]',
    ring: 'ring-red-400/40',
    dot: 'bg-red-400'
  },
  dark: {
    glow: 'shadow-[0_0_35px_rgba(168,85,247,0.35)]',
    ring: 'ring-purple-400/40',
    dot: 'bg-purple-400'
  },
  calm: {
    glow: 'shadow-[0_0_35px_rgba(96,165,250,0.35)]',
    ring: 'ring-blue-400/40',
    dot: 'bg-blue-400'
  },
  dramatic: {
    glow: 'shadow-[0_0_35px_rgba(45,212,191,0.35)]',
    ring: 'ring-teal-400/40',
    dot: 'bg-teal-400'
  },
  neutral: {
    glow: 'shadow-[0_0_25px_rgba(148,163,184,0.25)]',
    ring: 'ring-slate-400/30',
    dot: 'bg-slate-400'
  }
}

export const normalizeMood = (mood: string): MoodKey => {
  const value = mood.trim().toLowerCase()
  if (value in MOOD_STYLES) return value as MoodKey
  return 'neutral'
}

export const getMoodStyle = (mood: string) => MOOD_STYLES[normalizeMood(mood)]

