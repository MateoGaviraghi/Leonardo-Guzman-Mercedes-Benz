"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";

export default function Home() {
  const categories = [
    {
      name: "Clase A",
      category: "Autos",
      href: "/vehicles?category=auto",
      image:
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop", // Mercedes A-Class / Hatchback
    },
    {
      name: "GLC SUV",
      category: "SUVs",
      href: "/vehicles?category=suv",
      image:
        "https://images.unsplash.com/photo-1553440637-d22ed8a0256b?q=80&w=2070&auto=format&fit=crop", // Mercedes GLC / SUV
    },
    {
      name: "Vito",
      category: "Vans",
      href: "/vehicles?category=vans",
      image:
        "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?q=80&w=2072&auto=format&fit=crop", // Mercedes Vito / V-Class
    },
    {
      name: "Sprinter",
      category: "Sprinter",
      href: "/vehicles?category=sprinter",
      image:
        "https://images.unsplash.com/photo-1618589087798-29a5806e3c3f?q=80&w=2070&auto=format&fit=crop", // Mercedes Sprinter
    },
    {
      name: "Actros",
      category: "Trucks",
      href: "/vehicles?category=trucks",
      image:
        "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=2072&auto=format&fit=crop", // Mercedes Actros / Truck
    },
  ];

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
          poster="/hero-poster.jpg" // You might need to add this image or use a color
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="/video-home-final.mp4" type="video/mp4" />
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
          <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8">
            <h2 className="text-4xl md:text-5xl font-serif tracking-tight max-w-xl leading-tight">
              Ingeniería de precisión. <br />
              <span className="text-gray-500">Diseño atemporal.</span>
            </h2>
            <Link
              href="/vehicles"
              className="hidden md:block text-sm font-bold tracking-widest text-white hover:text-gray-400 transition-colors mt-8 md:mt-0"
            >
              VER TODOS LOS MODELOS
            </Link>
          </div>
        </div>

        {/* Categories Grid - Constrained Width for Better Fit */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-24">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)]"
              >
                <VehicleCard
                  title={cat.name}
                  category={cat.category}
                  href={cat.href}
                  image={cat.image}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Link - Constrained Width */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="md:hidden text-center">
            <Link
              href="/vehicles"
              className="text-sm font-bold tracking-widest text-white border-b border-white pb-1"
            >
              VER TODOS LOS MODELOS
            </Link>
          </div>
        </div>
      </section>

      {/* Minimalist About Section */}
      <section className="py-32 bg-zinc-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <div className="aspect-[3/4] bg-zinc-800 relative overflow-hidden">
              <Image
                src="/leonardo-portrait.png"
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
