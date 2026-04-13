"use client";

import { useState } from "react";
import Link from "next/link";
import VehicleCard from "@/components/VehicleCard";
import type { Vehicle } from "@/data/vehicles";

const categoryNav = [
  { id: "AUTOS", label: "AUTOS" },
  { id: "SUV", label: "SUV" },
  { id: "VANS", label: "VANS" },
  { id: "SPRINTER", label: "SPRINTER" },
  { id: "TRUCKS", label: "TRUCKS" },
];

function getVehiclesByCategory(
  vehicles: Vehicle[],
  selectedCategory: string
): Vehicle[] {
  const autoCategories = [
    "sedanes",
    "hatchback",
    "coupes",
    "cabrios-roadsters",
  ];

  let filtered: Vehicle[] = [];

  switch (selectedCategory) {
    case "AUTOS":
      filtered = vehicles.filter((v) =>
        autoCategories.includes(v.category.toLowerCase())
      );
      break;
    case "SUV":
      filtered = vehicles.filter(
        (v) =>
          v.category.toLowerCase() === "suv" ||
          v.category.toLowerCase() === "suv-todoterreno"
      );
      break;
    case "VANS":
      filtered = vehicles.filter((v) => v.category.toLowerCase() === "vans");
      break;
    case "SPRINTER":
      filtered = vehicles.filter(
        (v) => v.category.toLowerCase() === "sprinter"
      );
      break;
    case "TRUCKS":
      filtered = vehicles.filter(
        (v) =>
          v.category.toLowerCase().includes("truck") ||
          v.category.toLowerCase() === "accelo" ||
          v.category.toLowerCase() === "atego" ||
          v.category.toLowerCase() === "actros" ||
          v.category.toLowerCase() === "arocs"
      );
      break;
    default:
      filtered = [];
  }

  return filtered.slice(0, 4);
}

export default function HomeCategorySection({
  vehicles,
}: {
  vehicles: Vehicle[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("AUTOS");
  const currentVehicles = getVehiclesByCategory(vehicles, selectedCategory);

  return (
    <section className="py-32 bg-black">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12">
        <div className="flex flex-col items-center text-center border-b border-white/10 pb-8">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight mb-6">
            Ingeniería de precisión. <br />
          </h2>
          <Link
            href="/vehicles"
            className="text-sm font-bold tracking-widest text-white hover:text-gray-400 transition-colors uppercase"
          >
            VER TODOS LOS MODELOS
          </Link>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12">
        <nav className="flex flex-wrap justify-center gap-4 md:gap-8">
          {categoryNav.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-sm md:text-base font-bold tracking-widest transition-all pb-2 ${
                selectedCategory === cat.id
                  ? "text-white border-b-2 border-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Categories Grid */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 mb-24">
        {currentVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
            {currentVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                title={vehicle.name}
                category={vehicle.category}
                href={`/vehicles/${vehicle.id}`}
                image={`/vehicles/${vehicle.id}/foto-card/card`}
                fuelType={vehicle.fuel_type}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-full md:w-1/2">
              <div className="relative aspect-[16/9] bg-zinc-900 border border-white/10 flex items-center justify-center group hover:border-white/30 transition-all">
                <div className="text-center px-4">
                  <p className="text-xs font-bold tracking-widest text-gray-500 mb-2 uppercase">
                    {selectedCategory}
                  </p>
                  <h3 className="text-xl md:text-2xl font-serif text-gray-400">
                    Muy Pronto
                  </h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
