"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black pointer-events-none"
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
      {children}
    </>
  );
}
