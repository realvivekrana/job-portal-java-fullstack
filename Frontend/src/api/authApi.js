import api from './axiosInstance'

export const register = (payload) => api.post('/api/auth/register', payload).then((r) => r.data.data)
export const login = (payload) => api.post('/api/auth/login', payload).then((r) => r.data.data)
export const getCurrentUser = () => api.get('/api/users/me').then((r) => r.data.data)

// Admin
export const getAdminStats = () => api.get('/api/admin/stats').then((r) => r.data.data)
export const getAdminUsers = (params) => api.get('/api/admin/users', { params }).then((r) => r.data.data)
export const setUserActive = (id, active) =>
  api.patch(`/api/admin/users/${id}/status`, null, { params: { active } }).then((r) => r.data.data)
export const getAdminJobs = (params) => api.get('/api/admin/jobs', { params }).then((r) => r.data.data)
export const setAdminJobActive = (id, active) =>
  api.patch(`/api/admin/jobs/${id}/status`, null, { params: { active } }).then((r) => r.data.data)
export const deleteAdminJob = (id) => api.delete(`/api/admin/jobs/${id}`).then((r) => r.data)