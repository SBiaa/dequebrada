"use client";

import { useActionState, useEffect, useRef } from "react";
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
      <div className="grid gap-5 sm:grid-cols-2">
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

export function SnapshotForm({ accountId, today }: { accountId: string; today: string }) {
  const [state, action, pending] = useActionState(saveSnapshotAction, undefined);
  const ref = useResetOnOk(state);
  return (
    <form ref={ref} action={action} className="grid gap-5">
      <input type="hidden" name="accountId" value={accountId} />
      <Msg state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Data" name="day" type="date" required defaultValue={today} max={today} />
        <Field label="Seguidores" name="followers" inputMode="numeric" required placeholder="Ex.: 1250" />
        <Field label="Alcance (opcional)" name="reach" inputMode="numeric" hint="Contas alcançadas no período, nos insights." />
        <Field label="Visitas ao perfil (opcional)" name="profileVisits" inputMode="numeric" />
        <Field label="Cliques no link (opcional)" name="linkClicks" inputMode="numeric" />
        <Field label="Observação (opcional)" name="note" maxLength={300} placeholder="Ex.: fiz sorteio essa semana" />
      </div>
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
  return (
    <form ref={ref} action={action} className="grid gap-5">
      <input type="hidden" name="accountId" value={accountId} />
      {v && <input type="hidden" name="postId" value={v.id} />}
      <Msg state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id("day")} label="Data" name="day" type="date" required defaultValue={v?.day ?? today} max={today} />
        <div>
          <label htmlFor={id("format")} className="block font-semibold">
            Formato
          </label>
          <select id={id("format")} name="format" className={selectCls} defaultValue={v?.format ?? formats[0]}>
            {formats.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>
      <Field id={id("title")} label="Sobre o que foi o post" name="title" required maxLength={200} defaultValue={v?.title} />
      <Field id={id("url")} label="Link do post (opcional)" name="url" type="url" defaultValue={v?.url} placeholder="https://" />
      <fieldset className="grid gap-5 rounded-xl border border-line p-4 sm:grid-cols-3">
        <legend className="px-2 font-semibold">Resultados (preencha o que tiver)</legend>
        <Field id={id("reach")} label="Alcance" name="reach" inputMode="numeric" defaultValue={v?.reach} />
        <Field id={id("likes")} label="Curtidas" name="likes" inputMode="numeric" defaultValue={v?.likes} />
        <Field id={id("comments")} label="Comentários" name="comments" inputMode="numeric" defaultValue={v?.comments} />
        <Field id={id("shares")} label="Compartilhamentos" name="shares" inputMode="numeric" defaultValue={v?.shares} />
        <Field id={id("saves")} label="Salvos" name="saves" inputMode="numeric" defaultValue={v?.saves} />
        <Field
          id={id("leads")}
          label="Contatos ou vendas"
          name="leads"
          inputMode="numeric"
          defaultValue={v?.leads}
          hint="Quantas pessoas chamaram ou compraram por causa do post."
        />
      </fieldset>
      <Field id={id("note")} label="Observação (opcional)" name="note" maxLength={500} defaultValue={v?.note} />
      <button type="submit" disabled={pending} className="btn btn-primary justify-self-start">
        {pending ? "Salvando..." : v ? "Salvar alterações" : "Registrar post"}
      </button>
    </form>
  );
}
