import api from './axios'

export const reportApi = {
  cashFlow:   (params) => api.get('/reports/cash-flow', { params }).then((r) => r.data),
  spending:   (params) => api.get('/reports/spending-by-category', { params }).then((r) => r.data),
  income:     (params) => api.get('/reports/income-by-category', { params }).then((r) => r.data),
  comparison: (params) => api.get('/reports/month-comparison', { params }).then((r) => r.data),
  budgetVsActual: (params) => api.get('/reports/budget-vs-actual', { params }).then((r) => r.data),
  topExpenses: (params) => api.get('/reports/top-expenses', { params }).then((r) => r.data),
  savings:    () => api.get('/reports/savings-progress').then((r) => r.data),
  currencies: (params) => api.get('/reports/currency-summary', { params }).then((r) => r.data),
  insights:   () => api.get('/reports/insights').then((r) => r.data),
}

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary').then((r) => r.data),
  recent:  () => api.get('/dashboard/recent-transactions').then((r) => r.data),
}
