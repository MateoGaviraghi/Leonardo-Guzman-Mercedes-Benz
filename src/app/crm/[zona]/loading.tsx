/**
 * Placeholder de carga para /crm/[zona]/* (pizarron, agenda, ventas).
 * Replica el layout del Board: header de página + 4 columnas Kanban en
 * desktop (grid-cols-4), 1 columna simulada en mobile.
 */
export default function ZonaLoading() {
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6 animate-pulse">
        <div className="min-w-0 flex-1">
          <div className="h-7 w-56 bg-slate-200 rounded mb-2" />
          <div className="hidden sm:block h-5 w-96 max-w-full bg-slate-200 rounded" />
        </div>
        <div className="h-12 w-28 sm:w-40 bg-slate-200 rounded-lg flex-shrink-0" />
      </div>

      {/* Desktop: 4 columnas */}
      <div className="hidden md:grid grid-cols-4 gap-3 lg:gap-4 animate-pulse">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-slate-100 rounded-lg overflow-hidden flex flex-col"
          >
            <div className="px-3 pt-3 pb-3 border-b border-slate-200/60">
              <div className="h-5 w-24 bg-slate-200 rounded" />
            </div>
            <div className="flex-1 px-2 pb-2 pt-2 space-y-2">
              <div className="h-20 bg-white rounded-md" />
              <div className="h-20 bg-white rounded-md" />
              <div className="h-20 bg-white rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: tabs + una columna */}
      <div className="md:hidden animate-pulse">
        <div className="h-11 bg-slate-100 rounded-lg mb-4" />
        <div className="space-y-2">
          <div className="h-20 bg-slate-100 rounded-md" />
          <div className="h-20 bg-slate-100 rounded-md" />
          <div className="h-20 bg-slate-100 rounded-md" />
        </div>
      </div>
    </div>
  );
}
