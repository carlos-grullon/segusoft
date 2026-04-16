import { http } from './http'

export type ClaimResponse = {
  claimId: number
  claimNumber: string
  description: string
  status: string
  incidentDate: string
  createdAt: string
  policyId: number
  policyNumber: string
  policyType: string
  policyStatus: string
  clientFullName: string
}

export type CreateClaimRequest = {
  policyId: number
  description: string
  incidentDate: string
}

export const getClaims = () => http.get<ClaimResponse[]>('/api/claims').then(r => r.data)
export const getClaimById = (id: number) => http.get<ClaimResponse>(`/api/claims/${id}`).then(r => r.data)
export const createClaim = (data: CreateClaimRequest) => http.post<ClaimResponse>('/api/claims', data).then(r => r.data)
export const updateClaimStatus = (id: number, status: string) => http.put<ClaimResponse>(`/api/claims/${id}/status`, { status }).then(r => r.data)
