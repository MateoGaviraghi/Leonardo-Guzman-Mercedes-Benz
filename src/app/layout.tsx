import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MainWrapper } from "@/components/MainWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Leonardo Guzman | Vendedor Oficial Mercedes-Benz",
  description:
    "Vendedor oficial de Automotores Mega, concesionaria Mercedes-Benz.",
  openGraph: {
    title: "Leonardo Guzman | Vendedor Oficial Mercedes-Benz",
    description:
      "Vendedor oficial de Automotores Mega, concesionaria Mercedes-Benz.",
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
    title: "Leonardo Guzman | Vendedor Oficial Mercedes-Benz",
    description:
      "Vendedor oficial de Automotores Mega, concesionaria Mercedes-Benz.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navbar />
        <MainWrapper>{children}</MainWrapper>
        <Footer />
      </body>
    </html>
  );
}
