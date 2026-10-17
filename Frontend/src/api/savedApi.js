import api from './axiosInstance'

export const getSavedJobs = (params) => api.get('/api/saved-jobs', { params }).then((r) => r.data.data)
export const getSavedJobIds = () => api.get('/api/saved-jobs/ids').then((r) => r.data.data)
export const saveJob = (jobId) => api.post(`/api/saved-jobs/${jobId}`).then((r) => r.data)
export const unsaveJob = (jobId) => api.delete(`/api/saved-jobs/${jobId}`).then((r) => r.data)