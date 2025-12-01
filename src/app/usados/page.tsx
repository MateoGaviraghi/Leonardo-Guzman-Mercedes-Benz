"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function UsadosPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicle: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, email, vehicle, message } = formData;

    const whatsappMessage = `Hola Leonardo, estoy interesado en un *Usado Seleccionado*.%0A%0A*Mis datos:*%0A👤 Nombre: ${name}%0A📞 Teléfono: ${phone}%0A📧 Email: ${email}%0A🚗 Vehículo de interés: ${vehicle}%0A%0A*Consulta:*%0A${message}`;

    const phoneNumber = "5493425037000";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Hero Section */}
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
          <source src="/SUV_Reveal_Video_Generation.mp4" type="video/mp4" />
        </video>

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-8xl font-serif font-bold tracking-tighter mb-6"
          >
            Selección Premium
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 font-light tracking-wide"
          >
            Calidad certificada. Historia comprobada.
          </motion.p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Story / Certification Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xs font-bold tracking-[0.3em] text-mb-blue mb-8 uppercase">
              Confianza y Trayectoria
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-10 leading-tight">
              Más que un vehículo,
              <br />
              una relación de confianza.
            </h3>

            <div className="space-y-8 text-gray-400 text-lg font-light leading-relaxed">
              <p>
                En Automotores Mega, entendemos que comprar un usado es una
                decisión importante. Por eso, cada unidad es seleccionada con el
                compromiso de ofrecerte solo lo mejor. No se trata solo de
                vender autos, sino de construir relaciones duraderas basadas en
                la honestidad.
              </p>
              <p>
                Con el respaldo de Leonardo Guzman y una trayectoria que nos
                avala, te brindamos la tranquilidad que necesitas. Conocemos lo
                que vendemos y te lo contamos con total transparencia, para que
                tu única preocupación sea disfrutar de tu próximo Mercedes-Benz.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="text-white w-6 h-6 mt-1" />
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-2">
                    Atención Personalizada
                  </h4>
                  <p className="text-sm text-gray-500">
                    Asesoramiento experto para encontrar lo que buscas.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="text-white w-6 h-6 mt-1" />
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-2">
                    Transparencia Total
                  </h4>
                  <p className="text-sm text-gray-500">
                    Claridad y honestidad en cada operación.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Inquiry Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-zinc-900/50 border border-white/10 p-8 md:p-12"
          >
            <h3 className="text-2xl font-serif mb-8">
              Encuentra tu próximo vehículo
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-xs font-bold tracking-widest uppercase text-gray-500"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-xs font-bold tracking-widest uppercase text-gray-500"
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="Tu celular"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-xs font-bold tracking-widest uppercase text-gray-500"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="vehicle"
                  className="text-xs font-bold tracking-widest uppercase text-gray-500"
                >
                  Vehículo de Interés
                </label>
                <input
                  type="text"
                  id="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="Ej: Clase C 2020, GLC..."
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-xs font-bold tracking-widest uppercase text-gray-500"
                >
                  Consulta
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"
                  placeholder="¿Qué estás buscando específicamente?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-bold py-4 tracking-[0.2em] text-sm hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-3 uppercase mt-4"
              >
                Consultar Disponibilidad <Send size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
