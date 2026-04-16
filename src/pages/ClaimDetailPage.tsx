import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getClaimById, updateClaimStatus, type ClaimResponse } from '../api/claims'
import { getRole } from '../auth/token'

const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  InReview: 'bg-blue-100 text-blue-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-700',
}

const CLAIM_STATUSES = ['Pending', 'InReview', 'Approved', 'Rejected']

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const role = getRole()
  const canUpdateStatus = role === 'Admin' || role === 'Agent'

  const [claim, setClaim] = useState<ClaimResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getClaimById(Number(id))
      .then((data) => {
        if (cancelled) return
        setClaim(data)
        setSelectedStatus(data.status)
      })
      .catch((err) => {
        if (cancelled) return
        const status = err?.response?.status
        if (status === 401) { navigate('/login', { replace: true }); return }
        setError(err?.response?.data?.message ?? 'No se pudo cargar el reclamo')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, navigate])

  async function onUpdateStatus() {
    if (!id || !claim) return
    setUpdateError(null)
    setUpdateSuccess(false)
    setUpdating(true)
    try {
      const updated = await updateClaimStatus(Number(id), selectedStatus)
      setClaim(updated)
      setUpdateSuccess(true)
    } catch (err: any) {
      setUpdateError(err?.response?.data?.message ?? 'Error al actualizar el estado')
    } finally {
      setUpdating(false)
    }
  }

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

  if (!claim) return null

  return (
    <div className="grid gap-6 max-w-2xl mx-auto">
      <div>
        <Link to="/claims" className="text-sm text-slate-500 hover:text-slate-800">← Reclamos</Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{claim.claimNumber}</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 grid gap-5">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[claim.status] ?? 'bg-slate-100 text-slate-700'}`}>
            {claim.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="N° Reclamo" value={claim.claimNumber} mono />
          <Field label="Cliente" value={claim.clientFullName} />
          <Field label="Fecha del incidente" value={formatDate(claim.incidentDate)} />
          <Field label="Fecha de creación" value={formatDate(claim.createdAt)} />
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Póliza</div>
            <Link
              to={`/policies/${claim.policyId}`}
              className="mt-1 block text-sm text-blue-700 hover:underline font-mono"
            >
              {claim.policyNumber}
            </Link>
          </div>
          <Field label="Tipo de póliza" value={claim.policyType} />
          <Field label="Estado de póliza" value={claim.policyStatus} />
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Descripción</div>
          <p className="text-sm text-slate-700">{claim.description}</p>
        </div>
      </div>

      {canUpdateStatus && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Actualizar estado</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setUpdateSuccess(false) }}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              {CLAIM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={onUpdateStatus}
              disabled={updating || selectedStatus === claim.status}
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {updating ? 'Actualizando...' : 'Actualizar estado'}
            </button>
          </div>
          {updateError && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              Estado actualizado correctamente.
            </div>
          )}
        </div>
      )}
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
