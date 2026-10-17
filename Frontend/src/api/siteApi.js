import api from './axiosInstance'

export const getSite = () => api.get('/api/public/site').then((r) => r.data.data)
export const getOverview = () => api.get('/api/public/overview').then((r) => r.data.data)
export const updateSite = (payload) => api.put('/api/admin/site', payload).then((r) => r.data.data)