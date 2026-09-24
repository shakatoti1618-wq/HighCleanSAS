import type { Company, CompanyValue, GalleryImage, Service } from './api.ts'

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type JobStatus = 'NEW' | 'REVIEWED'

export interface AdminReview {
  id: string
  author: string
  content: string
  rating: number
  status: ReviewStatus
  companyId: string
  createdAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  read: boolean
  companyId: string
  createdAt: string
}

export interface JobApplication {
  id: string
  name: string
  position: string
  email: string
  phone: string
  message: string | null
  status: JobStatus
  read: boolean
  originalFileName: string
  mimeType: string
  fileSize: number
  dataConsentAcceptedAt: string
  createdAt: string
}

export interface AdminDashboard {
  services: number
  reviews: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  messages: { total: number; unread: number }
  gallery: number
  jobs: { total: number; new: number }
}

export interface CompanyUpdateInput {
  nit?: string
  description?: string
  mission?: string
  vision?: string
  qualityPolicy?: string
  values?: CompanyValue[]
  phone?: string
  whatsappNumber?: string
  email?: string
  address?: string
  schedules?: string
  serviceCities?: string[]
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const isFormData = init?.body instanceof FormData

  const response = await fetch(path, {
    credentials: 'include',
    headers: init?.body && !isFormData
      ? { 'Content-Type': 'application/json' }
      : undefined,
    ...init,
  })

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(detail?.error?.message ?? 'Operación no completada')
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<{ message: string }> {
  return request<{ message: string }>('/api/v1/auth/password', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function fetchAdminDashboard(): Promise<AdminDashboard> {
  return request<AdminDashboard>('/api/v1/admin/dashboard')
}

export function updateCompanyData(
  input: CompanyUpdateInput,
): Promise<Company> {
  return request<Company>('/api/v1/admin/company', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function fetchAdminServices(): Promise<Service[]> {
  return request<Service[]>('/api/v1/admin/services')
}

export function createService(name: string, description: string): Promise<Service> {
  return request<Service>('/api/v1/admin/services', {
    method: 'POST',
    body: JSON.stringify({ name, description: description || undefined }),
  })
}

export function updateService(
  id: string,
  name: string,
  description: string,
): Promise<Service> {
  return request<Service>(`/api/v1/admin/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, description: description || undefined }),
  })
}

export function deleteService(id: string): Promise<void> {
  return request<void>(`/api/v1/admin/services/${id}`, { method: 'DELETE' })
}

export function fetchAdminReviews(): Promise<AdminReview[]> {
  return request<AdminReview[]>('/api/v1/admin/reviews')
}

export function updateReviewStatus(id: string, status: ReviewStatus): Promise<AdminReview> {
  return request<AdminReview>(`/api/v1/admin/reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function deleteReview(id: string): Promise<void> {
  return request<void>(`/api/v1/admin/reviews/${id}`, { method: 'DELETE' })
}

export function fetchAdminMessages(): Promise<ContactMessage[]> {
  return request<ContactMessage[]>('/api/v1/admin/messages')
}

export function markMessageRead(id: string): Promise<ContactMessage> {
  return request<ContactMessage>(`/api/v1/admin/messages/${id}`, { method: 'PATCH' })
}

export function deleteMessage(id: string): Promise<void> {
  return request<void>(`/api/v1/admin/messages/${id}`, { method: 'DELETE' })
}

export function fetchAdminGallery(): Promise<GalleryImage[]> {
  return request<GalleryImage[]>('/api/v1/admin/gallery')
}

export function createGalleryImage(url: string, alt: string): Promise<GalleryImage> {
  return request<GalleryImage>('/api/v1/admin/gallery', {
    method: 'POST',
    body: JSON.stringify({ url, alt: alt || undefined }),
  })
}

export function deleteGalleryImage(id: string): Promise<void> {
  return request<void>(`/api/v1/admin/gallery/${id}`, { method: 'DELETE' })
}

export function uploadGalleryFile(
  file: File,
  alt: string,
): Promise<GalleryImage> {
  const formData = new FormData()
  if (alt) formData.append('alt', alt)
  formData.append('file', file)

  return request<GalleryImage>('/api/v1/admin/gallery/upload', {
    method: 'POST',
    body: formData,
  })
}

export function fetchAdminJobs(): Promise<JobApplication[]> {
  return request<JobApplication[]>('/api/v1/admin/jobs')
}

export function markJobReviewed(id: string): Promise<JobApplication> {
  return request<JobApplication>(`/api/v1/admin/jobs/${id}`, { method: 'PATCH' })
}

export function deleteJob(id: string): Promise<void> {
  return request<void>(`/api/v1/admin/jobs/${id}`, { method: 'DELETE' })
}

export function jobFileUrl(id: string): string {
  return `/api/v1/admin/jobs/${id}/file`
}