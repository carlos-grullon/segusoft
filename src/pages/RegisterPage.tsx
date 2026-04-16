import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { setToken, setRole } from '../auth/token'

type RoleName = 'Admin' | 'Client' | 'Agent'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [roleName, setRoleName] = useState<RoleName>('Client')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await register({ email, password, firstName, lastName, roleName })
      setToken(res.token)
      setRole(res.roleName)
      navigate('/me')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight">Register</h2>
        <p className="mt-1 text-sm text-slate-600">Crea una cuenta para acceder al sistema.</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={6}
              required
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Role</label>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value as RoleName)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="Admin">Admin</option>
              <option value="Client">Client</option>
              <option value="Agent">Agent</option>
            </select>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Creando...' : 'Register'}
          </button>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  )
}
