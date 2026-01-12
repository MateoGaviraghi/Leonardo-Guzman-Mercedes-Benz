"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import {
  Handshake,
  Shield,
  DollarSign,
  Gavel,
  HandCoins,
  CreditCard,
  User,
  Users,
  Instagram,
  Facebook,
  Phone,
} from "lucide-react";

export default function PlanAhorroPage() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Fullscreen */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Desktop Hero */}
        <div className="hidden md:block absolute inset-0">
          <Image
            src="/hero-plan-ahorro/hero-desktop.jpg"
            alt="Plan de Ahorro Mercedes-Benz"
            fill
            priority
            className="object-cover object-center"
            quality={100}
            unoptimized
            onLoad={() => setHeroLoaded(true)}
          />
        </div>

        {/* Mobile Hero */}
        <Image
          src="/hero-plan-ahorro/hero-mobile.jpg"
          alt="Plan de Ahorro Mercedes-Benz"
          fill
          priority
          className="md:hidden object-cover"
          onLoad={() => setHeroLoaded(true)}
        />

        {/* Overlay oscuro más suave */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 z-10"></div>

        {/* Contenido del Hero */}
        <div className="relative z-20 h-full flex items-end justify-center pb-16 md:pb-20 px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: heroLoaded ? 1 : 0, y: heroLoaded ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-center max-w-5xl"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-6">
              ARMA TU PLAN A LA MEDIDA
            </h1>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: heroLoaded ? 1 : 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
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

      {/* Sección Nosotros */}
      <section className="py-20 md:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-light text-center mb-12"
          >
            Nosotros
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-xl font-light text-gray-300 text-center max-w-5xl mx-auto leading-relaxed"
          >
            Por más de 45 años, con el respaldo y la garantía de Mercedes-Benz
            Argentina y Mercedes-Benz Camiones y Buses Argentina, te ofrecemos
            la posibilidad de acceder a la compra del vehículo que vos y tu
            negocio necesitan.
          </motion.p>
        </div>
      </section>

      {/* Sección Por qué elegirnos */}
      <section className="py-20 md:py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-light text-center mb-16"
          >
            Por qué elegirnos:
          </motion.h2>

          {/* Grid de características principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {/* 45 años */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center group"
            >
              <div className="text-7xl md:text-8xl font-thin text-white mb-6 transition-colors duration-300 group-hover:text-gray-300">
                45
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-4"></div>
              <p className="text-sm md:text-base font-light text-gray-300 leading-relaxed px-4">
                <span className="font-medium text-white">
                  Años en el mercado
                </span>
                <br />y más de 40.000 unidades entregadas.
              </p>
            </motion.div>

            {/* Respaldo */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center group"
            >
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Handshake
                  className="w-16 h-16 text-white/60 group-hover:text-white transition-all duration-300 group-hover:scale-110"
                  strokeWidth={1.5}
                />
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-4"></div>
              <p className="text-sm md:text-base font-light text-gray-300 leading-relaxed px-4">
                Con el{" "}
                <span className="font-medium text-white">
                  respaldo y garantía
                </span>{" "}
                de Mercedes-Benz Argentina y Mercedes-Benz Camiones y Buses
                Argentina.
              </p>
            </motion.div>

            {/* Productos Mercedes-Benz */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center group"
            >
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-16 h-16 transition-all duration-300 group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-white/60 group-hover:text-white transition-colors"
                  />
                  <path
                    d="M12 4 L12 12 M12 12 L19 16 M12 12 L5 16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="text-white/60 group-hover:text-white transition-colors"
                  />
                </svg>
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-4"></div>
              <p className="text-sm md:text-base font-light text-gray-300 leading-relaxed px-4">
                <span className="font-medium text-white">
                  Todos los productos
                </span>{" "}
                Mercedes-Benz, sin intermediarios, sin bancos.
              </p>
            </motion.div>

            {/* Protección */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center group"
            >
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Shield
                  className="w-16 h-16 text-white/60 group-hover:text-white transition-all duration-300 group-hover:scale-110"
                  strokeWidth={1.5}
                />
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-4"></div>
              <p className="text-sm md:text-base font-light text-gray-300 leading-relaxed px-4">
                <span className="font-medium text-white">
                  Protegés tus ahorros
                </span>{" "}
                con nuestros planes.
              </p>
            </motion.div>
          </div>

          {/* Lista de beneficios adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { icon: DollarSign, text: "84 cuotas en pesos y sin interés." },
              {
                icon: Gavel,
                text: "Podés participar en el acto de adjudicación desde la primera cuota.",
              },
              {
                icon: HandCoins,
                text: "Flexibilidad: podés adelantar, licitar o integrar cuotas.",
              },
              {
                icon: CreditCard,
                text: "Tenemos las mejores facilidades para abonar la cuota de tu plan.",
              },
              {
                icon: User,
                text: "Atención personalizada en todas las etapas del plan.",
              },
              {
                icon: Users,
                text: "La titularidad del contrato puede ser transferida a otra persona.",
              },
            ].map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="flex items-start gap-4 bg-zinc-900/30 p-6 border-l border-white/10 hover:border-white/30 transition-all duration-300 group"
                >
                  <IconComponent
                    className="w-10 h-10 text-white/60 group-hover:text-white flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm md:text-base font-light text-gray-300 leading-relaxed group-hover:text-white transition-colors pt-1">
                    {benefit.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 md:py-32 bg-black">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xl md:text-3xl font-light text-gray-300 leading-relaxed mb-10"
          >
            Subite a tu próximo Mercedes-Benz, con
            <br />
            <span className="text-white font-normal">
              Mercedes-Benz Plan de Ahorro.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a
              href="/contact"
              className="inline-block px-10 py-4 bg-white text-black font-medium text-lg tracking-wide hover:bg-gray-200 transition-colors duration-300"
            >
              CONTACTAME
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
