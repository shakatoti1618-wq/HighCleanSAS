import { useEffect, useState } from 'react'
import { Check, Download, Loader2, Trash2 } from 'lucide-react'
import {
  deleteJob,
  fetchAdminJobs,
  jobFileUrl,
  markJobReviewed,
  type JobApplication,
} from '../../lib/admin.ts'

function formatDate(value: string): string {
  return new Date(value).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

function Postulaciones() {
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true

    void fetchAdminJobs()
      .then((data) => {
        if (active) setJobs(data)
      })
      .catch((fetchError: unknown) => {
        if (active) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'No se pudieron cargar las postulaciones',
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

  const handleReviewed = async (job: JobApplication) => {
    if (busy) return

    setBusy(true)
    setError(null)

    try {
      const updated = await markJobReviewed(job.id)
      setJobs((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'No se pudo actualizar la postulación',
      )
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (job: JobApplication) => {
    if (busy) return

    setBusy(true)
    setError(null)

    try {
      await deleteJob(job.id)
      setJobs((previous) => previous.filter((item) => item.id !== job.id))
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'No se pudo eliminar la postulación',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="postulaciones-title">
      <h1
        id="postulaciones-title"
        className="bg-gradient-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-2xl font-bold text-transparent"
      >
        Postulaciones
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Hojas de vida recibidas en &quot;Trabaja con nosotros&quot;. Los
        archivos solo se descargan por este panel.
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
          Cargando postulaciones…
        </p>
      ) : jobs.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          No hay postulaciones recibidas.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {jobs.map((job) => (
            <li
              key={job.id}
              className={`rounded-sm border bg-white p-5 shadow-md ${
                job.read ? 'border-brand-turqSoft' : 'border-brand-turq/50'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold text-brand-ink">
                    {job.name}
                    {job.status === 'NEW' && (
                      <span className="ml-3 inline-block rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-xs font-semibold text-brand-goldDeep">
                        Nueva
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-600">
                    Aplica a:{' '}
                    <span className="font-medium text-brand-ink">
                      {job.position}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500">
                    {job.email} · {job.phone}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Recibida el {formatDate(job.createdAt)} · CV{' '}
                    {job.originalFileName} ({formatSize(job.fileSize)}) ·
                    Consentimiento registrado el{' '}
                    {formatDate(job.dataConsentAcceptedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {job.status === 'NEW' && (
                    <button
                      type="button"
                      onClick={() => handleReviewed(job)}
                      className="inline-flex items-center gap-1.5 rounded-sm bg-brand-turq px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-turqDeep"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Marcar revisada
                    </button>
                  )}
                  <a
                    href={jobFileUrl(job.id)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-brand-turq/40 px-3 py-2 text-sm text-brand-turqDeep hover:bg-brand-turq/10"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Ver hoja de vida
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(job)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    aria-label={`Eliminar postulación de ${job.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              {job.message && (
                <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
                  {job.message}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Postulaciones