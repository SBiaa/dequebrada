"use client";

import { UnsavedGuard } from "@/components/forms/UnsavedGuard";
import { useActionState, useCallback, useRef, useState } from "react";
import {
  Field,
  FormMessage,
  TextArea,
  inputClass,
} from "@/components/forms/Field";
import { savePostAction, type PostFormState } from "./actions";
import { CoverPicker } from "./CoverPicker";
import { PostPreview, type PreviewData } from "./PostPreview";

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl: string | null;
  coverAlt: string;
  categoryId: number | null;
  authorName: string;
  status: "draft" | "published";
  /** "AAAA-MM-DDTHH:mm" no horário de Brasília, só quando a data de publicação está no futuro. */
  scheduleAt?: string;
};

export function PostForm({
  values,
  categories,
  notice,
}: {
  values: PostFormValues;
  categories: { id: number; name: string }[];
  notice?: string;
}) {
  const [state, action, pending] = useActionState(
    savePostAction,
    notice ? { ok: notice } : undefined,
  );
  // Depois de um erro, os campos voltam com o que foi digitado.
  const v = { ...values, ...state?.fields };
  return (
    <Inner
      key={state?.at ?? 0}
      v={v}
      state={state}
      action={action}
      pending={pending}
      categories={categories}
    />
  );
}

