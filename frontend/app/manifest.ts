import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sebastian — Le Majordome Michelin",
    short_name: "Sebastian",
    description: "Votre majordome gastronomique personnel",
    start_url: "/",
    display: "standalone",
    background_color: "#0C0014",
    theme_color: "#DA291C",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
