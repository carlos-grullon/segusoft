import { Link, useNavigate } from 'react-router-dom'
import { clearToken, getToken } from '../auth/token'

export default function NavBar() {
  const navigate = useNavigate()
  const token = getToken()

  function onLogout() {
    clearToken()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-semibold tracking-tight text-slate-900">
            Segusoft
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
              Home
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!token ? (
            <>
              <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/me" className="text-sm text-slate-600 hover:text-slate-900">
                Profile
              </Link>
              <button
                onClick={onLogout}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
