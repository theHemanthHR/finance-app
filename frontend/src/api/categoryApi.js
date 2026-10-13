import api from './axios'

export const categoryApi = {
  list: (includeArchived = false) =>
    api.get('/categories', { params: { includeArchived } }).then((r) => r.data),
  create: (payload) => api.post('/categories', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/categories/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`),
}
