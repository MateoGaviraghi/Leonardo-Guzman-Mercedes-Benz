"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import VehicleCard from "@/components/VehicleCard";

interface Category {
  name: string;
  category: string;
  href: string;
  image: string;
}

interface CategoryCarouselProps {
  categories: Category[];
}

export default function CategoryCarousel({
  categories,
}: CategoryCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(
        carouselRef.current.scrollWidth - carouselRef.current.offsetWidth
      );
    }
  }, [categories]);

  return (
    <div className="w-full overflow-hidden cursor-grab active:cursor-grabbing">
      <motion.div
        ref={carouselRef}
        className="flex gap-8 px-6 md:px-12"
        drag="x"
        dragConstraints={{ right: 0, left: -width }}
        whileTap={{ cursor: "grabbing" }}
      >
        {categories.map((cat) => (
          <motion.div key={cat.name} className="min-w-[300px] md:min-w-[400px]">
            <VehicleCard
              title={cat.name}
              category={cat.category}
              href={cat.href}
              image={cat.image}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
