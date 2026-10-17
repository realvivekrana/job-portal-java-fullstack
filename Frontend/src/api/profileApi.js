import api from './axiosInstance'

export const getMyProfile = () => api.get('/api/profile/me').then((r) => r.data.data)
export const updateProfile = (payload) => api.put('/api/profile/me', payload).then((r) => r.data.data)
export const uploadResume = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/api/profile/me/resume', form).then((r) => r.data.data)
}
export const removeResume = () => api.delete('/api/profile/me/resume').then((r) => r.data.data)