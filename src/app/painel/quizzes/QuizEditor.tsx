"use client";

import { UnsavedGuard } from "@/components/forms/UnsavedGuard";
import { useActionState, useState } from "react";
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

const input = "w-full rounded-lg border border-line bg-surface p-3";
const small = "btn btn-ghost !min-h-9 !px-3 !text-sm";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="font-semibold">{label}</span>
      {children}
      {hint && <span className="text-sm text-muted">{hint}</span>}
    </label>
  );
}

export function QuizEditor({ values, notice }: { values: QuizValues; notice?: string }) {
  const [state, action, pending] = useActionState(saveQuizAction, undefined);
  const [v, setV] = useState(values);
  const [showPreview, setShowPreview] = useState(false);
  const set = <K extends keyof QuizValues>(k: K, val: QuizValues[K]) => setV((x) => ({ ...x, [k]: val }));

  const setStep = (i: number, patch: Partial<QuizStep>) =>
    set("steps", v.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, d: number) => {
    const list = [...v.steps];
    const [s] = list.splice(i, 1);
    list.splice(i + d, 0, s);
    set("steps", list);
  };
  const addStep = (kind: StepKind) =>
    set("steps", [
      ...v.steps,
      {
        id: newStepId(),
        kind,
        question: "",
        hint: "",
        options: kind === "single" || kind === "multi" ? ["", ""] : [],
        placeholder: "",
        buttonLabel: "",
        videoUrl: "",
      },
    ]);

  const message = state?.error ?? state?.ok ?? notice;

  return (
    <form action={action} className="grid gap-8">
      <UnsavedGuard />
      <input type="hidden" name="id" value={v.id} />
      <input type="hidden" name="steps" value={JSON.stringify(v.steps)} />

      {message && (
        <p
          key={state?.at}
          role={state?.error ? "alert" : "status"}
          className={`rounded-lg border p-4 font-semibold ${state?.error ? "border-red-500 text-red-500" : "border-accent"}`}
        >
          {message}
        </p>
      )}

      <section className="grid gap-5 rounded-xl border border-line p-5">
        <h2 className="text-xl font-bold">Capa</h2>
        <Field label="Título">
          <input name="title" required value={v.title} onChange={(e) => set("title", e.target.value)} className={input} />
        </Field>
        <Field label="Endereço" hint={`O quiz fica em /quiz/${v.slug || "…"}. Vazio = gerado pelo título.`}>
          <input name="slug" value={v.slug} onChange={(e) => set("slug", e.target.value)} className={input} />
        </Field>
        <Field label="Chamada acima do título" hint="Ex.: Exclusivo para empreendedores e especialistas">
          <input name="eyebrow" value={v.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} className={input} />
        </Field>
        <Field label="Texto da capa" hint="Vazio = o quiz começa direto na primeira pergunta.">
          <textarea name="intro" rows={3} value={v.intro} onChange={(e) => set("intro", e.target.value)} className={input} />
        </Field>
        <Field label="Botão da capa">
          <input name="ctaLabel" value={v.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} className={input} />
        </Field>
      </section>

      <section className="grid gap-5">
        <h2 className="text-xl font-bold">Passos</h2>
        {v.steps.length === 0 && <p className="text-muted">Nenhum passo ainda. Adicione abaixo.</p>}
        {v.steps.map((s, i) => (
          <div key={s.id} className="grid gap-4 rounded-xl border border-line p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold">
                Passo {i + 1} · {STEP_KINDS[s.kind]}
              </p>
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label={`Tipo do passo ${i + 1}`}
                  value={s.kind}
                  onChange={(e) => {
                    const kind = e.target.value as StepKind;
                    const needs = kind === "single" || kind === "multi";
                    setStep(i, { kind, options: needs && s.options.length < 2 ? ["", ""] : s.options });
                  }}
                  className="rounded-lg border border-line bg-surface px-2 text-sm"
                >
                  {Object.entries(STEP_KINDS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
                <button type="button" className={small} disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑<span className="sr-only"> Subir passo {i + 1}</span>
                </button>
                <button type="button" className={small} disabled={i === v.steps.length - 1} onClick={() => move(i, 1)}>
                  ↓<span className="sr-only"> Descer passo {i + 1}</span>
                </button>
                <button
                  type="button"
                  className={small}
                  onClick={() => set("steps", v.steps.filter((_, j) => j !== i))}
                >
                  Remover<span className="sr-only"> passo {i + 1}</span>
                </button>
              </div>
            </div>
            <Field label={s.kind === "info" || s.kind === "video" ? "Título da tela" : "Pergunta"}>
              <input value={s.question} onChange={(e) => setStep(i, { question: e.target.value })} className={input} />
            </Field>
            <Field label="Texto de apoio (opcional)">
              <textarea rows={2} value={s.hint} onChange={(e) => setStep(i, { hint: e.target.value })} className={input} />
            </Field>
            {(s.kind === "single" || s.kind === "multi") && (
              <div className="grid gap-2">
                <span className="font-semibold">Opções</span>
                {s.options.map((o, oi) => (
                  <div key={oi} className="flex gap-2">
                    <input
                      aria-label={`Opção ${oi + 1} do passo ${i + 1}`}
                      value={o}
                      onChange={(e) =>
                        setStep(i, { options: s.options.map((x, xi) => (xi === oi ? e.target.value : x)) })
                      }
                      className={input}
                    />
                    <button
                      type="button"
                      className={small}
                      onClick={() => setStep(i, { options: s.options.filter((_, xi) => xi !== oi) })}
                    >
                      ✕<span className="sr-only"> Remover opção {oi + 1}</span>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={`${small} justify-self-start`}
                  onClick={() => setStep(i, { options: [...s.options, ""] })}
                >
                  + Opção
                </button>
                {s.options.filter((o) => o.trim()).length < 2 && (
                  <span className="text-sm text-red-500">Coloque pelo menos 2 opções, senão o passo é descartado.</span>
                )}
              </div>
            )}
            {s.kind === "video" && (
              <Field
                label="Link do vídeo"
                hint="Cole o link do YouTube (pode ser não listado), do Vimeo ou de um arquivo .mp4."
              >
                <input
                  type="url"
                  value={s.videoUrl ?? ""}
                  onChange={(e) => setStep(i, { videoUrl: e.target.value })}
                  placeholder="https://youtu.be/..."
                  className={input}
                />
                {s.videoUrl?.trim() && !videoEmbed(s.videoUrl) && (
                  <span className="text-sm text-red-500">Não reconheci esse link, o passo vai ser descartado.</span>
                )}
              </Field>
            )}
            {s.kind === "text" && (
              <Field label="Texto de exemplo no campo">
                <input value={s.placeholder} onChange={(e) => setStep(i, { placeholder: e.target.value })} className={input} />
              </Field>
            )}
            {s.kind !== "single" && (
              <Field label="Texto do botão" hint="Vazio = Continuar">
                <input value={s.buttonLabel} onChange={(e) => setStep(i, { buttonLabel: e.target.value })} className={input} />
              </Field>
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {Object.entries(STEP_KINDS).map(([k, label]) => (
            <button key={k} type="button" className={small} onClick={() => addStep(k as StepKind)}>
              + {label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 rounded-xl border border-line p-5">
        <h2 className="text-xl font-bold">Contato e final</h2>
        <p className="text-sm text-muted">Nome, WhatsApp e o aceite da política de privacidade são sempre pedidos.</p>
        <Field label="Título da tela de contato">
          <input name="contactTitle" value={v.contactTitle} onChange={(e) => set("contactTitle", e.target.value)} className={input} />
        </Field>
        <label className="flex items-center gap-3">
          <input type="checkbox" name="askEmail" checked={v.askEmail} onChange={(e) => set("askEmail", e.target.checked)} />
          Pedir e-mail
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="askInstagram"
            checked={v.askInstagram}
            onChange={(e) => set("askInstagram", e.target.checked)}
          />
          Pedir Instagram
        </label>
        <Field label="Título do agradecimento">
          <input name="finalTitle" value={v.finalTitle} onChange={(e) => set("finalTitle", e.target.value)} className={input} />
        </Field>
        <Field label="Texto do agradecimento">
          <textarea name="finalText" rows={3} value={v.finalText} onChange={(e) => set("finalText", e.target.value)} className={input} />
        </Field>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 font-semibold">
          <input type="checkbox" name="published" checked={v.published} onChange={(e) => set("published", e.target.checked)} />
          No ar
        </label>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Salvando..." : "Salvar quiz"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setShowPreview((p) => !p)}>
          {showPreview ? "Fechar prévia" : "Ver prévia"}
        </button>
      </div>

      {showPreview && (
        <div className="rounded-xl border border-dashed border-line p-6">
          <QuizRunner
            key={JSON.stringify(v)}
            preview
            quiz={{
              ...v,
              title: v.title || "Título do quiz",
              steps: v.steps
                .map((s) => ({ ...s, options: s.options.filter((o) => o.trim()) }))
                .filter(
                  (s) =>
                    s.question.trim() &&
                    (s.kind === "video"
                      ? !!videoEmbed(s.videoUrl ?? "")
                      : s.kind === "text" || s.kind === "info" || s.options.length >= 2),
                ),
            }}
          />
        </div>
      )}
    </form>
  );
}
