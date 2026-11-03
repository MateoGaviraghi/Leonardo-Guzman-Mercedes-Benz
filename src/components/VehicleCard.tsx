"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface VehicleCardProps {
  title: string;
  category: string;
  href: string;
  image: string; // Base path without extension, e.g., "/vehicles/id/foto-card/card"
  fuelType?: string | null; // "nafta" | "electrico" | "hibrido"
  isAMG?: boolean; // If true, apply AMG premium styling
}

const IMAGE_FORMATS = [".png", ".avif", ".webp", ".jpg", ".jpeg"];

/** JPEG 8x8 px tono neutro #1a1a1a (mb-gray) usado como placeholder
 *  blur mientras se carga la imagen real del card. */
const PLACEHOLDER_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEhAQEBAVFRAQEBASEBAQEBAVFhUWFRUWFhUVFRUYHCggGBolHRYVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0NFRAQFS0dFR0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIABAAEAMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q==";

// Tilt 3D: rango contenido (grados) + spring de damping alto — sin overshoot,
// movimiento premium y sobrio (motion-web-senior: nada de springs "juguetones").
const TILT_DEG = 7;
const TILT_SPRING = { stiffness: 260, damping: 30, mass: 0.6 };

/**
 * Card de vehículo (home §Acto 2 + reutilizada en /vehicles).
 *
 * Hover = lift del bloque (CSS) + tilt 3D al mouse (perspective/rotateX/Y,
 * framer-motion springs contenidos) + escala 1.04 de
 * la imagen + stroke blanca avivada. Geometría recta — cero border-radius.
 * Tilt desactivado en touch / prefers-reduced-motion.
 */
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

  const cardRef = useRef<HTMLAnchorElement>(null);
  const tiltEnabled = useRef(false);
  // will-change-transform transiente: solo durante interacción (patrón
  // AutonomySection.tsx) — evita promover una capa de compositor permanente
  // por card sin interacción.
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    tiltEnabled.current =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);

  const rotateX = useSpring(rotateXRaw, TILT_SPRING);
  const rotateY = useSpring(rotateYRaw, TILT_SPRING);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLAnchorElement>) => {
      if (!tiltEnabled.current || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      rotateYRaw.set((px - 0.5) * TILT_DEG * 2);
      rotateXRaw.set(-(py - 0.5) * TILT_DEG * 2);
    },
    [rotateXRaw, rotateYRaw],
  );

  const handlePointerLeave = useCallback(() => {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
    setIsActive(false);
  }, [rotateXRaw, rotateYRaw]);

  return (
    <Link
      ref={cardRef}
      href={href}
      onPointerEnter={() => setIsActive(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      style={{ perspective: 1200 }}
      className={`group relative block w-full aspect-[16/9] overflow-hidden transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] hover:-translate-y-1 focus-visible:-translate-y-1 active:opacity-90 ${
        isAMG
          ? "bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-[#5AC3B6]/30 hover:border-[#5AC3B6]/70 focus-visible:border-[#5AC3B6]/70 shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(90,195,182,0.1)] hover:shadow-[0_8px_40px_rgba(90,195,182,0.25),inset_0_1px_0_rgba(90,195,182,0.2)]"
          : "bg-mb-black border border-white/8 hover:border-white/20 focus-visible:border-white/20"
      }`}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`absolute inset-0 ${isActive ? "will-change-transform" : ""}`}
      >
        {/* Background Image — la entrada del card (opacity+y) la posee la
            página (ScrollTrigger.batch); acá solo vive el hover emphasis. */}
        {!imageError ? (
          <div className="absolute inset-0">
            <Image
              src={currentSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              onError={handleImageError}
              unoptimized
              placeholder="blur"
              blurDataURL={PLACEHOLDER_BLUR}
              className="object-cover object-center transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-mb-black">
            <span className="text-silver-500 text-sm text-center px-4">
              {title}
            </span>
          </div>
        )}

        {/* Overlay Gradient */}
        <div
          className={`absolute inset-0 transition-opacity duration-[var(--dur-micro)] ${
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
            <span className="inline-block bg-mb-black text-white text-xs font-semibold tracking-wide px-3 py-1 border border-white/20">
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
              className={`text-2xl font-display font-medium transition-colors duration-300 ${
                isAMG
                  ? "text-white group-hover:text-[#5AC3B6]/90"
                  : "text-white group-hover:text-white/90"
              }`}
            >
              {title}
            </h3>
            <div
              className={`w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 ${
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
      </motion.div>
    </Link>
  );
}
