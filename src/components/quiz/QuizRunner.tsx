"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { saveLeadAction } from "@/app/quiz/[slug]/actions";
import type { QuizStep } from "@/lib/quiz";
import { whatsappUrl } from "@/lib/whatsapp";

export type QuizView = {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  ctaLabel: string;
  steps: QuizStep[];
  contactTitle: string;
  askEmail: boolean;
  askInstagram: boolean;
  finalTitle: string;
  finalText: string;
};

/** Quiz passo a passo. Com `preview`, não envia nada (usado no painel). */
export function QuizRunner({ quiz, preview = false }: { quiz: QuizView; preview?: boolean }) {
  const hasCover = quiz.intro.trim() !== "";
  // -1 = capa; 0..n-1 = passos; n = contato.
  const [step, setStep] = useState(hasCover ? -1 : 0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", instagram: "", consent: false });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const total = quiz.steps.length + 1;
  const current = step >= 0 ? quiz.steps[step] : undefined;
  const next = () => setStep((s) => s + 1);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (preview) {
      setDone(true);
      return;
    }
    startTransition(async () => {
      const res = await saveLeadAction({ slug: quiz.slug, ...form, answers });
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  const header = (
    <>
      {quiz.eyebrow && <p className="eyebrow">{quiz.eyebrow}</p>}
      <h1 className="mt-3 text-3xl font-bold md:text-4xl">{quiz.title}</h1>
    </>
  );

  if (done) {
    const resumo = quiz.steps
      .filter((s) => s.kind !== "info" && answers[s.id])
      .map((s) => `• ${s.question} ${[answers[s.id]].flat().join(", ")}`)
      .join("\n");
    const msg = `Oi! Sou ${form.name.trim()} e acabei de responder o quiz "${quiz.title}" no site.\n${resumo}`;
    return (
      <div className="text-center" role="status">
        <p className="eyebrow">{quiz.finalTitle}</p>
        <h2 className="h2-section mt-3">Valeu, {form.name.trim().split(" ")[0] || "você"}!</h2>
        <p className="mt-4 whitespace-pre-line text-lg text-muted">{quiz.finalText}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={whatsappUrl(msg)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Falar no WhatsApp
          </a>
          <Link href="/" className="btn btn-ghost">
            Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  if (step === -1) {
    return (
      <div className="text-center">
        {header}
        <p className="mt-6 whitespace-pre-line text-lg text-muted">{quiz.intro}</p>
        <button type="button" onClick={next} className="btn btn-primary mt-10 w-full">
          {quiz.ctaLabel || "Começar"}
        </button>
      </div>
    );
  }

  const inputCls = "rounded-lg border border-line bg-surface p-3";

  return (
    <div>
      {header}
      <div className="mt-10 flex items-center justify-between text-sm text-muted">
        <span>
          Passo {step + 1} de {total}
        </span>
        {step > (hasCover ? -1 : 0) && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="underline">
            Voltar
          </button>
        )}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface" aria-hidden>
        <div className="h-full bg-accent transition-all" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>

      {current ? (
        <div key={current.id} className="mt-10">
          <h2 className="h2-section">{current.question}</h2>
          {current.hint && <p className="mt-3 whitespace-pre-line text-muted">{current.hint}</p>}

          {current.kind === "single" && (
            <div className="mt-8 grid gap-3" role="group" aria-label={current.question}>
              {current.options.map((o) => (
                <button
                  key={o}
                  type="button"
                  aria-pressed={answers[current.id] === o}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, [current.id]: o }));
                    next();
                  }}
                  className={`rounded-xl border p-5 text-left text-lg font-semibold transition hover:border-accent ${
                    answers[current.id] === o ? "border-accent bg-surface" : "border-line"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          )}

          {current.kind === "multi" && (
            <fieldset className="mt-8 grid gap-3">
              <legend className="sr-only">{current.question}</legend>
              {current.options.map((o) => {
                const picked = ([answers[current.id]].flat().filter(Boolean) as string[]).includes(o);
                return (
                  <label
                    key={o}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-5 text-lg font-semibold transition hover:border-accent ${
                      picked ? "border-accent bg-surface" : "border-line"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={picked}
                      onChange={() =>
                        setAnswers((a) => {
                          const list = ([a[current.id]].flat().filter(Boolean) as string[]);
                          return { ...a, [current.id]: picked ? list.filter((x) => x !== o) : [...list, o] };
                        })
                      }
                      className="size-5"
                    />
                    {o}
                  </label>
                );
              })}
              <button type="button" onClick={next} className="btn btn-primary mt-2">
                {current.buttonLabel || "Continuar"}
              </button>
            </fieldset>
          )}

          {current.kind === "text" && (
            <div className="mt-8 grid gap-3">
              <textarea
                rows={4}
                aria-label={current.question}
                placeholder={current.placeholder}
                value={(answers[current.id] as string) ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [current.id]: e.target.value }))}
                className={inputCls}
              />
              <button type="button" onClick={next} className="btn btn-primary">
                {current.buttonLabel || "Continuar"}
              </button>
            </div>
          )}

          {current.kind === "info" && (
            <button type="button" onClick={next} className="btn btn-primary mt-8 w-full">
              {current.buttonLabel || "Continuar"}
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10 grid gap-5" noValidate>
          <h2 className="h2-section">{quiz.contactTitle}</h2>
          <label className="grid gap-2">
            <span className="font-semibold">Nome</span>
            <input
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold">WhatsApp com DDD</span>
            <input
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 90000-0000"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className={inputCls}
            />
          </label>
          {quiz.askEmail && (
            <label className="grid gap-2">
              <span className="font-semibold">E-mail</span>
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
              />
            </label>
          )}
          {quiz.askInstagram && (
            <label className="grid gap-2">
              <span className="font-semibold">Seu perfil do Instagram</span>
              <input
                placeholder="@seuperfil"
                autoComplete="off"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className={inputCls}
              />
            </label>
          )}
          <label className="flex items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              className="mt-1"
            />
            <span>
              Aceito ser contatado pelo De Quebrada e concordo com a{" "}
              <Link href="/politica-de-privacidade" className="underline">
                política de privacidade
              </Link>
              .
            </span>
          </label>
          {error && (
            <p className="font-semibold text-red-500" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Enviando..." : "Enviar"}
          </button>
          {preview && <p className="text-center text-sm text-muted">Prévia: nada é enviado.</p>}
        </form>
      )}
    </div>
  );
}
