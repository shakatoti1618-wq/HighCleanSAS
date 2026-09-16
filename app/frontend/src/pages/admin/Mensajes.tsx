import { useEffect, useState } from 'react'
import { Check, Hourglass, Loader2, Trash2 } from 'lucide-react'
import {
  deleteMessage,
  fetchAdminMessages,
  markMessageRead,
  type ContactMessage,
} from '../../lib/admin.ts'

function Mensajes() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true

    void fetchAdminMessages()
      .then((data) => {
        if (active) setMessages(data)
      })
      .catch((fetchError: unknown) => {
        if (active) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'No se pudieron cargar los mensajes',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleRead = async (message: ContactMessage) => {
    if (busy) return

    setBusy(true)
    setError(null)

    try {
      const updated = await markMessageRead(message.id)
      setMessages((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'No se pudo marcar el mensaje como leído',
      )
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (message: ContactMessage) => {
    if (busy) return

    setBusy(true)
    setError(null)

    try {
      await deleteMessage(message.id)
      setMessages((previous) =>
        previous.filter((item) => item.id !== message.id),
      )
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'No se pudo eliminar el mensaje',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="mensajes-title">
      <h1
        id="mensajes-title"
        className="bg-gradient-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-2xl font-bold text-transparent"
      >
        Mensajes
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Mensajes enviados desde el formulario de contacto del sitio.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando mensajes…
        </p>
      ) : messages.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          No hay mensajes recibidos.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className={`rounded-sm border bg-white p-5 shadow-md ${
                message.read ? 'border-brand-turqSoft' : 'border-brand-turq/50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold text-brand-ink">
                    {message.name}
                    {!message.read && (
                      <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-brand-turq/15 px-2.5 py-0.5 text-xs font-semibold text-brand-turqDeep">
                        <Hourglass className="h-3 w-3" aria-hidden="true" />
                        Sin leer
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">{message.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!message.read && (
                    <button
                      type="button"
                      onClick={() => handleRead(message)}
                      className="inline-flex items-center gap-1.5 rounded-sm bg-brand-turq px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-turqDeep"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Marcar como leído
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(message)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    aria-label={`Eliminar mensaje de ${message.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {message.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Mensajes