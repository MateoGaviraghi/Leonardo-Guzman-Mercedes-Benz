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
function ColorCarousel({
  vehicleId,
  isAMG = false,
}: {
  vehicleId: string;
  isAMG?: boolean;
}) {
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

    return () => {
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

      {/* Navigation Arrows - Desktop only fuera de imagen */}
      <button
        onClick={scrollPrev}
        className="hidden md:block absolute left-0 md:-left-8 lg:-left-16 top-1/2 -translate-y-1/2 p-2 sm:p-3 transition-all duration-300 group hover:opacity-70 z-10"
        aria-label="Anterior"
      >
        <svg
          className={`w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:-translate-x-1 ${
            isAMG ? "text-[#5AC3B6]" : "text-black"
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
        className="hidden md:block absolute right-0 md:-right-8 lg:-right-16 top-1/2 -translate-y-1/2 p-2 sm:p-3 transition-all duration-300 group hover:opacity-70 z-10"
        aria-label="Siguiente"
      >
        <svg
          className={`w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:translate-x-1 ${
            isAMG ? "text-[#5AC3B6]" : "text-black"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Flechas para mobile - debajo de la imagen */}
      <div className="flex md:hidden justify-center gap-8 mt-4">
        <button
          onClick={scrollPrev}
          className="p-3 transition-all duration-300 hover:opacity-70"
          aria-label="Anterior"
        >
          <svg
            className={`w-8 h-8 ${isAMG ? "text-[#5AC3B6]" : "text-black"}`}
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
          className="p-3 transition-all duration-300 hover:opacity-70"
          aria-label="Siguiente"
        >
          <svg
            className={`w-8 h-8 ${isAMG ? "text-[#5AC3B6]" : "text-black"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {colorImages.map((num, index) => (
          <button
            key={num}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === selectedIndex
                ? isAMG
                  ? "bg-[#5AC3B6] w-8 shadow-[0_0_10px_#5AC3B6]"
                  : "bg-black w-8"
                : isAMG
                ? "bg-[#5AC3B6]/30"
                : "bg-black/30"
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
  isAMG = false,
}: {
  items: { title?: string; description?: string; num: number }[];
  basePath: string;
  type: "exterior" | "interior";
  isAMG?: boolean;
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
      {/* Contenedor principal con altura fija para las flechas */}
      <div className="relative min-h-[400px] sm:min-h-[500px] flex items-center">
        {/* Carousel */}
        <div className="overflow-hidden w-full" ref={emblaRef}>
          <div className="flex">
            {items.map((item) => (
              <div key={item.num} className="flex-[0_0_100%] min-w-0">
                <div className="relative aspect-[16/9] w-full">
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

        {/* Navigation Arrows - Fijas fuera de la imagen en desktop, abajo en mobile */}
        <button
          onClick={scrollPrev}
          className="hidden md:block absolute left-0 md:-left-8 lg:-left-16 top-1/2 -translate-y-1/2 p-2 sm:p-3 transition-all duration-300 group hover:opacity-70 z-10"
          aria-label="Anterior"
        >
          <svg
            className={`w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:-translate-x-1 ${
              isAMG
                ? "text-[#5AC3B6]"
                : isInterior
                ? "text-white"
                : "text-black"
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
          className="hidden md:block absolute right-0 md:-right-8 lg:-right-16 top-1/2 -translate-y-1/2 p-2 sm:p-3 transition-all duration-300 group hover:opacity-70 z-10"
          aria-label="Siguiente"
        >
          <svg
            className={`w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:translate-x-1 ${
              isAMG
                ? "text-[#5AC3B6]"
                : isInterior
                ? "text-white"
                : "text-black"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Flechas para mobile - debajo de la imagen */}
      <div className="flex md:hidden justify-center gap-8 mt-4">
        <button
          onClick={scrollPrev}
          className="p-3 transition-all duration-300 hover:opacity-70"
          aria-label="Anterior"
        >
          <svg
            className={`w-8 h-8 ${
              isAMG
                ? "text-[#5AC3B6]"
                : isInterior
                ? "text-white"
                : "text-black"
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
          className="p-3 transition-all duration-300 hover:opacity-70"
          aria-label="Siguiente"
        >
          <svg
            className={`w-8 h-8 ${
              isAMG
                ? "text-[#5AC3B6]"
                : isInterior
                ? "text-white"
                : "text-black"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Current Info */}
      <div className="text-center mt-10 sm:mt-12 px-4">
        {items[selectedIndex]?.title && (
          <h3
            className={`text-xl sm:text-2xl md:text-3xl font-light mb-1 sm:mb-2 ${
              isAMG ? "text-[#5AC3B6]" : ""
            }`}
          >
            {items[selectedIndex].title}
          </h3>
        )}
        {items[selectedIndex]?.description && (
          <p
            className={`text-sm sm:text-base md:text-lg font-light max-w-3xl mx-auto leading-relaxed ${
              isAMG
                ? "text-gray-400"
                : isInterior
                ? "text-gray-400"
                : "text-gray-600"
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
                ? isAMG
                  ? "bg-[#5AC3B6] w-8 shadow-[0_0_10px_#5AC3B6]"
                  : isInterior
                  ? "bg-white w-8"
                  : "bg-black w-8"
                : isAMG
                ? "bg-[#5AC3B6]/30"
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
  isAMG = false,
}: {
  title: string;
  specs: { label: string; valor: string }[];
  isOpen: boolean;
  onToggle: () => void;
  isAMG?: boolean;
}) {
  return (
    <div
      className={`border-b ${
        isAMG
          ? isOpen
            ? "border-[#5AC3B6]/40 bg-gradient-to-r from-[#5AC3B6]/10 to-transparent"
            : "border-[#5AC3B6]/20 hover:border-[#5AC3B6]/40"
          : "border-gray-200"
      } transition-all duration-300`}
    >
      <button
        onClick={onToggle}
        className={`w-full flex justify-between items-center py-5 text-left transition-colors px-4 ${
          isAMG ? "hover:bg-[#5AC3B6]/5" : "hover:bg-black/5"
        }`}
      >
        <h3
          className={`text-lg md:text-xl font-light ${
            isAMG ? (isOpen ? "text-[#5AC3B6]" : "text-white") : ""
          }`}
        >
          {title}
        </h3>
        <svg
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          } ${isAMG ? "text-[#5AC3B6]" : ""}`}
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
                className={`flex justify-between items-baseline py-2 ${
                  isAMG ? "border-b border-[#5AC3B6]/10" : ""
                }`}
              >
                <span
                  className={`text-sm md:text-base font-light ${
                    isAMG ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {spec.label}
                </span>
                <span
                  className={`text-sm md:text-base font-light ml-4 ${
                    isAMG ? "text-[#5AC3B6]" : ""
                  }`}
                >
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
  const [activeEquipmentTab, setActiveEquipmentTab] = useState<string>("");
  const [activeAutonomyTab, setActiveAutonomyTab] = useState<string>("tab1");
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
          vehicle.equip_exterior &&
          typeof vehicle.equip_exterior === "string"
        )
          vehicle.equipExterior = JSON.parse(vehicle.equip_exterior);
        else vehicle.equipExterior = vehicle.equip_exterior || [];

        if (
          vehicle.equip_interior &&
          typeof vehicle.equip_interior === "string"
        )
          vehicle.equipInterior = JSON.parse(vehicle.equip_interior);
        else vehicle.equipInterior = vehicle.equip_interior || [];

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

        // Parsear autonomía y carga (eléctricos)
        if (
          vehicle.charging_tab1_content &&
          typeof vehicle.charging_tab1_content === "string"
        )
          vehicle.chargingTab1Content = JSON.parse(
            vehicle.charging_tab1_content
          );
        else vehicle.chargingTab1Content = vehicle.charging_tab1_content || [];

        if (
          vehicle.charging_tab2_content &&
          typeof vehicle.charging_tab2_content === "string"
        )
          vehicle.chargingTab2Content = JSON.parse(
            vehicle.charging_tab2_content
          );
        else vehicle.chargingTab2Content = vehicle.charging_tab2_content || [];

        // Convertir snake_case a camelCase para autonomía
        vehicle.autonomyGeneralTitle = vehicle.autonomy_general_title;
        vehicle.autonomyGeneralDescription =
          vehicle.autonomy_general_description;
        vehicle.autonomyCard1Title = vehicle.autonomy_card1_title;
        vehicle.autonomyCard1Description = vehicle.autonomy_card1_description;
        vehicle.autonomyCard1Link = vehicle.autonomy_card1_link;
        vehicle.autonomyCard2Title = vehicle.autonomy_card2_title;
        vehicle.autonomyCard2Description = vehicle.autonomy_card2_description;
        vehicle.autonomyCard2Link = vehicle.autonomy_card2_link;
        vehicle.chargingTab1Title = vehicle.charging_tab1_title;
        vehicle.chargingTab2Title = vehicle.charging_tab2_title;

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

      // Inicializar el tab activo con el primer equipamiento disponible
      if (vehicle.equipExterior && vehicle.equipExterior.length > 0) {
        setActiveEquipmentTab("exterior");
      } else if (vehicle.equipInterior && vehicle.equipInterior.length > 0) {
        setActiveEquipmentTab("interior");
      } else if (
        vehicle.equipMultimedia &&
        vehicle.equipMultimedia.length > 0
      ) {
        setActiveEquipmentTab("multimedia");
      } else if (
        vehicle.equipAsistencia &&
        vehicle.equipAsistencia.length > 0
      ) {
        setActiveEquipmentTab("asistencia");
      } else if (vehicle.equipConfort && vehicle.equipConfort.length > 0) {
        setActiveEquipmentTab("confort");
      } else if (
        vehicle.equipTrenRodaje &&
        vehicle.equipTrenRodaje.length > 0
      ) {
        setActiveEquipmentTab("tren-rodaje");
      } else if (vehicle.equipSeguridad && vehicle.equipSeguridad.length > 0) {
        setActiveEquipmentTab("seguridad");
      }
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

  // Detectar si es un vehículo AMG
  const isAMG = vehicle.is_amg || false;

  // Handle image error
  const handleImageError = (imagePath: string) => {
    setImageErrors((prev) => new Set(prev).add(imagePath));
  };

  // Check if image has error
  const hasImageError = (imagePath: string) => imageErrors.has(imagePath);

  return (
    <div className={`min-h-screen ${isAMG ? "bg-neutral-950" : "bg-black"}`}>
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
        <div
          className={`absolute inset-0 ${
            isAMG
              ? "bg-gradient-to-b from-black/80 via-[#5AC3B6]/5 to-black/95"
              : "bg-gradient-to-b from-black/70 via-transparent to-black/95"
          }`}
        ></div>

        {/* AMG Corner Accent */}
        {isAMG && (
          <div className="absolute top-0 right-0 w-64 h-64 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#5AC3B6]/30 to-transparent" />
          </div>
        )}

        {/* Contenido del hero */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pb-12 sm:pb-16 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* AMG Badge */}
              {isAMG && (
                <div className="inline-flex items-center gap-3 mb-4 sm:mb-5">
                  <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-[#5AC3B6] uppercase bg-[#5AC3B6]/10 px-3 py-1.5 border border-[#5AC3B6]/30">
                    AMG Performance
                  </span>
                </div>
              )}
              <p
                className={`text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.2em] sm:tracking-[0.3em] mb-2 sm:mb-3 uppercase ${
                  isAMG ? "text-[#5AC3B6]/80" : "text-white/70"
                }`}
              >
                {vehicle.category}
              </p>
              <h1
                className={`text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight ${
                  isAMG ? "text-white" : "text-white"
                }`}
              >
                {vehicle.name}
              </h1>
              {vehicle.subtitle && (
                <p
                  className={`text-lg md:text-xl max-w-2xl font-light ${
                    isAMG ? "text-gray-300" : "text-white/80"
                  }`}
                >
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

      {/* Aspectos Destacados - Diseño mejorado */}
      {vehicle.aspecto1Valor && (
        <section
          className={`py-16 sm:py-20 md:py-24 lg:py-32 text-white relative overflow-hidden ${
            isAMG
              ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950"
              : "bg-black"
          }`}
        >
          {/* AMG Decorative line */}
          {isAMG && (
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5AC3B6]/40 to-transparent" />
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-10 sm:mb-12 md:mb-16 lg:mb-20 text-center tracking-wide ${
                isAMG ? "text-white" : ""
              }`}
            >
              Aspectos Destacados
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
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
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: num * 0.15, duration: 0.6 }}
                    className="group relative h-full"
                  >
                    {/* Card principal - más horizontal */}
                    <div
                      className={`relative backdrop-blur-sm p-6 sm:p-8 md:p-10 transition-all duration-500 h-[180px] sm:h-[200px] flex flex-col items-center justify-center ${
                        isAMG
                          ? "bg-gradient-to-br from-neutral-900/80 to-neutral-950/80 border border-[#5AC3B6]/20 hover:border-[#5AC3B6]/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                          : "bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="text-center relative z-10 space-y-3 sm:space-y-4 px-2 w-full">
                        {/* Valor principal - adaptable al contenido */}
                        <div
                          className={`font-light tracking-tight leading-tight ${
                            isAMG ? "text-[#5AC3B6]" : "text-white"
                          } ${
                            valor && valor.length > 20
                              ? "text-xl sm:text-2xl md:text-3xl"
                              : valor && valor.length > 10
                              ? "text-2xl sm:text-3xl md:text-4xl"
                              : "text-3xl sm:text-4xl md:text-5xl"
                          }`}
                        >
                          {valor}
                        </div>

                        {/* Separador sutil */}
                        <div
                          className={`w-10 h-px mx-auto ${
                            isAMG
                              ? "bg-gradient-to-r from-transparent via-[#5AC3B6]/50 to-transparent"
                              : "bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          }`}
                        ></div>

                        {/* Label más espacioso */}
                        <div
                          className={`text-[10px] sm:text-xs font-light uppercase tracking-[0.15em] leading-relaxed ${
                            isAMG ? "text-gray-400" : "text-gray-300"
                          }`}
                        >
                          {label}
                        </div>
                      </div>

                      {/* Efecto de brillo en hover */}
                      <div
                        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                          isAMG
                            ? "bg-gradient-to-br from-[#5AC3B6]/5 via-transparent to-[#5AC3B6]/10"
                            : "bg-gradient-to-br from-white/0 via-white/0 to-white/5"
                        }`}
                      ></div>

                      {/* AMG corner accent */}
                      {isAMG && (
                        <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#5AC3B6]/20 to-transparent" />
                        </div>
                      )}
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
        <section
          className={`py-24 md:py-32 relative ${
            isAMG
              ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white"
              : "bg-white text-black"
          }`}
        >
          {isAMG && (
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5AC3B6]/40 to-transparent" />
          )}
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={`text-3xl md:text-5xl font-light mb-16 text-center ${
                isAMG ? "text-[#5AC3B6]" : ""
              }`}
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
              isAMG={isAMG}
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
        <section
          className={`py-24 md:py-32 text-white relative ${
            isAMG
              ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950"
              : "bg-black"
          }`}
        >
          {isAMG && (
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5AC3B6]/30 to-transparent" />
          )}
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={`text-3xl md:text-5xl font-light mb-16 text-center ${
                isAMG ? "text-[#5AC3B6]" : ""
              }`}
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
              isAMG={isAMG}
            />
          </div>
        </section>
      )}

      {/* Colores - Carousel de variantes de color */}
      <section
        className={`py-24 md:py-32 relative ${
          isAMG
            ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white"
            : "bg-white text-black"
        }`}
      >
        {isAMG && (
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5AC3B6]/40 to-transparent" />
        )}
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`text-3xl md:text-5xl font-light mb-16 text-center ${
              isAMG ? "text-[#5AC3B6]" : ""
            }`}
          >
            Colores Disponibles
          </motion.h2>

          <ColorCarousel vehicleId={vehicleId} isAMG={isAMG} />
        </div>
      </section>

      {/* Equipamiento - Con sistema de tabs */}
      {vehicle.equipmentGeneralTitle &&
        ((vehicle.equipExterior && vehicle.equipExterior.length > 0) ||
          (vehicle.equipInterior && vehicle.equipInterior.length > 0) ||
          (vehicle.equipMultimedia && vehicle.equipMultimedia.length > 0) ||
          (vehicle.equipAsistencia && vehicle.equipAsistencia.length > 0) ||
          (vehicle.equipConfort && vehicle.equipConfort.length > 0) ||
          (vehicle.equipTrenRodaje && vehicle.equipTrenRodaje.length > 0) ||
          (vehicle.equipSeguridad && vehicle.equipSeguridad.length > 0)) && (
          <section
            className={`py-24 md:py-32 text-white relative ${
              isAMG
                ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950"
                : "bg-black"
            }`}
          >
            {isAMG && (
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5AC3B6]/40 to-transparent" />
            )}
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className={`text-3xl md:text-5xl font-light mb-6 text-center ${
                  isAMG ? "text-[#5AC3B6]" : ""
                }`}
              >
                {vehicle.equipmentGeneralTitle}
              </motion.h2>
              {vehicle.equipmentGeneralDescription && (
                <p className="text-lg md:text-xl text-gray-200 font-light mb-16 md:mb-24 max-w-3xl mx-auto text-center">
                  {vehicle.equipmentGeneralDescription}
                </p>
              )}

              {/* Tabs Navigation */}
              <div
                className={`flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-8 sm:mb-12 md:mb-16 pb-0 ${
                  isAMG
                    ? "border-b border-[#5AC3B6]/30"
                    : "border-b border-white/20"
                }`}
              >
                {vehicle.equipExterior && vehicle.equipExterior.length > 0 && (
                  <button
                    onClick={() => setActiveEquipmentTab("exterior")}
                    className={`pb-3 sm:pb-4 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base font-light transition-all whitespace-nowrap ${
                      activeEquipmentTab === "exterior"
                        ? isAMG
                          ? "border-b-2 border-[#5AC3B6] text-[#5AC3B6]"
                          : "border-b-2 border-white text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Exterior
                  </button>
                )}
                {vehicle.equipInterior && vehicle.equipInterior.length > 0 && (
                  <button
                    onClick={() => setActiveEquipmentTab("interior")}
                    className={`pb-3 sm:pb-4 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base font-light transition-all whitespace-nowrap ${
                      activeEquipmentTab === "interior"
                        ? isAMG
                          ? "border-b-2 border-[#5AC3B6] text-[#5AC3B6]"
                          : "border-b-2 border-white text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Interior
                  </button>
                )}
                {vehicle.equipMultimedia &&
                  vehicle.equipMultimedia.length > 0 && (
                    <button
                      onClick={() => setActiveEquipmentTab("multimedia")}
                      className={`pb-3 sm:pb-4 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base font-light transition-all whitespace-nowrap ${
                        activeEquipmentTab === "multimedia"
                          ? isAMG
                            ? "border-b-2 border-[#5AC3B6] text-[#5AC3B6]"
                            : "border-b-2 border-white text-white"
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
                          ? isAMG
                            ? "border-b-2 border-[#5AC3B6] text-[#5AC3B6]"
                            : "border-b-2 border-white text-white"
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
                        ? isAMG
                          ? "border-b-2 border-[#5AC3B6] text-[#5AC3B6]"
                          : "border-b-2 border-white text-white"
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
                          ? isAMG
                            ? "border-b-2 border-[#5AC3B6] text-[#5AC3B6]"
                            : "border-b-2 border-white text-white"
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
                          ? isAMG
                            ? "border-b-2 border-[#5AC3B6] text-[#5AC3B6]"
                            : "border-b-2 border-white text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Seguridad
                    </button>
                  )}
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
                {/* Exterior */}
                {activeEquipmentTab === "exterior" && vehicle.equipExterior && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
                  >
                    {vehicle.equipExterior.map((item, index) => {
                      const imagePath = `${basePath}/equipment/exterior/${
                        index + 1
                      }`;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className={`group ${
                            isAMG
                              ? "rounded-lg overflow-hidden border border-[#5AC3B6]/20 hover:border-[#5AC3B6]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(90,195,182,0.15)]"
                              : ""
                          }`}
                        >
                          <div
                            className={`relative aspect-[4/3] overflow-hidden mb-3 sm:mb-4 ${
                              isAMG ? "bg-neutral-800" : "bg-zinc-800"
                            }`}
                          >
                            <MultiFormatImage
                              basePath={imagePath}
                              alt={item.title || "Exterior"}
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {isAMG && (
                              <div className="absolute inset-0 bg-gradient-to-t from-[#5AC3B6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            )}
                          </div>
                          {(item.title || item.description) && (
                            <div
                              className={`py-2 sm:py-3 ${isAMG ? "px-3" : ""}`}
                            >
                              {item.title && (
                                <h4
                                  className={`text-base sm:text-lg font-light mb-1 sm:mb-2 ${
                                    isAMG ? "text-[#5AC3B6]" : "text-white"
                                  }`}
                                >
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

                {/* Interior */}
                {activeEquipmentTab === "interior" && vehicle.equipInterior && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
                  >
                    {vehicle.equipInterior.map((item, index) => {
                      const imagePath = `${basePath}/equipment/interior/${
                        index + 1
                      }`;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className={`group ${
                            isAMG
                              ? "rounded-lg overflow-hidden border border-[#5AC3B6]/20 hover:border-[#5AC3B6]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(90,195,182,0.15)]"
                              : ""
                          }`}
                        >
                          <div
                            className={`relative aspect-[4/3] overflow-hidden mb-3 sm:mb-4 ${
                              isAMG ? "bg-neutral-800" : "bg-zinc-800"
                            }`}
                          >
                            <MultiFormatImage
                              basePath={imagePath}
                              alt={item.title || "Interior"}
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {isAMG && (
                              <div className="absolute inset-0 bg-gradient-to-t from-[#5AC3B6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            )}
                          </div>
                          {(item.title || item.description) && (
                            <div
                              className={`py-2 sm:py-3 ${isAMG ? "px-3" : ""}`}
                            >
                              {item.title && (
                                <h4
                                  className={`text-base sm:text-lg font-light mb-1 sm:mb-2 ${
                                    isAMG ? "text-[#5AC3B6]" : "text-white"
                                  }`}
                                >
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
                            className={`group ${
                              isAMG
                                ? "rounded-lg overflow-hidden border border-[#5AC3B6]/20 hover:border-[#5AC3B6]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(90,195,182,0.15)]"
                                : ""
                            }`}
                          >
                            <div
                              className={`relative aspect-[4/3] overflow-hidden mb-3 sm:mb-4 ${
                                isAMG ? "bg-neutral-800" : "bg-zinc-800"
                              }`}
                            >
                              <MultiFormatImage
                                basePath={imagePath}
                                alt={item.title || "Multimedia"}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {isAMG && (
                                <div className="absolute inset-0 bg-gradient-to-t from-[#5AC3B6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              )}
                            </div>
                            {(item.title || item.description) && (
                              <div
                                className={`py-2 sm:py-3 ${
                                  isAMG ? "px-3" : ""
                                }`}
                              >
                                {item.title && (
                                  <h4
                                    className={`text-base sm:text-lg font-light mb-1 sm:mb-2 ${
                                      isAMG ? "text-[#5AC3B6]" : "text-white"
                                    }`}
                                  >
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
                            className={`group ${
                              isAMG
                                ? "rounded-lg overflow-hidden border border-[#5AC3B6]/20 hover:border-[#5AC3B6]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(90,195,182,0.15)]"
                                : ""
                            }`}
                          >
                            <div
                              className={`relative aspect-[4/3] overflow-hidden mb-3 sm:mb-4 ${
                                isAMG ? "bg-neutral-800" : "bg-zinc-800"
                              }`}
                            >
                              <MultiFormatImage
                                basePath={imagePath}
                                alt={item.title || "Asistencia"}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {isAMG && (
                                <div className="absolute inset-0 bg-gradient-to-t from-[#5AC3B6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              )}
                            </div>
                            {(item.title || item.description) && (
                              <div
                                className={`py-2 sm:py-3 ${
                                  isAMG ? "px-3" : ""
                                }`}
                              >
                                {item.title && (
                                  <h4
                                    className={`text-base sm:text-lg font-light mb-1 sm:mb-2 ${
                                      isAMG ? "text-[#5AC3B6]" : "text-white"
                                    }`}
                                  >
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
                          className={`group ${
                            isAMG
                              ? "rounded-lg overflow-hidden border border-[#5AC3B6]/20 hover:border-[#5AC3B6]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(90,195,182,0.15)]"
                              : ""
                          }`}
                        >
                          <div
                            className={`relative aspect-[4/3] overflow-hidden mb-3 sm:mb-4 ${
                              isAMG ? "bg-neutral-800" : "bg-zinc-800"
                            }`}
                          >
                            <MultiFormatImage
                              basePath={imagePath}
                              alt={item.title || "Confort"}
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {isAMG && (
                              <div className="absolute inset-0 bg-gradient-to-t from-[#5AC3B6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            )}
                          </div>
                          {(item.title || item.description) && (
                            <div
                              className={`py-2 sm:py-3 ${isAMG ? "px-3" : ""}`}
                            >
                              {item.title && (
                                <h4
                                  className={`text-base sm:text-lg font-light mb-1 sm:mb-2 ${
                                    isAMG ? "text-[#5AC3B6]" : "text-white"
                                  }`}
                                >
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
                            className={`group ${
                              isAMG
                                ? "rounded-lg overflow-hidden border border-[#5AC3B6]/20 hover:border-[#5AC3B6]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(90,195,182,0.15)]"
                                : ""
                            }`}
                          >
                            <div
                              className={`relative aspect-[4/3] overflow-hidden mb-3 sm:mb-4 ${
                                isAMG ? "bg-neutral-800" : "bg-zinc-800"
                              }`}
                            >
                              <MultiFormatImage
                                basePath={imagePath}
                                alt={item.title || "Tren de rodaje"}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {isAMG && (
                                <div className="absolute inset-0 bg-gradient-to-t from-[#5AC3B6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              )}
                            </div>
                            {(item.title || item.description) && (
                              <div
                                className={`py-2 sm:py-3 ${
                                  isAMG ? "px-3" : ""
                                }`}
                              >
                                {item.title && (
                                  <h4
                                    className={`text-base sm:text-lg font-light mb-1 sm:mb-2 ${
                                      isAMG ? "text-[#5AC3B6]" : "text-white"
                                    }`}
                                  >
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
                            className={`group ${
                              isAMG
                                ? "rounded-lg overflow-hidden border border-[#5AC3B6]/20 hover:border-[#5AC3B6]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(90,195,182,0.15)]"
                                : ""
                            }`}
                          >
                            <div
                              className={`relative aspect-[4/3] overflow-hidden mb-3 sm:mb-4 ${
                                isAMG ? "bg-neutral-800" : "bg-zinc-800"
                              }`}
                            >
                              <MultiFormatImage
                                basePath={imagePath}
                                alt={item.title || "Seguridad"}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {isAMG && (
                                <div className="absolute inset-0 bg-gradient-to-t from-[#5AC3B6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              )}
                            </div>
                            {(item.title || item.description) && (
                              <div
                                className={`py-2 sm:py-3 ${
                                  isAMG ? "px-3" : ""
                                }`}
                              >
                                {item.title && (
                                  <h4
                                    className={`text-base sm:text-lg font-light mb-1 sm:mb-2 ${
                                      isAMG ? "text-[#5AC3B6]" : "text-white"
                                    }`}
                                  >
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
        <section
          className={`py-24 md:py-32 relative ${
            isAMG
              ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white"
              : "bg-white text-black"
          }`}
        >
          {isAMG && (
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5AC3B6]/40 to-transparent" />
          )}
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={`text-3xl md:text-5xl font-light mb-12 text-center ${
                isAMG ? "text-[#5AC3B6]" : ""
              }`}
            >
              Especificaciones Técnicas
            </motion.h2>

            <div
              className={`space-y-0 border-t ${
                isAMG ? "border-[#5AC3B6]/30" : "border-gray-200"
              }`}
            >
              {vehicle.specsConsumo && vehicle.specsConsumo.length > 0 && (
                <AccordionItem
                  title="Consumo y emisión"
                  specs={vehicle.specsConsumo}
                  isOpen={openSpecIndex === 0}
                  onToggle={() =>
                    setOpenSpecIndex(openSpecIndex === 0 ? null : 0)
                  }
                  isAMG={isAMG}
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
                    isAMG={isAMG}
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
                  isAMG={isAMG}
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
                    isAMG={isAMG}
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
                    isAMG={isAMG}
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
                    isAMG={isAMG}
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
                  isAMG={isAMG}
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
                    isAMG={isAMG}
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
                    isAMG={isAMG}
                  />
                )}
            </div>
          </div>
        </section>
      )}

      {/* ========== AUTONOMÍA Y CARGA (Solo eléctricos) ========== */}
      {(vehicle.chargingTab1Content?.length > 0 ||
        vehicle.chargingTab2Content?.length > 0 ||
        vehicle.autonomyCard1Title ||
        vehicle.autonomyCard2Title) && (
        <section
          className={`py-24 md:py-32 relative ${
            isAMG
              ? "bg-gradient-to-b from-neutral-900 via-black to-neutral-950 text-white"
              : "bg-white text-black"
          }`}
        >
          {isAMG && (
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5AC3B6]/40 to-transparent" />
          )}

          <div className="max-w-7xl mx-auto px-6 md:px-12">
            {/* Header */}
            {vehicle.autonomyGeneralTitle && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-16 text-center"
              >
                <h2
                  className={`text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6 ${
                    isAMG ? "text-[#5AC3B6]" : ""
                  }`}
                >
                  {vehicle.autonomyGeneralTitle}
                </h2>
                {vehicle.autonomyGeneralDescription && (
                  <p
                    className={`text-base md:text-lg font-light max-w-4xl mx-auto leading-relaxed ${
                      isAMG ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {vehicle.autonomyGeneralDescription}
                  </p>
                )}
              </motion.div>
            )}

            {/* Cards de Simuladores */}
            {(vehicle.autonomyCard1Title || vehicle.autonomyCard2Title) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20"
              >
                {/* Card 1 - Simular autonomía */}
                {vehicle.autonomyCard1Title && (
                  <Link
                    href={vehicle.autonomyCard1Link || "#"}
                    target={vehicle.autonomyCard1Link ? "_blank" : undefined}
                    className="group relative aspect-[16/9] overflow-hidden"
                  >
                    {/* Imagen de fondo */}
                    {!hasImageError(`${basePath}/autonomy/card1`) && (
                      <Image
                        src={getImagePath(`${basePath}/autonomy/card1`)}
                        alt={vehicle.autonomyCard1Title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={() =>
                          handleImageError(`${basePath}/autonomy/card1`)
                        }
                      />
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Contenido */}
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                      <div
                        className={`inline-flex items-center gap-2 text-xs tracking-wider uppercase mb-3 ${
                          isAMG ? "text-[#5AC3B6]" : "text-white/70"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span>Simulá</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-light text-white mb-2">
                        {vehicle.autonomyCard1Title}
                      </h3>
                      {vehicle.autonomyCard1Description && (
                        <p className="text-sm text-white/80 font-light">
                          {vehicle.autonomyCard1Description}
                        </p>
                      )}
                      <div
                        className={`mt-4 inline-flex items-center gap-2 text-sm font-light transition-transform group-hover:translate-x-2 ${
                          isAMG ? "text-[#5AC3B6]" : "text-white"
                        }`}
                      >
                        <span>Simular</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Card 2 - Simular tiempo de carga */}
                {vehicle.autonomyCard2Title && (
                  <Link
                    href={vehicle.autonomyCard2Link || "#"}
                    target={vehicle.autonomyCard2Link ? "_blank" : undefined}
                    className="group relative aspect-[16/9] overflow-hidden"
                  >
                    {/* Imagen de fondo */}
                    {!hasImageError(`${basePath}/autonomy/card2`) && (
                      <Image
                        src={getImagePath(`${basePath}/autonomy/card2`)}
                        alt={vehicle.autonomyCard2Title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={() =>
                          handleImageError(`${basePath}/autonomy/card2`)
                        }
                      />
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Contenido */}
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                      <div
                        className={`inline-flex items-center gap-2 text-xs tracking-wider uppercase mb-3 ${
                          isAMG ? "text-[#5AC3B6]" : "text-white/70"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 4v16m0-8h8m-8 0H4"
                          />
                        </svg>
                        <span>Simular</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-light text-white mb-2">
                        {vehicle.autonomyCard2Title}
                      </h3>
                      {vehicle.autonomyCard2Description && (
                        <p className="text-sm text-white/80 font-light">
                          {vehicle.autonomyCard2Description}
                        </p>
                      )}
                      <div
                        className={`mt-4 inline-flex items-center gap-2 text-sm font-light transition-transform group-hover:translate-x-2 ${
                          isAMG ? "text-[#5AC3B6]" : "text-white"
                        }`}
                      >
                        <span>Simular</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            )}

            {/* Tabs de Carga y Tecnología */}
            {(vehicle.chargingTab1Content?.length > 0 ||
              vehicle.chargingTab2Content?.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {/* Tab Navigation */}
                <div
                  className={`flex border-b mb-12 ${
                    isAMG ? "border-[#5AC3B6]/20" : "border-black/10"
                  }`}
                >
                  {vehicle.chargingTab1Title &&
                    vehicle.chargingTab1Content?.length > 0 && (
                      <button
                        onClick={() => setActiveAutonomyTab("tab1")}
                        className={`px-6 py-4 text-sm md:text-base tracking-wider uppercase font-light transition-all ${
                          activeAutonomyTab === "tab1"
                            ? isAMG
                              ? "border-b-2 border-[#5AC3B6] text-[#5AC3B6]"
                              : "border-b-2 border-black text-black"
                            : isAMG
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {vehicle.chargingTab1Title}
                      </button>
                    )}
                  {vehicle.chargingTab2Title &&
                    vehicle.chargingTab2Content?.length > 0 && (
                      <button
                        onClick={() => setActiveAutonomyTab("tab2")}
                        className={`px-6 py-4 text-sm md:text-base tracking-wider uppercase font-light transition-all ${
                          activeAutonomyTab === "tab2"
                            ? isAMG
                              ? "border-b-2 border-[#5AC3B6] text-[#5AC3B6]"
                              : "border-b-2 border-black text-black"
                            : isAMG
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {vehicle.chargingTab2Title}
                      </button>
                    )}
                </div>

                {/* Tab Content */}
                <div className="space-y-12">
                  {/* Tab 1 - Carga */}
                  {activeAutonomyTab === "tab1" &&
                    vehicle.chargingTab1Content?.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center ${
                          index % 2 === 1 ? "lg:grid-flow-dense" : ""
                        }`}
                      >
                        {/* Imagen */}
                        <div
                          className={index % 2 === 1 ? "lg:col-start-2" : ""}
                        >
                          <div className="relative aspect-[4/3] overflow-hidden">
                            {!hasImageError(
                              `${basePath}/autonomy/charging/${index + 1}`
                            ) && (
                              <Image
                                src={getImagePath(
                                  `${basePath}/autonomy/charging/${index + 1}`
                                )}
                                alt={item.title || "Carga"}
                                fill
                                className="object-cover"
                                onError={() =>
                                  handleImageError(
                                    `${basePath}/autonomy/charging/${index + 1}`
                                  )
                                }
                              />
                            )}
                          </div>
                        </div>

                        {/* Contenido */}
                        <div
                          className={
                            index % 2 === 1
                              ? "lg:col-start-1 lg:row-start-1"
                              : ""
                          }
                        >
                          {item.title && (
                            <h3
                              className={`text-2xl md:text-4xl font-light mb-4 ${
                                isAMG ? "text-white" : ""
                              }`}
                            >
                              {item.title}
                            </h3>
                          )}
                          {item.description && (
                            <p
                              className={`text-base md:text-lg font-light leading-relaxed ${
                                isAMG ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}

                  {/* Tab 2 - Tecnología */}
                  {activeAutonomyTab === "tab2" &&
                    vehicle.chargingTab2Content?.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center ${
                          index % 2 === 1 ? "lg:grid-flow-dense" : ""
                        }`}
                      >
                        {/* Imagen */}
                        <div
                          className={index % 2 === 1 ? "lg:col-start-2" : ""}
                        >
                          <div className="relative aspect-[4/3] overflow-hidden">
                            {!hasImageError(
                              `${basePath}/autonomy/technology/${index + 1}`
                            ) && (
                              <Image
                                src={getImagePath(
                                  `${basePath}/autonomy/technology/${index + 1}`
                                )}
                                alt={item.title || "Tecnología"}
                                fill
                                className="object-cover"
                                onError={() =>
                                  handleImageError(
                                    `${basePath}/autonomy/technology/${
                                      index + 1
                                    }`
                                  )
                                }
                              />
                            )}
                          </div>
                        </div>

                        {/* Contenido */}
                        <div
                          className={
                            index % 2 === 1
                              ? "lg:col-start-1 lg:row-start-1"
                              : ""
                          }
                        >
                          {item.title && (
                            <h3
                              className={`text-2xl md:text-4xl font-light mb-4 ${
                                isAMG ? "text-white" : ""
                              }`}
                            >
                              {item.title}
                            </h3>
                          )}
                          {item.description && (
                            <p
                              className={`text-base md:text-lg font-light leading-relaxed ${
                                isAMG ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section - Diseño elegante */}
      <section
        className={`py-32 md:py-40 relative ${
          isAMG
            ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white"
            : "bg-white text-black"
        }`}
      >
        {isAMG && (
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5AC3B6]/40 to-transparent" />
        )}
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className={`text-3xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight ${
                isAMG ? "text-[#5AC3B6]" : ""
              }`}
            >
              ¿Te interesa este vehículo?
            </h2>
            <p
              className={`text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto ${
                isAMG ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Contactame para conocer más detalles, disponibilidad y coordinar
              una visita personalizada
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact"
                className={`group relative px-10 py-4 font-light text-sm tracking-wider uppercase overflow-hidden transition-all duration-300 ${
                  isAMG
                    ? "bg-[#5AC3B6] text-black hover:bg-[#4AB3A6] shadow-[0_4px_20px_rgba(90,195,182,0.3)]"
                    : "bg-black text-white hover:bg-zinc-800"
                }`}
              >
                <span className="relative z-10">Contactame</span>
              </Link>

              <Link
                href="/vehicles"
                className={`group px-10 py-4 border font-light text-sm tracking-wider uppercase transition-all duration-300 ${
                  isAMG
                    ? "border-[#5AC3B6]/50 text-white hover:bg-[#5AC3B6]/10 hover:border-[#5AC3B6]"
                    : "border-black/30 text-black hover:bg-black hover:text-white"
                }`}
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
          className={`fixed bottom-8 right-8 w-12 h-12 md:w-14 md:h-14 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 z-50 group ${
            isAMG
              ? "border border-[#5AC3B6]/40 bg-neutral-900/90 hover:bg-neutral-800 hover:border-[#5AC3B6]/70"
              : "border border-black/20 bg-white/80 hover:bg-white hover:border-black/40"
          }`}
          aria-label="Volver arriba"
        >
          <svg
            className={`w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-y-1 ${
              isAMG ? "text-[#5AC3B6]" : "text-black"
            }`}
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
