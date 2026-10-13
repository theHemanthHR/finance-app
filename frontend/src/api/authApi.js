import api from './axios'

export const authApi = {
  csrf:      ()            => api.get('/auth/csrf'),
  register:  (payload)     => api.post('/auth/register', payload),
  login:     (payload)     => api.post('/auth/login', payload),
  logout:    ()            => api.post('/auth/logout'),
  me:        ()            => api.get('/auth/me'),
  settings:  ()            => api.get('/settings'),
  updateSettings: (p)      => api.patch('/settings', p),
  completeOnboarding: ()   => api.post('/settings/onboarding/complete'),
}
