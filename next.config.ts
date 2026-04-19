import type { NextConfig } from "next";

// Nota: el silenciador del warning de baseline-browser-mapping vive en
// scripts/silence-baseline-warning.cjs y se carga vía NODE_OPTIONS en los
// scripts "dev" y "build" del package.json (necesario porque Turbopack usa
// workers que no heredan el console.warn patchado desde este archivo).

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
