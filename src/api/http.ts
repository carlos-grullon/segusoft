import axios from 'axios'
import { getToken } from '../auth/token'

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined

export const http = axios.create({
  baseURL: baseURL ?? 'http://localhost:5033',
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
