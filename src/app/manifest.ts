import type { MetadataRoute } from "next";

// O manifesto fica no App Router para receber o content-type correto na Vercel.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Foco",
    short_name: "Foco",
    description: "Acompanhe objetivos, metas e sua evolução semanal.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f1e8",
    theme_color: "#18392b",
    orientation: "portrait-primary",
    categories: ["productivity", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
