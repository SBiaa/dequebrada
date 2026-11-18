"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

const STATUS = ["novo", "contatado", "fechado", "perdido"] as const;
type Status = (typeof STATUS)[number];

export async function setLeadStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as Status;
  if (!STATUS.includes(status)) return;
  await db.update(schema.leads).set({ status }).where(eq(schema.leads.id, id));
  revalidatePath("/painel/leads");
  revalidatePath("/painel", "layout");
}
