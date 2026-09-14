import { useEffect, useRef, useState, type FormEvent } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { motion } from 'motion/react'
import { sendChatMessage } from '../lib/api.ts'
import { EASE } from '../lib/motion.ts'

const WELCOME_MESSAGE =
  'Hola, soy el asistente virtual de High Clean SAS. Pregúntame por sus servicios, la empresa, horarios o cómo contactarlos.'

interface ChatMessage {
  id: number
  from: 'user' | 'assistant'
  text: string
}

let messageId = 1

function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, from: 'assistant', text: WELCOME_MESSAGE },
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo?.({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, pending, open])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = input.trim()
    if (!text || pending) return

    setMessages((previous) => [
      ...previous,
      { id: messageId++, from: 'user', text },
    ])
    setInput('')
    setPending(true)
    setError(null)

    try {
      const response = await sendChatMessage(text)
      setMessages((previous) => [
        ...previous,
        { id: messageId++, from: 'assistant', text: response },
      ])
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo conectar con el asistente. Intenta de nuevo.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] right-6 z-40 flex flex-col items-end">
      {open && (
        <motion.div
          id="chat-panel"
          role="dialog"
          aria-label="Asistente virtual"
          className="mb-3 flex w-80 max-w-[calc(100vw-3rem)] max-h-[calc(100dvh-16rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-brand-turqSoft bg-white shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <header className="flex items-center justify-between bg-brand-turq px-5 py-4 text-white">
            <div>
              <h2 className="font-display text-base font-semibold">
                Asistente virtual
              </h2>
              <p className="text-xs text-white/85">
                Información de High Clean SAS
              </p>
            </div>
          </header>

          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) =>
              message.from === 'user' ? (
                <p
                  key={message.id}
                  className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-turq px-4 py-2.5 text-sm text-white"
                >
                  {message.text}
                </p>
              ) : (
                <p
                  key={message.id}
                  className="w-fit max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-brand-turqSoft px-4 py-2.5 text-sm text-brand-ink"
                >
                  {message.text}
                </p>
              ),
            )}

            {pending && (
              <p className="w-fit rounded-2xl rounded-tl-sm bg-brand-turqSoft px-4 py-2.5 text-sm text-brand-ink">
                Escribiendo…
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700"
              >
                {error}
              </p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-slate-200 px-4 py-3"
          >
            <label className="sr-only" htmlFor="chat-input">
              Escribe tu mensaje
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu mensaje…"
              aria-label="Escribe tu mensaje"
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-turq"
            />
            <button
              type="submit"
              disabled={pending || input.trim().length === 0}
              aria-label="Enviar mensaje"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-turq text-white transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </motion.div>
      )}

      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-turq text-white shadow-lg transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2"
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

export default ChatWidget