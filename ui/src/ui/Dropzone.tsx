import { motion } from 'framer-motion'
import { UploadCloud } from 'lucide-react'

interface DropzoneProps {
  accept: string
  title: string
  subtitle: string
  onSelect: (file: File) => void
}

export default function Dropzone({ accept, title, subtitle, onSelect }: DropzoneProps) {
  return (
    <motion.label
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-sky-300/55 bg-gradient-to-br from-white/85 via-cyan-100/70 to-pink-100/70 p-10 text-center transition hover:border-cyan-400/70 hover:from-white/95 hover:via-cyan-100/90 hover:to-fuchsia-100/80"
    >
      <UploadCloud className="mb-3 h-8 w-8 text-sky-500 transition group-hover:-translate-y-0.5" />
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-600">{subtitle}</p>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onSelect(file)
        }}
      />
    </motion.label>
  )
}
