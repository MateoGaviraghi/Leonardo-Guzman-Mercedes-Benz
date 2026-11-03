"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import type { Vehicle } from "@/data/vehicles";

/**
 * Carrusel 3D cilíndrico interactivo (home §Acto 2) — reemplaza el grid de
 * cards. Adaptado del snippet provisto por el cliente: mismo mecanismo de
 * drag + spring de inercia al soltar, pero:
 *  - onDrag usa info.delta.x (incremental) en vez de info.offset.x
 *    (cumulativo). El snippet original sumaba el offset-desde-el-inicio del
 *    gesto en cada frame, lo que hace que la velocidad de rotación dependa
 *    de cuántos frames dura el drag (un drag lento gira MÁS que uno rápido
 *    para la misma distancia) — physics rota, no lo que el cliente pidió.
 *    El spring del onDragEnd sí se deja intacto (excepción explícita).
 *  - Sin overlay de imagen expandida al click: cada cara navega directo a
 *    /vehicles/{id}. Un click post-drag se cancela (hasDraggedRef).
 *  - Caras = vehículos reales (imagen foto-card + fallback de formatos,
 *    nombre, badge AMG). Geometría recta — cero rounded.
 */

// Orden = convención real de los assets (avif primero): probar .png primero
// hacía que casi todas las caras quemaran 1-2 requests 404 antes de dar con
// el archivo real → carga lenta que "parece bug", sobre todo en mobile.
const IMAGE_FORMATS = [".avif", ".webp", ".jpg", ".jpeg", ".png"];
// Geometría FIJA del cilindro: todas las categorías renderizan exactamente
// este número de caras (repitiendo vehículos hasta llenar el anillo). Antes
// el radio dependía de cuántos vehículos tenía la categoría → los carruseles
// se veían de tamaños distintos entre tabs. 10 caras = el look de Trucks
// (el aprobado por el cliente), idéntico en todas.
const FACE_TOTAL = 10;
const ROTATE_DEG_PER_PX = 0.25;
// Rotación automática: una vuelta completa cada 50s — lenta y continua,
// sensación premium (no un "spinner"). Se pausa por completo mientras hay
// interacción (drag, settle post-drag, hover desktop) o la pestaña está
// oculta; ver el useEffect de auto-rotación más abajo.
const AUTO_ROTATE_DEG_PER_SEC = 360 / 50;

