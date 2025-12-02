"use client";

import VehicleCard from "@/components/VehicleCard";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";

function VehiclesContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";

  const vehicles = [
    {
      id: "1",
      name: "Clase A Hatchback",
      category: "auto",
      image:
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "2",
      name: "Clase C Sedán",
      category: "auto",
      image:
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "3",
      name: "GLA SUV",
      category: "suv",
      image:
        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "4",
      name: "GLC SUV",
      category: "suv",
      image:
        "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?q=80&w=2159&auto=format&fit=crop",
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
      name: "Actros",
      category: "trucks",
      image:
        "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=2072&auto=format&fit=crop",
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
      id: "8",
      name: "GLE SUV",
      category: "suv",
      image:
        "https://images.unsplash.com/photo-1605218427368-35b019b8a394?q=80&w=1974&auto=format&fit=crop",
      price: "Consultar",
    },
  ];

  const filteredVehicles =
    category === "all"
      ? vehicles
      : vehicles.filter((v) => v.category === category);

  const categories = [
    { id: "all", name: "Todos" },
    { id: "auto", name: "Autos" },
    { id: "suv", name: "SUVs" },
    { id: "vans", name: "Vans" },
    { id: "sprinter", name: "Sprinter" },
    { id: "trucks", name: "Trucks" },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-12">
      {/* Hero Section with Video */}
      <div className="relative h-[85vh] flex items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black z-10"></div>
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        >
          <source src="/Truck_Hero_Video.mp4" type="video/mp4" />
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
      <div className="sticky top-20 z-30 bg-black/95 backdrop-blur-md border-b border-white/10 py-6 mb-12">
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

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
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
