interface EmotionDonutProps {
  distribution: Array<{ mood: string; value: number }>
}

const palette = ['#c8a892', '#b98f8c', '#b8b2d4', '#a9bdcd', '#b8ccb8', '#aeb7c1']

export default function EmotionDonut({ distribution }: EmotionDonutProps) {
  const total = distribution.reduce((acc, item) => acc + item.value, 0)
  if (total === 0) {
    return (
      <div className="rounded-[2rem] border border-[#d8d1c5] bg-[linear-gradient(180deg,#faf6ef_0%,#eef2f5_100%)] p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.24)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Distribution</p>
        <h3 className="mt-1 mb-3 text-xl font-semibold text-slate-800">Mood Distribution</h3>
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
    <div className="rounded-[2rem] border border-[#d8d1c5] bg-[linear-gradient(180deg,#faf6ef_0%,#eef2f5_100%)] p-5 shadow-[0_22px_50px_-40px_rgba(82,94,104,0.24)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Distribution</p>
      <h3 className="mt-1 mb-4 text-xl font-semibold text-slate-800">Mood Distribution</h3>
      <div className="flex items-center gap-4">
        <div
          className="relative h-28 w-28 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="absolute inset-4 rounded-full bg-[#faf5ee]" />
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
