"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import type { Vehicle } from "@/data/vehicles";

// Helper to check if image exists
const getImagePath = (
  basePath: string,
  formats = ["avif", "webp", "jpg", "jpeg", "png"]
) => {
  return `${basePath}.${formats[0]}`; // Default to first format, Next.js will handle errors
};

// Color Carousel Component - Auto-rotating carousel
function ColorCarousel({ vehicleId }: { vehicleId: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [imageFormat, setImageFormat] = useState<Record<number, string>>({});

  // Intentar múltiples formatos para cada imagen
  const tryImageFormats = (num: number) => {
    const formats = ["jpg", "png", "avif", "webp"];
    return formats[0]; // Empezar con jpg
  };

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect);
    onSelect();

    // Auto-rotate every 3 seconds
    const interval = setInterval(() => {
      if (emblaApi) {
        emblaApi.scrollNext();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Check for available color images (1-7)
  const colorImages = [1, 2, 3, 4, 5, 6, 7].filter(
    (num) => !imageErrors.has(num)
  );

  if (colorImages.length === 0) return null;

  return (
    <div className="relative">
      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {colorImages.map((num) => {
            const format = imageFormat[num] || "jpg";
            return (
              <div key={num} className="flex-[0_0_100%] min-w-0">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={`/vehicles/${vehicleId}/colors/${num}.${format}?v=${Date.now()}`}
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
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows - Minimalistas sin borde */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 sm:left-4 md:-left-8 lg:-left-16 top-1/2 -translate-y-1/2 p-2 sm:p-3 transition-all duration-300 group hover:opacity-70 z-10"
        aria-label="Anterior"
      >
        <svg
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-transform group-hover:-translate-x-1 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 sm:right-4 md:-right-8 lg:-right-16 top-1/2 -translate-y-1/2 p-2 sm:p-3 transition-all duration-300 group hover:opacity-70 z-10"
        aria-label="Siguiente"
      >
        <svg
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-transform group-hover:translate-x-1 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {colorImages.map((num, index) => (
          <button
            key={num}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === selectedIndex ? "bg-black w-8" : "bg-black/30"
            }`}
            aria-label={`Ir a color ${num}`}
          />
        ))}
      </div>
    </div>
  );
}

// Image formats to try
const IMAGE_FORMATS = ["avif", "webp", "jpg", "jpeg", "png"];

// Multi-format Image Component
function MultiFormatImage({
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
      onError={handleError}
    />
  );
}

// Carousel Component
function ImageCarousel({
  items,
  basePath,
  type,
}: {
  items: { title?: string; description?: string; num: number }[];
  basePath: string;
  type: "exterior" | "interior";
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (items.length === 0) return null;

  const isInterior = type === "interior";

  return (
    <div className="relative">
      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((item) => (
            <div key={item.num} className="flex-[0_0_100%] min-w-0">
              <div
                className={`relative aspect-[16/9] w-full ${
                  isInterior ? "bg-black" : "bg-white"
                }`}
              >
                <MultiFormatImage
                  basePath={`${basePath}/${type}/${item.num}`}
                  alt={item.title || `${type} ${item.num}`}
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Minimalistas sin borde */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 sm:left-4 md:-left-8 lg:-left-16 top-1/2 -translate-y-1/2 p-2 sm:p-3 transition-all duration-300 group hover:opacity-70 z-10"
        aria-label="Anterior"
      >
        <svg
          className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-transform group-hover:-translate-x-1 ${
            isInterior ? "text-white" : "text-black"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 sm:right-4 md:-right-8 lg:-right-16 top-1/2 -translate-y-1/2 p-2 sm:p-3 transition-all duration-300 group hover:opacity-70 z-10"
        aria-label="Siguiente"
      >
        <svg
          className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-transform group-hover:translate-x-1 ${
            isInterior ? "text-white" : "text-black"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Current Info */}
      <div className="text-center mt-4 sm:mt-6 px-4">
        {items[selectedIndex]?.title && (
          <h3 className="text-xl sm:text-2xl md:text-3xl font-light mb-2 sm:mb-3">
            {items[selectedIndex].title}
          </h3>
        )}
        {items[selectedIndex]?.description && (
          <p
            className={`text-sm sm:text-base md:text-lg font-light max-w-3xl mx-auto leading-relaxed ${
              isInterior ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {items[selectedIndex].description}
          </p>
        )}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6 sm:mt-8">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === selectedIndex
                ? isInterior
                  ? "bg-white w-8"
                  : "bg-black w-8"
                : isInterior
                ? "bg-white/30"
                : "bg-black/30"
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Accordion Item Component
function AccordionItem({
  title,
  specs,
  isOpen,
  onToggle,
}: {
  title: string;
  specs: { label: string; valor: string }[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center py-5 text-left hover:bg-black/5 transition-colors px-4"
      >
        <h3 className="text-lg md:text-xl font-light">{title}</h3>
        <svg
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-6 space-y-3">
            {specs.map((spec, index) => (
              <div
                key={index}
                className="flex justify-between items-baseline py-2"
              >
                <span className="text-sm md:text-base text-gray-600 font-light">
                  {spec.label}
                </span>
                <span className="text-sm md:text-base font-light ml-4">
                  {spec.valor}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [openSpecIndex, setOpenSpecIndex] = useState<number | null>(0);
  const [activeEquipmentTab, setActiveEquipmentTab] =
    useState<string>("multimedia");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Detectar scroll para mostrar/ocultar botón de ir arriba
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    loadVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (!response.ok) throw new Error("Error al cargar vehículo");
      const data = await response.json();

      // Parsear campos JSON
      const vehicle = data.vehicle;
      if (vehicle) {
        // Parsear especificaciones (manejar null)
        if (vehicle.specs_consumo && typeof vehicle.specs_consumo === "string")
          vehicle.specsConsumo = JSON.parse(vehicle.specs_consumo);
        else vehicle.specsConsumo = vehicle.specs_consumo || [];

        if (
          vehicle.specs_motorizacion &&
          typeof vehicle.specs_motorizacion === "string"
        )
          vehicle.specsMotorizacion = JSON.parse(vehicle.specs_motorizacion);
        else vehicle.specsMotorizacion = vehicle.specs_motorizacion || [];

        if (
          vehicle.specs_potencia &&
          typeof vehicle.specs_potencia === "string"
        )
          vehicle.specsPotencia = JSON.parse(vehicle.specs_potencia);
        else vehicle.specsPotencia = vehicle.specs_potencia || [];

        if (
          vehicle.specs_dimensiones &&
          typeof vehicle.specs_dimensiones === "string"
        )
          vehicle.specsDimensiones = JSON.parse(vehicle.specs_dimensiones);
        else vehicle.specsDimensiones = vehicle.specs_dimensiones || [];

        if (
          vehicle.specs_performance &&
          typeof vehicle.specs_performance === "string"
        )
          vehicle.specsPerformance = JSON.parse(vehicle.specs_performance);
        else vehicle.specsPerformance = vehicle.specs_performance || [];

        if (
          vehicle.specs_carroceria &&
          typeof vehicle.specs_carroceria === "string"
        )
          vehicle.specsCarroceria = JSON.parse(vehicle.specs_carroceria);
        else vehicle.specsCarroceria = vehicle.specs_carroceria || [];

        if (vehicle.specs_chasis && typeof vehicle.specs_chasis === "string")
          vehicle.specsChasis = JSON.parse(vehicle.specs_chasis);
        else vehicle.specsChasis = vehicle.specs_chasis || [];

        if (
          vehicle.specs_cantidades &&
          typeof vehicle.specs_cantidades === "string"
        )
          vehicle.specsCantidades = JSON.parse(vehicle.specs_cantidades);
        else vehicle.specsCantidades = vehicle.specs_cantidades || [];

        // Parsear equipamiento
        if (
          vehicle.equip_multimedia &&
          typeof vehicle.equip_multimedia === "string"
        )
          vehicle.equipMultimedia = JSON.parse(vehicle.equip_multimedia);
        else vehicle.equipMultimedia = vehicle.equip_multimedia || [];

        if (
          vehicle.equip_asistencia &&
          typeof vehicle.equip_asistencia === "string"
        )
          vehicle.equipAsistencia = JSON.parse(vehicle.equip_asistencia);
        else vehicle.equipAsistencia = vehicle.equip_asistencia || [];

        if (vehicle.equip_confort && typeof vehicle.equip_confort === "string")
          vehicle.equipConfort = JSON.parse(vehicle.equip_confort);
        else vehicle.equipConfort = vehicle.equip_confort || [];

        if (
          vehicle.equip_tren_rodaje &&
          typeof vehicle.equip_tren_rodaje === "string"
        )
          vehicle.equipTrenRodaje = JSON.parse(vehicle.equip_tren_rodaje);
        else vehicle.equipTrenRodaje = vehicle.equip_tren_rodaje || [];

        if (
          vehicle.equip_seguridad &&
          typeof vehicle.equip_seguridad === "string"
        )
          vehicle.equipSeguridad = JSON.parse(vehicle.equip_seguridad);
        else vehicle.equipSeguridad = vehicle.equip_seguridad || [];

        if (
          vehicle.specs_bateria_carga &&
          typeof vehicle.specs_bateria_carga === "string"
        )
          vehicle.specsBateriaCarga = JSON.parse(vehicle.specs_bateria_carga);
        else vehicle.specsBateriaCarga = vehicle.specs_bateria_carga || [];

        // Convertir snake_case a camelCase
        vehicle.aspecto1Valor = vehicle.aspecto_1_valor;
        vehicle.aspecto1Label = vehicle.aspecto_1_label;
        vehicle.aspecto2Valor = vehicle.aspecto_2_valor;
        vehicle.aspecto2Label = vehicle.aspecto_2_label;
        vehicle.aspecto3Valor = vehicle.aspecto_3_valor;
        vehicle.aspecto3Label = vehicle.aspecto_3_label;
        vehicle.aspecto4Valor = vehicle.aspecto_4_valor;
        vehicle.aspecto4Label = vehicle.aspecto_4_label;

        vehicle.exterior1Title = vehicle.exterior_1_title;
        vehicle.exterior1Description = vehicle.exterior_1_description;
        vehicle.exterior2Title = vehicle.exterior_2_title;
        vehicle.exterior2Description = vehicle.exterior_2_description;
        vehicle.exterior3Title = vehicle.exterior_3_title;
        vehicle.exterior3Description = vehicle.exterior_3_description;
        vehicle.exterior4Title = vehicle.exterior_4_title;
        vehicle.exterior4Description = vehicle.exterior_4_description;
        vehicle.exterior5Title = vehicle.exterior_5_title;
        vehicle.exterior5Description = vehicle.exterior_5_description;
        vehicle.exterior6Title = vehicle.exterior_6_title;
        vehicle.exterior6Description = vehicle.exterior_6_description;
        vehicle.exterior7Title = vehicle.exterior_7_title;
        vehicle.exterior7Description = vehicle.exterior_7_description;
        vehicle.exterior8Title = vehicle.exterior_8_title;
        vehicle.exterior8Description = vehicle.exterior_8_description;
        vehicle.exterior9Title = vehicle.exterior_9_title;
        vehicle.exterior9Description = vehicle.exterior_9_description;
        vehicle.exterior10Title = vehicle.exterior_10_title;
        vehicle.exterior10Description = vehicle.exterior_10_description;

        vehicle.interior1Title = vehicle.interior_1_title;
        vehicle.interior1Description = vehicle.interior_1_description;
        vehicle.interior2Title = vehicle.interior_2_title;
        vehicle.interior2Description = vehicle.interior_2_description;
        vehicle.interior3Title = vehicle.interior_3_title;
        vehicle.interior3Description = vehicle.interior_3_description;
        vehicle.interior4Title = vehicle.interior_4_title;
        vehicle.interior4Description = vehicle.interior_4_description;
        vehicle.interior5Title = vehicle.interior_5_title;
        vehicle.interior5Description = vehicle.interior_5_description;
        vehicle.interior6Title = vehicle.interior_6_title;
        vehicle.interior6Description = vehicle.interior_6_description;
        vehicle.interior7Title = vehicle.interior_7_title;
        vehicle.interior7Description = vehicle.interior_7_description;
        vehicle.interior8Title = vehicle.interior_8_title;
        vehicle.interior8Description = vehicle.interior_8_description;
        vehicle.interior9Title = vehicle.interior_9_title;
        vehicle.interior9Description = vehicle.interior_9_description;
        vehicle.interior10Title = vehicle.interior_10_title;
        vehicle.interior10Description = vehicle.interior_10_description;

        vehicle.equipmentGeneralTitle = vehicle.equipment_general_title;
        vehicle.equipmentGeneralDescription =
          vehicle.equipment_general_description;
      }

      setVehicle(vehicle);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Cargando vehículo...</p>
        </motion.div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Vehículo no encontrado</h1>
          <Link
            href="/vehicles"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Volver a vehículos
          </Link>
        </div>
      </div>
    );
  }

  const basePath = `/vehicles/${vehicleId}`;

  // Handle image error
  const handleImageError = (imagePath: string) => {
    setImageErrors((prev) => new Set(prev).add(imagePath));
  };

  // Check if image has error
  const hasImageError = (imagePath: string) => imageErrors.has(imagePath);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Fullscreen con overlay elegante */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Mobile Hero - visible only on screens < 768px */}
        {!hasImageError(`${basePath}/hero/hero-mobile`) && (
          <Image
            src={`${basePath}/hero/hero-mobile.jpg?v=${Date.now()}`}
            alt={vehicle.name}
            fill
            className="object-cover md:hidden"
            priority
            sizes="100vw"
            onError={() => handleImageError(`${basePath}/hero/hero-mobile`)}
            unoptimized
          />
        )}

        {/* Desktop Hero - visible only on screens >= 768px */}
        <MultiFormatImage
          basePath={`${basePath}/hero/hero`}
          alt={vehicle.name}
          fill
          className="object-cover hidden md:block"
          priority
          sizes="100vw"
        />

        {/* Gradiente overlay sofisticado */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/95"></div>

        {/* Contenido del hero */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pb-12 sm:pb-16 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <p className="text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.2em] sm:tracking-[0.3em] text-white/70 mb-2 sm:mb-3 uppercase">
                {vehicle.category}
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight">
                {vehicle.name}
              </h1>
              {vehicle.subtitle && (
                <p className="text-lg md:text-xl text-white/80 max-w-2xl font-light">
                  {vehicle.subtitle}
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator - Oculto en mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1 h-2 bg-white/60 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Aspectos Destacados - Cards minimalistas */}
      {vehicle.aspecto1Valor && (
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-10 sm:mb-12 md:mb-16 lg:mb-20 text-center"
            >
              Aspectos Destacados
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {[1, 2, 3, 4].map((num) => {
                const valor = vehicle[`aspecto${num}Valor` as keyof Vehicle] as
                  | string
                  | undefined;
                const label = vehicle[`aspecto${num}Label` as keyof Vehicle] as
                  | string
                  | undefined;
                if (!valor) return null;

                return (
                  <motion.div
                    key={num}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: num * 0.1 }}
                    className="group relative bg-zinc-900 p-6 sm:p-7 md:p-8 border border-white/20 hover:border-white transition-all duration-300 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[180px] md:min-h-[200px]"
                  >
                    {/* Línea decorativa superior */}
                    <div className="absolute top-0 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-500"></div>

                    <div className="text-center flex flex-col items-center justify-center gap-2 sm:gap-3">
                      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight break-words max-w-full leading-tight">
                        {valor}
                      </div>
                      <div className="text-[10px] sm:text-xs md:text-sm text-gray-300 font-light uppercase tracking-[0.15em] sm:tracking-[0.2em] break-words max-w-full">
                        {label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Exterior - Carousel */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].some(
        (num) =>
          vehicle[`exterior${num}Title` as keyof Vehicle] ||
          vehicle[`exterior${num}Description` as keyof Vehicle]
      ) && (
        <section className="py-24 md:py-32 bg-white text-black">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-light mb-16 text-center"
            >
              Exterior
            </motion.h2>

            <ImageCarousel
              items={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                .map((num) => ({
                  num,
                  title: vehicle[`exterior${num}Title` as keyof Vehicle] as
                    | string
                    | undefined,
                  description: vehicle[
                    `exterior${num}Description` as keyof Vehicle
                  ] as string | undefined,
                }))
                .filter((item) => item.title || item.description)}
              basePath={basePath}
              type="exterior"
            />
          </div>
        </section>
      )}

      {/* Interior - Carousel */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].some(
        (num) =>
          vehicle[`interior${num}Title` as keyof Vehicle] ||
          vehicle[`interior${num}Description` as keyof Vehicle]
      ) && (
        <section className="py-24 md:py-32 bg-black text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-light mb-16 text-center"
            >
              Interior
            </motion.h2>

            <ImageCarousel
              items={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                .map((num) => ({
                  num,
                  title: vehicle[`interior${num}Title` as keyof Vehicle] as
                    | string
                    | undefined,
                  description: vehicle[
                    `interior${num}Description` as keyof Vehicle
                  ] as string | undefined,
                }))
                .filter((item) => item.title || item.description)}
              basePath={basePath}
              type="interior"
            />
          </div>
        </section>
      )}

      {/* Colores - Carousel de variantes de color */}
      <section className="py-24 md:py-32 bg-white text-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-light mb-16 text-center"
          >
            Colores Disponibles
          </motion.h2>

          <ColorCarousel vehicleId={vehicleId} />
        </div>
      </section>

      {/* Equipamiento - Con sistema de tabs */}
      {vehicle.equipmentGeneralTitle &&
        ((vehicle.equipMultimedia && vehicle.equipMultimedia.length > 0) ||
          (vehicle.equipAsistencia && vehicle.equipAsistencia.length > 0) ||
          (vehicle.equipConfort && vehicle.equipConfort.length > 0) ||
          (vehicle.equipTrenRodaje && vehicle.equipTrenRodaje.length > 0) ||
          (vehicle.equipSeguridad && vehicle.equipSeguridad.length > 0)) && (
          <section className="py-24 md:py-32 bg-black text-white">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-light mb-6 text-center"
              >
                {vehicle.equipmentGeneralTitle}
              </motion.h2>
              {vehicle.equipmentGeneralDescription && (
                <p className="text-lg md:text-xl text-gray-200 font-light mb-16 md:mb-24 max-w-3xl mx-auto text-center">
                  {vehicle.equipmentGeneralDescription}
                </p>
              )}

              {/* Tabs Navigation */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-8 sm:mb-12 md:mb-16 border-b border-white/20 pb-0">
                {vehicle.equipMultimedia &&
                  vehicle.equipMultimedia.length > 0 && (
                    <button
                      onClick={() => setActiveEquipmentTab("multimedia")}
                      className={`pb-3 sm:pb-4 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base font-light transition-all whitespace-nowrap ${
                        activeEquipmentTab === "multimedia"
                          ? "border-b-2 border-white text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Sistema multimedia
                    </button>
                  )}
                {vehicle.equipAsistencia &&
                  vehicle.equipAsistencia.length > 0 && (
                    <button
                      onClick={() => setActiveEquipmentTab("asistencia")}
                      className={`pb-3 sm:pb-4 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base font-light transition-all whitespace-nowrap ${
                        activeEquipmentTab === "asistencia"
                          ? "border-b-2 border-white text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Sistemas de asistencia
                    </button>
                  )}
                {vehicle.equipConfort && vehicle.equipConfort.length > 0 && (
                  <button
                    onClick={() => setActiveEquipmentTab("confort")}
                    className={`pb-3 sm:pb-4 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base font-light transition-all whitespace-nowrap ${
                      activeEquipmentTab === "confort"
                        ? "border-b-2 border-white text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Confort
                  </button>
                )}
                {vehicle.equipTrenRodaje &&
                  vehicle.equipTrenRodaje.length > 0 && (
                    <button
                      onClick={() => setActiveEquipmentTab("tren-rodaje")}
                      className={`pb-3 sm:pb-4 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base font-light transition-all whitespace-nowrap ${
                        activeEquipmentTab === "tren-rodaje"
                          ? "border-b-2 border-white text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Tren de rodaje
                    </button>
                  )}
                {vehicle.equipSeguridad &&
                  vehicle.equipSeguridad.length > 0 && (
                    <button
                      onClick={() => setActiveEquipmentTab("seguridad")}
                      className={`pb-3 sm:pb-4 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base font-light transition-all whitespace-nowrap ${
                        activeEquipmentTab === "seguridad"
                          ? "border-b-2 border-white text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Seguridad
                    </button>
                  )}
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
                {/* Multimedia */}
                {activeEquipmentTab === "multimedia" &&
                  vehicle.equipMultimedia && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
                    >
                      {vehicle.equipMultimedia.map((item, index) => {
                        const imagePath = `${basePath}/equipment/multimedia/${
                          index + 1
                        }`;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800 mb-3 sm:mb-4">
                              <MultiFormatImage
                                basePath={imagePath}
                                alt={item.title || "Multimedia"}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            {(item.title || item.description) && (
                              <div className="py-2 sm:py-3">
                                {item.title && (
                                  <h4 className="text-base sm:text-lg font-light mb-1 sm:mb-2 text-white">
                                    {item.title}
                                  </h4>
                                )}
                                {item.description && (
                                  <p className="text-sm text-gray-200 font-light leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}

                {/* Asistencia */}
                {activeEquipmentTab === "asistencia" &&
                  vehicle.equipAsistencia && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
                    >
                      {vehicle.equipAsistencia.map((item, index) => {
                        const imagePath = `${basePath}/equipment/asistencia/${
                          index + 1
                        }`;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800 mb-3 sm:mb-4">
                              <MultiFormatImage
                                basePath={imagePath}
                                alt={item.title || "Asistencia"}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            {(item.title || item.description) && (
                              <div className="py-2 sm:py-3">
                                {item.title && (
                                  <h4 className="text-base sm:text-lg font-light mb-1 sm:mb-2 text-white">
                                    {item.title}
                                  </h4>
                                )}
                                {item.description && (
                                  <p className="text-sm text-gray-200 font-light leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}

                {/* Confort */}
                {activeEquipmentTab === "confort" && vehicle.equipConfort && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
                  >
                    {vehicle.equipConfort.map((item, index) => {
                      const imagePath = `${basePath}/equipment/confort/${
                        index + 1
                      }`;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800 mb-3 sm:mb-4">
                            <MultiFormatImage
                              basePath={imagePath}
                              alt={item.title || "Confort"}
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          {(item.title || item.description) && (
                            <div className="py-2 sm:py-3">
                              {item.title && (
                                <h4 className="text-base sm:text-lg font-light mb-1 sm:mb-2 text-white">
                                  {item.title}
                                </h4>
                              )}
                              {item.description && (
                                <p className="text-sm text-gray-200 font-light leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* Tren de rodaje */}
                {activeEquipmentTab === "tren-rodaje" &&
                  vehicle.equipTrenRodaje && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
                    >
                      {vehicle.equipTrenRodaje.map((item, index) => {
                        const imagePath = `${basePath}/equipment/tren-rodaje/${
                          index + 1
                        }`;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800 mb-3 sm:mb-4">
                              <MultiFormatImage
                                basePath={imagePath}
                                alt={item.title || "Tren de rodaje"}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            {(item.title || item.description) && (
                              <div className="py-2 sm:py-3">
                                {item.title && (
                                  <h4 className="text-base sm:text-lg font-light mb-1 sm:mb-2 text-white">
                                    {item.title}
                                  </h4>
                                )}
                                {item.description && (
                                  <p className="text-sm text-gray-200 font-light leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}

                {/* Seguridad */}
                {activeEquipmentTab === "seguridad" &&
                  vehicle.equipSeguridad && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
                    >
                      {vehicle.equipSeguridad.map((item, index) => {
                        const imagePath = `${basePath}/equipment/seguridad/${
                          index + 1
                        }`;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800 mb-3 sm:mb-4">
                              <MultiFormatImage
                                basePath={imagePath}
                                alt={item.title || "Seguridad"}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            {(item.title || item.description) && (
                              <div className="py-2 sm:py-3">
                                {item.title && (
                                  <h4 className="text-base sm:text-lg font-light mb-1 sm:mb-2 text-white">
                                    {item.title}
                                  </h4>
                                )}
                                {item.description && (
                                  <p className="text-sm text-gray-200 font-light leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
              </div>
            </div>
          </section>
        )}

      {/* Especificaciones Técnicas - Acordeón */}
      {((vehicle.specsConsumo && vehicle.specsConsumo.length > 0) ||
        (vehicle.specsMotorizacion && vehicle.specsMotorizacion.length > 0) ||
        (vehicle.specsPotencia && vehicle.specsPotencia.length > 0) ||
        (vehicle.specsDimensiones && vehicle.specsDimensiones.length > 0) ||
        (vehicle.specsPerformance && vehicle.specsPerformance.length > 0) ||
        (vehicle.specsCarroceria && vehicle.specsCarroceria.length > 0) ||
        (vehicle.specsChasis && vehicle.specsChasis.length > 0) ||
        (vehicle.specsCantidades && vehicle.specsCantidades.length > 0) ||
        (vehicle.specsBateriaCarga &&
          vehicle.specsBateriaCarga.length > 0)) && (
        <section className="py-24 md:py-32 bg-white text-black">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-light mb-12 text-center"
            >
              Especificaciones Técnicas
            </motion.h2>

            <div className="space-y-0 border-t border-gray-200">
              {vehicle.specsConsumo && vehicle.specsConsumo.length > 0 && (
                <AccordionItem
                  title="Consumo y emisión"
                  specs={vehicle.specsConsumo}
                  isOpen={openSpecIndex === 0}
                  onToggle={() =>
                    setOpenSpecIndex(openSpecIndex === 0 ? null : 0)
                  }
                />
              )}

              {vehicle.specsMotorizacion &&
                vehicle.specsMotorizacion.length > 0 && (
                  <AccordionItem
                    title="Motorización"
                    specs={vehicle.specsMotorizacion}
                    isOpen={openSpecIndex === 1}
                    onToggle={() =>
                      setOpenSpecIndex(openSpecIndex === 1 ? null : 1)
                    }
                  />
                )}

              {vehicle.specsPotencia && vehicle.specsPotencia.length > 0 && (
                <AccordionItem
                  title="Potencia y autonomía"
                  specs={vehicle.specsPotencia}
                  isOpen={openSpecIndex === 2}
                  onToggle={() =>
                    setOpenSpecIndex(openSpecIndex === 2 ? null : 2)
                  }
                />
              )}

              {vehicle.specsDimensiones &&
                vehicle.specsDimensiones.length > 0 && (
                  <AccordionItem
                    title="Dimensiones"
                    specs={vehicle.specsDimensiones}
                    isOpen={openSpecIndex === 3}
                    onToggle={() =>
                      setOpenSpecIndex(openSpecIndex === 3 ? null : 3)
                    }
                  />
                )}

              {vehicle.specsPerformance &&
                vehicle.specsPerformance.length > 0 && (
                  <AccordionItem
                    title="Performance"
                    specs={vehicle.specsPerformance}
                    isOpen={openSpecIndex === 4}
                    onToggle={() =>
                      setOpenSpecIndex(openSpecIndex === 4 ? null : 4)
                    }
                  />
                )}

              {vehicle.specsCarroceria &&
                vehicle.specsCarroceria.length > 0 && (
                  <AccordionItem
                    title="Carrocería"
                    specs={vehicle.specsCarroceria}
                    isOpen={openSpecIndex === 5}
                    onToggle={() =>
                      setOpenSpecIndex(openSpecIndex === 5 ? null : 5)
                    }
                  />
                )}

              {vehicle.specsChasis && vehicle.specsChasis.length > 0 && (
                <AccordionItem
                  title="Chasis"
                  specs={vehicle.specsChasis}
                  isOpen={openSpecIndex === 6}
                  onToggle={() =>
                    setOpenSpecIndex(openSpecIndex === 6 ? null : 6)
                  }
                />
              )}

              {vehicle.specsCantidades &&
                vehicle.specsCantidades.length > 0 && (
                  <AccordionItem
                    title="Cantidades dimensiones y pesos"
                    specs={vehicle.specsCantidades}
                    isOpen={openSpecIndex === 7}
                    onToggle={() =>
                      setOpenSpecIndex(openSpecIndex === 7 ? null : 7)
                    }
                  />
                )}

              {vehicle.specsBateriaCarga &&
                vehicle.specsBateriaCarga.length > 0 && (
                  <AccordionItem
                    title="Batería y carga"
                    specs={vehicle.specsBateriaCarga}
                    isOpen={openSpecIndex === 8}
                    onToggle={() =>
                      setOpenSpecIndex(openSpecIndex === 8 ? null : 8)
                    }
                  />
                )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Diseño elegante */}
      <section className="py-32 md:py-40 bg-white text-black">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight">
              ¿Te interesa este vehículo?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-light mb-12 max-w-2xl mx-auto">
              Contactame para conocer más detalles, disponibilidad y coordinar
              una visita personalizada
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact"
                className="group relative px-10 py-4 bg-black text-white font-light text-sm tracking-wider uppercase overflow-hidden transition-all duration-300 hover:bg-zinc-800"
              >
                <span className="relative z-10">Contactame</span>
              </Link>

              <Link
                href="/vehicles"
                className="group px-10 py-4 border border-black/30 text-black font-light text-sm tracking-wider uppercase transition-all duration-300 hover:bg-black hover:text-white"
              >
                Ver más vehículos
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Back to top button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 w-12 h-12 md:w-14 md:h-14 rounded-full border border-black/20 backdrop-blur-sm bg-white/80 flex items-center justify-center transition-all duration-300 z-50 group hover:bg-white hover:border-black/40"
          aria-label="Volver arriba"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-black transition-transform group-hover:-translate-y-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </div>
  );
}
