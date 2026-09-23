import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordFieldProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  rounded?: 'sm' | 'full'
}

export function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled = false,
  rounded = 'full',
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-sm'

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`w-full border border-slate-200 bg-white px-4 py-2.5 pr-12 text-sm text-slate-800 placeholder:text-slate-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-turq disabled:cursor-not-allowed disabled:opacity-60 ${roundedClass}`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        disabled={disabled}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq disabled:cursor-not-allowed disabled:opacity-60"
      >
        {visible ? (
          <EyeOff className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Eye className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}