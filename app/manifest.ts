import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sistem Informasi Tuberkulosis",
    short_name: "NU-TBCARE",
    description: "Aplikasi pelaporan mandiri dan pemantauan pasien Tuberkulsis",
    start_url: "/",
    display: "standalone",
    background_color: "white",
    theme_color: "white",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
