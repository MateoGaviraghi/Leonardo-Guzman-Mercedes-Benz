"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { SITE } from "@/lib/site";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/crm") || pathname.startsWith("/admin")) return null;

  const vehicleCats = [
    { label: "Experiencia", href: "/experiencia" },
    { label: "Autos", href: "/vehicles?category=auto" },
    { label: "SUVs", href: "/vehicles?category=suv" },
    { label: "Vans", href: "/vehicles?category=vans" },
    { label: "Sprinter", href: "/vehicles?category=sprinter" },
    { label: "Trucks", href: "/vehicles?category=trucks" },
  ];

  const servicios = [
    { label: "Financiación", href: "/financiacion" },
    { label: "Plan de Ahorro", href: "/plan-ahorro" },
    { label: "Usados Seleccionados", href: "/usados" },
    { label: "Sobre mí", href: "/about" },
  ];

  return (
    <footer className="bg-mb-black text-white border-t border-white/10 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10 md:py-14">
        {/* Identidad superior */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-10">
          <div className="relative w-12 h-12 shrink-0">
            <Image
              src="/logo-mercedes-benz.png"
              alt="Mercedes-Benz Logo"
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-serif tracking-tight leading-none">
              Leonardo Guzman
            </span>
            <span className="text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase text-gray-400 mt-2">
              Promotor de Ventas · Automotores Mega
            </span>
          </div>
        </div>

        {/* Divisor */}
        <div className="h-px bg-white/10 mb-8 md:mb-10" />

        {/* Tres columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Vehículos */}
          <div>
            <h3 className="text-xs font-medium tracking-[0.25em] uppercase text-gray-500 mb-4">
              Vehículos
            </h3>
            <ul className="space-y-2.5">
              {vehicleCats.map((cat) => (
                <li key={cat.label}>
                  <Link
                    href={cat.href}
                    className="relative text-sm font-light tracking-wide text-gray-300 hover:text-white transition-colors duration-300 group inline-block"
                  >
                    {cat.label}
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-white [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)] transition-[clip-path] duration-500 ease-out"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-xs font-medium tracking-[0.25em] uppercase text-gray-500 mb-4">
              Servicios
            </h3>
            <ul className="space-y-2.5">
              {servicios.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="relative text-sm font-light tracking-wide text-gray-300 hover:text-white transition-colors duration-300 group inline-block"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-white [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)] transition-[clip-path] duration-500 ease-out"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-xs font-medium tracking-[0.25em] uppercase text-gray-500 mb-4">
              Contacto
            </h3>
            <ul className="space-y-2.5 mb-6">
              <li>
                <a
                  href="https://wa.me/5493425037000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative text-sm font-light tracking-wide text-gray-300 hover:text-white transition-colors duration-300 group inline-block"
                >
                  WhatsApp
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-white [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)] transition-[clip-path] duration-500 ease-out"></span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+5493425037000"
                  className="relative text-sm font-light tracking-wide text-gray-300 hover:text-white transition-colors duration-300 group inline-block"
                >
                  +54 9 342 503-7000
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-white [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)] transition-[clip-path] duration-500 ease-out"></span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="relative text-sm font-light tracking-wide text-gray-300 hover:text-white transition-colors duration-300 group inline-block break-all"
                >
                  {SITE.email}
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-white [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)] transition-[clip-path] duration-500 ease-out"></span>
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="relative text-sm font-light tracking-wide text-gray-300 hover:text-white transition-colors duration-300 group inline-block"
                >
                  Formulario de consulta
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-white [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)] transition-[clip-path] duration-500 ease-out"></span>
                </Link>
              </li>
            </ul>

            {/* Redes sociales */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/leoguzmanmbenz/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[44px] min-h-[44px] items-center justify-center text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://www.facebook.com/leo.guzman.667144"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[44px] min-h-[44px] items-center justify-center text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://wa.me/5493425037000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[44px] min-h-[44px] items-center justify-center text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="WhatsApp de Leonardo Guzman"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
              <a
                href="tel:+5493425037000"
                className="flex min-w-[44px] min-h-[44px] items-center justify-center text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Teléfono"
              >
                <Phone className="w-5 h-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        {/* Divisor inferior */}
        <div className="h-px bg-white/10 mt-8 md:mt-10 mb-6" />

        {/* Dirección + copyright */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="text-xs font-light tracking-wide text-gray-500 leading-relaxed">
            <p className="text-gray-400 mb-1">Automotores Mega S.A.</p>
            <p>Acceso Norte República de Entre Ríos 5660</p>
            <p>E3100 Paraná, Entre Ríos · Argentina</p>
          </div>
          <p className="text-[11px] font-light tracking-[0.15em] uppercase text-gray-500">
            © {new Date().getFullYear()} Leonardo Guzman · Promotor de Ventas —
            Automotores Mega S.A., Concesionario Oficial Mercedes-Benz
          </p>
        </div>
      </div>
    </footer>
  );
}
