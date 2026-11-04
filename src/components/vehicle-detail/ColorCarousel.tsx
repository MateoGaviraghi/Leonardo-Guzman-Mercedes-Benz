"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ShowroomCarousel, type ShowroomSlide } from "./ShowroomCarousel";

// Wrapper — construye slides[] para ShowroomCarousel (motor Embla vive ahí).
// Régimen "backdrop": foreground object-contain + backdrop de la misma imagen
// (scale-1.3 blur-48px brightness-0.85, estático) llenando el marco.
// Fallback de formatos (jpg→png→avif→webp) INTACTO.
export function ColorCarousel({
  vehicleId,
  isAMG = false,
}: {
  vehicleId: string;
  isAMG?: boolean;
}) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [imageFormat, setImageFormat] = useState<Record<number, string>>({});

  // Colores 1-7: se muestran y los que no tienen foto se descartan por onError.
  // Colores 8-10 (autos con más de 7, como la CLE): se suman solo si la foto
  // existe, porque fuera de pantalla el <Image> lazy nunca falla y quedarían
  // slides vacíos en los autos que tienen 7.
  const [extras, setExtras] = useState<number[]>([]);
  useEffect(() => {
    let vivo = true;
    const formats = ["jpg", "png", "avif", "webp"];
    const existe = (src: string) =>
      new Promise<boolean>((ok) => {
        const img = new window.Image();
        img.onload = () => ok(true);
        img.onerror = () => ok(false);
        img.src = src;
      });
    (async () => {
      const halladas: number[] = [];
      const formatos: Record<number, string> = {};
      for (const num of [8, 9, 10]) {
        let hallada = false;
        for (const f of formats) {
          if (await existe(`/vehicles/${vehicleId}/colors/${num}.${f}`)) {
            halladas.push(num);
            formatos[num] = f;
            hallada = true;
            break;
          }
        }
        if (!hallada) break; // numeración correlativa: si falta el 8, no hay 9
      }
      if (!vivo || !halladas.length) return;
      setImageFormat((prev) => ({ ...prev, ...formatos }));
      setExtras(halladas);
    })();
    return () => {
      vivo = false;
    };
  }, [vehicleId]);

  const colorImages = [1, 2, 3, 4, 5, 6, 7, ...extras].filter(
    (num) => !imageErrors.has(num)
  );

  if (colorImages.length === 0) return null;

  const tone: "dark" | "light" | "amg" = isAMG ? "amg" : "light";

  const slides: ShowroomSlide[] = colorImages.map((num) => {
    const format = imageFormat[num] || "jpg";
    const src = `/vehicles/${vehicleId}/colors/${num}.${format}`;
    return {
      key: String(num),
      backdropSrc: src,
      media: (
        <Image
          src={src}
          alt={`Color ${num}`}
          fill
          className="object-contain"
          onError={() => {
            // Intentar siguiente formato
            const formats = ["jpg", "png", "avif", "webp"];
            const currentIndex = formats.indexOf(format);
            if (currentIndex < formats.length - 1) {
              setImageFormat((prev) => ({
                ...prev,
                [num]: formats[currentIndex + 1],
              }));
            } else {
              setImageErrors((prev) => new Set(prev).add(num));
            }
          }}
          unoptimized
        />
      ),
    };
  });

  return (
    <ShowroomCarousel slides={slides} regime="backdrop" tone={tone} isAMG={isAMG} />
  );
}
