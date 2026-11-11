import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Capas do blog e PDFs de membros vão até 4 MB (+ margem do formulário).
    serverActions: { bodySizeLimit: "4.4mb" },
  },
  async redirects() {
    return [
      // O conteúdo do podcast foi para /estudio (estúdio + participação no podcast).
      { source: "/podcast", destination: "/estudio", permanent: true },
      { source: "/podcasts", destination: "/estudio", permanent: true },
      // O portal de notícias agora é o blog.
      { source: "/news", destination: "/blog", permanent: true },
      // URL oficial da formação é a que já circula na divulgação.
      { source: "/da-quebrada-ao-digital", destination: "/daquebradaaodigital", permanent: true },
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
