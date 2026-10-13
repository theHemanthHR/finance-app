import api from './axios'

export const currencyApi = {
  list:  () => api.get('/currencies').then((r) => r.data),
  quote: (from, to, date) =>
    api.get('/currencies/quote', { params: { from, to, date } }).then((r) => r.data),
}
