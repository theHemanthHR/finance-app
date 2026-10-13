import api from './axios'

export const recurringApi = {
  list:   () => api.get('/recurring-expenses').then((r) => r.data),
  create: (payload) => api.post('/recurring-expenses', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/recurring-expenses/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/recurring-expenses/${id}`),
}
