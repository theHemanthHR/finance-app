import api from './axios'

export const goalApi = {
  list:   () => api.get('/goals').then((r) => r.data),
  get:    (id) => api.get(`/goals/${id}`).then((r) => r.data),
  create: (payload) => api.post('/goals', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/goals/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/goals/${id}`),
  contributions: (id) => api.get(`/goals/${id}/contributions`).then((r) => r.data),
  contribute: (id, payload) => api.post(`/goals/${id}/contributions`, payload).then((r) => r.data),
}
