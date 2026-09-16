import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'

export type ConsentContext = 'job' | 'contact'

interface DataConsentCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  context: ConsentContext
  id: string
  required?: boolean
}

const consentText: Record<ConsentContext, string> = {
  job: 'He leído y autorizo el tratamiento de mis datos personales por parte de High Clean SAS, conforme a la Política de Tratamiento de Datos Personales, con la finalidad de evaluar mi postulación a un cargo en la empresa.',
  contact:
    'He leído y autorizo el tratamiento de mis datos personales por parte de High Clean SAS, conforme a la Política de Tratamiento de Datos Personales, con la finalidad de dar respuesta a mi solicitud de contacto.',
}

function DataConsentCheckbox({
  checked,
  onChange,
  context,
  id,
  required = false,
}: DataConsentCheckboxProps) {
  const text = consentText[context]
  const [before, after] = text.split(
    'Política de Tratamiento de Datos Personales',
  )

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked)
  }

  return (
    <label className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        required={required}
        className="mt-0.5 h-4 w-4 shrink-0 accent-brand-turq"
      />
      <span>
        {before}
        <Link
          to="/politica-de-datos"
          className="font-medium text-brand-turqDeep underline underline-offset-2 hover:text-brand-lagoon"
        >
          Política de Tratamiento de Datos Personales
        </Link>
        {after}
      </span>
    </label>
  )
}

export default DataConsentCheckbox