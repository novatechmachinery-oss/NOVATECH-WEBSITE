import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Novatech Machinery",
    short_name: "Novatech",
    description: "Used CNC machines, industrial machinery, and machine tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#145b93",
    icons: [
      {
        src: "/main-logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
