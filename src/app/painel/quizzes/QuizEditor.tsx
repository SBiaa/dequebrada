"use client";

import Link from "next/link";
import { UnsavedGuard } from "@/components/forms/UnsavedGuard";
import { useActionState, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { newStepId, STEP_KINDS, videoEmbed, type QuizStep, type StepKind } from "@/lib/quiz";
import { saveQuizAction } from "../quizzes-actions";

export type QuizValues = {
  id: string;
  title: string;
  slug: string;
  eyebrow: string;
  intro: string;
  ctaLabel: string;
  steps: QuizStep[];
  contactTitle: string;
  askEmail: boolean;
  askInstagram: boolean;
  finalTitle: string;
  finalText: string;
  published: boolean;
};

const input =
  "w-full rounded-lg border border-line bg-bg p-3 text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";
const iconBtn =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-line px-2 text-sm text-muted hover:border-accent hover:text-ink disabled:opacity-40 disabled:hover:border-line";

/** Ícone, nome curto e explicação de cada tipo de passo. */
const KIND_INFO: Record<StepKind, { icon: IconName; short: string; desc: string }> = {
  single: { icon: "check", short: "Escolha única", desc: "Uma opção. Avança sozinho ao tocar." },
  multi: { icon: "clipboard", short: "Várias escolhas", desc: "Marca quantas quiser." },
  text: { icon: "chat", short: "Resposta escrita", desc: "A pessoa digita a resposta." },
  info: { icon: "doc", short: "Tela de texto", desc: "Só um recado, sem pergunta." },
  video: { icon: "video", short: "Vídeo", desc: "YouTube, Vimeo ou .mp4." },
};

const isChoice = (k: StepKind) => k === "single" || k === "multi";

/** Motivo pelo qual o passo vai ser descartado ao salvar (ou null se está ok). */
function stepIssue(s: QuizStep): string | null {
  if (!s.question.trim()) return s.kind === "info" || s.kind === "video" ? "Falta o título." : "Falta a pergunta.";
  if (isChoice(s.kind) && s.options.filter((o) => o.trim()).length < 2) return "Precisa de pelo menos 2 opções.";
  if (s.kind === "video" && !videoEmbed(s.videoUrl ?? "")) return "Falta um link de vídeo válido.";
  return null;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="font-semibold">{label}</span>
      {children}
      {hint && <span className="text-sm text-muted">{hint}</span>}
    </label>
  );
}

function SectionTitle({ n, children, id }: { n: number; children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="scroll-anchor flex items-center gap-3 text-xl font-bold">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm text-accent-ink">{n}</span>
      {children}
    </h2>
  );
}

