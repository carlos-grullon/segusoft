import { http } from './http'

export type AuthResponse = {
  token: string
  email: string
  roleName: string
  firstName: string
  lastName: string
  expiresAt: string
}

export type RegisterRequest = {
  email: string
  password: string
  firstName: string
  lastName: string
  roleName: 'Admin' | 'Client' | 'Agent'
}

export type LoginRequest = {
  email: string
  password: string
}

export type MeResponse = {
  userId: number
  email: string
  roleName: string
  firstName: string
  lastName: string
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/api/auth/register', request)
  return data
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/api/auth/login', request)
  return data
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await http.get<MeResponse>('/api/auth/me')
  return data
}
