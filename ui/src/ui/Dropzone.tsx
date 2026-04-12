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
      className="group flex cursor-pointer flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-[#c9d3dc] bg-[linear-gradient(180deg,#faf6ef_0%,#f1ece2_100%)] p-10 text-center transition hover:border-[#8ea5b7] hover:bg-[linear-gradient(180deg,#fcf8f1_0%,#f4eee4_100%)]"
    >
      <UploadCloud className="mb-3 h-8 w-8 text-[#607b90] transition group-hover:-translate-y-0.5" />
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
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
