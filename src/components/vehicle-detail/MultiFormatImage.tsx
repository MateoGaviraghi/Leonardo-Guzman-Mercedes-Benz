"use client";

import { useState } from "react";
import Image from "next/image";

// Image formats to try
export const IMAGE_FORMATS = ["avif", "webp", "jpg", "jpeg", "png"];

// Multi-format Image Component
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
  const [formatIndex, setFormatIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (formatIndex < IMAGE_FORMATS.length - 1) {
      setFormatIndex(formatIndex + 1);
    } else {
      setHasError(true);
    }
  };

  if (hasError) return null;

  return (
    <Image
      src={`${basePath}.${IMAGE_FORMATS[formatIndex]}`}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
      unoptimized
      onError={handleError}
    />
  );
}
