"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import type { Vehicle } from "@/data/vehicles";

/* ═══════════════════════════════════════════════
   MULTI-FORMAT IMAGE — tries avif → jpg → webp → png
   ═══════════════════════════════════════════════ */
const FMTS = ["avif", "jpg", "webp", "png"];

function Img({
  base,
  alt,
  fill = true,
  className = "",
  priority = false,
  sizes = "100vw",
}: {
  base: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [i, setI] = useState(0);
  const [dead, setDead] = useState(false);
  if (dead) return null;
  return (
    <Image
      src={`${base}.${FMTS[i]}`}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
      unoptimized
      onError={() => (i + 1 < FMTS.length ? setI(i + 1) : setDead(true))}
    />
  );
}

/* ═══════════════════════════════════════════════
   MODELS MODAL — Para elegir ficha técnica
   ═══════════════════════════════════════════════ */
function ModelsModal({
  pdfs,
  isOpen,
  onClose,
}: {
  pdfs: NonNullable<Vehicle["truckPdfs"]>;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div
              className="bg-zinc-950 border border-white/10 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/[0.06]">
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium mb-1">
                    Fichas técnicas
                  </p>
                  <h3 className="text-xl md:text-2xl font-extralight text-white tracking-tight">
                    Elegí tu modelo
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/30 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* PDF List */}
              <div className="p-2">
                {pdfs.map((pdf, i) => (
                  <motion.a
                    key={i}
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group flex items-center justify-between p-4 md:p-5 hover:bg-white/[0.04] transition-colors border-b border-white/[0.05] last:border-0"
                  >
                    <span className="text-sm md:text-base font-light text-white group-hover:text-white/80 transition-colors leading-snug">
                      {pdf.name}
                    </span>

                    <svg
                      className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-all shrink-0 group-hover:translate-x-0.5 ml-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function TruckDetailClient({
  vehicle,
}: {
  vehicle: Vehicle;
}) {
  const basePath = `/vehicles/${vehicle.id}`;
  const sections = vehicle.truckSections || [];
  const pdfs = vehicle.truckPdfs || [];
  const [modelsOpen, setModelsOpen] = useState(false);

  const aspectos = [1, 2, 3, 4]
    .map((n) => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      valor: (vehicle as any)[`aspecto${n}Valor`] as string | undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      label: (vehicle as any)[`aspecto${n}Label`] as string | undefined,
    }))
    .filter((a) => a.valor && a.label);

  // Parallax on hero
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      {/* Models Modal */}
      <ModelsModal pdfs={pdfs} isOpen={modelsOpen} onClose={() => setModelsOpen(false)} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO — Full viewport, parallax, cinematic
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <Img
            base={`${basePath}/hero`}
            alt={vehicle.name}
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Cinematic gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        {/* Content */}
        <motion.div
          className="absolute inset-0 flex items-end"
          style={{ opacity: heroOpacity }}
        >
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-28">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0, 1] }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-white/50" />
                <p className="text-[11px] font-medium tracking-[0.35em] text-white/60 uppercase">
                  Mercedes-Benz Trucks · {vehicle.category}
                </p>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extralight tracking-tight leading-[0.95] mb-5">
                {vehicle.name}
              </h1>

              {vehicle.subtitle && (
                <p className="text-lg md:text-xl text-white/60 font-light max-w-lg leading-relaxed mb-10">
                  {vehicle.subtitle}
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 bg-white text-black px-8 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase hover:bg-white/90 transition-colors"
                >
                  Contactame
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                {pdfs.length > 0 && (
                  <button
                    onClick={() => setModelsOpen(true)}
                    className="inline-flex items-center gap-3 border border-white/30 text-white px-8 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase hover:border-white/60 hover:bg-white/5 transition-all"
                  >
                    Ver modelos
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ASPECTOS DESTACADOS — Stats ribbon
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {aspectos.length > 0 && (
        <section className="relative border-y border-white/[0.06]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {aspectos.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.7 }}
                  className={`relative py-12 md:py-16 px-6 md:px-10 ${
                    i < aspectos.length - 1 ? "border-r border-white/[0.06]" : ""
                  } ${i < 2 ? "border-b lg:border-b-0 border-white/[0.06]" : ""}`}
                >
                  <div className="text-3xl md:text-4xl lg:text-[2.75rem] font-extralight tracking-tight text-white mb-3 leading-none">
                    {a.valor}
                  </div>
                  <div className="text-[10px] md:text-[11px] text-white/35 tracking-[0.2em] uppercase font-medium">
                    {a.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          INTRO — Title + description, editorial layout
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {(vehicle.equipmentGeneralTitle || vehicle.equipmentGeneralDescription) && (
        <section className="py-24 md:py-32 bg-black">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              {vehicle.equipmentGeneralTitle && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="lg:col-span-5"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-px bg-white/20" />
                    <p className="text-[10px] tracking-[0.35em] text-white/30 uppercase font-medium">
                      Acerca del modelo
                    </p>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-extralight tracking-tight leading-[1.2] text-white">
                    {vehicle.equipmentGeneralTitle}
                  </h2>
                </motion.div>
              )}
              {vehicle.equipmentGeneralDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="lg:col-span-7 lg:pt-14"
                >
                  <p className="text-[15px] md:text-base text-white/45 leading-[1.9] font-light">
                    {vehicle.equipmentGeneralDescription}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTIONS — Alternating image + content
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {sections.length > 0 && (
        <div>
          {sections.map((section, idx) => (
            <TruckSection
              key={idx}
              section={section}
              imageBase={`${basePath}/sections/${idx + 1}`}
              index={idx}
              isReversed={idx % 2 !== 0}
            />
          ))}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SPECS — Clean accordion
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SpecsAccordion vehicle={vehicle} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CTA — Closing statement
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Img
            base={`${basePath}/hero`}
            alt=""
            fill
            className="object-cover blur-sm scale-110 opacity-20"
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-3xl mx-auto px-6 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="w-12 h-px bg-white/20" />
            <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-medium">
              Leonardo Guzmán
            </p>
            <div className="w-12 h-px bg-white/20" />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-tight mb-6 leading-[1.1]">
            Potencia que mueve
            <br />
            <span className="text-white/50">tu negocio</span>
          </h2>

          <p className="text-white/35 mb-14 font-light text-lg max-w-md mx-auto leading-relaxed">
            Consultanos por el {vehicle.name}, financiación y disponibilidad.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 bg-white text-black px-10 py-4 text-xs font-semibold tracking-[0.15em] uppercase hover:bg-white/90 transition-colors"
            >
              Contactame
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            {pdfs.length > 0 && (
              <button
                onClick={() => setModelsOpen(true)}
                className="group inline-flex items-center gap-3 border border-white/30 text-white px-10 py-4 text-xs font-semibold tracking-[0.15em] uppercase hover:border-white/60 hover:bg-white/5 transition-all"
              >
                Ver modelos
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TRUCK SECTION — Alternating image + content
   Image is contained (not full 50%), with animation
   ═══════════════════════════════════════════════ */
function TruckSection({
  section,
  imageBase,
  index,
  isReversed,
}: {
  section: NonNullable<Vehicle["truckSections"]>[number];
  imageBase: string;
  index: number;
  isReversed: boolean;
}) {
  return (
    <section className="relative py-20 md:py-28 bg-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center`}>
          {/* Image — larger (7 cols), with hover + entrance animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] }}
            className={`${isReversed ? "lg:col-start-6 lg:col-end-13 lg:order-2" : "lg:col-span-7"}`}
          >
            <div className="relative aspect-[16/10] overflow-hidden group">
              <Img
                base={imageBase}
                alt={section.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </motion.div>

          {/* Content — 5 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className={`${isReversed ? "lg:col-start-1 lg:col-end-6 lg:order-1" : "lg:col-start-8 lg:col-end-13"}`}
          >
            {/* Section number */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[11px] font-mono text-white/20 tracking-wider">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="w-8 h-px bg-white/15" />
            </div>

            <h3 className="text-3xl md:text-4xl font-extralight tracking-tight text-white mb-8 leading-[1.15]">
              {section.title}
            </h3>

            {/* Descripción — se muestra si existe, independientemente del tipo */}
            {section.content && (
              <p className="text-sm md:text-[15px] text-white/55 leading-[1.9] font-light mb-6">
                {section.content}
              </p>
            )}

            {/* Lista — se muestra si hay items */}
            {section.items && section.items.length > 0 && (
              <ul className="space-y-4">
                {section.items.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + i * 0.06 }}
                    className="flex items-start gap-4"
                  >
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-white/25 shrink-0" />
                    <span className="text-sm md:text-[15px] text-white/55 leading-relaxed font-light">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   SPECS ACCORDION
   ═══════════════════════════════════════════════ */
function SpecsAccordion({ vehicle }: { vehicle: Vehicle }) {
  const [open, setOpen] = useState<string | null>(null);

  const SPEC_KEYS = [
    { key: "specsMotorizacion", label: "Motorización" },
    { key: "specsPotencia", label: "Potencia" },
    { key: "specsDimensiones", label: "Dimensiones" },
    { key: "specsCantidades", label: "Cantidades y pesos" },
    { key: "specsPerformance", label: "Performance" },
    { key: "specsCarroceria", label: "Carrocería" },
    { key: "specsChasis", label: "Chasis" },
    { key: "specsConsumo", label: "Consumo y emisión" },
  ];

  const available = SPEC_KEYS.filter(({ key }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = (vehicle as any)[key];
    return Array.isArray(arr) && arr.length > 0;
  });

  if (available.length === 0) return null;

  return (
    <section className="py-28 md:py-36 bg-black">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-white/20" />
            <p className="text-[10px] tracking-[0.35em] text-white/30 uppercase font-medium">
              Datos técnicos
            </p>
          </div>
          <h2 className="text-4xl md:text-5xl font-extralight tracking-tight text-white">
            Especificaciones
          </h2>
        </motion.div>

        <div className="border-t border-white/[0.08]">
          {available.map(({ key, label }, i) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const items = (vehicle as any)[key] as { valor: string; label: string }[];
            const isOpen = open === key;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-white/[0.08]"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : key)}
                  className="w-full flex justify-between items-center py-5 md:py-6 text-left group"
                >
                  <span className="text-sm md:text-base font-light text-white/60 group-hover:text-white transition-colors tracking-wide">
                    {label}
                  </span>
                  <div className={`relative w-5 h-5 flex items-center justify-center transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                    <div className="absolute w-3 h-px bg-white/40 group-hover:bg-white transition-colors" />
                    <div className="absolute w-px h-3 bg-white/40 group-hover:bg-white transition-colors" />
                  </div>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 space-y-1">
                    {items.map((item, j) => (
                      <div
                        key={j}
                        className="flex justify-between items-baseline py-2.5 border-b border-white/[0.04] last:border-0"
                      >
                        <span className="text-sm text-white/35 font-light">{item.label}</span>
                        <span className="text-sm text-white/80 font-light ml-8 text-right tabular-nums">
                          {item.valor}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