function useIsScreenSm() {
  const [isSm, setIsSm] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = (e: MediaQueryListEvent) => setIsSm(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isSm;
}

function CarouselFaceImage({ vehicle }: { vehicle: Vehicle }) {
  const [formatIndex, setFormatIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const src = `/vehicles/${vehicle.id}/foto-card/card${IMAGE_FORMATS[formatIndex]}`;

  const handleError = () => {
    if (formatIndex < IMAGE_FORMATS.length - 1) {
      setFormatIndex((i) => i + 1);
    } else {
      setImageError(true);
    }
  };

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border border-white/10 bg-neutral-900">
      {!imageError ? (
        <Image
          src={src}
          alt={vehicle.name}
          fill
          draggable={false}
          sizes="(max-width: 640px) 190px, 260px"
          onError={handleError}
          unoptimized
          // Eager: las caras del cilindro son pocas y están "en pantalla"
          // aunque roten fuera de la cámara — lazy las cargaba recién al
          // girar, con pop-in visible.
          loading="eager"
          className="pointer-events-none select-none object-cover object-center"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-silver-500">
          {vehicle.name}
        </div>
      )}
      {vehicle.is_amg && (
        <span className="pointer-events-none absolute left-0 top-0 border border-[#5AC3B6]/40 bg-black/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#5AC3B6]/90">
          AMG
        </span>
      )}
    </div>
  );
}

function FaceCaption({ vehicle }: { vehicle: Vehicle }) {
  return (
    <>
      <p className="mt-3 truncate text-[10px] font-mono uppercase tracking-[0.14em] text-silver-500">
        {vehicle.category}
      </p>
      <h3 className="truncate text-base font-display font-medium text-white transition-colors duration-[var(--dur-micro)] group-hover:text-silver-300">
        {vehicle.name}
      </h3>
    </>
  );
}

interface ThreeDVehicleCarouselProps {
  vehicles: Vehicle[];
  reducedMotion?: boolean;
}

export default function ThreeDVehicleCarousel({
  vehicles,
  reducedMotion = false,
}: ThreeDVehicleCarouselProps) {
  const isSm = useIsScreenSm();
  const rotation = useMotionValue(0);
  const hasDraggedRef = useRef(false);
  // Flags de pausa de la auto-rotación — refs (no state) porque se leen
  // desde un rAF loop en cada frame y no deben disparar re-renders.
  const isDraggingRef = useRef(false);
  const isSettlingRef = useRef(false);
  const isHoveredRef = useRef(false);
  // Fuera de viewport (scrolleado lejos del carrusel): mismo mecanismo de
  // pausa que document.hidden — el rAF sigue vivo pero no suma grados,
  // liberando main thread/batería en mobile mientras no se ve nada girar.
  const isOutOfViewRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Anillo de tamaño fijo: se cicla la lista de vehículos hasta llenar
  // exactamente FACE_TOTAL caras — mismo radio y mismo tamaño aparente en
  // todas las categorías. Para el fallback reduced-motion (fila estática)
  // no se duplica — ahí no hay "vacío" que disimular.
  const faces = useMemo(() => {
    if (vehicles.length === 0) return [];
    return Array.from({ length: FACE_TOTAL }, (_, i) => ({
      vehicle: vehicles[i % vehicles.length],
      key: `${vehicles[i % vehicles.length].id}-${i}`,
    }));
  }, [vehicles]);

  const faceWidth = isSm ? 190 : 260;
  const faceCount = faces.length;
  const cylinderWidth = faceWidth * faceCount;
  const radius = cylinderWidth / (2 * Math.PI);

  // La página remonta este componente con key={categoria} al cambiar de tab,
  // pero por las dudas (fast-refresh / reuso) arrancamos siempre en 0.
  useEffect(() => {
    rotation.set(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-rotación continua vía rAF: suma grados/frame a la misma motion
  // value que gira el cilindro (`rotation`), así conviven con el drag y el
  // spring de inercia sin pisarse. Se desactiva del todo bajo
  // prefers-reduced-motion (ese caso ni siquiera monta este branch, pero el
  // guard queda explícito por claridad).
  useEffect(() => {
    if (reducedMotion) return;

    let rafId: number;
    let lastTime: number | null = null;

    const tick = (time: number) => {
      if (lastTime === null) lastTime = time;
      const deltaMs = time - lastTime;
      lastTime = time;

      const paused =
        isDraggingRef.current ||
        isSettlingRef.current ||
        isHoveredRef.current ||
        isOutOfViewRef.current ||
        document.hidden;

      if (!paused) {
        rotation.set(
          rotation.get() + (AUTO_ROTATE_DEG_PER_SEC * deltaMs) / 1000,
        );
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reducedMotion, rotation]);

  // Pausa por viewport: mismo mecanismo que document.hidden (ref leído por
  // el rAF de arriba, no state — no debe re-renderizar por scroll). Si el
  // carrusel scrollea fuera de pantalla, el loop deja de sumar grados hasta
  // que vuelve a entrar.
  useEffect(() => {
    if (reducedMotion) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isOutOfViewRef.current = !entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      hasDraggedRef.current = false;
    }
  }, []);

  if (faces.length === 0) return null;

  // prefers-reduced-motion: sin física de drag/inercia — fila estática
  // scrolleable, más estable y predecible que un cilindro sin animación.
  if (reducedMotion) {
    return (
      <div
        role="list"
        aria-label="Vehículos de la categoría"
        className="flex h-[300px] items-center gap-5 overflow-x-auto px-1 pb-2 md:h-[380px]"
      >
        {vehicles.map((vehicle) => (
          <Link
            key={vehicle.id}
            href={`/vehicles/${vehicle.id}`}
            role="listitem"
            className="group w-[220px] shrink-0"
          >
            <CarouselFaceImage vehicle={vehicle} />
            <FaceCaption vehicle={vehicle} />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-[320px] items-center justify-center overflow-hidden md:h-[440px]"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        drag="x"
        // El cilindro NO debe trasladarse nunca: constreñir el drag a (0,0)
        // con elástico 0 hace que framer-motion ignore el desplazamiento del
        // elemento (transform translateX) y solo quede el efecto que sí
        // queremos, alimentado a mano en onDrag: la rotación. Sin esto,
        // drag="x" mueve el div entero además de rotarlo (el bug reportado:
        // el cilindro queda corrido con un hueco al costado).
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        role="list"
        aria-label="Vehículos de la categoría — arrastrá para girar"
        className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
        style={{
          x: 0,
          rotateY: rotation,
          width: cylinderWidth,
          transformStyle: "preserve-3d",
        }}
        onHoverStart={() => {
          isHoveredRef.current = true;
        }}
        onHoverEnd={() => {
          isHoveredRef.current = false;
        }}
        onDragStart={() => {
          hasDraggedRef.current = false;
          isDraggingRef.current = true;
        }}
        onDrag={(_, info) => {
          if (Math.abs(info.offset.x) > 6) hasDraggedRef.current = true;
          rotation.set(rotation.get() + info.delta.x * ROTATE_DEG_PER_PX);
        }}
        onDragEnd={(_, info) => {
          isDraggingRef.current = false;
          // La auto-rotación queda pausada durante todo el settle del
          // spring de inercia (no solo mientras el dedo/mouse está abajo) —
          // si no, ambos suman grados a la misma motion value en el mismo
          // frame y el settle se ve tembloroso.
          isSettlingRef.current = true;
          // Un único source of truth: se anima la MISMA motion value
          // (`rotation`) que gira el cilindro, no un track `controls`
          // paralelo. Antes el spring corría sobre `controls`/`animate` y
          // `rotation` quedaba con el valor viejo → al reanudar la auto-
          // rotación el rAF leía ese valor y el cilindro saltaba hacia atrás
          // toda la inercia. Animando `rotation` directo, el rAF retoma
          // exactamente donde quedó el settle.
          animate(rotation, rotation.get() + info.velocity.x * 0.05, {
            type: "spring",
            stiffness: 100,
            damping: 30,
            mass: 0.1,
          }).then(() => {
            isSettlingRef.current = false;
          });
          // Si el mouseup del drag dispara un click fantasma en la cara de
          // abajo, el handler de click ya lo intercepta (flag en true) y lo
          // resetea. Si NO hubo click fantasma (lo usual en un drag real
          // con distancia), hay que resetear igual en el siguiente tick —
          // si no, el flag queda pegado en true y el próximo click
          // genuino del usuario se pierde.
          window.setTimeout(() => {
            hasDraggedRef.current = false;
          }, 0);
        }}
      >
        {faces.map(({ vehicle, key }, i) => (
          <div
            key={key}
            role="listitem"
            className="absolute flex h-full origin-center flex-col items-center justify-center p-2"
            style={{
              width: `${faceWidth}px`,
              transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)`,
              // Sin esto, las caras a >90° de la cámara muestran su dorso
              // espejado (texto invertido) — hay que ocultarlas, no mostrar
              // el reverso.
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <Link
              href={`/vehicles/${vehicle.id}`}
              draggable={false}
              onClick={handleLinkClick}
              className="group block w-full"
            >
              <CarouselFaceImage vehicle={vehicle} />
              <FaceCaption vehicle={vehicle} />
            </Link>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
