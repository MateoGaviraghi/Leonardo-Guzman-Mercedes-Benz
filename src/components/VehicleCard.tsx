"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface VehicleCardProps {
  title: string;
  category: string;
  href: string;
  image: string; // Base path without extension, e.g., "/vehicles/id/foto-card/card"
  fuelType?: string; // "nafta" | "electrico" | "hibrido"
  isAMG?: boolean; // If true, apply AMG premium styling
}

const IMAGE_FORMATS = [".png", ".avif", ".webp", ".jpg", ".jpeg"];

export default function VehicleCard({
  title,
  category,
  href,
  image,
  fuelType,
  isAMG = false,
}: VehicleCardProps) {
  // Remove extension if provided to get base path
  const basePath = image.replace(/\.(png|avif|webp|jpg|jpeg)$/i, "");
  const [formatIndex, setFormatIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const currentSrc = `${basePath}${IMAGE_FORMATS[formatIndex]}`;
  const isElectric = fuelType?.toLowerCase() === "electrico";

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
      className={`group block relative w-full aspect-[16/9] overflow-hidden transition-all duration-500 ${
        isAMG
          ? "bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-[#5AC3B6]/30 hover:border-[#5AC3B6]/70 shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(90,195,182,0.1)] hover:shadow-[0_8px_40px_rgba(90,195,182,0.25),inset_0_1px_0_rgba(90,195,182,0.2)]"
          : "bg-neutral-900 border-2 border-transparent hover:border-white/20"
      }`}
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
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isAMG
            ? "bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.95)_0%,rgba(90,195,182,0.08)_40%,transparent_70%)] group-hover:opacity-90"
            : "bg-gradient-to-t from-black/90 via-black/40 to-transparent"
        }`}
      />

      {/* AMG Corner Accent */}
      {isAMG && (
        <div className="absolute top-0 right-0 w-24 h-24 opacity-40 group-hover:opacity-60 transition-opacity duration-500">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#5AC3B6]/20 to-transparent" />
        </div>
      )}

      {/* Tag Eléctrico */}
      {isElectric && (
        <div className="absolute top-4 right-4 z-20">
          <span className="inline-block bg-neutral-800/90 backdrop-blur-sm text-white text-xs font-semibold tracking-wide px-3 py-1 rounded-full border border-white/20">
            ⚡ Eléctrico
          </span>
        </div>
      )}

      {/* Content */}
      <div
        className={`absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end ${
          isAMG
            ? "bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16"
            : ""
        }`}
      >
        {/* AMG Badge */}
        {isAMG && (
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#5AC3B6]/90 uppercase bg-[#5AC3B6]/10 px-2 py-1 border border-[#5AC3B6]/20">
              AMG
            </span>
          </div>
        )}
        <p
          className={`text-xs font-bold tracking-widest mb-1.5 uppercase ${
            isAMG ? "text-[#5AC3B6]/80" : "text-white/80"
          }`}
        >
          {category}
        </p>
        <div className="flex items-center justify-between">
          <h3
            className={`text-2xl font-serif transition-colors duration-300 ${
              isAMG
                ? "text-white group-hover:text-[#5AC3B6]/90"
                : "text-white group-hover:text-white/90"
            }`}
          >
            {title}
          </h3>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 ${
              isAMG
                ? "border border-[#5AC3B6]/60 bg-[#5AC3B6]/10 backdrop-blur-sm shadow-[0_0_20px_rgba(90,195,182,0.3)]"
                : "border border-white/30"
            }`}
          >
            <ArrowRight
              size={15}
              className={`transition-transform duration-300 group-hover:translate-x-0.5 ${
                isAMG ? "text-[#5AC3B6]" : "text-white"
              }`}
            />
          </div>
        </div>

        {/* AMG Bottom Line Accent */}
        {isAMG && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#5AC3B6]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
      </div>
    </Link>
  );
}
