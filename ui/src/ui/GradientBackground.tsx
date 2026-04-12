import type { ReactNode } from 'react'
import Floating3DObjects from './Floating3DObjects'

interface GradientBackgroundProps {
  children: ReactNode
}

export default function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <div className="relative min-h-screen bg-[linear-gradient(145deg,#f8f5ee_0%,#f6f2ea_52%,#f2eee5_100%)] text-slate-800">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 left-[4%] h-[22rem] w-[22rem] rounded-full bg-[#dce8f1]/70 blur-3xl" />
        <div className="absolute right-[2%] top-[12%] h-[20rem] w-[20rem] rounded-full bg-[#e8d5cc]/60 blur-3xl" />
        <div className="absolute bottom-[8%] left-[22%] h-[18rem] w-[18rem] rounded-full bg-[#dce5d8]/55 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.26)_0,rgba(255,255,255,0.26)_1px,transparent_1px,transparent_120px),linear-gradient(0deg,rgba(255,255,255,0.18)_0,rgba(255,255,255,0.18)_1px,transparent_1px,transparent_120px)] opacity-35" />
        <Floating3DObjects />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
