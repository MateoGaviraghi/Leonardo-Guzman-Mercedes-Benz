"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HomeHero() {
  return (
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
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight mb-4 leading-tight">
            Automotores Mega SA
          </h1>
          <p className="text-xl md:text-3xl lg:text-4xl text-white font-light tracking-wide mb-2">
            Concesionario Oficial Mercedes-Benz
          </p>
          <p className="text-base md:text-lg lg:text-xl text-gray-300 font-light tracking-wide mb-10">
            Argentina, Entre Ríos
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
  );
}
