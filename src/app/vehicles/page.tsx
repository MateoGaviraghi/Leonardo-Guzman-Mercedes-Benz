"use client";

import VehicleCard from "@/components/VehicleCard";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import type { Vehicle } from "@/data/vehicles";

function VehiclesContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const brand = searchParams.get("brand") || "mercedes-benz";
  const subcategory = searchParams.get("subcategory") || "all";
  const fuelType = searchParams.get("fuelType") || "all";
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevCategory, setPrevCategory] = useState(category);

  // Handle category transition animation
  useEffect(() => {
    if (category !== prevCategory) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevCategory(category);
      }, 1600); // Match template.tsx timing (0.8 delay + 0.8 duration)
      return () => clearTimeout(timer);
    }
  }, [category, prevCategory]);

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles");
        const data = await response.json();
        if (data.success) {
          setVehicles(data.vehicles || []);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Truck subcategories
  const truckSubcategories = [
    { id: "all", name: "Todos" },
    { id: "accelo", name: "Accelo" },
    { id: "atego", name: "Atego" },
    { id: "actros", name: "Actros" },
    { id: "arocs", name: "Arocs" },
  ];

  // Carrocerías - Auto subcategories
  const autoBodyTypes = [
    { id: "all", name: "Todos" },
    { id: "sedan", name: "Sedán" },
    { id: "hatchback", name: "Hatchback" },
    { id: "coupes", name: "Coupés" },
    { id: "cabrios-roadsters", name: "Cabrios/Roadsters" },
  ];

  // Carrocerías - SUV subcategories
  const suvBodyTypes = [
    { id: "all", name: "Todos" },
    { id: "suv-todoterreno", name: "SUV & Todoterreno" },
  ];

  // Tipo de combustible (opcional para todos)
  const fuelTypes = [
    { id: "all", name: "Todos" },
    { id: "nafta", name: "Nafta" },
    { id: "electrico", name: "Eléctrico" },
    { id: "hibrido", name: "Híbrido" },
  ];

  // Get body types based on category
  const getBodyTypes = () => {
    if (category === "trucks") return truckSubcategories;
    if (category === "auto") return autoBodyTypes;
    if (category === "suv") return suvBodyTypes;
    return [];
  };

  // Map vehicle category to main category
  // Handles all variations: singular, plural, with/without accents, different cases
  const getMainCategory = (vehicleCategory: string): string => {
    const cat = vehicleCategory.toLowerCase().trim();

    // AUTO categories (sedans, compacts, coupes, electric, general autos)
    const autoCategories = [
      "auto",
      "autos",
      "sedan",
      "sedanes",
      "sedán",
      "sedánes",
      "compacto",
      "compactos",
      "compacta",
      "compactas",
      "coupe",
      "coupes",
      "coupé",
      "coupés",
      "electrico",
      "electricos",
      "eléctrico",
      "eléctricos",
      "deportivo",
      "deportivos",
      "convertible",
      "convertibles",
      "cabriolet",
      "amg", // AMG cars that are not SUVs go to auto
    ];

    // SUV categories
    const suvCategories = [
      "suv",
      "suvs",
      "crossover",
      "crossovers",
      "todoterreno",
      "4x4",
    ];

    // VANS categories
    const vansCategories = ["van", "vans"];

    // SPRINTER categories
    const sprinterCategories = ["sprinter", "sprinters"];

    // TRUCKS categories
    const trucksCategories = [
      "truck",
      "trucks",
      "camion",
      "camiones",
      "camión",
    ];

    if (autoCategories.includes(cat)) return "auto";
    if (suvCategories.includes(cat)) return "suv";
    if (vansCategories.includes(cat)) return "vans";
    if (sprinterCategories.includes(cat)) return "sprinter";
    if (trucksCategories.includes(cat)) return "trucks";

    // Default: return lowercase for consistency
    return cat;
  };

  // Filter vehicles based on category, brand, and subcategory
  const filteredVehicles =
    category === "all"
      ? vehicles
      : vehicles.filter((v) => {
          const mainCategory = getMainCategory(v.category);
          if (mainCategory !== category) return false;

          // Filter by brand for auto and suv categories
          if ((category === "auto" || category === "suv") && brand !== "all") {
            const isAMG = v.is_amg || false;
            if (brand === "amg" && !isAMG) return false;
            if (brand === "mercedes-benz" && isAMG) return false;
          }

          // Filter by subcategory (body type) - match vehicle category with selected subcategory
          if (subcategory !== "all") {
            const vehicleCat = v.category.toLowerCase().trim();
            // Check if the vehicle's category matches or contains the subcategory
            if (
              !vehicleCat.includes(subcategory) &&
              vehicleCat !== subcategory
            ) {
              return false;
            }
          }

          // Filter by fuel type
          if (fuelType !== "all") {
            const vehicleFuel = (v.fuel_type || "").toLowerCase().trim();
            if (vehicleFuel !== fuelType) {
              return false;
            }
          }

          return true;
        });

  const categories = [
    { id: "all", name: "Todos" },
    { id: "auto", name: "Autos" },
    { id: "suv", name: "SUVs" },
    { id: "vans", name: "Vans" },
    { id: "sprinter", name: "Sprinter" },
    { id: "trucks", name: "Trucks" },
  ];

  // Dynamic video selection based on category
  const getHeroVideo = () => {
    const videoMap: { [key: string]: string } = {
      all: "/heros Vehiculos/MercedesBenz-todos.mp4",
      auto: "/heros Vehiculos/mercedes benz auto.mp4",
      suv: "/heros Vehiculos/mercedes benz suv.mp4",
      vans: "/heros Vehiculos/mercedes benz vans.mp4",
      sprinter: "/heros Vehiculos/mercedes benz sprinter.mp4",
      trucks: "/heros Vehiculos/mercedes benz truck.mp4",
    };
    return videoMap[category] || videoMap.all;
  };

  return (
    <div className="min-h-screen bg-black text-white pb-12">
      {/* Transition Overlay with Logo - Same as template.tsx */}
      <AnimatePresence>
        {isTransitioning && (
          <>
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 0.8, duration: 0.8, ease: "easeInOut" }}
              className="fixed inset-0 z-[100] bg-black pointer-events-none"
            />
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-32 h-32">
                <Image
                  src="/logo-mercedes-benz.png"
                  alt="Mercedes-Benz Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section with Video */}
      <div className="relative h-[85vh] flex items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/40 to-black z-10"></div>
        {/* Video Background */}
        <video
          key={category}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        >
          <source src={getHeroVideo()} type="video/mp4" />
        </video>

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-8xl font-serif font-bold tracking-tighter mb-6"
          >
            {category === "all" && "Toda Nuestra Gama"}
            {category === "auto" && "Autos"}
            {category === "suv" && "SUVs"}
            {category === "vans" && "Vans"}
            {category === "sprinter" && "Sprinter"}
            {category === "trucks" && "Trucks"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 font-light tracking-wide"
          >
            Ingeniería alemana. Excelencia garantizada.
          </motion.p>
        </div>
      </div>

      {/* Category Filter Buttons - Above Grid */}
      <div className="bg-black border-b border-white/10 py-6 mb-16">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-wrap lg:flex-nowrap justify-center gap-3 lg:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/vehicles?category=${cat.id}`}
                className={`text-xs lg:text-sm font-bold tracking-widest uppercase transition-all px-4 py-3 lg:px-8 lg:py-4 border-2 ${
                  category === cat.id
                    ? "text-black bg-white border-white"
                    : "text-white bg-transparent border-white/60 hover:bg-white hover:text-black hover:border-white"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div
        className={`w-full pt-12 pb-12 relative ${
          (category === "auto" || category === "suv") && brand === "amg"
            ? "bg-[radial-gradient(ellipse_at_top,rgba(90,195,182,0.08)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(90,195,182,0.05)_0%,transparent_40%)] bg-neutral-950"
            : ""
        }`}
      >
        {/* AMG Decorative Elements */}
        {(category === "auto" || category === "suv") && brand === "amg" && (
          <>
            {/* Top border accent */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5AC3B6]/40 to-transparent" />
            {/* Bottom border accent */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5AC3B6]/30 to-transparent" />
            {/* AMG Performance Badge */}
            <div className="absolute top-6 right-6 md:right-12 opacity-30 pointer-events-none hidden lg:block">
              <span className="text-[10px] font-bold tracking-[0.4em] text-[#5AC3B6] uppercase">
                Performance
              </span>
            </div>
          </>
        )}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div
            className={
              category === "trucks" || category === "auto" || category === "suv"
                ? "flex flex-col lg:flex-row gap-8 lg:gap-12"
                : ""
            }
          >
            {/* Trucks Sidebar */}
            {category === "trucks" && (
              <aside className="w-full lg:w-80 shrink-0">
                <div className="backdrop-blur-md rounded-lg overflow-hidden transition-all bg-neutral-900/80 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                  {/* Subcategories */}
                  <nav className="p-3 lg:p-4 overflow-x-auto lg:overflow-x-visible">
                    <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
                      {truckSubcategories.map((subcat) => (
                        <Link
                          key={subcat.id}
                          href={`/vehicles?category=trucks&subcategory=${subcat.id}`}
                          scroll={false}
                          className={`whitespace-nowrap text-sm font-semibold tracking-wide uppercase transition-all px-5 py-3 border rounded-md text-center lg:text-left ${
                            subcategory === subcat.id
                              ? "text-black bg-white border-white"
                              : "text-white bg-transparent border-white/30 hover:bg-white/10 hover:border-white/50"
                          }`}
                        >
                          {subcat.name}
                        </Link>
                      ))}
                    </div>
                  </nav>
                </div>
              </aside>
            )}

            {/* Auto & SUV Sidebar with Brand Toggle */}
            {(category === "auto" || category === "suv") && (
              <aside className="w-full lg:w-80 shrink-0">
                <div
                  className={`backdrop-blur-md rounded-lg overflow-hidden transition-all duration-500 ${
                    brand === "amg"
                      ? "bg-gradient-to-b from-neutral-900/95 to-neutral-950/95 border border-[#5AC3B6]/25 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(90,195,182,0.1)_inset]"
                      : "bg-neutral-900/80 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                  }`}
                >
                  {/* Brand Toggle */}
                  <div
                    className={`p-4 lg:p-5 border-b ${
                      brand === "amg"
                        ? "border-[#5AC3B6]/30"
                        : "border-white/15"
                    }`}
                  >
                    <div className="flex gap-3 lg:gap-4">
                      <Link
                        href={`/vehicles?category=${category}&brand=mercedes-benz`}
                        scroll={false}
                        className={`flex-1 py-4 lg:py-5 px-3 lg:px-4 text-center font-bold transition-all flex flex-col items-center justify-center gap-2 rounded-md ${
                          brand === "mercedes-benz"
                            ? "bg-white/10 border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            : "bg-black/50 border-2 border-white/20 hover:border-white/40 hover:bg-black/70"
                        }`}
                      >
                        <div className="relative w-full h-5 lg:h-6 flex items-center justify-center">
                          <Image
                            src="/logosParaSlidebar/mercedesBenzLogoLetras.png"
                            alt="Mercedes-Benz"
                            width={110}
                            height={26}
                            className="object-contain"
                            style={{
                              filter: "brightness(0) invert(1)",
                            }}
                          />
                        </div>
                      </Link>
                      <Link
                        href={`/vehicles?category=${category}&brand=amg`}
                        scroll={false}
                        className={`flex-1 py-4 lg:py-5 px-3 lg:px-4 text-center font-bold transition-all duration-500 flex flex-col items-center justify-center gap-2 rounded-md relative overflow-hidden ${
                          brand === "amg"
                            ? "bg-gradient-to-br from-[#5AC3B6]/25 via-[#5AC3B6]/15 to-[#5AC3B6]/20 border-2 border-[#5AC3B6] shadow-[0_0_30px_rgba(90,195,182,0.35),inset_0_1px_0_rgba(255,255,255,0.1)]"
                            : "bg-black/50 border-2 border-white/20 hover:border-[#5AC3B6]/40 hover:bg-black/70"
                        }`}
                      >
                        {brand === "amg" && (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(90,195,182,0.2),transparent_70%)]" />
                        )}
                        <div className="relative z-10 w-full h-5 lg:h-6 flex items-center justify-center">
                          <Image
                            src="/logosParaSlidebar/logoAmgPhotoroom.png"
                            alt="AMG"
                            width={75}
                            height={26}
                            className="object-contain"
                            style={{
                              filter:
                                brand === "amg"
                                  ? "brightness(1.2) drop-shadow(0 0 8px rgba(90,195,182,0.5))"
                                  : "brightness(0) invert(1)",
                            }}
                          />
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="p-3 lg:p-4 overflow-x-auto lg:overflow-x-visible lg:max-h-[65vh] lg:overflow-y-auto custom-scrollbar space-y-6">
                    {/* Carrocerías */}
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-white/60 mb-3 uppercase">
                        Carrocerías
                      </h3>
                      <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
                        {getBodyTypes().map((bodyType) => (
                          <Link
                            key={bodyType.id}
                            href={`/vehicles?category=${category}&brand=${brand}&subcategory=${bodyType.id}&fuelType=${fuelType}`}
                            scroll={false}
                            className={`whitespace-nowrap text-sm font-semibold tracking-wide uppercase transition-all px-5 py-3 border rounded-md text-center lg:text-left ${
                              subcategory === bodyType.id
                                ? brand === "amg"
                                  ? "text-black bg-[#5AC3B6] border-[#5AC3B6] shadow-md"
                                  : "text-black bg-white border-white"
                                : brand === "amg"
                                ? "text-white bg-transparent border-[#5AC3B6]/30 hover:bg-[#5AC3B6]/10 hover:border-[#5AC3B6]/50"
                                : "text-white bg-transparent border-white/30 hover:bg-white/10 hover:border-white/50"
                            }`}
                          >
                            {bodyType.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Tipo de combustible */}
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-white/60 mb-3 uppercase">
                        Tipo de combustible
                      </h3>
                      <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
                        {fuelTypes.map((fuel) => (
                          <Link
                            key={fuel.id}
                            href={`/vehicles?category=${category}&brand=${brand}&subcategory=${subcategory}&fuelType=${fuel.id}`}
                            scroll={false}
                            className={`whitespace-nowrap text-sm font-semibold tracking-wide uppercase transition-all px-5 py-3 border rounded-md text-center lg:text-left ${
                              fuelType === fuel.id
                                ? brand === "amg"
                                  ? "text-black bg-[#5AC3B6] border-[#5AC3B6] shadow-md"
                                  : "text-black bg-white border-white"
                                : brand === "amg"
                                ? "text-white bg-transparent border-[#5AC3B6]/30 hover:bg-[#5AC3B6]/10 hover:border-[#5AC3B6]/50"
                                : "text-white bg-transparent border-white/30 hover:bg-white/10 hover:border-white/50"
                            }`}
                          >
                            {fuel.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Vehicle Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  <p className="mt-4 text-gray-400">Cargando vehículos...</p>
                </div>
              ) : (
                <>
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 ${
                      category === "trucks" ||
                      category === "auto" ||
                      category === "suv"
                        ? "lg:grid-cols-2"
                        : "lg:grid-cols-3"
                    }`}
                  >
                    {filteredVehicles.map((vehicle) => (
                      <VehicleCard
                        key={vehicle.id}
                        title={vehicle.name}
                        category={vehicle.category}
                        href={`/vehicles/${vehicle.id}`}
                        image={`/vehicles/${vehicle.id}/foto-card/card`}
                        fuelType={vehicle.fuel_type}
                        isAMG={brand === "amg"}
                      />
                    ))}
                  </div>

                  {filteredVehicles.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                      No se encontraron vehículos en esta categoría.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all group"
            aria-label="Volver arriba"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Cargando...</div>
        </div>
      }
    >
      <VehiclesContent />
    </Suspense>
  );
}
