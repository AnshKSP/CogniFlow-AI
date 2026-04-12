import { motion } from 'framer-motion'

const crystalSpikes = [
  {
    left: '8%',
    top: '16%',
    width: 86,
    height: 140,
    clipPath: 'polygon(50% 0%, 100% 100%, 8% 88%)',
    gradient: 'linear-gradient(145deg, rgba(173,196,219,0.82), rgba(131,157,179,0.64))',
    border: '1px solid rgba(143,165,183,0.72)',
    transform: 'perspective(1100px) rotateX(22deg) rotateY(-18deg)',
    duration: 8.6
  },
  {
    left: '78%',
    top: '24%',
    width: 98,
    height: 122,
    clipPath: 'polygon(36% 0%, 100% 72%, 0% 100%)',
    gradient: 'linear-gradient(160deg, rgba(224,193,183,0.82), rgba(191,154,140,0.66))',
    border: '1px solid rgba(197,165,150,0.74)',
    transform: 'perspective(1050px) rotateX(20deg) rotateY(20deg)',
    duration: 7.9
  },
  {
    left: '44%',
    top: '10%',
    width: 74,
    height: 108,
    clipPath: 'polygon(50% 0%, 94% 32%, 88% 100%, 10% 100%, 4% 30%)',
    gradient: 'linear-gradient(155deg, rgba(197,213,201,0.84), rgba(154,176,163,0.64))',
    border: '1px solid rgba(166,187,174,0.74)',
    transform: 'perspective(980px) rotateX(18deg) rotateY(-14deg)',
    duration: 9.2
  }
]

const torusRings = [
  { left: '18%', top: '58%', size: 178, color: 'rgba(148,166,183,0.56)', duration: 16 },
  { left: '62%', top: '50%', size: 152, color: 'rgba(187,156,146,0.48)', duration: 14.5 },
  { left: '74%', top: '10%', size: 96, color: 'rgba(159,176,166,0.52)', duration: 12.8 }
]

const holoPanels = [
  {
    left: '26%',
    top: '34%',
    width: 168,
    height: 84,
    gradient: 'linear-gradient(125deg, rgba(255,255,255,0.34), rgba(216,225,232,0.46), rgba(204,187,179,0.32))',
    transform: 'perspective(1000px) rotateX(52deg) rotateY(-10deg)'
  },
  {
    left: '60%',
    top: '68%',
    width: 146,
    height: 72,
    gradient: 'linear-gradient(125deg, rgba(255,255,255,0.3), rgba(221,228,216,0.4), rgba(203,208,219,0.28))',
    transform: 'perspective(920px) rotateX(48deg) rotateY(16deg)'
  }
]

const orbitSystems = [
  { left: '52%', top: '30%', size: 120, dotColor: '#6f8799', duration: 10.8 },
  { left: '30%', top: '72%', size: 96, dotColor: '#ad7c6f', duration: 9.4 }
]

const lightClouds = [
  'absolute -left-10 top-[12%] h-56 w-56 rounded-full bg-[#d6e1ea]/35 blur-3xl',
  'absolute right-[2%] top-[46%] h-44 w-44 rounded-full bg-[#e4d5cb]/32 blur-3xl',
  'absolute left-[38%] bottom-[8%] h-48 w-48 rounded-full bg-[#d8e1d8]/28 blur-3xl'
]

export default function Floating3DObjects() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {lightClouds.map((className, index) => (
        <motion.div
          key={`cloud-${index}`}
          className={className}
          animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.78, 0.35] }}
          transition={{ duration: 8.2 + index * 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {holoPanels.map((panel, index) => (
        <motion.div
          key={`panel-${index}`}
          className="absolute rounded-3xl border border-white/50"
          style={{
            left: panel.left,
            top: panel.top,
            width: panel.width,
            height: panel.height,
            background: panel.gradient,
            transform: panel.transform
          }}
          animate={{ y: [0, -12, 0], rotate: [-3, 3, -3], opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 8 + index, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {crystalSpikes.map((spike, index) => (
        <motion.div
          key={`spike-${index}`}
          className="absolute"
          style={{
            left: spike.left,
            top: spike.top,
            width: spike.width,
            height: spike.height,
            clipPath: spike.clipPath,
            background: spike.gradient,
            border: spike.border,
            transform: spike.transform
          }}
          animate={{ y: [0, -16, 0], rotate: [-6, 9, -6], scale: [1, 1.07, 1] }}
          transition={{ duration: spike.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {torusRings.map((ring, index) => (
        <motion.div
          key={`ring-${index}`}
          className="absolute rounded-full"
          style={{
            left: ring.left,
            top: ring.top,
            width: ring.size,
            height: ring.size,
            border: `2px solid ${ring.color}`,
            boxShadow: `inset 0 0 28px ${ring.color}`
          }}
          animate={{ rotate: [0, 360], scale: [1, 1.06, 1] }}
          transition={{ duration: ring.duration, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {orbitSystems.map((orbit, index) => (
        <motion.div
          key={`orbit-${index}`}
          className="absolute"
          style={{ left: orbit.left, top: orbit.top, width: orbit.size, height: orbit.size }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: orbit.duration, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border border-white/38" />
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full" style={{ backgroundColor: orbit.dotColor }} />
          <span className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white/80" />
          <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#cad9e5]/90" />
          <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#e1c8bc]/90" />
        </motion.div>
      ))}

      <motion.div
        className="absolute bottom-[6%] left-[20%] h-24 w-[62%] rounded-2xl border border-white/45"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(138,160,179,0.18) 0px, rgba(138,160,179,0.18) 1px, transparent 1px, transparent 14px), repeating-linear-gradient(0deg, rgba(196,173,162,0.16) 0px, rgba(196,173,162,0.16) 1px, transparent 1px, transparent 12px)',
          transform: 'perspective(1000px) rotateX(64deg)'
        }}
        animate={{ y: [0, -10, 0], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 7.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {Array.from({ length: 14 }).map((_, index) => (
        <motion.span
          key={`node-${index}`}
          className="absolute h-1.5 w-1.5 rounded-full bg-white/75"
          style={{
            left: `${6 + index * 6.6}%`,
            top: `${10 + ((index * 9) % 78)}%`
          }}
          animate={{ y: [0, -8, 0], scale: [0.8, 1.25, 0.8], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 3.8 + index * 0.28, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
