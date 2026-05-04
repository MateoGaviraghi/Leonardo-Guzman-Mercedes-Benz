"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Phone } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/crm") || pathname.startsWith("/admin")) return null;

  const vehicleCats = [
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
    { label: "Sobre Mí", href: "/about" },
  ];

  return (
    <footer className="bg-surface-1 text-white border-t border-white/5 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20 md:py-28">
        {/* Identidad superior */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mb-16 md:mb-20">
          <div className="relative w-16 h-16 shrink-0">
            <Image
              src="/logo-mercedes-benz.png"
              alt="Mercedes-Benz Logo"
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-serif tracking-tight leading-none">
              Leonardo Guzman
            </span>
            <span className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-gray-400 mt-3">
              Promotor Oficial · Automotores Mega
            </span>
          </div>
        </div>

        {/* Divisor */}
        <div className="h-px bg-white/10 mb-16 md:mb-20" />

        {/* Tres columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Vehículos */}
          <div>
            <h3 className="text-xs font-medium tracking-[0.25em] uppercase text-gray-500 mb-6">
              Vehículos
            </h3>
            <ul className="space-y-3.5">
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
            <h3 className="text-xs font-medium tracking-[0.25em] uppercase text-gray-500 mb-6">
              Servicios
            </h3>
            <ul className="space-y-3.5">
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
            <h3 className="text-xs font-medium tracking-[0.25em] uppercase text-gray-500 mb-6">
              Contacto
            </h3>
            <ul className="space-y-3.5 mb-8">
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
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://www.facebook.com/leo.guzman.667144"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://wa.me/5493425037000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
              <a
                href="tel:+5493425037000"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Teléfono"
              >
                <Phone className="w-5 h-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        {/* Divisor inferior */}
        <div className="h-px bg-white/10 mt-16 md:mt-20 mb-10" />

        {/* Dirección + copyright */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="text-xs font-light tracking-wide text-gray-500 leading-relaxed">
            <p className="text-gray-400 mb-1">Automotores Mega S.A.</p>
            <p>Acceso Norte República de Entre Ríos 5660</p>
            <p>E3100 Paraná, Entre Ríos · Argentina</p>
          </div>
          <p className="text-[11px] font-light tracking-[0.15em] uppercase text-gray-600">
            © {new Date().getFullYear()} Leonardo Guzman · Concesionario Oficial
            Mercedes-Benz
          </p>
        </div>
      </div>
    </footer>
  );
}
