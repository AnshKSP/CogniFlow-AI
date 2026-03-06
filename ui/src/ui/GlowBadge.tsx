import { getMoodStyle } from './mood'

interface GlowBadgeProps {
  label: string
  mood: string
}

export default function GlowBadge({ label, mood }: GlowBadgeProps) {
  const style = getMoodStyle(mood)
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/65 px-3 py-1 text-xs font-medium text-slate-700 ${style.glow}`}>
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {label}
    </span>
  )
}
