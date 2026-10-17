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
  { value: 'INTERVIEWING', label: 'Interviewing' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
]

// Same rules as the backend (ApplicationServiceImpl.ALLOWED_TRANSITIONS)
export const STATUS_TRANSITIONS = {
  APPLIED: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEWING', 'HIRED', 'REJECTED'],
  INTERVIEWING: ['HIRED', 'REJECTED'],
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

export const DATE_POSTED = [
  { value: '', label: 'Any time' },
  { value: '1', label: 'Last 24 hours' },
  { value: '3', label: 'Last 3 days' },
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
]

export const SALARY_STEPS = [
  { value: '', label: 'Any pay' },
  { value: '200000', label: '₹2,00,000+' },
  { value: '400000', label: '₹4,00,000+' },
  { value: '800000', label: '₹8,00,000+' },
  { value: '1500000', label: '₹15,00,000+' },
]

export const EXPERIENCE_LEVELS = [
  { value: '', label: 'Any experience' },
  { value: '0', label: 'Fresher' },
  { value: '2', label: 'Up to 2 years' },
  { value: '5', label: 'Up to 5 years' },
]

export const ROLE_HOME = {
  ADMIN: '/admin/dashboard',
  RECRUITER: '/recruiter/dashboard',
  CANDIDATE: '/candidate/dashboard',
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const RESUME_EXTENSIONS = ['pdf', 'doc', 'docx']
export const LOGO_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']

// Fallback used until /api/public/site answers (or if the server is down). Admin can change all of these.
export const DEFAULT_SITE = {
  siteName: 'JobPortal',
  siteTagline: 'Find jobs. Hire talent.',
  heroTitle: 'Find your next job',
  heroLead:
    'Search openings from companies that are hiring now, apply in a couple of taps and follow every application in one place.',
  candidatePoints:
    'Filter by skill, location, job type and salary\nApply with a saved resume and a short cover letter\nTrack every application from applied to hired',
  recruiterPoints:
    'Create your company page and post jobs in minutes\nReview applicants and open resumes in one click\nShortlist, hire or reject with automatic email updates',
  ctaTitle: 'Ready to get started?',
  ctaText: 'Join as a candidate to apply, or as a recruiter to start hiring.',
  authHeadline: 'Your next role, or your next hire, starts here.',
  authPoints:
    'Search openings and apply with one saved resume\nPost jobs and shortlist applicants in one place\nGet email updates when your application status changes',
  footerAbout: 'A simple place for candidates to find the right job and for recruiters to hire the right people.',
  footerNote: 'Made in India',
  contactEmail: '',
}