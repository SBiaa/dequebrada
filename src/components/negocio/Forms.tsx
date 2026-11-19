"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Field, TextArea } from "@/components/forms/Field";
import {
  addAccountAction,
  saveBusinessAction,
  savePostAction,
  saveSnapshotAction,
  type NegocioState,
} from "@/app/membros/negocio/actions";

const selectCls =
  "mt-2 block w-full rounded-lg border border-line bg-bg px-4 py-3 text-base text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

function Msg({ state }: { state: NegocioState }) {
  if (!state) return null;
  return (
    <p
      key={state.at}
      role={state.error ? "alert" : "status"}
      className={`rounded-lg border p-3 font-semibold ${state.error ? "border-red-500 text-red-500" : "border-accent"}`}
    >
      {state.error ?? state.ok}
    </p>
  );
}

/** Limpa o formulário depois de salvar com sucesso. */
function useResetOnOk(state: NegocioState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return ref;
}

export function BusinessForm({
  values,
}: {
  values: { name: string; segment: string; city: string; description: string } | null;
}) {
  const [state, action, pending] = useActionState(saveBusinessAction, undefined);
  return (
    <form action={action} className="grid gap-5">
      <Msg state={state} />
      <Field label="Nome do negócio" name="name" required maxLength={120} defaultValue={values?.name} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ramo" name="segment" maxLength={120} placeholder="Ex.: barbearia, confeitaria" defaultValue={values?.segment} />
        <Field label="Cidade" name="city" maxLength={120} defaultValue={values?.city} />
      </div>
      <TextArea label="Sobre o negócio (opcional)" name="description" rows={3} maxLength={1000} defaultValue={values?.description} />
      <button type="submit" disabled={pending} className="btn btn-primary justify-self-start">
        {pending ? "Salvando..." : "Salvar negócio"}
      </button>
    </form>
  );
}

export function AccountForm({ networks, base }: { networks: Record<string, string>; base: string }) {
  const [state, action, pending] = useActionState(addAccountAction, undefined);
  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="base" value={base} />
      <Msg state={state} />
      <div className="grid gap-4">
        <div>
          <label htmlFor="network" className="block font-semibold">
            Rede
          </label>
          <select id="network" name="network" className={selectCls} defaultValue="instagram">
            {Object.entries(networks).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <Field label="Perfil" name="handle" required maxLength={100} placeholder="@seunegocio" />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary justify-self-start">
        {pending ? "Adicionando..." : "Adicionar rede"}
      </button>
    </form>
  );
}

/** "1.250" ou "1250" → 1250. null se vazio ou inválido. */
function parseNum(raw: string): number | null {
  const s = raw.replace(/[.\s]/g, "");
  return /^\d+$/.test(s) ? Number(s) : null;
}
const fmtN = (n: number) => n.toLocaleString("pt-BR");
const fmtD = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

export type LastSnapshot = { day: string; followers: number } | null;

export function SnapshotForm({
  accountId,
  today,
  last,
  tip,
}: {
  accountId: string;
  today: string;
  /** Último registro, para comparar enquanto digita. */
  last?: LastSnapshot;
  /** Onde achar os números nessa rede. */
  tip?: string;
}) {
  const [state, action, pending] = useActionState(saveSnapshotAction, undefined);
  const ref = useResetOnOk(state);
  const [followers, setFollowers] = useState("");
  const [lastSaved, setLastSaved] = useState(state);
  if (state !== lastSaved) {
    setLastSaved(state);
    if (state?.ok) setFollowers("");
  }
  const n = parseNum(followers);
  const diff = n != null && last ? n - last.followers : null;

  return (
    <form ref={ref} action={action} className="grid gap-5">
      <input type="hidden" name="accountId" value={accountId} />
      <Msg state={state} />
      {tip && <p className="text-sm text-muted">{tip}</p>}

      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] sm:items-start">
        <Field label="Data" name="day" type="date" required defaultValue={today} max={today} />
        <div>
          <label htmlFor="snap-followers" className="block font-semibold">
            Seguidores
          </label>
          <input
            id="snap-followers"
            name="followers"
            inputMode="numeric"
            required
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            placeholder={last ? fmtN(last.followers) : "Ex.: 1.250"}
            aria-describedby="snap-followers-hint"
            className="mt-2 block w-full rounded-lg border border-line bg-bg px-4 py-3 text-2xl font-bold tabular-nums text-ink placeholder:font-normal placeholder:text-muted/60 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <p id="snap-followers-hint" className="mt-1.5 text-sm" aria-live="polite">
            {diff != null ? (
              <span className={diff >= 0 ? "font-semibold text-accent" : "font-semibold text-red-400"}>
                {diff >= 0 ? "+" : "−"}
                {fmtN(Math.abs(diff))} desde {fmtD(last!.day)}
              </span>
            ) : last ? (
              <span className="text-muted">
                Último registro: {fmtN(last.followers)} em {fmtD(last.day)}
              </span>
            ) : (
              <span className="text-muted">Primeiro registro desta rede.</span>
            )}
          </p>
        </div>
      </div>

      <details className="rounded-lg border border-line p-4">
        <summary className="cursor-pointer font-semibold">Mais números dos insights (opcional)</summary>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <Field label="Alcance" name="reach" inputMode="numeric" hint="Contas alcançadas no período." />
          <Field label="Visitas ao perfil" name="profileVisits" inputMode="numeric" />
          <Field label="Cliques no link" name="linkClicks" inputMode="numeric" />
        </div>
      </details>
      <Field label="Observação (opcional)" name="note" maxLength={300} placeholder="Ex.: fiz sorteio essa semana" />

      <button type="submit" disabled={pending} className="btn btn-primary justify-self-start">
        {pending ? "Salvando..." : "Salvar números"}
      </button>
    </form>
  );
}

