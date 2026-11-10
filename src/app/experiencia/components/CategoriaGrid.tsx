"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import VehicleCard from "@/components/VehicleCard";

import { pegar } from "@/lib/texto";
const CATEGORIES = [
  {
    id: "auto",
    name: "Autos",
    href: "/vehicles?category=auto",
    description: "Sedanes, hatchbacks, coupés y cabriolets.",
    featuredName: "Clase S",
    image: "/vehicles/7eba156c-0097-4ee7-acfc-7a2b89d92598/foto-card/card.jpg",
  },
  {
    id: "suv",
    name: "SUVs",
    href: "/vehicles?category=suv",
    description: "Crossovers y todo terreno.",
    featuredName: "EQA",
    image: "/vehicles/fe9a948b-abf8-4415-977e-944a4d24ae62/foto-card/card.jpg",
  },
  {
    id: "vans",
    name: "Vans",
    href: "/vehicles?category=vans",
    description: "Vito Tourer y Vito Mixto.",
    featuredName: "Vito Tourer",
    image: "/vehicles/vito-tourer/foto-card/card.avif",
  },
  {
    id: "sprinter",
    name: "Sprinter",
    href: "/vehicles?category=sprinter",
    description: "Furgón, Combi, Mixto y Chasis.",
    featuredName: "Sprinter Furgón",
    image: "/vehicles/sprinter-furgon/foto-card/card.webp",
  },
  {
    id: "trucks",
    name: "Trucks",
    href: "/vehicles?category=trucks",
    description: "Accelo, Atego, Actros y Arocs.",
    featuredName: "Actros",
    image: "/vehicles/ee10dd62-79cb-470b-9c6d-55dfa6314108/foto-card/card.jpg",
  },
];

/**
 * Grilla final de 5 categorías — anatomía VehicleCard exacta (WU-2):
 * reutiliza el componente compartido (border white/8→20, overlay gradiente,
 * eyebrow, h3 display, flecha en caja cuadrada). Reveal `.vcard-reveal`
 * vía ScrollTrigger.batch, solo transform/opacity.
 */
export default function CategoriaGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = window as Window & { __gsapScrollTriggerRegistered?: boolean };
    if (!w.__gsapScrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      w.__gsapScrollTriggerRegistered = true;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(".vcard-reveal", { opacity: 1, scale: 1 });
        return;
      }
      ScrollTrigger.batch(".vcard-reveal", {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, scale: 0.96 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.55,
              ease: "power3.out",
              stagger: 0.06,
              force3D: true,
              clearProps: "transform",
            },
          ),
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="min-h-screen bg-surface-0 px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-16 text-center md:mb-20">
          <p className="text-eyebrow mb-4 font-mono uppercase tracking-[0.14em] text-silver-500">
            Elegí tu categoría
          </p>
          <h2 className="text-display-2 mx-auto font-display font-medium text-white">
            {pegar("Una gama para cada propósito.")}
          </h2>
        </div>

        <div ref={gridRef} className="flex flex-wrap justify-center gap-4 md:gap-5">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="vcard-reveal w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
            >
              <VehicleCard title={cat.name} category={cat.featuredName} href={cat.href} image={cat.image} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
