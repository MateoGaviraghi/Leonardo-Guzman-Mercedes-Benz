"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface VehicleCardProps {
  title: string;
  category: string;
  href: string;
  image: string;
}

export default function VehicleCard({
  title,
  category,
  href,
  image,
}: VehicleCardProps) {
  return (
    <Link
      href={href}
      className="group block relative w-full aspect-[4/3] overflow-hidden bg-zinc-900"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${image}')` }}
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
        <p className="text-xs font-bold tracking-widest text-gray-400 mb-1 uppercase">
          {category}
        </p>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-serif text-white group-hover:text-white/90 transition-colors">
            {title}
          </h3>
          <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
            <ArrowRight size={14} className="text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}
