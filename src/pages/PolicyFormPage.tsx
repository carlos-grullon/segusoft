import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createPolicy, getPolicyById, updatePolicy, type CreatePolicyRequest, type UpdatePolicyRequest } from '../api/policies'
import { getRole } from '../auth/token'

const POLICY_TYPES = ['Auto', 'Health', 'Home', 'Life']
const POLICY_STATUSES = ['Pending', 'Active', 'Expired', 'Cancelled']

export default function PolicyFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const role = getRole()

  const [type, setType] = useState('Auto')
  const [status, setStatus] = useState('Pending')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [premiumAmount, setPremiumAmount] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [agentId, setAgentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit || !id) return
    let cancelled = false
    getPolicyById(Number(id))
      .then((p) => {
        if (cancelled) return
        setType(p.type)
        setStatus(p.status)
        setStartDate(p.startDate.slice(0, 10))
        setEndDate(p.endDate.slice(0, 10))
        setPremiumAmount(String(p.premiumAmount))
        setDescription(p.description ?? '')
        setAgentId(p.agentId ? String(p.agentId) : '')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.response?.data?.message ?? 'No se pudo cargar la póliza')
      })
      .finally(() => { if (!cancelled) setLoadingData(false) })
    return () => { cancelled = true }
  }, [id, isEdit])

  if (role !== 'Admin' && role !== 'Agent') {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        No tienes permiso para acceder a esta página.
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isEdit && id) {
        const payload: UpdatePolicyRequest = {
          type,
          status,
          startDate,
          endDate,
          premiumAmount: Number(premiumAmount),
          description: description || undefined,
          agentId: agentId ? Number(agentId) : undefined,
        }
        await updatePolicy(Number(id), payload)
        navigate(`/policies/${id}`)
      } else {
        const payload: CreatePolicyRequest = {
          type,
          startDate,
          endDate,
          premiumAmount: Number(premiumAmount),
          description: description || undefined,
          clientId: Number(clientId),
          agentId: agentId ? Number(agentId) : undefined,
        }
        const created = await createPolicy(payload)
        navigate(`/policies/${created.policyId}`)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al guardar la póliza')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {isEdit ? 'Editar Póliza' : 'Nueva Póliza'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {isEdit ? 'Modifica los datos de la póliza.' : 'Completa los datos para registrar una nueva póliza.'}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              {POLICY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {isEdit && (
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              >
                {POLICY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Fecha inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Fecha fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Prima mensual (USD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={premiumAmount}
              onChange={(e) => setPremiumAmount(e.target.value)}
              required
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {!isEdit && (
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">ID del cliente</label>
              <input
                type="number"
                min="1"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          )}

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">ID del agente <span className="text-slate-400">(opcional)</span></label>
            <input
              type="number"
              min="1"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Descripción <span className="text-slate-400">(opcional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear póliza'}
            </button>
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/policies/${id}` : '/policies')}
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
