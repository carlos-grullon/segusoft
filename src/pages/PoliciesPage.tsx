import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPolicies, type PolicyResponse } from '../api/policies'
import { getRole } from '../auth/token'

const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Active: 'bg-green-100 text-green-800',
  Expired: 'bg-gray-100 text-gray-700',
  Cancelled: 'bg-red-100 text-red-700',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function PoliciesPage() {
  const navigate = useNavigate()
  const role = getRole()
  const canCreate = role === 'Admin' || role === 'Agent'

  const [policies, setPolicies] = useState<PolicyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPolicies()
      .then((data) => { if (!cancelled) setPolicies(data) })
      .catch((err) => {
        if (cancelled) return
        const status = err?.response?.status
        if (status === 401) { navigate('/login', { replace: true }); return }
        setError(err?.response?.data?.message ?? 'No se pudieron cargar las pólizas')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [navigate])

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pólizas</h1>
          <p className="mt-1 text-sm text-slate-600">Lista de pólizas disponibles en el sistema.</p>
        </div>
        {canCreate && (
          <Link
            to="/policies/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            Nueva Póliza
          </Link>
        )}
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
          {policies.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">No hay pólizas disponibles.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-700">N° Póliza</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Tipo</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Estado</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Cliente</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Prima</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Inicio</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Fin</th>
                  <th className="px-4 py-3 font-medium text-slate-700" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {policies.map((p) => (
                  <tr key={p.policyId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-900">{p.policyNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{p.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[p.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{p.clientFullName}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(p.premiumAmount)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.startDate)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.endDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/policies/${p.policyId}`}
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
