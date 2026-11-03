/**
 * Loading state de /vehicles/[id] — feedback instantáneo (F1 de PLAN-UX.md)
 * mientras el server component espera la respuesta de Supabase. Placeholder
 * sobrio: bloque hero full-viewport (h-[100svh], como el hero real) con
 * shimmer sutil, más una barra de título fantasma debajo. Tonos del sitio
 * (mb-black / silver del @theme), cero hairlines, cero border-radius.
 */
export default function VehicleDetailLoading() {
  return (
    <div className="bg-mb-black min-h-screen">
      <div className="skeleton-shimmer h-[100svh] w-full" aria-hidden />
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
        <div className="h-2.5 w-32 bg-white/10 mb-4" />
        <div className="h-10 w-2/3 md:w-1/2 bg-white/10" />
      </div>
    </div>
  );
}
