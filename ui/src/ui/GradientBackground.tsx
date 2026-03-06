import type { ReactNode } from 'react'
import Floating3DObjects from './Floating3DObjects'

interface GradientBackgroundProps {
  children: ReactNode
}

export default function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-100 via-indigo-100 to-rose-100 text-slate-800">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-[24rem] w-[24rem] rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute top-[15%] -right-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-[28%] h-[22rem] w-[22rem] rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute bottom-[20%] left-[60%] h-[20rem] w-[20rem] rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(255,255,255,0.9),transparent_26%),radial-gradient(circle_at_88%_8%,rgba(255,255,255,0.65),transparent_22%),radial-gradient(circle_at_55%_90%,rgba(255,255,255,0.55),transparent_28%)]" />
        <Floating3DObjects />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
