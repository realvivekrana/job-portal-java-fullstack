export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

export const TOKEN_KEY = 'jobportal_token'
export const USER_KEY = 'jobportal_user'

export const ROLES = {
  ADMIN: 'ADMIN',
  RECRUITER: 'RECRUITER',
  CANDIDATE: 'CANDIDATE',
}

export const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'PART_TIME', label: 'Part time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'CONTRACT', label: 'Contract' },
]

export const APPLICATION_STATUSES = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
]

// Same rules as the backend (ApplicationServiceImpl.ALLOWED_TRANSITIONS)
export const STATUS_TRANSITIONS = {
  APPLIED: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['HIRED', 'REJECTED'],
  HIRED: [],
  REJECTED: [],
}

export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'salaryMax:desc', label: 'Highest salary' },
  { value: 'salaryMin:asc', label: 'Lowest salary' },
  { value: 'experienceRequired:asc', label: 'Least experience' },
  { value: 'title:asc', label: 'Title A-Z' },
]

export const ROLE_HOME = {
  ADMIN: '/admin/dashboard',
  RECRUITER: '/recruiter/dashboard',
  CANDIDATE: '/candidate/dashboard',
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const RESUME_EXTENSIONS = ['pdf', 'doc', 'docx']
export const LOGO_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']