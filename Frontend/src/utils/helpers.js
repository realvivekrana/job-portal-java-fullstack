import { API_BASE_URL, JOB_TYPES } from './constants'

export function formatSalary(min, max) {
  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  const hasMin = min !== null && min !== undefined && min !== ''
  const hasMax = max !== null && max !== undefined && max !== ''
  if (hasMin && hasMax) return `${fmt(min)} - ${fmt(max)}`
  if (hasMin) return `From ${fmt(min)}`
  if (hasMax) return `Up to ${fmt(max)}`
  return 'Not disclosed'
}

export function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function timeAgo(value) {
  if (!value) return ''
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  return formatDate(value)
}

export function jobTypeLabel(value) {
  return JOB_TYPES.find((t) => t.value === value)?.label || value || ''
}

export function skillsToArray(skills) {
  if (!skills) return []
  return skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function initials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || '?'
  )
}

export function fileUrl(path) {
  if (!path) return null
  return path.startsWith('http') ? path : `${API_BASE_URL}${path}`
}

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback
  if (error.code === 'ERR_NETWORK') return 'Cannot reach the server. Please check your connection.'
  const body = error.response?.data
  if (body?.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
    const first = Object.values(body.data)[0]
    if (typeof first === 'string') return first
  }
  return body?.message || fallback
}

// Field level validation errors from the backend: { field: "message" }
export function getFieldErrors(error) {
  const data = error?.response?.data?.data
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {}
}

export function validateFile(file, extensions, maxSize) {
  if (!file) return 'Please choose a file'
  const ext = file.name.split('.').pop().toLowerCase()
  if (!extensions.includes(ext)) return `Allowed file types: ${extensions.join(', ').toUpperCase()}`
  if (file.size > maxSize) return `File must be ${Math.round(maxSize / 1024 / 1024)} MB or smaller`
  return null
}