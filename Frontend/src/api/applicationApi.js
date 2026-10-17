import api from './axiosInstance'

export const applyToJob = (jobId, { coverLetter, resume }) => {
  const form = new FormData()
  if (coverLetter) form.append('coverLetter', coverLetter)
  if (resume) form.append('resume', resume)
  return api.post(`/api/applications/job/${jobId}`, form).then((r) => r.data.data)
}
export const getMyApplications = (params) => api.get('/api/applications/my', { params }).then((r) => r.data.data)
export const getMyApplicationStats = () => api.get('/api/applications/my/stats').then((r) => r.data.data)
export const withdrawApplication = (id) => api.delete(`/api/applications/${id}`).then((r) => r.data)

export const getJobApplicants = (jobId, params) =>
  api.get(`/api/applications/job/${jobId}`, { params }).then((r) => r.data.data)
export const getRecruiterStats = () => api.get('/api/applications/recruiter/stats').then((r) => r.data.data)
export const updateApplicationStatus = (id, status) =>
  api.patch(`/api/applications/${id}/status`, { status }).then((r) => r.data.data)

// Resumes are private (need the JWT), so fetch as a blob and open it in a new tab
export async function openResume(url) {
  const res = await api.get(url, { responseType: 'blob' })
  const blobUrl = URL.createObjectURL(res.data)
  const win = window.open(blobUrl, '_blank')
  if (!win) {
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = url.split('/').pop()
    a.click()
  }
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
}