export type PostValues = {
  id: string;
  day: string;
  format: string;
  title: string;
  url: string;
  reach: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
  leads: string;
  note: string;
};

const RESULTS = [
  { k: "reach", label: "Alcance" },
  { k: "likes", label: "Curtidas" },
  { k: "comments", label: "Comentários" },
  { k: "shares", label: "Compartilhamentos" },
  { k: "saves", label: "Salvos" },
  { k: "leads", label: "Contatos ou vendas" },
] as const;
type ResultKey = (typeof RESULTS)[number]["k"];

export function PostForm({
  accountId,
  today,
  formats,
  values,
}: {
  accountId: string;
  today: string;
  formats: readonly string[];
  values?: PostValues;
}) {
  const [state, action, pending] = useActionState(savePostAction, undefined);
  const ref = useResetOnOk(values ? undefined : state);
  const v = values;
  const id = (k: string) => (v ? `${k}-${v.id}` : `post-${k}`);
  const empty: Record<ResultKey, string> = { reach: "", likes: "", comments: "", shares: "", saves: "", leads: "" };
  const initial: Record<ResultKey, string> = v
    ? { reach: v.reach, likes: v.likes, comments: v.comments, shares: v.shares, saves: v.saves, leads: v.leads }
    : empty;
  const [res, setRes] = useState(initial);
  const [format, setFormat] = useState(v?.format ?? formats[0]);
  const [lastSaved, setLastSaved] = useState(state);
  if (state !== lastSaved) {
    setLastSaved(state);
    if (state?.ok && !v) {
      setRes(empty);
      setFormat(formats[0]);
    }
  }

  const reach = parseNum(res.reach);
  const inter = (["likes", "comments", "shares", "saves"] as const).reduce((a, k) => a + (parseNum(res[k]) ?? 0), 0);
  const rate = reach ? (inter / reach) * 100 : null;

  return (
    <form ref={ref} action={action} className="grid gap-5">
      <input type="hidden" name="accountId" value={accountId} />
      {v && <input type="hidden" name="postId" value={v.id} />}
      <Msg state={state} />

      <fieldset>
        <legend className="font-semibold">Formato</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {formats.map((f) => {
            const on = format === f;
            return (
              <label
                key={f}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                  on ? "border-accent bg-accent/10 font-semibold" : "border-line text-muted hover:border-accent/60 hover:text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={f}
                  checked={on}
                  onChange={() => setFormat(f)}
                  className="sr-only"
                />
                {f}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <Field id={id("day")} label="Data" name="day" type="date" required defaultValue={v?.day ?? today} max={today} />
        <Field id={id("title")} label="Sobre o que foi o post" name="title" required maxLength={200} defaultValue={v?.title} />
      </div>
      <Field id={id("url")} label="Link do post (opcional)" name="url" type="url" defaultValue={v?.url} placeholder="https://" />

      <fieldset className="rounded-xl border border-line p-4">
        <legend className="px-2 font-semibold">Resultados (preencha o que tiver)</legend>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {RESULTS.map((r) => (
            <div key={r.k}>
              <label htmlFor={id(r.k)} className="block text-sm font-semibold">
                {r.label}
              </label>
              <input
                id={id(r.k)}
                name={r.k}
                inputMode="numeric"
                value={res[r.k]}
                onChange={(e) => setRes((p) => ({ ...p, [r.k]: e.target.value }))}
                className="mt-1.5 block w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base tabular-nums text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-surface-2 px-3 py-2 text-sm" aria-live="polite">
          {rate != null ? (
            <>
              Engajamento: <strong className="text-accent">{rate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</strong>{" "}
              <span className="text-muted">({fmtN(inter)} interações ÷ {fmtN(reach!)} de alcance)</span>
            </>
          ) : (
            <span className="text-muted">Preencha o alcance para ver o engajamento do post.</span>
          )}
        </p>
      </fieldset>

      <Field id={id("note")} label="Observação (opcional)" name="note" maxLength={500} defaultValue={v?.note} />
      <button type="submit" disabled={pending} className="btn btn-primary justify-self-start">
        {pending ? "Salvando..." : v ? "Salvar alterações" : "Registrar post"}
      </button>
    </form>
  );
}
