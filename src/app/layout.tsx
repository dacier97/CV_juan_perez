import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cv-daniel-ortiz.vercel.app"),
  title: "Daniel Ortiz | Ingeniero Electrónico & Full Stack Developer",
  description: "Portafolio profesional, proyectos, experiencia en telecomunicaciones, redes, cloud, React, Next.js y automatización con Power Platform.",
  keywords: ["ingeniero electrónico", "telecomunicaciones", "React", "Next.js", "cloud", "Supabase", "portafolio", "CV"],
  authors: [{ name: "Daniel Ortiz" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Daniel Ortiz | Ingeniero Electrónico & Full Stack Developer",
    description: "Portafolio profesional, proyectos, experiencia en telecomunicaciones, redes, cloud, React, Next.js y automatización con Power Platform.",
    url: "https://cv-daniel-ortiz.vercel.app",
    siteName: "Daniel Ortiz Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Daniel Ortiz | Ingeniero Electrónico & Full Stack Developer",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniel Ortiz | Ingeniero Electrónico & Full Stack Developer",
    description: "Portafolio profesional, proyectos, experiencia en telecomunicaciones, redes, cloud, React, Next.js y automatización con Power Platform.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
