import { ROLES } from '../../utils/constants'

/** Sidebar navigation per role. `exclude` stops a link from also lighting up for a sibling route. */
export const SIDEBAR = {
  [ROLES.CANDIDATE]: [
    { label: 'Overview', items: [{ to: '/candidate/dashboard', label: 'Dashboard', icon: 'dashboard', exact: true }] },
    {
      label: 'Job search',
      items: [
        { to: '/jobs', label: 'Find jobs', icon: 'search', exact: true },
        { to: '/candidate/applications', label: 'My applications', icon: 'send' },
      ],
    },
    { label: 'Account', items: [{ to: '/candidate/profile', label: 'My profile', icon: 'user' }] },
  ],
  [ROLES.RECRUITER]: [
    { label: 'Overview', items: [{ to: '/recruiter/dashboard', label: 'Dashboard', icon: 'dashboard', exact: true }] },
    {
      label: 'Hiring',
      items: [
        { to: '/recruiter/jobs', label: 'My jobs', icon: 'briefcase', exclude: ['/recruiter/jobs/new'] },
        { to: '/recruiter/jobs/new', label: 'Post a job', icon: 'plus', exact: true },
      ],
    },
    { label: 'Account', items: [{ to: '/recruiter/company', label: 'Company profile', icon: 'building' }] },
  ],
  [ROLES.ADMIN]: [
    { label: 'Overview', items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard', exact: true }] },
    {
      label: 'Management',
      items: [
        { to: '/admin/users', label: 'Users', icon: 'users' },
        { to: '/admin/jobs', label: 'Jobs', icon: 'briefcase' },
        { to: '/admin/site', label: 'Website content', icon: 'globe' },
      ],
    },
  ],
}

export function isItemActive(item, pathname) {
  if (item.exclude?.some((p) => pathname === p || pathname.startsWith(p + '/'))) return false
  if (item.exact) return pathname === item.to
  return pathname === item.to || pathname.startsWith(item.to + '/')
}

const TITLES = [
  [/^\/recruiter\/jobs\/new/, 'Post a job'],
  [/^\/recruiter\/jobs\/[^/]+\/edit/, 'Edit job'],
  [/^\/recruiter\/jobs\/[^/]+\/applicants/, 'Applicants'],
  [/^\/recruiter\/jobs/, 'My jobs'],
  [/^\/recruiter\/company/, 'Company profile'],
  [/^\/recruiter\/dashboard/, 'Dashboard'],
  [/^\/candidate\/applications/, 'My applications'],
  [/^\/candidate\/profile/, 'My profile'],
  [/^\/candidate\/dashboard/, 'Dashboard'],
  [/^\/admin\/users/, 'Users'],
  [/^\/admin\/jobs/, 'Jobs'],
  [/^\/admin\/site/, 'Website content'],
  [/^\/admin\/dashboard/, 'Dashboard'],
]

export function titleFor(pathname) {
  return TITLES.find(([re]) => re.test(pathname))?.[1] || 'Dashboard'
}

export const roleLabel = (role = '') => role.charAt(0) + role.slice(1).toLowerCase()