"use client";

import VehicleCard from "@/components/VehicleCard";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useState, useEffect } from "react";
import Image from "next/image";

function VehiclesContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const brand = searchParams.get("brand") || "mercedes-benz";
  const subcategory = searchParams.get("subcategory") || "all";
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  // Auto subcategories - Mercedes-Benz (SOLO GRUPOS)
  const autoMercedesSubcategories = [
    { id: "all", name: "Todos" },
    { id: "compactos", name: "Compactos" },
    { id: "sedanes", name: "Sedanes" },
    { id: "coupes", name: "Coupés" },
    { id: "electricos", name: "Eléctricos" },
  ];

  // Auto subcategories - AMG (SOLO GRUPOS)
  const autoAMGSubcategories = [
    { id: "all", name: "Todos" },
    { id: "compactos-deportivos", name: "Compactos Deportivos" },
    { id: "sedanes-performance", name: "Sedanes de Performance" },
    { id: "deportivos-puros", name: "Deportivos Puros" },
    { id: "electricos-performance", name: "Eléctricos de Performance" },
  ];

  // SUV subcategories - Mercedes-Benz (SOLO GRUPOS)
  const suvMercedesSubcategories = [
    { id: "all", name: "Todos" },
    { id: "compactas", name: "Compactas" },
    { id: "medianas-grandes", name: "Medianas / Grandes" },
    { id: "lujo", name: "Lujo / Full Size" },
    { id: "electricas", name: "SUVs Eléctricas" },
  ];

  // SUV subcategories - AMG (SOLO GRUPOS)
  const suvAMGSubcategories = [
    { id: "all", name: "Todos" },
    { id: "compactas", name: "Compactas" },
    { id: "medianas-grandes", name: "Medianas / Grandes" },
    { id: "leyenda", name: "La Leyenda" },
  ];

  // Get subcategories based on category and brand
  const getSubcategories = () => {
    if (category === "trucks") return truckSubcategories;
    if (category === "auto") {
      return brand === "amg" ? autoAMGSubcategories : autoMercedesSubcategories;
    }
    if (category === "suv") {
      return brand === "amg" ? suvAMGSubcategories : suvMercedesSubcategories;
    }
    return [];
  };

  const vehicles = [
    {
      id: "1",
      name: "Clase A Hatchback",
      category: "auto",
      brand: "mercedes-benz",
      subcategory: "clase-a-hatchback",
      image:
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "2",
      name: "Clase C Sedán",
      category: "auto",
      brand: "mercedes-benz",
      subcategory: "clase-c",
      image:
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "13",
      name: "Clase E Sedán",
      category: "auto",
      brand: "mercedes-benz",
      subcategory: "clase-e",
      image:
        "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "14",
      name: "EQS",
      category: "auto",
      brand: "mercedes-benz",
      subcategory: "eqs",
      image:
        "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "15",
      name: "Mercedes-AMG A 45 S",
      category: "auto",
      brand: "amg",
      subcategory: "a-35-45",
      image:
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "16",
      name: "Mercedes-AMG GT",
      category: "auto",
      brand: "amg",
      subcategory: "amg-gt",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "17",
      name: "Mercedes-AMG C 63 S E PERFORMANCE",
      category: "auto",
      brand: "amg",
      subcategory: "c-43-63",
      image:
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "3",
      name: "GLA SUV",
      category: "suv",
      brand: "mercedes-benz",
      subcategory: "gla",
      image:
        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "4",
      name: "GLC SUV",
      category: "suv",
      brand: "mercedes-benz",
      subcategory: "glc",
      image:
        "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?q=80&w=2159&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "8",
      name: "GLE SUV",
      category: "suv",
      brand: "mercedes-benz",
      subcategory: "gle",
      image:
        "https://images.unsplash.com/photo-1605218427368-35b019b8a394?q=80&w=1974&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "18",
      name: "Clase G",
      category: "suv",
      brand: "mercedes-benz",
      subcategory: "clase-g",
      image:
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "19",
      name: "EQE SUV",
      category: "suv",
      brand: "mercedes-benz",
      subcategory: "eqe-suv",
      image:
        "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "20",
      name: "Mercedes-AMG GLA 45 S",
      category: "suv",
      brand: "amg",
      subcategory: "gla-35-45",
      image:
        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "21",
      name: "Mercedes-AMG GLC 63 S",
      category: "suv",
      brand: "amg",
      subcategory: "glc-43-63",
      image:
        "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?q=80&w=2159&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "22",
      name: "Mercedes-AMG G 63",
      category: "suv",
      brand: "amg",
      subcategory: "g-63",
      image:
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "5",
      name: "Sprinter Furgón",
      category: "sprinter",
      image:
        "https://images.unsplash.com/photo-1566008885218-90abf9200ddb?q=80&w=2000&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "6",
      name: "Atego 1726",
      category: "trucks",
      subcategory: "atego",
      image:
        "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "7",
      name: "Vito Furgón",
      category: "vans",
      image:
        "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?q=80&w=2072&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "9",
      name: "Actros 2651",
      category: "trucks",
      subcategory: "actros",
      image:
        "https://images.unsplash.com/photo-1586864387634-80150c44ff66?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "10",
      name: "Accelo 815",
      category: "trucks",
      subcategory: "accelo",
      image:
        "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=2072&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "11",
      name: "Arocs 4145",
      category: "trucks",
      subcategory: "arocs",
      image:
        "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2076&auto=format&fit=crop",
      price: "Consultar",
    },
  ];

  const filteredVehicles =
    category === "all"
      ? vehicles
      : vehicles.filter((v) => {
          if (v.category !== category) return false;

          // Filter by brand for auto and suv categories
          if ((category === "auto" || category === "suv") && brand !== "all") {
            if (v.brand !== brand) return false;
          }

          // Filter by subcategory
          if (subcategory !== "all" && v.subcategory) {
            return v.subcategory === subcategory;
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
      {/* Hero Section with Video */}
      <div className="relative h-[85vh] flex items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black z-10"></div>
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
      <div className="bg-black border-b border-white/10 py-6 mb-12">
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
        className={`w-full ${
          (category === "auto" || category === "suv") && brand === "amg"
            ? "bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border-y border-[#5AC3B6]/30 shadow-[0_0_40px_rgba(90,195,182,0.2)]"
            : ""
        }`}
      >
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
                  className={`backdrop-blur-md rounded-lg overflow-hidden transition-all ${
                    brand === "amg"
                      ? "bg-neutral-900/80 border border-[#5AC3B6]/40 shadow-[0_0_30px_rgba(90,195,182,0.15)]"
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
                        className={`flex-1 py-4 lg:py-5 px-3 lg:px-4 text-center font-bold transition-all flex flex-col items-center justify-center gap-2 rounded-md ${
                          brand === "amg"
                            ? "bg-[#5AC3B6]/20 border-2 border-[#5AC3B6] shadow-[0_0_20px_rgba(90,195,182,0.4)]"
                            : "bg-black/50 border-2 border-white/20 hover:border-white/40 hover:bg-black/70"
                        }`}
                      >
                        <div className="relative w-full h-5 lg:h-6 flex items-center justify-center">
                          <Image
                            src="/logosParaSlidebar/logoAmgPhotoroom.png"
                            alt="AMG"
                            width={75}
                            height={26}
                            className="object-contain"
                            style={{
                              filter: "brightness(0) invert(1)",
                            }}
                          />
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Subcategories */}
                  <nav className="p-3 lg:p-4 overflow-x-auto lg:overflow-x-visible lg:max-h-[65vh] lg:overflow-y-auto custom-scrollbar">
                    <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
                      {getSubcategories().map((subcat) => (
                        <Link
                          key={subcat.id}
                          href={`/vehicles?category=${category}&brand=${brand}&subcategory=${subcat.id}`}
                          scroll={false}
                          className={`whitespace-nowrap text-sm font-semibold tracking-wide uppercase transition-all px-5 py-3 border rounded-md text-center lg:text-left ${
                            subcategory === subcat.id
                              ? brand === "amg"
                                ? "text-black bg-[#5AC3B6] border-[#5AC3B6] shadow-md"
                                : "text-black bg-white border-white"
                              : brand === "amg"
                              ? "text-white bg-transparent border-[#5AC3B6]/30 hover:bg-[#5AC3B6]/10 hover:border-[#5AC3B6]/50"
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

            {/* Vehicle Grid */}
            <div className="flex-1">
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
                    href={`/vehicles/${vehicle.id}`} // Assuming individual vehicle pages exist or will exist
                    image={vehicle.image}
                  />
                ))}
              </div>

              {filteredVehicles.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                  No se encontraron vehículos en esta categoría.
                </div>
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
