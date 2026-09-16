export interface JobApplicationInput {
  name: string
  position: string
  email: string
  phone: string
  message?: string
  website?: string
  consent: boolean
  file: File
}

export interface JobApplicationResult {
  id: string | null
  createdAt: string
  status?: string
}

async function readError(response: Response, fallback: string): Promise<Error> {
  const detail = (await response.json().catch(() => null)) as {
    error?: { message?: string }
  } | null
  return new Error(detail?.error?.message ?? fallback)
}

export async function applyJob(
  input: JobApplicationInput,
): Promise<JobApplicationResult> {
  const form = new FormData()
  form.append('name', input.name)
  form.append('position', input.position)
  form.append('email', input.email)
  form.append('phone', input.phone)
  if (input.message) form.append('message', input.message)
  if (input.website) form.append('website', input.website)
  if (input.consent) form.append('consent', 'on')
  form.append('cv', input.file)

  const response = await fetch('/api/v1/jobs/apply', {
    method: 'POST',
    body: form,
  })

  if (!response.ok) {
    throw await readError(
      response,
      'No se pudo enviar tu postulación. Intenta de nuevo más tarde.',
    )
  }

  return (await response.json()) as JobApplicationResult
}