"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/**
 * Badge rojo con el conteo de tarjetas vencidas (pizarrón, next_contact_at < hoy).
 * Al tocarlo toggleea el filtro ?vencidas=1 en la URL (del pizarrón de la zona actual).
 * Si no hay vencidas, no se renderiza.
 */
export function OverdueBadge({
  count,
  zonaSlug,
}: {
  count: number;
  zonaSlug: string;
}) {
  const searchParams = useSearchParams();
  const active = searchParams.get("vencidas") === "1";

  if (count === 0) return null;

  const params = new URLSearchParams(searchParams.toString());
  if (active) params.delete("vencidas");
  else params.set("vencidas", "1");
  const qs = params.toString();
  const href = `/crm/${zonaSlug}/pizarron${qs ? `?${qs}` : ""}`;

  return (
    <Link
      href={href}
      title={
        active
          ? "Quitar filtro de vencidas"
          : `Ver las ${count} tarjetas vencidas`
      }
      aria-pressed={active}
      className={[
        "inline-flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg text-sm font-bold border-2 transition-colors flex-shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1",
        active
          ? "bg-red-600 text-white border-red-600 shadow-md"
          : "bg-red-50 text-red-800 border-red-300 hover:bg-red-100 hover:border-red-400",
      ].join(" ")}
    >
      <AlertTriangle className="w-5 h-5" aria-hidden="true" />
      <span>
        {count} {count === 1 ? "vencida" : "vencidas"}
      </span>
    </Link>
  );
}
