"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface VehicleCardProps {
  title: string;
  category: string;
  href: string;
  image: string; // Base path without extension, e.g., "/vehicles/id/foto-card/card"
}

const IMAGE_FORMATS = [".png", ".avif", ".webp", ".jpg", ".jpeg"];

export default function VehicleCard({
  title,
  category,
  href,
  image,
}: VehicleCardProps) {
  // Remove extension if provided to get base path
  const basePath = image.replace(/\.(png|avif|webp|jpg|jpeg)$/i, "");
  const [formatIndex, setFormatIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const currentSrc = `${basePath}${IMAGE_FORMATS[formatIndex]}`;

  const handleImageError = () => {
    if (formatIndex < IMAGE_FORMATS.length - 1) {
      setFormatIndex(formatIndex + 1);
    } else {
      setImageError(true);
    }
  };

  return (
    <Link
      href={href}
      className="group block relative w-full aspect-[16/9] overflow-hidden bg-neutral-900"
    >
      {/* Background Image */}
      {!imageError ? (
        <img
          src={currentSrc}
          alt={title}
          onError={handleImageError}
          className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
          <span className="text-zinc-500 text-sm">Sin imagen</span>
        </div>
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
        <p className="text-xs font-bold tracking-widest text-white/80 mb-1 uppercase">
          {category}
        </p>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-serif text-white group-hover:text-white/90 transition-colors">
            {title}
          </h3>
          <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
            <ArrowRight size={14} className="text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}
