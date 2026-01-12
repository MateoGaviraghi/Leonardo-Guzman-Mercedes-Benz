"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Instagram,
  Facebook,
  MessageCircle,
  Send,
} from "lucide-react";
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
                    Teléfono
                  </h3>
                  <a
                    href="tel:+5493425037000"
                    className="text-white text-lg hover:text-gray-300 transition-colors"
                  >
                    +54 9 342 503-7000
                  </a>
                </div>
              </div>

              {/* Social Media Icons */}
              <div>
                <h3 className="text-sm font-bold tracking-widest uppercase mb-4 text-gray-500">
                  Redes Sociales
                </h3>
                <div className="flex items-center gap-5">
                  <a
                    href="https://www.instagram.com/leoguzmanmbenz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition-opacity duration-300"
                    aria-label="Instagram"
                  >
                    <Instagram
                      className="w-6 h-6 text-white"
                      strokeWidth={1.5}
                    />
                  </a>
                  <a
                    href="https://www.facebook.com/leo.guzman.667144"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition-opacity duration-300"
                    aria-label="Facebook"
                  >
                    <Facebook
                      className="w-6 h-6 text-white"
                      strokeWidth={1.5}
                    />
                  </a>
                  <a
                    href="https://wa.me/5493425037000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition-opacity duration-300"
                    aria-label="WhatsApp"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
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
