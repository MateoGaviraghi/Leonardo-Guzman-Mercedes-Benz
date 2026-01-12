"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Instagram,
  Facebook,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileVehiclesOpen, setIsMobileVehiclesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const vehicleCategories = [
    { name: "Autos", href: "/vehicles?category=auto" },
    { name: "SUVs", href: "/vehicles?category=suv" },
    { name: "Vans", href: "/vehicles?category=vans" },
    { name: "Sprinter", href: "/vehicles?category=sprinter" },
    { name: "Trucks", href: "/vehicles?category=trucks" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-mb-black/90 backdrop-blur-md py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="w-full px-6 md:px-12 flex items-center justify-between relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group z-10">
            {/* Custom Logo Image */}
            <div className="relative w-12 h-12">
              <Image
                src="/logo-mercedes-benz.png"
                alt="Mercedes-Benz Logo"
                fill
                className="object-contain transition-transform duration-500 group-hover:rotate-180"
                priority
              />
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-none uppercase">
                Leonardo Guzman
              </span>
              <span className="text-xs font-medium tracking-[0.15em] text-gray-400 leading-none mt-1 group-hover:text-mb-blue transition-colors uppercase">
                Automotores Mega
              </span>
            </div>
          </Link>

          {/* Desktop Links - Centered */}
          <div className="hidden lg:flex items-center gap-12 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link
              href="/"
              className="relative text-xs font-bold text-gray-300 hover:text-white transition-colors tracking-[0.15em] uppercase group"
            >
              Inicio
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <div
              className="relative group"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="flex items-center gap-2 text-xs font-bold text-gray-300 group-hover:text-white transition-colors tracking-[0.15em] uppercase py-4">
                VEHÍCULOS 0KM
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-56"
                  >
                    <div className="bg-black/90 backdrop-blur-2xl border border-white/10 p-1 shadow-2xl">
                      {vehicleCategories.map((cat) => (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          className="block px-6 py-3 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all tracking-widest uppercase border-l-2 border-transparent hover:border-white"
                        >
                          {cat.name}
                        </Link>
                      ))}
                      <div className="h-px bg-white/10 my-1 mx-2"></div>
                      <Link
                        href="/vehicles"
                        className="block px-6 py-3 text-xs font-bold text-white hover:bg-white/10 transition-all tracking-widest uppercase text-center"
                      >
                        Ver Todos
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/usados"
              className="relative text-xs font-bold text-gray-300 hover:text-white transition-colors tracking-[0.15em] uppercase group"
            >
              Usados
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              href="/financiacion"
              className="relative text-xs font-bold text-gray-300 hover:text-white transition-colors tracking-[0.15em] uppercase group"
            >
              Financiación
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              href="/plan-ahorro"
              className="relative text-xs font-bold text-gray-300 hover:text-white transition-colors tracking-[0.15em] uppercase group whitespace-nowrap"
            >
              Plan de Ahorro
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              href="/about"
              className="relative text-xs font-bold text-gray-300 hover:text-white transition-colors tracking-[0.15em] uppercase group"
            >
              Sobre Mí
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/contact"
              className="relative text-xs font-bold text-gray-300 hover:text-white transition-colors tracking-[0.15em] uppercase group"
            >
              Contacto
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Social Media Icons - Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-5 z-10">
            <a
              href="https://www.instagram.com/leoguzmanmbenz/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity duration-300"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-white" strokeWidth={1.5} />
            </a>
            <a
              href="https://www.facebook.com/leo.guzman.667144"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity duration-300"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-white" strokeWidth={1.5} />
            </a>
            <a
              href="https://wa.me/5493425037000"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity duration-300"
              aria-label="WhatsApp"
            >
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
            <a
              href="tel:+5493425037000"
              className="hover:opacity-70 transition-opacity duration-300"
              aria-label="Teléfono"
            >
              <Phone className="w-5 h-5 text-white" strokeWidth={1.5} />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white hover:text-mb-blue transition-colors z-10"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black pt-24 px-6 lg:hidden"
          >
            <div className="flex flex-col space-y-6">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white border-b border-white/10 pb-4"
              >
                Inicio
              </Link>

              <button
                onClick={() => setIsMobileVehiclesOpen(!isMobileVehiclesOpen)}
                className="flex items-center justify-between w-full text-xl font-bold text-white border-b border-white/10 pb-4"
              >
                VEHÍCULOS 0KM
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${
                    isMobileVehiclesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {isMobileVehiclesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col space-y-4 py-4 pl-4 border-b border-white/10">
                      {vehicleCategories.map((cat) => (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          onClick={() => setIsOpen(false)}
                          className="block text-lg text-gray-400 hover:text-white"
                        >
                          {cat.name}
                        </Link>
                      ))}
                      <Link
                        href="/vehicles"
                        onClick={() => setIsOpen(false)}
                        className="block text-lg font-bold text-white pt-2"
                      >
                        VER TODOS
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                href="/usados"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white border-b border-white/10 pb-4"
              >
                Usados
              </Link>

              <Link
                href="/financiacion"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white border-b border-white/10 pb-4"
              >
                Financiación
              </Link>

              <Link
                href="/plan-ahorro"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white border-b border-white/10 pb-4"
              >
                Plan de Ahorro
              </Link>

              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white border-b border-white/10 pb-4"
              >
                Sobre Mí
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white border-b border-white/10 pb-4"
              >
                Contacto
              </Link>

              {/* Social Media Icons - Mobile */}
              <div className="flex items-center gap-6 pt-8 justify-center">
                <a
                  href="https://www.instagram.com/leoguzmanmbenz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-7 h-7 text-white" strokeWidth={1.5} />
                </a>
                <a
                  href="https://www.facebook.com/leo.guzman.667144"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-7 h-7 text-white" strokeWidth={1.5} />
                </a>
                <a
                  href="https://wa.me/5493425037000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity duration-300"
                  aria-label="WhatsApp"
                >
                  <svg
                    className="w-7 h-7 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
                <a
                  href="tel:+5493425037000"
                  className="hover:opacity-70 transition-opacity duration-300"
                  aria-label="Teléfono"
                >
                  <Phone className="w-7 h-7 text-white" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
