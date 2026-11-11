import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // O conteúdo do podcast foi para /estudio (estúdio + participação no podcast).
      { source: "/podcast", destination: "/estudio", permanent: true },
      { source: "/podcasts", destination: "/estudio", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
