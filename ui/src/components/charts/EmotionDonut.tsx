interface EmotionDonutProps {
  distribution: Array<{ mood: string; value: number }>
}

const palette = ['#f97316', '#ef4444', '#a855f7', '#3b82f6', '#14b8a6', '#94a3b8']

export default function EmotionDonut({ distribution }: EmotionDonutProps) {
  const total = distribution.reduce((acc, item) => acc + item.value, 0)
  if (total === 0) {
    return (
      <div className="rounded-2xl border border-indigo-300/45 bg-gradient-to-br from-white/90 via-indigo-100/75 to-sky-100/70 p-4 shadow-xl shadow-indigo-300/25">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Mood Distribution</h3>
        <p className="text-xs text-slate-600">Distribution appears after analysis.</p>
      </div>
    )
  }

  let offset = 0
  const gradient = distribution
    .map((item, index) => {
      const portion = (item.value / total) * 100
      const start = offset
      const end = offset + portion
      offset = end
      return `${palette[index % palette.length]} ${start}% ${end}%`
    })
    .join(', ')

  return (
    <div className="rounded-2xl border border-indigo-300/45 bg-gradient-to-br from-white/90 via-indigo-100/75 to-sky-100/70 p-4 shadow-xl shadow-indigo-300/25">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">Mood Distribution</h3>
      <div className="flex items-center gap-4">
        <div
          className="relative h-28 w-28 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="absolute inset-4 rounded-full bg-white/90" />
        </div>
        <div className="space-y-2 text-xs text-slate-700">
          {distribution.map((item, index) => (
            <div key={`${item.mood}-${index}`} className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
              <span className="capitalize">{item.mood}</span>
              <span className="text-slate-500">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
