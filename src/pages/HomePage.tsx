export default function HomePage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Segusoft</h1>
        <p className="mt-2 text-slate-600">UI para consumir Seguros API.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-slate-900">Siguiente paso</div>
        <p className="mt-1 text-sm text-slate-600">
          Inicia sesión o regístrate para ver tu perfil.
        </p>
      </div>
    </div>
  )
}
