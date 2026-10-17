import api from './axiosInstance'

const clean = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))

export const searchJobs = (params) => api.get('/api/jobs', { params: clean(params) }).then((r) => r.data.data)
export const getJob = (id) => api.get(`/api/jobs/${id}`).then((r) => r.data.data)
export const getMyJobs = (params) => api.get('/api/jobs/my', { params }).then((r) => r.data.data)
export const createJob = (payload) => api.post('/api/jobs', payload).then((r) => r.data.data)
export const updateJob = (id, payload) => api.put(`/api/jobs/${id}`, payload).then((r) => r.data.data)
export const setJobActive = (id, active) =>
  api.patch(`/api/jobs/${id}/status`, null, { params: { active } }).then((r) => r.data.data)