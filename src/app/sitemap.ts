import type { MetadataRoute } from "next";
import { allCategories, allPublishedForFeed } from "@/lib/blog";
import { siteUrl } from "@/lib/url";

export const revalidate = 3600;

const STATIC_PATHS = [
  "",
  "/daquebradaaodigital",
  "/estudio",
  "/publicidade",
  "/blog",
  "/loja",
  "/parceiros",
  "/sobre",
  "/business",
  "/presenca-digital",
  "/politica-de-privacidade",
  "/termos-e-condicoes",
  "/politica-de-reembolso",
  "/acessibilidade",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [posts, categories] = await Promise.all([allPublishedForFeed(), allCategories()]);
  return [
    ...STATIC_PATHS.map((p) => ({ url: `${base}${p}` })),
    ...categories.map((c) => ({ url: `${base}/blog/categoria/${c.slug}` })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
