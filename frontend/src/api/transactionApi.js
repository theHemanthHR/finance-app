import api from './axios'

export const transactionApi = {
  list: (params) => api.get('/transactions', { params }).then((r) => r.data),
  get:  (id) => api.get(`/transactions/${id}`).then((r) => r.data),
  create: (payload) => api.post('/transactions', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/transactions/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/transactions/${id}`),

  exportCsv: async (params) => {
    const res = await api.get('/transactions/export.csv', { params, responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `finora-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  },
}
