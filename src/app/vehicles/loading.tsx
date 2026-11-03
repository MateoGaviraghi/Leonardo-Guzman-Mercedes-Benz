import VehicleCardSkeleton from "@/components/VehicleCardSkeleton";

/**
 * Loading state de /vehicles — feedback instantáneo (F1 de PLAN-UX.md) mientras
 * el server component de la ruta espera la respuesta de Supabase. Reemplaza el
 * árbol entero de la ruta (Next.js loading.tsx), por eso reserva arriba un bloque
 * negro de altura de hero (h-[100svh]) para que el swap a la grilla real no salte.
 */
export default function VehiclesLoading() {
  return (
    <div className="bg-mb-black min-h-screen">
      <div className="h-[100svh] bg-mb-black" aria-hidden />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
