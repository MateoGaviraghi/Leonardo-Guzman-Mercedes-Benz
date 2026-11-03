/**
 * Empty-state de imagen — JAMÁS void. Gradiente silver reservando el aspect-ratio
 * del slot, con marca central sutil usando SOLO datos ya presentes (categoría o
 * nombre del vehículo) — cero copy inventado, cero íconos nuevos, sin loop.
 */
export function EmptyMedia({
  aspect = "16/9",
  tone = "dark",
  label,
  className = "",
}: {
  aspect?: "16/9" | "4/3";
  tone?: "light" | "dark";
  /** Texto ya existente (categoría/nombre del vehículo) — nunca inventado. */
  label?: string;
  className?: string;
}) {
  const aspectClass = aspect === "4/3" ? "aspect-[4/3]" : "aspect-[16/9]";
  const gradient =
    tone === "light"
      ? "bg-[linear-gradient(135deg,var(--color-silver-100),var(--color-silver-300))]"
      : "bg-[linear-gradient(135deg,var(--color-silver-700),var(--color-surface-2))]";

  return (
    <div
      className={`relative flex w-full items-center justify-center ${aspectClass} ${gradient} ${className}`}
    >
      {label && (
        <span className="text-eyebrow uppercase tracking-[0.3em] opacity-40">
          {label}
        </span>
      )}
    </div>
  );
}
