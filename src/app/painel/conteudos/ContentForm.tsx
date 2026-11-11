"use client";

import { useActionState } from "react";
import { Field, FormMessage, TextArea, inputClass } from "@/components/forms/Field";
import { saveContentAction, type ContentFields, type ContentFormState } from "../membros-actions";

export type ContentFormValues = ContentFields & {
  id?: string;
  published: boolean;
  fileName: string | null;
};

export function ContentForm({ values, notice }: { values: ContentFormValues; notice?: string }) {
  const [state, action, pending] = useActionState(saveContentAction, notice ? { ok: notice } : undefined);
  const v = { ...values, ...state?.fields };
  return <Inner key={state?.at ?? 0} v={v} state={state} action={action} pending={pending} />;
}

function Inner({
  v,
  state,
  action,
  pending,
}: {
  v: ContentFormValues;
  state: ContentFormState;
  action: (fd: FormData) => void;
  pending: boolean;
}) {
  return (
    <form action={action} className="space-y-7" noValidate>
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <FormMessage state={state} />
      <Field label="Título" name="title" defaultValue={v.title} required maxLength={200} />
      <div>
        <label htmlFor="kind" className="block font-semibold">
          Tipo
        </label>
        <select id="kind" name="kind" defaultValue={v.kind} className={inputClass}>
          <option value="video">Vídeo</option>
          <option value="aula">Aula</option>
          <option value="pdf">PDF</option>
          <option value="link">Link</option>
        </select>
      </div>
      <TextArea label="Descrição" name="description" rows={4} defaultValue={v.description} required maxLength={2000} />

      <fieldset className="space-y-6 rounded-xl border border-line p-5">
        <legend className="px-2 font-semibold">O conteúdo (preencha pelo menos um)</legend>
        <Field
          label="Vídeo do YouTube"
          name="youtube"
          defaultValue={v.youtube}
          hint='Cole o link do vídeo. Para ser exclusivo, publique no YouTube como "Não listado".'
        />
        <div>
          {v.fileName && (
            <p className="mb-2 flex flex-wrap items-center gap-3 text-sm">
              Arquivo atual: <strong>{v.fileName}</strong>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="removeFile" className="h-4 w-4" /> Remover
              </label>
            </p>
          )}
          <label htmlFor="file" className="block font-semibold">
            {v.fileName ? "Trocar PDF" : "PDF"} <span className="font-normal text-muted">(até 4 MB)</span>
          </label>
          <input id="file" name="file" type="file" accept="application/pdf" className="mt-2 block w-full text-sm" />
          <p className="mt-1.5 text-sm text-muted">Só assinantes logados conseguem baixar.</p>
        </div>
        <Field label="Link externo" name="externalUrl" defaultValue={v.externalUrl} hint="Ex.: aula ao vivo, pasta compartilhada. Começa com https://" />
      </fieldset>

      <details className="rounded-xl border border-line p-5">
        <summary className="cursor-pointer font-semibold">Opções avançadas</summary>
        <div className="mt-5">
          <Field label="Endereço (slug)" name="slug" defaultValue={v.slug} hint="Se deixar vazio, é criado a partir do título." />
        </div>
      </details>

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
        <button type="submit" name="intent" value="publish" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando..." : v.published ? "Salvar e manter publicado" : "Publicar para assinantes"}
        </button>
        <button type="submit" name="intent" value="draft" className="btn btn-ghost" disabled={pending}>
          {v.published ? "Salvar e tirar do ar" : "Salvar rascunho"}
        </button>
      </div>
    </form>
  );
}
