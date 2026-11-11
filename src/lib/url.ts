import "server-only";

/** Endereço público do site, usado em links de e-mail, sitemap, RSS e Open Graph. */
export function siteUrl(): string {
  const fromEnv =
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined);
  return (fromEnv ?? "http://localhost:3000").replace(/\/$/, "");
}
