"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function VehicleCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const { category } = await params;
      // Wait for full transition (logo fade + background fade)
      setTimeout(() => {
        router.replace(`/vehicles?category=${category}`);
      }, 1400);
    };
    redirect();
  }, [params, router]);

  return (
    <>
      {/* Black Background Layer - fades out slowly */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 0.6, duration: 1.0, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] bg-black pointer-events-none"
      />

      {/* Logo Layer - fades out smoothly */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
      >
        <div className="relative w-32 h-32">
          <Image
            src="/logo mercedes benz.png"
            alt="Mercedes-Benz Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </motion.div>

      <div className="min-h-screen bg-black" />
    </>
  );
}
