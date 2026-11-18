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
    // true: el plan gratis de Vercel llegó al límite de optimizaciones
    // (402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED, 2026-11-18); las fotos se
    // sirven tal cual están en public/.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    // Next 16 solo acepta las calidades listadas acá (por defecto [75]); una
    // calidad fuera de la lista da 400 en /_next/image. 20 = fondo desenfocado
    // del carrusel (ShowroomCarousel), 100 = plan-ahorro.
    qualities: [20, 75, 100],
  },
  turbopack: {
    root: __dirname,
  },
  // /experiencia se quitó del sitio (2026-11-11, Mateo) y el catálogo /vehicles también
  // (2026-11-17, Mateo: «eliminar la página de vehículos»): los links viejos van a la gama
  // del inicio, abierta en la pestaña de esa categoría. Las fichas /vehicles/<id> siguen.
  async redirects() {
    const q = (key: string, value: string) => ({ type: "query" as const, key, value });
    return [
      { source: "/experiencia/:path*", destination: "/#gama", permanent: true },
      { source: "/vehicles", has: [q("category", "auto"), q("brand", "amg")], destination: "/#gama-amg", permanent: true },
      { source: "/vehicles", has: [q("category", "auto")], destination: "/#gama-autos", permanent: true },
      { source: "/vehicles", has: [q("category", "suv")], destination: "/#gama-suv", permanent: true },
      { source: "/vehicles", has: [q("category", "vans")], destination: "/#gama-vans", permanent: true },
      { source: "/vehicles", has: [q("category", "sprinter")], destination: "/#gama-sprinter", permanent: true },
      { source: "/vehicles", has: [q("category", "trucks")], destination: "/#gama-camiones", permanent: true },
      { source: "/vehicles", destination: "/#gama", permanent: true },
    ];
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
