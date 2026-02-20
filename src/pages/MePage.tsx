import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, type MeResponse } from '../api/auth'
import { clearToken } from '../auth/token'

export default function MePage() {
  const navigate = useNavigate()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const roleMessage =
    me?.roleName === 'Admin'
      ? 'Tienes acceso de administrador.'
      : me?.roleName === 'Agent'
        ? 'Acceso de agente: gestiona clientes y pólizas.'
        : me?.roleName === 'Client'
          ? 'Acceso de cliente: revisa tus productos y solicitudes.'
          : null

  useEffect(() => {
    let cancelled = false

    async function run() {
      setError(null)
      try {
        const data = await getMe()
        if (!cancelled) setMe(data)
      } catch (err: any) {
        const status = err?.response?.status
        if (status === 401) {
          clearToken()
          navigate('/login', { replace: true })
          return
        }
        setError(err?.response?.data?.message ?? 'No se pudo cargar el perfil')
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [navigate])

  function onLogout() {
    clearToken()
    navigate('/login')
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Mi Perfil</h2>
            <p className="mt-1 text-sm text-slate-600">Información de tu sesión actual.</p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!me && !error ? <div className="mt-6 text-sm text-slate-600">Cargando...</div> : null}

        {me ? (
          <div className="mt-6 grid gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-sm text-slate-700">
                Bienvenido,
                <span className="ml-1 font-semibold text-slate-900">
                  {me.firstName} {me.lastName}
                </span>
              </div>
              {roleMessage ? <div className="mt-1 text-sm text-slate-600">{roleMessage}</div> : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</div>
                <div className="mt-1 text-sm text-slate-900">{me.email}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Rol</div>
                <div className="mt-1 text-sm text-slate-900">{me.roleName}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
