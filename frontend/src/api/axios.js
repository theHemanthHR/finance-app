import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

export function toApiError(error) {
  const res = error?.response
  const data = res?.data
  return {
    status: res?.status ?? 0,
    code: data?.code ?? 'NETWORK_ERROR',
    message: data?.message ?? error?.message ?? 'Something went wrong',
    fieldErrors: data?.fieldErrors ?? null,
  }
}

let onUnauthorized = null
export function setUnauthorizedHandler(fn) { onUnauthorized = fn }

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401 && onUnauthorized) onUnauthorized()
    return Promise.reject(error)
  },
)

export default api
