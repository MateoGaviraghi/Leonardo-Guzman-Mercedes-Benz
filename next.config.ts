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
    // Next 16 solo acepta las calidades listadas acá (por defecto [75]); una
    // calidad fuera de la lista da 400 en /_next/image. 20 = fondo desenfocado
    // del carrusel (ShowroomCarousel), 100 = plan-ahorro.
    qualities: [20, 75, 100],
  },
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
