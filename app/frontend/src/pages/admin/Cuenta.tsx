import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, KeyRound, Loader2 } from 'lucide-react'
import { PasswordField } from '../../components/fields/PasswordField.tsx'
import { changePassword } from '../../lib/admin.ts'

const PASSWORD_POLICY_MESSAGE =
  'La contraseña debe tener al menos 12 caracteres e incluir letras y números'

function Cuenta() {
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (pending) return

    if (!currentPassword) {
      setError('Ingresa tu contraseña actual')
      return
    }

    if (
      nextPassword.length < 12 ||
      !/[A-Za-z]/.test(nextPassword) ||
      !/[0-9]/.test(nextPassword)
    ) {
      setError(PASSWORD_POLICY_MESSAGE)
      return
    }

    if (confirmPassword !== nextPassword) {
      setError('La confirmación no coincide con la contraseña nueva')
      return
    }

    setPending(true)
    setSaved(false)
    setError(null)

    try {
      await changePassword({
        currentPassword,
        newPassword: nextPassword,
      })
      setSaved(true)
      window.setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            notice:
              'Contraseña actualizada. Inicia sesión con tu nueva contraseña.',
          },
        })
      }, 700)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo cambiar la contraseña',
      )
      setPending(false)
    }
  }

  return (
    <section aria-labelledby="cuenta-title">
      <h1
        id="cuenta-title"
        className="bg-gradient-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-2xl font-bold text-transparent"
      >
        Cuenta
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Cambia la contraseña de acceso al panel. Al actualizarla se cerrará tu
        sesión actual y tendrás que iniciar sesión de nuevo.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-5">
        <div className="space-y-5 rounded-sm border border-brand-turqSoft bg-white p-6 shadow-md">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-brand-turqDeep" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-brand-ink">
              Cambiar contraseña
            </h2>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-ink">
              Contraseña actual
            </span>
            <PasswordField
              id="cuenta-current"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              placeholder="••••••••"
              rounded="sm"
              disabled={pending}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-ink">
              Contraseña nueva
            </span>
            <PasswordField
              id="cuenta-next"
              value={nextPassword}
              onChange={setNextPassword}
              autoComplete="new-password"
              placeholder="Mínimo 12 caracteres con letras y números"
              rounded="sm"
              disabled={pending}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-ink">
              Confirmar contraseña nueva
            </span>
            <PasswordField
              id="cuenta-confirm"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              placeholder="Repite la contraseña nueva"
              rounded="sm"
              disabled={pending}
            />
          </label>

          <p className="text-xs text-slate-500">{PASSWORD_POLICY_MESSAGE}.</p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {saved && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-sm border border-brand-leaf/40 bg-brand-leaf/10 px-4 py-3 text-sm font-medium text-brand-leafDeep"
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Contraseña actualizada. Redirigiendo al inicio de sesión…
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-sm bg-brand-turq px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <KeyRound className="h-4 w-4" aria-hidden="true" />
          )}
          {pending ? 'Actualizando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </section>
  )
}

export default Cuenta