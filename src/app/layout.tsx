import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MainWrapper } from "@/components/MainWrapper";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import WhatsAppChip from "@/components/WhatsAppChip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serif del sistema (≙ MB Corpo A Title). Mapeada por token
// --font-display en globals.css: si algún día llega la licencia MB Corpo,
// el swap es solo este bloque.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

// URL base del sitio — prioridad:
//   1. NEXT_PUBLIC_SITE_URL (manual, lo ideal en producción)
//   2. NEXT_PUBLIC_VERCEL_URL (auto en Vercel preview/deployments)
//   3. localhost (dev)
// Esto resuelve el warning de `metadataBase` y da URLs absolutas correctas a
// Open Graph / Twitter cards cuando alguien comparte el sitio en WhatsApp,
// Instagram o Twitter/X.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000");

const siteTitle =
  "Leonardo Guzman | Asesor Mercedes-Benz — Automotores Mega, Paraná";
const siteDescription =
  "Leonardo Guzman, promotor de ventas en Automotores Mega, concesionario oficial Mercedes-Benz en Paraná, Entre Ríos. Conocé la gama y consultá por WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mercedes-Benz Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Skip-to-content link — invisible hasta que recibe focus por Tab */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:font-medium focus:tracking-wide focus:rounded"
        >
          Saltar al contenido
        </a>
        <SmoothScrollProvider>
          <Navbar />
          <MainWrapper>{children}</MainWrapper>
          <Footer />
          <WhatsAppChip />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
