"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";

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
    { name: "Autos", href: "/vehicles/auto" },
    { name: "SUVs", href: "/vehicles/suv" },
    { name: "Vans", href: "/vehicles/vans" },
    { name: "Sprinter", href: "/vehicles/sprinter" },
    { name: "Trucks", href: "/vehicles/trucks" },
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
                src="/logo mercedes benz.png"
                alt="Mercedes-Benz Logo"
                fill
                className="object-contain transition-transform duration-500 group-hover:rotate-180"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-none uppercase">
                Leonardo Guzman
              </span>
              <span className="text-[10px] font-medium tracking-[0.2em] text-gray-400 leading-none mt-1 group-hover:text-mb-blue transition-colors uppercase">
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
                href="/about"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white border-b border-white/10 pb-4"
              >
                Sobre Mí
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white"
              >
                Contacto
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
