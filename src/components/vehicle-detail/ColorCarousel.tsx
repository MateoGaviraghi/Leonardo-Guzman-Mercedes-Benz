"use client";

import { useState } from "react";
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

  // Check for available color images (1-7)
  const colorImages = [1, 2, 3, 4, 5, 6, 7].filter(
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
