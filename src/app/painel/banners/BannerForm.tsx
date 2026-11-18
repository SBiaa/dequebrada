"use client";

import { UnsavedGuard } from "@/components/forms/UnsavedGuard";
import { useActionState, useState } from "react";
import { Field, FormMessage } from "@/components/forms/Field";
import { saveBannerAction, type BannerFields, type BannerFormState } from "../banners-actions";

export type BannerFormValues = BannerFields & { id?: string; active: boolean; imageUrl: string | null };

export function BannerForm({ values, notice }: { values: BannerFormValues; notice?: string }) {
  const [state, action, pending] = useActionState(saveBannerAction, notice ? { ok: notice } : undefined);
  const v = { ...values, ...state?.fields };
  return <Inner key={state?.at ?? 0} v={v} state={state} action={action} pending={pending} />;
}

function Inner({
  v,
  state,
  action,
  pending,
}: {
  v: BannerFormValues;
  state: BannerFormState;
  action: (fd: FormData) => void;
  pending: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const shown = preview ?? v.imageUrl;

  return (
    <form action={action} className="space-y-7" noValidate>
      <UnsavedGuard />
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <FormMessage state={state} />
      <Field
        label="Nome do banner"
        name="title"
        defaultValue={v.title}
        required
        maxLength={200}
        hint="Só para você se organizar. Não aparece no site. Ex.: Prefeitura de Poá, vacinação."
      />

      <fieldset className="space-y-4 rounded-xl border border-line p-5">
        <legend className="px-2 font-semibold">Imagem</legend>
        {shown && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt="Prévia do banner"
            className="aspect-[4/1] w-full max-w-2xl rounded-lg border border-line bg-white object-contain"
          />
        )}
        <label htmlFor="image" className="sr-only">
          Imagem do banner
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
        <p className="text-sm text-muted">
          JPG, PNG ou WebP, até 4 MB. Tamanho ideal: 1200 × 300 px (bem largo). Outros formatos aparecem inteiros, com
          faixa nas laterais.
        </p>
        <Field
          label="Descrição do banner (acessibilidade)"
          name="imageAlt"
          defaultValue={v.imageAlt}
          required
          hint="Resuma o que está escrito. Ex.: Prefeitura de Poá: vacinação contra a gripe até 30/11."
        />
      </fieldset>

      <Field label="Link ao clicar (opcional)" name="linkUrl" defaultValue={v.linkUrl} hint="Começa com https://. Vazio = banner sem clique." />

      <fieldset className="space-y-4 rounded-xl border border-line p-5">
        <legend className="px-2 font-semibold">Período no ar (opcional)</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Começa em" name="startsAt" type="date" defaultValue={v.startsAt} />
          <Field label="Termina em" name="endsAt" type="date" defaultValue={v.endsAt} />
        </div>
        <p className="text-sm text-muted">Sem datas, fica no ar até você esconder. O último dia ainda aparece.</p>
      </fieldset>

      <details className="rounded-xl border border-line p-5">
        <summary className="cursor-pointer font-semibold">Opções avançadas</summary>
        <div className="mt-5 max-w-xs">
          <Field label="Ordem na home" name="sortOrder" defaultValue={v.sortOrder} inputMode="numeric" hint="Menor aparece primeiro." />
        </div>
      </details>

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
        <button type="submit" name="intent" value="show" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando..." : v.id && v.active ? "Salvar (continua no ar)" : "Salvar e colocar no ar"}
        </button>
        <button type="submit" name="intent" value="hide" className="btn btn-ghost" disabled={pending}>
          {v.id && v.active ? "Salvar e esconder" : "Salvar sem mostrar"}
        </button>
      </div>
    </form>
  );
}
