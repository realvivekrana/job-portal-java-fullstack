import api from './axiosInstance'

export const getMyCompany = () => api.get('/api/companies/me').then((r) => r.data.data)
export const getCompany = (id) => api.get(`/api/companies/${id}`).then((r) => r.data.data)
export const createCompany = (payload) => api.post('/api/companies', payload).then((r) => r.data.data)
export const updateCompany = (payload) => api.put('/api/companies/me', payload).then((r) => r.data.data)
export const uploadLogo = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/api/companies/me/logo', form).then((r) => r.data.data)
}