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
      // Wait for logo to fade out (0.6s) then redirect
      setTimeout(() => {
        router.replace(`/vehicles?category=${category}`);
      }, 600);
    };
    redirect();
  }, [params, router]);

  return (
    <>
      {/* Black Background Layer - same as template.tsx */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] bg-black pointer-events-none"
      />

      {/* Logo Layer - same as template.tsx */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
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
