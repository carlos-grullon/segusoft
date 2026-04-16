import { http } from './http'

export type PolicyResponse = {
  policyId: number
  policyNumber: string
  type: string
  status: string
  startDate: string
  endDate: string
  premiumAmount: number
  description?: string
  clientId: number
  clientEmail: string
  clientFullName: string
  agentId?: number
  agentEmail?: string
  agentFullName?: string
  createdAt: string
}

export type CreatePolicyRequest = {
  type: string
  startDate: string
  endDate: string
  premiumAmount: number
  description?: string
  clientId: number
  agentId?: number
}

export type UpdatePolicyRequest = Partial<Omit<CreatePolicyRequest, 'clientId'> & { status: string }>

export const getPolicies = () => http.get<PolicyResponse[]>('/api/policies').then(r => r.data)
export const getPolicyById = (id: number) => http.get<PolicyResponse>(`/api/policies/${id}`).then(r => r.data)
export const createPolicy = (data: CreatePolicyRequest) => http.post<PolicyResponse>('/api/policies', data).then(r => r.data)
export const updatePolicy = (id: number, data: UpdatePolicyRequest) => http.put<PolicyResponse>(`/api/policies/${id}`, data).then(r => r.data)
export const deletePolicy = (id: number) => http.delete(`/api/policies/${id}`)
