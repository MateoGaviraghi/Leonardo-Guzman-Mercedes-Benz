/**
 * Skeleton de un VehicleCard. Mismas dimensiones que la card real (aspect 16:9)
 * para evitar layout shift cuando carga la data. Shimmer sutil via CSS keyframes
 * (skeleton-shimmer en globals.css), respetuoso con prefers-reduced-motion (la
 * animation duration global queda a 0.01ms en ese caso → shimmer no se mueve).
 */
export default function VehicleCardSkeleton() {
  return (
    <div
      aria-hidden
      className="skeleton-shimmer relative w-full aspect-[16/9] border-2 border-transparent"
    >
      {/* Etiqueta categoría placeholder (bottom-left) */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className="h-2.5 w-20 bg-white/10 mb-3" />
        <div className="h-7 w-2/3 bg-white/10" />
      </div>
    </div>
  );
}