function Inner({
  v: values,
  state,
  action,
  pending,
  categories,
}: {
  v: PostFormValues;
  state: PostFormState;
  action: (formData: FormData) => void;
  pending: boolean;
  categories: { id: number; name: string }[];
}) {
  const [excerpt, setExcerpt] = useState(values.excerpt);
  const formRef = useRef<HTMLFormElement>(null);
  const catName = (id: string) =>
    categories.find((c) => String(c.id) === id)?.name ?? "";
  const [preview, setPreview] = useState<PreviewData>({
    title: values.title,
    excerpt: values.excerpt,
    body: values.body,
    categoryName: catName(String(values.categoryId ?? "")),
    authorName: values.authorName,
    coverUrl: values.coverUrl,
    coverAlt: values.coverAlt,
  });

  // Lê o formulário a cada alteração para atualizar a prévia.
  function readForm() {
    const f = formRef.current;
    if (!f) return;
    const fd = new FormData(f);
    const get = (k: string) => String(fd.get(k) ?? "");
    setPreview((p) => ({
      ...p,
      title: get("title"),
      excerpt: get("excerpt"),
      body: get("body"),
      categoryName: catName(get("categoryId")),
      authorName: get("authorName"),
      coverAlt: get("coverAlt"),
    }));
  }
  const onCover = useCallback(
    (url: string | null) =>
      setPreview((p) => (p.coverUrl === url ? p : { ...p, coverUrl: url })),
    [],
  );

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [dirty, setDirty] = useState(false);
  const statusLabel = dirty
    ? "Alterações não salvas"
    : values.status === "published"
      ? "Publicado"
      : values.id
        ? "Rascunho salvo"
        : "Novo post";
  const tabClass = (on: boolean) =>
    `min-h-10 rounded-md px-4 text-sm ${on ? "bg-surface-2 font-bold text-ink" : "text-muted hover:text-ink"}`;

  return (
    <form
      ref={formRef}
      action={action}
      onInput={() => {
        setDirty(true);
        readForm();
      }}
      onChange={readForm}
      noValidate
    >
      <UnsavedGuard />
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <FormMessage state={state} />

      <div role="tablist" aria-label="Modo" className="mt-6 inline-flex flex-wrap rounded-lg border border-line bg-bg p-1">
        <button
          type="button"
          role="tab"
          id="tab-write"
          aria-selected={tab === "write"}
          aria-controls="panel-write"
          className={tabClass(tab === "write")}
          onClick={() => setTab("write")}
        >
          Escrever
        </button>
        <button
          type="button"
          role="tab"
          id="tab-preview"
          aria-selected={tab === "preview"}
          aria-controls="panel-preview"
          className={tabClass(tab === "preview")}
          onClick={() => setTab("preview")}
        >
          Prévia (card, celular e computador)
        </button>
      </div>

      <div
        id="panel-write"
        role="tabpanel"
        aria-labelledby="tab-write"
        className={`mt-8 gap-8 lg:items-start ${tab === "write" ? "lg:flex" : "hidden"}`}
      >
        <div className="min-w-0 flex-1 space-y-7">
          <Field label="Título" name="title" defaultValue={values.title} required maxLength={200} />

          <TextArea
            label="Resumo"
            name="excerpt"
            rows={3}
            maxLength={320}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            hint={`Aparece no Google e nos cards do blog. Ideal: até 160 caracteres (${excerpt.length}/160).`}
            required
          />

          <TextArea
            label="Texto da notícia"
            name="body"
            rows={18}
            defaultValue={values.body}
            required
            hint="Deixe uma linha em branco entre parágrafos. **negrito**, *itálico*, ## Subtítulo, - item de lista, [texto do link](https://...)."
          />

          <details className="rounded-xl border border-line p-5">
            <summary className="cursor-pointer font-semibold">Opções avançadas</summary>
            <div className="mt-5">
              <Field
                label="Endereço do post (slug)"
                name="slug"
                defaultValue={values.slug}
                maxLength={100}
                hint="Fica em dequebrada.com/blog/endereco. Se deixar vazio, é criado a partir do título. Evite mudar depois de publicado."
              />
            </div>
          </details>
        </div>

        <aside className="mt-8 space-y-6 lg:mt-0 lg:w-80 lg:shrink-0">
          <div>
            <label htmlFor="categoryId" className="block font-semibold">
              Categoria
            </label>
            <select id="categoryId" name="categoryId" defaultValue={values.categoryId ?? ""} className={inputClass}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Field label="Autor" name="authorName" defaultValue={values.authorName} maxLength={100} />

          <div>
            <label htmlFor="scheduleAt" className="block font-semibold">
              Agendar publicação
            </label>
            <input
              id="scheduleAt"
              name="scheduleAt"
              type="datetime-local"
              defaultValue={values.scheduleAt ?? ""}
              aria-describedby="scheduleAt-hint"
              className={inputClass}
            />
            <p id="scheduleAt-hint" className="mt-1 text-sm text-muted">
              Opcional, horário de Brasília. Escolha a data e clique em Publicar: o post só aparece no site na hora
              marcada. Deixe vazio para publicar agora.
            </p>
          </div>

          <fieldset className="space-y-4 rounded-xl border border-line p-5">
            <legend className="px-2 font-semibold">Imagem de capa</legend>
            <CoverPicker currentUrl={values.coverUrl || null} currentAlt={values.coverAlt} onPreview={onCover} />
            <Field
              label="Descrição da imagem"
              name="coverAlt"
              defaultValue={values.coverAlt}
              maxLength={200}
              hint='Diga o que aparece na foto. Ex.: "Novo ponto de ônibus com painel solar na Vila São Paulo".'
            />
          </fieldset>

          <div>
            <p className="font-semibold">Como aparece no Google</p>
            <div className="mt-2 rounded-xl bg-white p-4 text-sm leading-snug text-[#4d5156]">
              <p className="text-xs text-[#202124]">dequebrada.com › blog</p>
              <p className="mt-1 text-base text-[#1a0dab] [overflow-wrap:anywhere]">{preview.title || "Título do post"}</p>
              <p className="mt-1 [overflow-wrap:anywhere]">
                {preview.excerpt
                  ? preview.excerpt.length > 160
                    ? `${preview.excerpt.slice(0, 157)}…`
                    : preview.excerpt
                  : "O resumo aparece aqui."}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div
        id="panel-preview"
        role="tabpanel"
        aria-labelledby="tab-preview"
        className={tab === "preview" ? "mt-8" : "hidden"}
      >
        <PostPreview data={preview} />
      </div>

      <div className="sticky bottom-3 z-10 mt-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/95 px-4 py-3 shadow-lg backdrop-blur">
        <p className="flex items-center gap-2 text-sm text-muted" aria-live="polite">
          <span aria-hidden="true" className={`inline-block size-2 rounded-full ${dirty ? "bg-warn" : "bg-wa"}`} />
          {statusLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {values.status !== "published" && (
            <button type="submit" name="intent" value="draft" className="btn btn-ghost !min-h-11" disabled={pending}>
              Salvar rascunho
            </button>
          )}
          <button type="submit" name="intent" value="publish" className="btn btn-primary !min-h-11" disabled={pending}>
            {pending ? "Salvando..." : values.status === "published" ? "Salvar alterações" : "Publicar"}
          </button>
        </div>
      </div>
    </form>
  );
}
