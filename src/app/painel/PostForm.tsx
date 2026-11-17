"use client";

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

  return (
    // No computador grande, o formulário sai da coluna do painel e divide a tela com a prévia.
    <div className="xl:relative xl:left-1/2 xl:grid xl:w-[min(1440px,calc(100vw-5rem))] xl:-translate-x-1/2 xl:grid-cols-2 xl:items-start xl:gap-8">
      <form
        ref={formRef}
        action={action}
        onInput={readForm}
        onChange={readForm}
        className="space-y-7"
        noValidate
      >
        {values.id && <input type="hidden" name="id" value={values.id} />}
        <FormMessage state={state} />

        <Field
          label="Título"
          name="title"
          defaultValue={values.title}
          required
          maxLength={200}
        />

        <div className="grid gap-7 md:grid-cols-2">
          <div>
            <label htmlFor="categoryId" className="block font-semibold">
              Categoria
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={values.categoryId ?? ""}
              className={inputClass}
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Autor"
            name="authorName"
            defaultValue={values.authorName}
            maxLength={100}
          />
        </div>

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

        <fieldset className="space-y-4 rounded-xl border border-line p-5">
          <legend className="px-2 font-semibold">Imagem de capa</legend>
          <CoverPicker
            currentUrl={values.coverUrl || null}
            currentAlt={values.coverAlt}
            onPreview={onCover}
          />
          <Field
            label="Descrição da imagem (texto alternativo)"
            name="coverAlt"
            defaultValue={values.coverAlt}
            maxLength={200}
            hint='Diga o que aparece na foto. Ex.: "Novo ponto de ônibus com painel solar na Vila São Paulo".'
          />
        </fieldset>

        <TextArea
          label="Texto da notícia"
          name="body"
          rows={18}
          defaultValue={values.body}
          required
          hint="Deixe uma linha em branco entre parágrafos. **negrito**, *itálico*, ## Subtítulo, - item de lista, [texto do link](https://...)."
        />

        <details className="rounded-xl border border-line p-5">
          <summary className="cursor-pointer font-semibold">
            Opções avançadas
          </summary>
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

        <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
          <button
            type="submit"
            name="intent"
            value="publish"
            className="btn btn-primary"
            disabled={pending}
          >
            {pending
              ? "Salvando..."
              : values.status === "published"
                ? "Salvar e manter publicado"
                : "Publicar"}
          </button>
          {values.status !== "published" && (
            <button
              type="submit"
              name="intent"
              value="draft"
              className="btn btn-ghost"
              disabled={pending}
            >
              Salvar rascunho
            </button>
          )}
        </div>
      </form>
      <div className="mt-10 xl:sticky xl:top-28 xl:mt-0">
        <PostPreview data={preview} />
      </div>
    </div>
  );
}
