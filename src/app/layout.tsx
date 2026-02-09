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
  title: "Juan Pérez | Curriculum Vitae Profesional",
  description: "Portafolio profesional y CV de Juan Pérez. Experiencia detallada, habilidades y trayectoria laboral.",
  keywords: ["Juan Pérez", "curriculum vitae", "portafolio", "CV", "experiencia laboral"],
  authors: [{ name: "Juan Pérez" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Juan Pérez | Curriculum Vitae Profesional",
    description: "Portafolio profesional y CV de Juan Pérez. Experiencia detallada, habilidades y trayectoria laboral.",
    siteName: "Juan Pérez CV",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Juan Pérez | Curriculum Vitae Profesional",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Juan Pérez | Curriculum Vitae Profesional",
    description: "Portafolio profesional y CV de Juan Pérez. Experiencia detallada, habilidades y trayectoria laboral.",
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
        {/* Extra Kill Switch for Vercel Toolbar */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const style = document.createElement('style');
              style.innerHTML = \`
                [data-vercel-toolbar],
                #__vercel_toolbar,
                iframe[src*="vercel"] {
                  display: none !important;
                }
              \`;
              document.head.appendChild(style);
            })();
          `
        }} />
      </body>
    </html>
  );
}
