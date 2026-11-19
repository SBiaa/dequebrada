"use client";

import { UnsavedGuard } from "@/components/forms/UnsavedGuard";
import { useActionState, useState } from "react";
import { Field, FormMessage, TextArea, inputClass } from "@/components/forms/Field";
import { Icon } from "@/components/ui/Icon";
import { PRODUCT_CATEGORIES } from "@/data/products";
import { saveProductAction, type ProductFields, type ProductFormState } from "../produtos-actions";

export type ProductFormValues = ProductFields & { id?: string; available: boolean; imageUrl: string | null };

/** "49,90" → "R$ 49,90"; vazio → "Sob consulta". Só para a prévia. */
function previewPrice(raw: string): string {
  const n = Number(raw.replace(/\./g, "").replace(",", ".").trim());
  if (!raw.trim() || !Number.isFinite(n)) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export function ProductForm({ values, notice }: { values: ProductFormValues; notice?: string }) {
  const [state, action, pending] = useActionState(saveProductAction, notice ? { ok: notice } : undefined);
  const v = { ...values, ...state?.fields };
  return <Inner key={state?.at ?? 0} v={v} state={state} action={action} pending={pending} />;
}

function Inner({
  v,
  state,
  action,
  pending,
}: {
  v: ProductFormValues;
  state: ProductFormState;
  action: (fd: FormData) => void;
  pending: boolean;
}) {
  const [buyType, setBuyType] = useState(v.buyType);
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [name, setName] = useState(v.name);
  const [price, setPrice] = useState(v.price);
  const [category, setCategory] = useState(v.category);
  const [options, setOptions] = useState(v.variantOptions);
  const [variantLabel, setVariantLabel] = useState(v.variantLabel);
  const [buyLabel, setBuyLabel] = useState(v.buyLabel);
  const shown = preview ?? (removed ? null : v.imageUrl);
  const opts = options
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const catName = PRODUCT_CATEGORIES.find((c) => c.slug === category)?.name ?? "";

  const buyCard = (on: boolean) =>
    `flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
      on ? "border-accent bg-accent/10" : "border-line bg-surface hover:border-accent/60"
    }`;

  return (
    <form action={action} noValidate>
      <UnsavedGuard />
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <FormMessage state={state} />

      <div className="mt-6 gap-8 lg:flex lg:items-start">
        <div className="min-w-0 flex-1 space-y-7">
          <Field
            label="Nome do produto"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
          />
          <div className="grid gap-7 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="block font-semibold">
                Categoria
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Preço (R$)"
              name="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="49,90"
              hint='Vazio = "Sob consulta".'
            />
          </div>
          <TextArea label="Descrição" name="description" rows={4} defaultValue={v.description} required maxLength={2000} />

          <fieldset className="rounded-xl border border-line p-5">
            <legend className="px-2 font-semibold">Variações (opcional)</legend>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field
                label="Nome da variação"
                name="variantLabel"
                value={variantLabel}
                onChange={(e) => setVariantLabel(e.target.value)}
                placeholder="Tamanho"
              />
              <Field
                label="Opções"
                name="variantOptions"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="P, M, G, GG"
                hint="Separe por vírgula."
              />
            </div>
            {opts.length > 0 && (
              <ul aria-label="Opções que o cliente vai ver" className="mt-4 flex flex-wrap gap-2">
                {opts.map((o) => (
                  <li key={o} className="rounded-lg border border-line px-3 py-1 text-sm">
                    {o}
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          <fieldset>
            <legend className="font-semibold">Como o cliente compra</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <label className={buyCard(buyType === "whatsapp")}>
                <input
                  type="radio"
                  name="buyType"
                  value="whatsapp"
                  checked={buyType === "whatsapp"}
                  onChange={() => setBuyType("whatsapp")}
                  className="sr-only"
                />
                <Icon name="chat" className={`h-6 w-6 shrink-0 ${buyType === "whatsapp" ? "text-accent" : "text-muted"}`} />
                <span>
                  <span className="block font-semibold">Pelo WhatsApp</span>
                  <span className="text-sm text-muted">Mensagem pronta com o produto e a opção escolhida.</span>
                </span>
              </label>
              <label className={buyCard(buyType === "external")}>
                <input
                  type="radio"
                  name="buyType"
                  value="external"
                  checked={buyType === "external"}
                  onChange={() => setBuyType("external")}
                  className="sr-only"
                />
                <Icon name="route" className={`h-6 w-6 shrink-0 ${buyType === "external" ? "text-accent" : "text-muted"}`} />
                <span>
                  <span className="block font-semibold">Link externo</span>
                  <span className="text-sm text-muted">Mercado Livre, Shopee, link de Pix…</span>
                </span>
              </label>
            </div>
            {buyType === "external" && (
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                <Field label="Link de compra" name="buyUrl" defaultValue={v.buyUrl} placeholder="https://" />
                <Field
                  label="Texto do botão"
                  name="buyLabel"
                  value={buyLabel}
                  onChange={(e) => setBuyLabel(e.target.value)}
                  placeholder="Comprar no Mercado Livre"
                />
              </div>
            )}
          </fieldset>

          <details className="rounded-xl border border-line p-5">
            <summary className="cursor-pointer font-semibold">Opções avançadas</summary>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <Field label="Código (SKU)" name="sku" defaultValue={v.sku} hint="Se deixar vazio, é criado a partir do nome." />
              <Field label="Ordem na loja" name="sortOrder" defaultValue={v.sortOrder} inputMode="numeric" hint="Menor aparece primeiro." />
            </div>
          </details>
        </div>

        <aside className="mt-8 space-y-4 lg:sticky lg:top-6 lg:mt-0 lg:w-80 lg:shrink-0">
          <section aria-labelledby="foto-titulo" className="rounded-xl border border-line bg-surface p-4">
            <h2 id="foto-titulo" className="font-bold">
              Foto
            </h2>
            <label
              htmlFor="image"
              className="mt-3 flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-line bg-white text-center transition-colors hover:border-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent"
            >
              {shown ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shown} alt="Prévia da foto" className="h-full w-full object-contain p-3" />
              ) : (
                <span className="flex flex-col items-center gap-1 px-4 text-sm text-[#4b5870]">
                  <Icon name="camera" className="h-8 w-8" />
                  <span className="font-semibold text-[#0a6ea3]">Escolher foto</span>
                  JPG, PNG ou WebP, até 4 MB
                </span>
              )}
              <input
                id="image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
            </label>
            <p className="mt-2 text-xs text-muted">
              {shown ? "Clique na foto para trocar. " : ""}Foto quadrada fica melhor.
            </p>
            {v.imageUrl && !preview && (
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="removeImage"
                  className="h-4 w-4"
                  onChange={(e) => setRemoved(e.target.checked)}
                />
                Remover foto atual
              </label>
            )}
            <div className="mt-4">
              <Field
                label="Descrição da foto"
                name="imageAlt"
                defaultValue={v.imageAlt}
                placeholder="Caneca preta com o logo"
                hint="Para quem usa leitor de tela."
              />
            </div>
          </section>

          <section aria-labelledby="previa-titulo" className="rounded-xl border border-line bg-surface p-4">
            <h2 id="previa-titulo" className="text-sm font-bold uppercase tracking-wider text-muted">
              Como aparece na loja
            </h2>
            <div className="mt-3 rounded-lg border border-line bg-bg p-3">
              <p className="text-xs text-muted">{catName}</p>
              <p className="font-semibold leading-snug [overflow-wrap:anywhere]">{name || "Nome do produto"}</p>
              <p className="mt-1 text-lg font-bold">{previewPrice(price)}</p>
              {opts.length > 0 && (
                <p className="mt-1 text-xs text-muted">
                  {variantLabel || "Opções"}: {opts.join(" · ")}
                </p>
              )}
              <span
                aria-hidden="true"
                className={`mt-3 block rounded-lg py-2 text-center text-sm font-bold ${
                  buyType === "whatsapp" ? "bg-wa text-black" : "bg-accent text-accent-ink"
                }`}
              >
                {buyType === "whatsapp" ? "Comprar pelo WhatsApp" : buyLabel || "Comprar"}
              </span>
            </div>
          </section>

          <section aria-labelledby="pub-titulo" className="space-y-3 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 id="pub-titulo" className="font-bold">
                Na loja
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  v.id && v.available ? "bg-accent text-accent-ink" : "border border-line text-muted"
                }`}
              >
                {!v.id ? "Novo" : v.available ? "Visível" : "Escondido"}
              </span>
            </div>
            <button type="submit" name="intent" value="show" className="btn btn-primary w-full" disabled={pending}>
              {pending ? "Salvando..." : v.id && v.available ? "Salvar alterações" : "Salvar e mostrar na loja"}
            </button>
            <button type="submit" name="intent" value="hide" className="btn btn-ghost w-full" disabled={pending}>
              {v.id && v.available ? "Salvar e esconder da loja" : "Salvar sem mostrar"}
            </button>
          </section>
        </aside>
      </div>
    </form>
  );
}
