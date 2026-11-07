import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Foco | Seus objetivos no ritmo certo",
  description: "Acompanhe objetivos, metas e sua evolução semanal.",
  applicationName: "Foco",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Foco",
  },
  formatDetection: { telephone: false },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#18392b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
