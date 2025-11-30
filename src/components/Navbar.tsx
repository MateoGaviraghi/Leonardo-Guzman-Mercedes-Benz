"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    { name: "Usados", href: "/vehicles?category=usados" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 ${
          scrolled
            ? "bg-mb-black/90 backdrop-blur-md py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
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

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              href="/"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors tracking-wide"
            >
              Inicio
            </Link>

            {/* Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-gray-300 group-hover:text-white transition-colors tracking-wide py-2">
                Vehículos{" "}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-64"
                  >
                    <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-lg p-2 shadow-2xl">
                      {vehicleCategories.map((cat) => (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          className="block px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                      <div className="h-px bg-white/10 my-2 mx-2"></div>
                      <Link
                        href="/vehicles"
                        className="block px-4 py-3 text-sm font-bold text-mb-blue hover:text-white hover:bg-mb-blue/10 rounded-md transition-colors text-center"
                      >
                        Ver Todos
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/about"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors tracking-wide"
            >
              Sobre Mí
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors tracking-wide"
            >
              Contacto
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-mb-blue transition-colors"
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
            className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col space-y-6">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white border-b border-white/10 pb-4"
              >
                Inicio
              </Link>

              <div className="space-y-4 border-b border-white/10 pb-4">
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">
                  Vehículos
                </p>
                {vehicleCategories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-xl text-gray-300 hover:text-white"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

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
