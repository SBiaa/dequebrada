import "server-only";
import { and, asc, desc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import { db, schema } from "@/db";

const { banners } = schema;

/** Banners no ar hoje (fuso de São Paulo) para um local do site, na ordem definida no painel. */
export async function listLiveBanners(where: "home" | "blog" = "home") {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  return db
    .select({ id: banners.id, imageUrl: banners.imageUrl, imageAlt: banners.imageAlt, linkUrl: banners.linkUrl })
    .from(banners)
    .where(
      and(
        eq(banners.active, true),
        inArray(banners.placement, [where, "both"]),
        or(isNull(banners.startsAt), lte(banners.startsAt, today)),
        or(isNull(banners.endsAt), gte(banners.endsAt, today)),
      ),
    )
    .orderBy(asc(banners.sortOrder), desc(banners.createdAt));
}
