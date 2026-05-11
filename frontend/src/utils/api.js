import axios from 'axios'
import { store } from '../store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const state = store.getState()
    const token = state.auth?.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 — only clear auth for protected resource calls, NOT for auth endpoints
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    const is401 = error.response?.status === 401

    // Don't clear auth if the 401 came from login/register/auth endpoints themselves
    const isAuthEndpoint = url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/google')

    if (is401 && !isAuthEndpoint) {
      const state = store.getState()
      // Only clear if we have a token — means it expired/invalid
      if (state.auth?.token) {
        store.dispatch({ type: 'auth/silentLogout' })
      }
    }
    return Promise.reject(error)
  }
)

export default api
