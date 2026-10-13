import api from './axios'

export const budgetApi = {
  list:   (month) => api.get('/budgets', { params: { month } }).then((r) => r.data),
  create: (payload) => api.post('/budgets', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/budgets/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/budgets/${id}`),
}