export function QuizEditor({ values, notice, leads }: { values: QuizValues; notice?: string; leads?: number }) {
  const [state, action, pending] = useActionState(saveQuizAction, undefined);
  const [v, setV] = useState(values);
  const [tab, setTab] = useState<"editar" | "previa">("editar");
  const set = <K extends keyof QuizValues>(k: K, val: QuizValues[K]) => setV((x) => ({ ...x, [k]: val }));

  const setStep = (i: number, patch: Partial<QuizStep>) =>
    set("steps", v.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, d: number) => {
    const list = [...v.steps];
    const [s] = list.splice(i, 1);
    list.splice(i + d, 0, s);
    set("steps", list);
  };
  const addStep = (kind: StepKind) => {
    const id = newStepId();
    set("steps", [
      ...v.steps,
      {
        id,
        kind,
        question: "",
        hint: "",
        options: isChoice(kind) ? ["", ""] : [],
        placeholder: "",
        buttonLabel: "",
        videoUrl: "",
      },
    ]);
    // Leva o foco para a pergunta do passo novo.
    requestAnimationFrame(() => document.getElementById(`q-${id}`)?.focus());
  };

  const message = state?.error ?? state?.ok ?? notice;
  const issues = v.steps.map(stepIssue);
  const broken = issues.filter(Boolean).length;
  const asks = v.steps.filter((s, i) => !issues[i] && s.kind !== "info" && s.kind !== "video").length;
  const savedSlug = values.slug;

  const tabCls = (on: boolean) =>
    `inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold ${
      on ? "bg-ink text-bg" : "text-muted hover:text-ink"
    }`;

  return (
    <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      {/* Abas */}
      <div className="flex flex-wrap items-center justify-between gap-3 lg:col-start-1 lg:row-start-1">
        <div role="tablist" aria-label="Modo" className="inline-flex gap-1 rounded-xl border border-line p-1">
          <button type="button" role="tab" aria-selected={tab === "editar"} className={tabCls(tab === "editar")} onClick={() => setTab("editar")}>
            Editar
          </button>
          <button type="button" role="tab" aria-selected={tab === "previa"} className={tabCls(tab === "previa")} onClick={() => setTab("previa")}>
            Prévia
          </button>
        </div>
        {tab === "previa" && <p className="text-sm text-muted">Teste como o visitante vê. Nada é enviado.</p>}
      </div>

      {/* O <form> some do layout (display: contents) para a prévia, que tem o próprio <form>, ficar fora dele. */}
      <form id="quiz-form" action={action} className="contents">
        <UnsavedGuard />
        <input type="hidden" name="id" value={v.id} />
        <input type="hidden" name="steps" value={JSON.stringify(v.steps)} />

        <div className={`grid min-w-0 gap-10 lg:col-start-1 lg:row-start-2 ${tab === "previa" ? "hidden" : ""}`}>
          {message && (
            <p
              key={state?.at}
              role={state?.error ? "alert" : "status"}
              className={`rounded-lg border px-4 py-3 font-semibold ${
                state?.error ? "border-red-500 text-red-500" : "border-accent/50 bg-accent/10"
              }`}
            >
              {message}
            </p>
          )}

          <section aria-labelledby="sec-capa" className="grid gap-5">
            <SectionTitle n={1} id="sec-capa">
              Capa
            </SectionTitle>
            <div className="grid gap-5 rounded-xl border border-line bg-surface p-5">
              <Field label="Título">
                <input name="title" required value={v.title} onChange={(e) => set("title", e.target.value)} className={input} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Endereço" hint="Vazio = criado a partir do título.">
                  <span className="flex items-stretch overflow-hidden rounded-lg border border-line bg-bg focus-within:border-accent focus-within:ring-2 focus-within:ring-accent">
                    <span className="flex items-center border-r border-line bg-surface-2 px-3 text-sm text-muted">/quiz/</span>
                    <input
                      name="slug"
                      value={v.slug}
                      onChange={(e) => set("slug", e.target.value)}
                      placeholder="diagnostico"
                      className="min-w-0 flex-1 bg-transparent p-3 text-ink focus:outline-none"
                    />
                  </span>
                </Field>
                <Field label="Chamada acima do título" hint="Opcional.">
                  <input
                    name="eyebrow"
                    value={v.eyebrow}
                    onChange={(e) => set("eyebrow", e.target.value)}
                    placeholder="Para quem empreende na quebrada"
                    className={input}
                  />
                </Field>
              </div>
              <Field label="Texto da capa" hint="Vazio = o quiz começa direto na primeira pergunta.">
                <textarea name="intro" rows={3} value={v.intro} onChange={(e) => set("intro", e.target.value)} className={input} />
              </Field>
              <Field label="Botão da capa">
                <input name="ctaLabel" value={v.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} className={`${input} sm:max-w-xs`} />
              </Field>
            </div>
          </section>

          <section aria-labelledby="sec-passos" className="grid gap-5">
            <SectionTitle n={2} id="sec-passos">
              Perguntas
            </SectionTitle>
            {v.steps.length === 0 && (
              <p className="rounded-xl border border-dashed border-line p-5 text-muted">
                Nenhum passo ainda. Escolha abaixo o tipo do primeiro.
              </p>
            )}
            <ol className="grid gap-4">
              {v.steps.map((s, i) => {
                const info = KIND_INFO[s.kind];
                const issue = issues[i];
                return (
                  <li
                    key={s.id}
                    id={`passo-${i + 1}`}
                    className={`scroll-anchor grid gap-4 rounded-xl border bg-surface p-5 ${issue ? "border-warn/60" : "border-line"}`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-sm font-bold">
                        {i + 1}
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm">
                        <Icon name={info.icon} className="h-4 w-4 text-accent" />
                        <select
                          aria-label={`Tipo do passo ${i + 1}`}
                          value={s.kind}
                          onChange={(e) => {
                            const kind = e.target.value as StepKind;
                            setStep(i, { kind, options: isChoice(kind) && s.options.length < 2 ? ["", ""] : s.options });
                          }}
                          className="rounded-lg border border-line bg-bg py-1.5 pl-2 pr-7 text-sm font-semibold"
                        >
                          {(Object.keys(STEP_KINDS) as StepKind[]).map((k) => (
                            <option key={k} value={k}>
                              {KIND_INFO[k].short}
                            </option>
                          ))}
                        </select>
                      </span>
                      <div className="ml-auto flex gap-1.5">
                        <button type="button" className={iconBtn} disabled={i === 0} onClick={() => move(i, -1)}>
                          ↑<span className="sr-only"> Subir passo {i + 1}</span>
                        </button>
                        <button type="button" className={iconBtn} disabled={i === v.steps.length - 1} onClick={() => move(i, 1)}>
                          ↓<span className="sr-only"> Descer passo {i + 1}</span>
                        </button>
                        <button
                          type="button"
                          className={`${iconBtn} hover:!border-red-400 hover:!text-red-400`}
                          onClick={() => set("steps", v.steps.filter((_, j) => j !== i))}
                        >
                          Remover<span className="sr-only"> passo {i + 1}</span>
                        </button>
                      </div>
                    </div>

                    <Field label={s.kind === "info" || s.kind === "video" ? "Título da tela" : "Pergunta"}>
                      <input
                        id={`q-${s.id}`}
                        value={s.question}
                        onChange={(e) => setStep(i, { question: e.target.value })}
                        placeholder={isChoice(s.kind) ? "Ex.: Há quanto tempo seu negócio existe?" : undefined}
                        className={`${input} text-lg font-semibold`}
                      />
                    </Field>
                    <Field label="Texto de apoio (opcional)">
                      <textarea rows={2} value={s.hint} onChange={(e) => setStep(i, { hint: e.target.value })} className={input} />
                    </Field>

                    {isChoice(s.kind) && (
                      <fieldset className="grid gap-2">
                        <legend className="mb-2 font-semibold">
                          Opções <span className="font-normal text-muted">· {s.kind === "single" ? "a pessoa escolhe uma" : "a pessoa marca várias"}</span>
                        </legend>
                        {s.options.map((o, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className={`h-4 w-4 shrink-0 border-2 border-line ${s.kind === "single" ? "rounded-full" : "rounded"}`}
                            />
                            <input
                              aria-label={`Opção ${oi + 1} do passo ${i + 1}`}
                              value={o}
                              onChange={(e) => setStep(i, { options: s.options.map((x, xi) => (xi === oi ? e.target.value : x)) })}
                              onKeyDown={(e) => {
                                // Enter na última opção cria a próxima.
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  if (oi === s.options.length - 1 && o.trim()) setStep(i, { options: [...s.options, ""] });
                                }
                              }}
                              placeholder={`Opção ${oi + 1}`}
                              className={`${input} !py-2.5`}
                            />
                            <button
                              type="button"
                              className={iconBtn}
                              disabled={s.options.length <= 2}
                              onClick={() => setStep(i, { options: s.options.filter((_, xi) => xi !== oi) })}
                            >
                              ✕<span className="sr-only"> Remover opção {oi + 1} do passo {i + 1}</span>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="ml-6 justify-self-start text-sm font-semibold text-accent hover:underline"
                          onClick={() => setStep(i, { options: [...s.options, ""] })}
                        >
                          + Adicionar opção
                        </button>
                      </fieldset>
                    )}

                    {s.kind === "video" && (
                      <Field label="Link do vídeo" hint="YouTube (pode ser não listado), Vimeo ou arquivo .mp4.">
                        <input
                          type="url"
                          value={s.videoUrl ?? ""}
                          onChange={(e) => setStep(i, { videoUrl: e.target.value })}
                          placeholder="https://youtu.be/..."
                          className={input}
                        />
                      </Field>
                    )}

                    {s.kind !== "single" && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        {s.kind === "text" && (
                          <Field label="Exemplo dentro do campo">
                            <input value={s.placeholder} onChange={(e) => setStep(i, { placeholder: e.target.value })} className={input} />
                          </Field>
                        )}
                        <Field label="Texto do botão" hint="Vazio = Continuar">
                          <input value={s.buttonLabel} onChange={(e) => setStep(i, { buttonLabel: e.target.value })} className={input} />
                        </Field>
                      </div>
                    )}

                    {issue && (
                      <p className="flex items-center gap-2 rounded-lg bg-warn-bg px-3 py-2 text-sm text-warn">
                        <Icon name="alert" className="h-4 w-4 shrink-0" />
                        {issue} Sem isso, o passo é descartado ao salvar.
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>

            <fieldset className="rounded-xl border border-dashed border-line p-4">
              <legend className="px-2 font-semibold">Adicionar passo</legend>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {(Object.keys(STEP_KINDS) as StepKind[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => addStep(k)}
                    className="flex items-start gap-3 rounded-lg border border-line bg-surface p-3 text-left transition-colors hover:border-accent"
                  >
                    <Icon name={KIND_INFO[k].icon} className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span>
                      <span className="block text-sm font-semibold">+ {KIND_INFO[k].short}</span>
                      <span className="block text-xs text-muted">{KIND_INFO[k].desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          </section>

          <section aria-labelledby="sec-contato" className="grid gap-5">
            <SectionTitle n={3} id="sec-contato">
              Contato e agradecimento
            </SectionTitle>
            <div className="grid gap-5 rounded-xl border border-line bg-surface p-5">
              <Field label="Título da tela de contato">
                <input name="contactTitle" value={v.contactTitle} onChange={(e) => set("contactTitle", e.target.value)} className={input} />
              </Field>
              <fieldset>
                <legend className="font-semibold">O que pedir</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Nome", "WhatsApp"].map((f) => (
                    <span key={f} className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm">
                      <Icon name="lock" className="h-4 w-4 text-muted" />
                      {f} <span className="text-muted">(sempre)</span>
                    </span>
                  ))}
                  {(
                    [
                      ["askEmail", "E-mail"],
                      ["askInstagram", "Instagram"],
                    ] as const
                  ).map(([k, label]) => (
                    <label
                      key={k}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                        v[k] ? "border-accent bg-accent/10 font-semibold" : "border-line text-muted hover:border-accent/60"
                      }`}
                    >
                      <input type="checkbox" name={k} checked={v[k]} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4" />
                      {label}
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted">O aceite da política de privacidade é pedido sempre.</p>
              </fieldset>
              <div className="border-t border-line pt-5">
                <Field label="Título do agradecimento">
                  <input name="finalTitle" value={v.finalTitle} onChange={(e) => set("finalTitle", e.target.value)} className={input} />
                </Field>
              </div>
              <Field label="Texto do agradecimento">
                <textarea name="finalText" rows={3} value={v.finalText} onChange={(e) => set("finalText", e.target.value)} className={input} />
              </Field>
            </div>
          </section>
        </div>

        {/* Lateral: status, salvar, roteiro */}
        <aside className="order-last space-y-4 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="space-y-4 lg:sticky lg:top-6">
            <section aria-labelledby="pub-titulo" className="space-y-3 rounded-xl border border-line bg-surface p-4">
              <h2 id="pub-titulo" className="font-bold">
                Publicação
              </h2>
              <fieldset className="grid grid-cols-2 gap-2">
                <legend className="sr-only">Status do quiz</legend>
                {(
                  [
                    [true, "No ar"],
                    [false, "Rascunho"],
                  ] as const
                ).map(([val, label]) => (
                  <label
                    key={label}
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                      v.published === val ? "border-accent bg-accent/10 font-bold" : "border-line text-muted hover:border-accent/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="published"
                      value={val ? "on" : "off"}
                      checked={v.published === val}
                      onChange={() => set("published", val)}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
              <p className="text-xs text-muted">
                {v.published ? "Qualquer pessoa com o link consegue responder." : "Só você vê. O link não abre para visitantes."}
              </p>
              <button type="submit" disabled={pending} className="btn btn-primary w-full">
                {pending ? "Salvando..." : "Salvar quiz"}
              </button>
              {v.id && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-sm">
                  <Link href={`/painel/leads?quiz=${savedSlug}`} className="text-accent hover:underline">
                    Ver leads{leads != null ? ` (${leads})` : ""}
                  </Link>
                  {values.published && (
                    <Link href={`/quiz/${savedSlug}`} target="_blank" className="text-accent hover:underline">
                      Abrir quiz<span className="sr-only"> (nova aba)</span>
                    </Link>
                  )}
                </div>
              )}
            </section>

            <nav aria-labelledby="roteiro-titulo" className="rounded-xl border border-line bg-surface p-4">
              <h2 id="roteiro-titulo" className="text-sm font-bold uppercase tracking-wider text-muted">
                Roteiro do quiz
              </h2>
              <ol className="mt-3 space-y-1 text-sm">
                <li>
                  <a href="#sec-capa" className="flex gap-2 rounded px-1 py-0.5 hover:bg-surface-2">
                    <span className="w-5 shrink-0 text-muted">·</span>
                    <span className={v.intro.trim() ? "" : "text-muted"}>{v.intro.trim() ? "Capa" : "Sem capa"}</span>
                  </a>
                </li>
                {v.steps.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#passo-${i + 1}`}
                      onClick={() => setTab("editar")}
                      className="flex gap-2 rounded px-1 py-0.5 hover:bg-surface-2"
                    >
                      <span className="w-5 shrink-0 tabular-nums text-muted">{i + 1}.</span>
                      <span className={`min-w-0 truncate ${issues[i] ? "text-warn" : ""}`}>
                        {s.question.trim() || "(sem título)"}
                      </span>
                      {issues[i] && <span className="sr-only"> (incompleto)</span>}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#sec-contato" className="flex gap-2 rounded px-1 py-0.5 hover:bg-surface-2">
                    <span className="w-5 shrink-0 text-muted">·</span>
                    Contato e agradecimento
                  </a>
                </li>
              </ol>
              <p className={`mt-3 border-t border-line pt-3 text-xs ${asks === 0 || broken ? "text-warn" : "text-muted"}`}>
                {asks === 0
                  ? "Coloque pelo menos uma pergunta completa para salvar."
                  : broken
                    ? `${broken} ${broken === 1 ? "passo incompleto vai" : "passos incompletos vão"} ser descartado${broken === 1 ? "" : "s"}.`
                    : `${asks} ${asks === 1 ? "pergunta" : "perguntas"} + contato. Tudo certo.`}
              </p>
            </nav>
          </div>
        </aside>
      </form>

      {tab === "previa" && (
        <div className="rounded-xl border border-line bg-surface p-6 sm:p-10 lg:col-start-1 lg:row-start-2">
          <div className="mx-auto max-w-xl">
            <QuizRunner
              key={JSON.stringify(v)}
              preview
              quiz={{
                ...v,
                title: v.title || "Título do quiz",
                steps: v.steps
                  .filter((_, i) => !issues[i])
                  .map((s) => ({ ...s, options: s.options.filter((o) => o.trim()) })),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
