import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createClaim } from '../api/claims'

export default function ClaimFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [policyId, setPolicyId] = useState(searchParams.get('policyId') ?? '')
  const [description, setDescription] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const created = await createClaim({
        policyId: Number(policyId),
        description,
        incidentDate,
      })
      navigate(`/claims/${created.claimId}`)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al crear el reclamo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Nuevo Reclamo</h1>
        <p className="mt-1 text-sm text-slate-600">Registra un reclamo asociado a una póliza activa.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">ID de la póliza</label>
            <input
              type="number"
              min="1"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              required
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Fecha del incidente</label>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              required
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe el incidente con el mayor detalle posible."
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
              {loading ? 'Creando...' : 'Crear reclamo'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/claims')}
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
