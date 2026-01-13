"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";
import { useState, useEffect } from "react";
import type { Vehicle } from "@/data/vehicles";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("AUTOS");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryNav = [
    { id: "AUTOS", label: "AUTOS" },
    { id: "SUV", label: "SUV" },
    { id: "VANS", label: "VANS" },
    { id: "SPRINTER", label: "SPRINTER" },
    { id: "TRUCKS", label: "TRUCKS" },
  ];

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles");
        const data = await response.json();
        console.log("Vehicles from API:", data);
        if (data.success) {
          console.log("Vehicles array:", data.vehicles);
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

  // Filtrar vehículos según categoría
  const getVehiclesByCategory = () => {
    const autoCategories = [
      "sedanes",
      "hatchback",
      "coupes",
      "cabrios-roadsters",
    ];

    let filtered: Vehicle[] = [];

    switch (selectedCategory) {
      case "AUTOS":
        filtered = vehicles.filter((v) =>
          autoCategories.includes(v.category.toLowerCase())
        );
        break;
      case "SUV":
        filtered = vehicles.filter(
          (v) =>
            v.category.toLowerCase() === "suv" ||
            v.category.toLowerCase() === "suv-todoterreno"
        );
        break;
      case "VANS":
        filtered = vehicles.filter((v) => v.category.toLowerCase() === "vans");
        break;
      case "SPRINTER":
        filtered = vehicles.filter(
          (v) => v.category.toLowerCase() === "sprinter"
        );
        break;
      case "TRUCKS":
        filtered = vehicles.filter(
          (v) =>
            v.category.toLowerCase().includes("truck") ||
            v.category.toLowerCase() === "accelo" ||
            v.category.toLowerCase() === "atego" ||
            v.category.toLowerCase() === "actros" ||
            v.category.toLowerCase() === "arocs"
        );
        break;
      default:
        filtered = [];
    }

    console.log(`Filtered vehicles for ${selectedCategory}:`, filtered);
    return filtered.slice(0, 4); // Limitar a 4 vehículos
  };

  const currentVehicles = getVehiclesByCategory();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Cinematic Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source
            src="/Mercedes_Benz_Reveal_Video_Generated.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>

        <div className="relative z-10 h-full flex flex-col justify-end pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <p className="text-xs md:text-sm font-bold tracking-[0.3em] text-white/80 mb-4 uppercase">
              Leonardo Guzman
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight mb-6 leading-tight">
              Concesionario Oficial <br /> Mercedes-Benz
            </h1>
            <p className="text-lg md:text-2xl lg:text-3xl text-gray-300 font-light tracking-wide mb-10">
              Automotores Mega SA, Argentina Entre Ríos
            </p>

            <div className="flex items-center gap-8">
              <Link
                href="/vehicles"
                className="group flex items-center gap-4 text-white hover:text-gray-300 transition-colors"
              >
                <span className="text-sm font-bold tracking-widest border-b border-white pb-1 group-hover:border-gray-300 uppercase">
                  CONOCÉ NUESTROS VEHÍCULOS
                </span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Editorial Grid Section */}
      <section className="py-32 bg-black">
        {/* Header - Constrained Width */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12">
          <div className="flex flex-col items-center text-center border-b border-white/10 pb-8">
            <h2 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight mb-6">
              Ingeniería de precisión. <br />
       
            </h2>
            <Link
              href="/vehicles"
              className="text-sm font-bold tracking-widest text-white hover:text-gray-400 transition-colors uppercase"
            >
              VER TODOS LOS MODELOS
            </Link>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12">
          <nav className="flex flex-wrap justify-center gap-4 md:gap-8">
            {categoryNav.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-sm md:text-base font-bold tracking-widest transition-all pb-2 ${
                  selectedCategory === cat.id
                    ? "text-white border-b-2 border-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Categories Grid - Constrained Width for Better Fit */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 mb-24">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <p className="text-gray-500">Cargando vehículos...</p>
            </div>
          ) : currentVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
              {currentVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  title={vehicle.name}
                  category={vehicle.category}
                  href={`/vehicles/${vehicle.id}`}
                  image={`/vehicles/${vehicle.id}/foto-card/card`}
                  fuelType={vehicle.fuel_type}
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-full md:w-1/2">
                <div className="relative aspect-[16/9] bg-zinc-900 border border-white/10 flex items-center justify-center group hover:border-white/30 transition-all">
                  <div className="text-center px-4">
                    <p className="text-xs font-bold tracking-widest text-gray-500 mb-2 uppercase">
                      {selectedCategory}
                    </p>
                    <h3 className="text-xl md:text-2xl font-serif text-gray-400">
                      Muy Pronto
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Minimalist About Section */}
      <section className="py-32 bg-zinc-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <div className="aspect-[3/4] bg-zinc-800 relative overflow-hidden">
              <Image
                src="/foto-home.jpg"
                alt="Leonardo Guzman"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2 className="text-4xl md:text-6xl font-serif mb-12 leading-tight">
              Más que un vehículo, <br /> un estilo de vida.
            </h2>
            <div className="space-y-8 text-lg text-gray-400 leading-relaxed max-w-2xl">
              <p>
                Como Promotor Oficial de Automotores Mega, entiendo que la
                elección de un Mercedes-Benz es una declaración de principios.
                Es optar por la seguridad, la innovación y un legado de
                excelencia que perdura en el tiempo.
              </p>
              <p>
                Mi compromiso es brindarte una experiencia de asesoramiento a la
                altura de la estrella, personalizada y exclusiva.
              </p>
            </div>
            <div className="mt-12">
              <Link
                href="/contact"
                className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-widest hover:bg-gray-200 transition-colors"
              >
                CONTACTAR
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
