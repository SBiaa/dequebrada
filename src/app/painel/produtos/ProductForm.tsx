"use client";

import { useActionState, useState } from "react";
import { Field, FormMessage, TextArea, inputClass } from "@/components/forms/Field";
import { PRODUCT_CATEGORIES } from "@/data/products";
import { saveProductAction, type ProductFields, type ProductFormState } from "../produtos-actions";

export type ProductFormValues = ProductFields & { id?: string; available: boolean; imageUrl: string | null };

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
  const shown = preview ?? (removed ? null : v.imageUrl);

  return (
    <form action={action} className="space-y-7" noValidate>
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <FormMessage state={state} />
      <Field label="Nome do produto" name="name" defaultValue={v.name} required maxLength={200} />
      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="block font-semibold">
            Categoria
          </label>
          <select id="category" name="category" defaultValue={v.category} className={inputClass}>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Field label="Preço (R$)" name="price" defaultValue={v.price} inputMode="decimal" hint='Ex.: 49,90. Vazio = "Sob consulta".' />
      </div>
      <TextArea label="Descrição" name="description" rows={4} defaultValue={v.description} required maxLength={2000} />

      <fieldset className="space-y-4 rounded-xl border border-line p-5">
        <legend className="px-2 font-semibold">Foto</legend>
        {shown && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="Prévia da foto" className="aspect-square w-48 rounded-lg border border-line bg-white object-contain" />
        )}
        <label htmlFor="image" className="sr-only">
          Foto do produto
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
        />
        <p className="text-sm text-muted">JPG, PNG ou WebP, até 4 MB. Foto quadrada fica melhor.</p>
        {v.imageUrl && !preview && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="removeImage" className="h-4 w-4" onChange={(e) => setRemoved(e.target.checked)} />
            Remover foto atual
          </label>
        )}
        <Field label="Descrição da foto (acessibilidade)" name="imageAlt" defaultValue={v.imageAlt} hint="Ex.: Caneca preta com o logo De Quebrada." />
      </fieldset>

      <fieldset className="space-y-6 rounded-xl border border-line p-5">
        <legend className="px-2 font-semibold">Variações (opcional)</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Nome da variação" name="variantLabel" defaultValue={v.variantLabel} hint="Ex.: Tamanho, Cor." />
          <Field label="Opções" name="variantOptions" defaultValue={v.variantOptions} hint="Separadas por vírgula: P, M, G, GG" />
        </div>
      </fieldset>

      <fieldset className="space-y-5 rounded-xl border border-line p-5">
        <legend className="px-2 font-semibold">Como o cliente compra</legend>
        <label className="flex items-center gap-3">
          <input type="radio" name="buyType" value="whatsapp" checked={buyType === "whatsapp"} onChange={() => setBuyType("whatsapp")} className="h-4 w-4" />
          Pelo WhatsApp (mensagem pronta com produto e variação)
        </label>
        <label className="flex items-center gap-3">
          <input type="radio" name="buyType" value="external" checked={buyType === "external"} onChange={() => setBuyType("external")} className="h-4 w-4" />
          Link externo (Mercado Livre, Shopee, Pix...)
        </label>
        {buyType === "external" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Link de compra" name="buyUrl" defaultValue={v.buyUrl} hint="Começa com https://" />
            <Field label="Texto do botão" name="buyLabel" defaultValue={v.buyLabel} hint="Ex.: Comprar no Mercado Livre" />
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

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
        <button type="submit" name="intent" value="show" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando..." : v.id && v.available ? "Salvar (continua na loja)" : "Salvar e mostrar na loja"}
        </button>
        <button type="submit" name="intent" value="hide" className="btn btn-ghost" disabled={pending}>
          {v.id && v.available ? "Salvar e esconder da loja" : "Salvar sem mostrar"}
        </button>
      </div>
    </form>
  );
}
