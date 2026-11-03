"use client";

import { RichText } from "@/components/RichText";
import { MultiFormatImage } from "./MultiFormatImage";
import { EmptyMedia } from "./EmptyMedia";
import { ShowroomCarousel, type ShowroomSlide } from "./ShowroomCarousel";

// Wrapper — construye slides[] para ShowroomCarousel (motor Embla vive ahí).
export function ImageCarousel({
  items,
  basePath,
  type,
  isAMG = false,
  variant = "auto",
}: {
  items: { title?: string; description?: string; num: number }[];
  basePath: string;
  /**
   * Subpath bajo `${basePath}/`. Acepta segmentos anidados:
   *   - "exterior", "interior" (legacy, ajustan estilo)
   *   - "equipment/variantes-carroceria", "equipment/carga", etc.
   */
  type: string;
  isAMG?: boolean;
  /**
   * "auto"  → usa "interior" si type==="interior", sino "exterior" (light).
   * "light" → fondo claro, texto oscuro (forzar).
   * "dark"  → fondo oscuro, texto claro (forzar).
   */
  variant?: "auto" | "light" | "dark";
}) {
  if (items.length === 0) return null;

  // Estilo: legacy "exterior"/"interior" mantienen el comportamiento original;
  // las secciones nuevas pueden forzar variant para elegir tema.
  const isInterior =
    variant === "dark" || (variant === "auto" && type === "interior");

  const tone: "dark" | "light" | "amg" = isAMG
    ? "amg"
    : isInterior
    ? "dark"
    : "light";

  const descriptionClass = `text-[15px] md:text-base leading-[1.6] font-light max-w-[60ch] text-left ${
    isAMG ? "text-silver-300" : isInterior ? "text-silver-300" : "text-silver-700"
  }`;
  const emptyTone: "light" | "dark" = isInterior ? "dark" : "light";

  const slides: ShowroomSlide[] = items.map((item) => ({
    key: String(item.num),
    media: (
      <>
        {/* Empty-state reservado detrás — nunca void */}
        <div className="absolute inset-0">
          <EmptyMedia aspect="16/9" tone={emptyTone} className="h-full" />
        </div>
        <MultiFormatImage
          basePath={`${basePath}/${type}/${item.num}`}
          alt={item.title || `${type} ${item.num}`}
          className="object-cover"
        />
      </>
    ),
    title: item.title,
    description: item.description ? (
      <RichText className={descriptionClass}>{item.description}</RichText>
    ) : undefined,
  }));

  return (
    <ShowroomCarousel slides={slides} regime="cover" tone={tone} isAMG={isAMG} />
  );
}
