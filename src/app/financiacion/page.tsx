"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function FinanciacionPage() {
  const financingOptions = [
    {
      title: "Financiación.",
      description:
        "Mercedes-Benz Financiera ofrece en la Argentina una amplia gama de opciones financieras especialmente diseñadas para que puedas acceder de la forma más ágil y transparente a los vehículos de la marca Mercedes-Benz.",
      benefits: [
        "Tasa Fija en pesos",
        "Financiación de vehículos 0Km y Usados",
        "Planes a la medida de las necesidades de nuestros clientes",
      ],
      image: "/financiacion/imageFinanciacion.jpg",
    },
    {
      title: "Leasing.",
      description:
        "El Leasing es una alternativa para la adquisición o renovación de tu vehículo Mercedes-Benz, mediante la cual se otorga el uso de la unidad por un plazo determinado, con la opción a comprar o renovar la unidad.",
      benefits: [
        "Financiación 100% de la unidad",
        "No estar alcanzado por el impuesto a los activos",
        "Diferimiento del IVA",
        "Amortización acelerada del bien",
        "Servicios de Administración",
      ],
      image: "/financiacion/leasing.jpg",
    },
    {
      title: "Flotas.",
      description:
        '"Desarrollar alternativas de financiación para flotas es uno de nuestros mayores desafíos." La posibilidad de acceder a su flota con cualquiera de nuestros productos financieros está hoy al alcance de su mano. Las coberturas de seguros, mantenimientos preventivos y correctivos son elementos diferenciales a la hora de elegir un plan de financiación. Además, todo el asesoramiento técnico y financiero de parte del grupo líder del sector automotriz como así también líder en el mundo en la administración de flotas. No dude en contactarse para obtener información adicional.',
      benefits: [],
      image: "/financiacion/flotas.jpg",
    },
    {
      title: "Seguros.",
      description:
        "Tu mejor inversión exige la mejor protección. Por eso, Mercedes-Benz Financiera junto a Aon Risk Services Argentina, broker líder en administración de riesgos y seguros, pone a tu alcance aseguradoras de primer nivel. Porque nuestro compromiso con la seguridad va más allá del vehículo. Podrás elegir la cobertura a la medida de tus necesidades, con las Compañías de Seguro de primera línea.",
      benefits: [],
      image: "/financiacion/seguros.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Hero Section with Image */}
      <section className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-financiacion/financiacion.png"
            alt="Mercedes-Benz Financiera"
            fill
            className="object-cover"
            priority
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative h-full max-w-[1400px] mx-auto px-6 md:px-12 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-bold tracking-[0.3em] text-gray-400 mb-4 uppercase">
              Financiación
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight mb-6 leading-tight">
              Mercedes-Benz Financiera.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
              Accedé a vehículos Mercedes-Benz de la manera más simple.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-white text-black px-8 py-4 font-semibold text-sm tracking-wider hover:bg-gray-200 transition-all duration-300 flex items-center gap-3"
            >
              Realizar consulta
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-zinc-900/30 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-serif tracking-tight mb-6">
              La financiación justa para <br className="hidden md:block" />
              todos los modelos.
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
              En Mercedes-Benz Financiera desarrollamos productos financieros
              con una amplia gama de opciones que permiten acceder a vehículos
              Mercedes-Benz de la manera más simple, transparente y rápida.
            </p>
          </motion.div>

          {/* Financing Options Grid */}
          <div className="space-y-32">
            {financingOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Image */}
                <div
                  className={`lg:col-span-6 relative ${
                    index % 2 === 1 ? "lg:col-start-7" : ""
                  }`}
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-zinc-900 group">
                    <Image
                      src={option.image}
                      alt={option.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Border overlay */}
                    <div className="absolute inset-0 border border-white/10 pointer-events-none"></div>
                  </div>
                  {/* Decorative frame */}
                  <div className="absolute -bottom-6 -right-6 w-full h-full border border-white/5 -z-10 hidden md:block"></div>
                </div>

                {/* Content */}
                <div
                  className={`lg:col-span-6 ${
                    index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""
                  }`}
                >
                  <h3 className="text-3xl md:text-5xl font-serif tracking-tight mb-6">
                    {option.title}
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    {option.description}
                  </p>

                  {/* Benefits List */}
                  {option.benefits.length > 0 && (
                    <ul className="space-y-4">
                      {option.benefits.map((benefit, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-gray-300"
                        >
                          <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-black/50 -z-10"></div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-serif tracking-tight mb-6">
              ¿Listo para tu próximo <br className="hidden md:block" />
              Mercedes-Benz?
            </h2>
            <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Estoy listo para ayudarte a encontrar la mejor opción de
              financiación que se adapte a tus necesidades. Confía en mi
              experiencia.
            </p>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-white text-black px-10 py-5 font-semibold text-sm tracking-wider hover:bg-gray-200 transition-all duration-300 inline-flex items-center gap-3"
              >
                Contactame
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
