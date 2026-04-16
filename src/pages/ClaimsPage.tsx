import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getClaims, type ClaimResponse } from '../api/claims'

const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  InReview: 'bg-blue-100 text-blue-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-700',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ClaimsPage() {
  const navigate = useNavigate()
  const [claims, setClaims] = useState<ClaimResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getClaims()
      .then((data) => { if (!cancelled) setClaims(data) })
      .catch((err) => {
        if (cancelled) return
        const status = err?.response?.status
        if (status === 401) { navigate('/login', { replace: true }); return }
        setError(err?.response?.data?.message ?? 'No se pudieron cargar los reclamos')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [navigate])

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reclamos</h1>
        <p className="mt-1 text-sm text-slate-600">Lista de reclamos registrados en el sistema.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {claims.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">No hay reclamos disponibles.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-700">N° Reclamo</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Estado</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Tipo póliza</th>
                  <th className="px-4 py-3 font-medium text-slate-700">N° Póliza</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Cliente</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Fecha incidente</th>
                  <th className="px-4 py-3 font-medium text-slate-700" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {claims.map((c) => (
                  <tr key={c.claimId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-900">{c.claimNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[c.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{c.policyType}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">{c.policyNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{c.clientFullName}</td>
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
          )}
        </div>
      )}
    </div>
  )
}
