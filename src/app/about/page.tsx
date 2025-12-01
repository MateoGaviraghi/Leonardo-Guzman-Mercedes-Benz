"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-zinc-900/30 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Image Section - Takes up 5 columns */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative order-2 lg:order-1"
          >
            <div className="aspect-[3/4] relative overflow-hidden bg-zinc-900">
              <Image
                src="/leonardo-portrait.png"
                alt="Leonardo Guzman"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              {/* Decorative border frame */}
              <div className="absolute inset-0 border border-white/10 pointer-events-none"></div>
            </div>
            {/* Offset decorative box */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border border-white/5 -z-10 hidden md:block"></div>
          </motion.div>

          {/* Text Section - Takes up 7 columns */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 lg:pl-12 order-1 lg:order-2"
          >
            <h2 className="text-xs font-bold tracking-[0.3em] text-gray-500 mb-6 uppercase">
              Promotor Oficial Mercedes-Benz
            </h2>
            <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-10 leading-none">
              Pasión por la <br />{" "}
              <span className="text-gray-500">Excelencia.</span>
            </h1>

            <div className="space-y-8 text-lg text-gray-300 font-light leading-relaxed max-w-2xl">
              <p className="text-2xl text-white font-serif">
                &ldquo;Adquirir un Mercedes-Benz no es solo comprar un auto, es
                invertir en un legado.&rdquo;
              </p>
              <p>
                Soy{" "}
                <strong className="text-white font-medium">
                  Leonardo Guzman
                </strong>
                , y mi misión en Automotores Mega es simple: brindarte una
                experiencia a la altura de la estrella que nos representa.
              </p>
              <p>
                Con años de trayectoria en el sector automotriz, entiendo que
                cada cliente es único. Mi enfoque se basa en la escucha activa y
                el asesoramiento personalizado, asegurando que encuentres no
                solo un vehículo, sino el compañero perfecto para tu estilo de
                vida.
              </p>
              <p>
                Desde el primer contacto hasta la entrega de tu unidad y el
                servicio post-venta, estoy aquí para garantizar que tu paso por
                Mercedes-Benz sea impecable.
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-4 text-white hover:text-gray-300 transition-colors"
              >
                <span className="text-sm font-bold tracking-widest border-b border-white pb-1 group-hover:border-gray-300 uppercase">
                  Iniciar una conversación
                </span>
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
