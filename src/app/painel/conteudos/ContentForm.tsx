"use client";

import { UnsavedGuard } from "@/components/forms/UnsavedGuard";
import { useActionState, useState } from "react";
import { Field, FormMessage, TextArea } from "@/components/forms/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
import { saveContentAction, type ContentFields, type ContentFormState } from "../membros-actions";

export type ContentFormValues = ContentFields & {
  id?: string;
  published: boolean;
  fileName: string | null;
};

const KINDS: { id: ContentFields["kind"]; label: string; hint: string; icon: IconName }[] = [
  { id: "video", label: "Vídeo", hint: "Um vídeo do YouTube", icon: "video" },
  { id: "aula", label: "Aula", hint: "Aula gravada ou série", icon: "presentation" },
  { id: "pdf", label: "PDF", hint: "Material para baixar", icon: "doc" },
  { id: "link", label: "Link", hint: "Pasta, live, outro site", icon: "route" },
];

/** Tira o ID de um link do YouTube (watch, youtu.be, shorts, embed). */
function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live)\/)([\w-]{11})/);
  return m ? m[1] : null;
}

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
  const [kind, setKind] = useState(v.kind);
  const [yt, setYt] = useState(v.youtube);
  const [fileName, setFileName] = useState<string | null>(null);
  const ytId = youtubeId(yt);

  return (
    <form action={action} noValidate>
      <UnsavedGuard />
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <FormMessage state={state} />

      <div className="mt-6 gap-8 lg:flex lg:items-start">
        <div className="min-w-0 flex-1 space-y-7">
          <fieldset>
            <legend className="font-semibold">Tipo</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {KINDS.map((k) => {
                const on = kind === k.id;
                return (
                  <label
                    key={k.id}
                    className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                      on ? "border-accent bg-accent/10" : "border-line bg-surface hover:border-accent/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="kind"
                      value={k.id}
                      checked={on}
                      onChange={() => setKind(k.id)}
                      className="sr-only"
                    />
                    <Icon name={k.icon} className={`h-6 w-6 ${on ? "text-accent" : "text-muted"}`} />
                    <span className="font-semibold">{k.label}</span>
                    <span className="text-xs text-muted">{k.hint}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <Field label="Título" name="title" defaultValue={v.title} required maxLength={200} />
          <TextArea
            label="Descrição"
            name="description"
            rows={4}
            defaultValue={v.description}
            required
            maxLength={2000}
            hint="Aparece no card da área de membros. Diga o que a pessoa vai aprender ou levar."
          />

          <fieldset className="space-y-6 rounded-xl border border-line p-5">
            <legend className="px-2 font-semibold">O conteúdo (preencha pelo menos um)</legend>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-start">
              <Field
                label="Vídeo do YouTube"
                name="youtube"
                value={yt}
                onChange={(e) => setYt(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                hint='Para ser exclusivo, publique no YouTube como "Não listado".'
              />
              <div className="aspect-video overflow-hidden rounded-lg border border-line bg-surface-2 sm:mt-8">
                {ytId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`}
                    alt="Miniatura do vídeo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">
                    {yt ? "Link não reconhecido" : "Prévia do vídeo"}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="font-semibold">
                PDF <span className="font-normal text-muted">(até 4 MB)</span>
              </p>
              {v.fileName && (
                <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg bg-surface-2 px-3 py-2 text-sm">
                  <Icon name="doc" className="h-5 w-5 text-accent" />
                  <strong className="[overflow-wrap:anywhere]">{v.fileName}</strong>
                  <label className="ml-auto flex items-center gap-2 text-muted">
                    <input type="checkbox" name="removeFile" className="h-4 w-4" /> Remover
                  </label>
                </div>
              )}
              <label
                htmlFor="file"
                className="mt-2 flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-line px-4 py-5 text-center text-sm transition-colors hover:border-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent"
              >
                <span className="font-semibold text-accent">
                  {fileName ?? (v.fileName ? "Trocar o PDF" : "Escolher um PDF")}
                </span>
                <span className="text-muted">Só assinantes logados conseguem baixar.</span>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                />
              </label>
            </div>

            <Field
              label="Link externo"
              name="externalUrl"
              defaultValue={v.externalUrl}
              placeholder="https://"
              hint="Ex.: aula ao vivo, pasta compartilhada."
            />
          </fieldset>

          <details className="rounded-xl border border-line p-5">
            <summary className="cursor-pointer font-semibold">Opções avançadas</summary>
            <div className="mt-5">
              <Field
                label="Endereço (slug)"
                name="slug"
                defaultValue={v.slug}
                hint="Se deixar vazio, é criado a partir do título."
              />
            </div>
          </details>
        </div>

        <aside className="mt-8 lg:sticky lg:top-6 lg:mt-0 lg:w-72 lg:shrink-0">
          <div className="space-y-3 rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold">Publicação</p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  v.published ? "bg-accent text-accent-ink" : "border border-line text-muted"
                }`}
              >
                {v.published ? "Publicado" : v.id ? "Rascunho" : "Novo"}
              </span>
            </div>
            <p className="text-sm text-muted">
              {v.published
                ? "Assinantes já veem este conteúdo."
                : "Só aparece para assinantes depois de publicar."}
            </p>
            <button type="submit" name="intent" value="publish" className="btn btn-primary w-full" disabled={pending}>
              {pending ? "Salvando..." : v.published ? "Salvar alterações" : "Publicar para assinantes"}
            </button>
            <button type="submit" name="intent" value="draft" className="btn btn-ghost w-full" disabled={pending}>
              {v.published ? "Salvar e tirar do ar" : "Salvar rascunho"}
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}
