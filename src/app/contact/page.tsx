"use client";

import { useState } from "react";
import { MapPin, Phone, Instagram, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, email, message } = formData;

    // Format the message for WhatsApp
    const whatsappMessage = `Hola Leonardo, mi nombre es *${name}*.%0A%0A*Mis datos de contacto:*%0A📞 Teléfono: ${phone}%0A📧 Email: ${email}%0A%0A*Mensaje:*%0A${message}`;

    // Replace with the actual phone number (e.g., 549xxxxxxxxxx)
    const phoneNumber = "5493425037000";

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-12 leading-none">
              Hablemos.
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-md font-light leading-relaxed">
              ¿Estás interesado en un modelo específico o necesitas
              asesoramiento experto? Escríbeme directamente y comencemos tu
              viaje hacia la excelencia.
            </p>

            <div className="space-y-10 hidden lg:block">
              <div className="flex items-start gap-6 group">
                <div className="p-4 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-500">
                    Ubicación
                  </h3>
                  <p className="text-white text-lg">Automotores Mega S.A.</p>
                  <p className="text-gray-400 font-light">
                    Acceso Norte República de Entre Ríos 5660
                    <br />
                    E3100 Paraná, Entre Ríos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="p-4 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-500">
                    WhatsApp
                  </h3>
                  <p className="text-white text-lg">+54 9 342 503-7000</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="p-4 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-500">
                    Instagram
                  </h3>
                  <a
                    href="https://www.instagram.com/leoguzmanmbenz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-lg hover:text-mb-blue transition-colors"
                  >
                    @leoguzmanmbenz
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-sm shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <label
                    htmlFor="name"
                    className="text-xs font-bold tracking-widest uppercase text-gray-500 group-focus-within:text-white transition-colors"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors placeholder-white/20"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="space-y-2 group">
                  <label
                    htmlFor="phone"
                    className="text-xs font-bold tracking-widest uppercase text-gray-500 group-focus-within:text-white transition-colors"
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors placeholder-white/20"
                    placeholder="Tu número de celular"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label
                  htmlFor="email"
                  className="text-xs font-bold tracking-widest uppercase text-gray-500 group-focus-within:text-white transition-colors"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors placeholder-white/20"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-2 group">
                <label
                  htmlFor="message"
                  className="text-xs font-bold tracking-widest uppercase text-gray-500 group-focus-within:text-white transition-colors"
                >
                  Mensaje
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none placeholder-white/20"
                  placeholder="Hola Leonardo, estoy interesado en..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-bold py-5 tracking-[0.2em] text-sm hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-3 uppercase group"
              >
                Enviar Consulta WhatsApp{" "}
                <Send
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
