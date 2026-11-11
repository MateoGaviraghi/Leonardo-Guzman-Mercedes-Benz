import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif, Noto_Sans, Noto_Sans_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MainWrapper } from "@/components/MainWrapper";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import WhatsAppChip from "@/components/WhatsAppChip";
import "./globals.css";

// Tipografías (2026-11-10, Mateo: «usar la más similares posible o idénticas» a las
// de Mercedes-Benz). Las MB Corpo tienen licencia propia de la marca (OQ-016); estas
// son las libres más parecidas, comparadas con texto real de mercedes-benz.com.ar:
//   títulos    → Instrument Serif   (≙ MB Corpo A Title Condensed)
//   subtítulos → Noto Sans Display  (≙ MB Corpo S Title)
//   textos     → Noto Sans, 90 % de ancho (≙ MB Corpo S Text)
// Los tokens viven en globals.css: si llega la licencia MB Corpo, el cambio es acá.
const titulo = Instrument_Serif({
  variable: "--nf-titulo",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const subtitulo = Noto_Sans_Display({
  variable: "--nf-subtitulo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const texto = Noto_Sans({
  variable: "--nf-texto",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${titulo.variable} ${subtitulo.variable} ${texto.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
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
