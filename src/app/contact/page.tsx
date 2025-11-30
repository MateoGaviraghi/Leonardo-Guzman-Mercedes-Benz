"use client";

import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Info */}
          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-12 leading-none">
              CONTACTO.
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-md">
              ¿Estás interesado en un modelo específico o necesitas
              asesoramiento? Escríbeme y te responderé a la brevedad.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <MapPin className="w-6 h-6 text-mb-blue mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-1">Ubicación</h3>
                  <p className="text-gray-400">Automotores Mega S.A.</p>
                  <p className="text-gray-400">
                    Av. Example 1234, Buenos Aires
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Phone className="w-6 h-6 text-mb-blue mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    Teléfono / WhatsApp
                  </h3>
                  <p className="text-gray-400">+54 9 11 1234-5678</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Mail className="w-6 h-6 text-mb-blue mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-1">Email</h3>
                  <p className="text-gray-400">leonardo.guzman@example.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-zinc-900/50 p-8 md:p-12">
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-white focus:outline-none focus:border-mb-blue transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
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
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-white focus:outline-none focus:border-mb-blue transition-colors"
                    placeholder="Tu teléfono"
                  />
                </div>
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
                  className="w-full bg-transparent border-b border-gray-700 py-2 text-white focus:outline-none focus:border-mb-blue transition-colors"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-xs font-bold tracking-widest uppercase text-gray-500"
                >
                  Mensaje
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full bg-transparent border-b border-gray-700 py-2 text-white focus:outline-none focus:border-mb-blue transition-colors resize-none"
                  placeholder="¿En qué puedo ayudarte?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-bold py-4 tracking-widest text-sm hover:bg-mb-blue hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
              >
                ENVIAR MENSAJE <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
