import { motion } from 'motion/react'
import { EASE } from '../lib/motion.ts'

interface SectionHeaderProps {
  id?: string
  label: string
  title: string
  subtitle?: string
  gold?: boolean
}

function SectionHeader({ id, label, title, subtitle, gold = false }: SectionHeaderProps) {
  return (
    <motion.div
      className="mb-14 max-w-2xl"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          className={`h-px w-10 ${gold ? 'bg-brand-gold' : 'bg-brand-turqDeep'}`}
          aria-hidden="true"
        />
        <p
          className={`text-sm font-medium ${gold ? 'text-brand-goldDeep' : 'text-brand-turqDeep'}`}
        >
          {label}
        </p>
      </div>
      <h2
        id={id}
        className="text-balance bg-linear-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent md:text-4xl"
      >
        {title}
      </h2>
      {subtitle && <p className="mt-4 leading-relaxed text-slate-600">{subtitle}</p>}
    </motion.div>
  )
}

export default SectionHeader