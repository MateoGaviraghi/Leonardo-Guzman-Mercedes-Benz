/**
 * Placeholder de carga para /crm/zonas (grilla/lista de gestión de zonas).
 * Replica el layout de ZonasAdmin: header de página + lista de filas de zona.
 */
export default function ZonasLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 animate-pulse">
        <div className="h-5 w-32 bg-slate-200 rounded mb-3" />
        <div className="h-8 w-56 bg-slate-200 rounded mb-2" />
        <div className="h-5 w-full max-w-2xl bg-slate-200 rounded" />
      </div>

      <div className="space-y-4 animate-pulse">
        <div className="h-12 w-full bg-slate-100 rounded-lg" />
        <ul className="space-y-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="bg-slate-100 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
