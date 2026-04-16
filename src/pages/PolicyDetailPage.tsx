import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPolicyById, type PolicyResponse } from '../api/policies'
import { getClaims, type ClaimResponse } from '../api/claims'
import { getRole } from '../auth/token'

const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Active: 'bg-green-100 text-green-800',
  Expired: 'bg-gray-100 text-gray-700',
  Cancelled: 'bg-red-100 text-red-700',
}

const CLAIM_STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  InReview: 'bg-blue-100 text-blue-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-700',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const role = getRole()
  const canEdit = role === 'Admin' || role === 'Agent'

  const [policy, setPolicy] = useState<PolicyResponse | null>(null)
  const [claims, setClaims] = useState<ClaimResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    const numId = Number(id)

    Promise.all([getPolicyById(numId), getClaims()])
      .then(([pol, allClaims]) => {
        if (cancelled) return
        setPolicy(pol)
        setClaims(allClaims.filter((c) => c.policyId === numId))
      })
      .catch((err) => {
        if (cancelled) return
        const status = err?.response?.status
        if (status === 401) { navigate('/login', { replace: true }); return }
        setError(err?.response?.data?.message ?? 'No se pudo cargar la póliza')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
    )
  }

  if (!policy) return null

  return (
    <div className="grid gap-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/policies" className="text-sm text-slate-500 hover:text-slate-800">← Pólizas</Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{policy.policyNumber}</h1>
        </div>
        <div className="flex items-center gap-2">
          {policy.status === 'Active' && (
            <Link
              to={`/claims/new?policyId=${policy.policyId}`}
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Crear Reclamo
            </Link>
          )}
          {canEdit && (
            <Link
              to={`/policies/${policy.policyId}/edit`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
            >
              Editar póliza
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 grid gap-5">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-slate-900">{policy.type}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[policy.status] ?? 'bg-slate-100 text-slate-700'}`}>
            {policy.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="N° Póliza" value={policy.policyNumber} mono />
          <Field label="Tipo" value={policy.type} />
          <Field label="Cliente" value={`${policy.clientFullName} (${policy.clientEmail})`} />
          <Field
            label="Agente"
            value={policy.agentFullName ? `${policy.agentFullName} (${policy.agentEmail})` : 'Sin asignar'}
          />
          <Field label="Prima mensual" value={formatCurrency(policy.premiumAmount)} />
          <Field label="Fecha inicio" value={formatDate(policy.startDate)} />
          <Field label="Fecha fin" value={formatDate(policy.endDate)} />
          <Field label="Creado" value={formatDate(policy.createdAt)} />
        </div>

        {policy.description && (
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Descripción</div>
            <p className="text-sm text-slate-700">{policy.description}</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Reclamos de esta póliza</h2>
        {claims.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
            No hay reclamos asociados a esta póliza.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-700">N° Reclamo</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Estado</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Fecha incidente</th>
                  <th className="px-4 py-3 font-medium text-slate-700" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {claims.map((c) => (
                  <tr key={c.claimId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-900">{c.claimNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${CLAIM_STATUS_BADGE[c.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(c.incidentDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/claims/${c.claimId}`}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-sm text-slate-900 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}
