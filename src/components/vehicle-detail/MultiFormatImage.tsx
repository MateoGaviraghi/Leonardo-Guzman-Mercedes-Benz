"use client";

import { useState } from "react";
import Image from "next/image";
import { useFormatoFoto } from "./FormatosFotos";

// Image formats to try
export const IMAGE_FORMATS = ["avif", "webp", "jpg", "jpeg", "png"];

// Multi-format Image Component
// Si la lista del build (FormatosFotos) sabe el formato de la foto, se pide ese
// primero y no hay 404; si dice que la foto no existe, no se pide. Sin lista
// (un auto subido después del build), o si ese archivo falla, sigue probando
// los demás formatos como antes.
export function MultiFormatImage({
  basePath,
  alt,
  fill = true,
  className = "",
  priority = false,
  sizes = "100vw",
}: {
  basePath: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const conocido = useFormatoFoto(basePath);
  const orden = conocido
    ? [conocido, ...IMAGE_FORMATS.filter((f) => f !== conocido)]
    : IMAGE_FORMATS;

  // El intento se guarda junto a la ruta: si cambia la foto, vuelve a empezar.
  const [intento, setIntento] = useState({ ruta: basePath, i: 0 });
  const i = intento.ruta === basePath ? intento.i : 0;

  // `null`: la lista del build dice que esta foto no existe → no se pide.
  if (conocido === null || i >= orden.length) return null;

  return (
    <Image
      src={`${basePath}.${orden[i]}`}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
      unoptimized
      onError={() => setIntento({ ruta: basePath, i: i + 1 })}
    />
  );
}
