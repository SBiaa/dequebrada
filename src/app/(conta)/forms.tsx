"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, FormMessage } from "@/components/forms/Field";
import {
  deleteAccountAction,
  loginAction,
  requestResetAction,
  resetPasswordAction,
  signupAction,
} from "./actions";

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending} aria-disabled={pending}>
      {pending ? "Aguarde..." : children}
    </button>
  );
}

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState(loginAction, notice ? { ok: notice } : undefined);
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormMessage state={state} />
      <Field
        key={state?.error}
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state?.email}
        required
      />
      <Field label="Senha" name="password" type="password" autoComplete="current-password" required />
      <Submit pending={pending}>Entrar</Submit>
      <p className="text-center">
        <Link href="/esqueci-senha" className="text-accent underline-offset-4 hover:underline">
          Esqueci minha senha
        </Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestResetAction, undefined);
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field label="E-mail da sua conta" name="email" type="email" autoComplete="email" required />
      <Submit pending={pending}>Enviar link</Submit>
      <p className="text-center">
        <Link href="/entrar" className="text-accent underline-offset-4 hover:underline">
          Voltar para o login
        </Link>
      </p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <Field
        label="Nova senha"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        hint="Pelo menos 8 caracteres."
        required
      />
      <Field label="Repita a nova senha" name="confirm" type="password" autoComplete="new-password" required />
      <Submit pending={pending}>Salvar nova senha</Submit>
    </form>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, undefined);
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field
        key={`n${state?.at}`}
        label="Nome"
        name="name"
        autoComplete="name"
        defaultValue={state?.name}
        required
        maxLength={100}
      />
      <Field
        key={`e${state?.at}`}
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state?.email}
        required
      />
      <Field
        label="Senha"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        hint="Pelo menos 8 caracteres."
        required
      />
      <Field label="Repita a senha" name="confirm" type="password" autoComplete="new-password" required />
      <label className="flex gap-3 text-sm leading-relaxed">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0" />
        <span>
          Li e aceito a{" "}
          <Link href="/politica-de-privacidade" className="text-accent underline underline-offset-4" target="_blank">
            Política de Privacidade
            <span className="sr-only"> (abre em nova aba)</span>
          </Link>
          . Meus dados (nome, e-mail) são usados só para a minha conta na área de membros.
        </span>
      </label>
      <Submit pending={pending}>Criar conta</Submit>
      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/entrar?next=/membros" className="text-accent underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccountAction, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <Field
        label="Digite sua senha para confirmar"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <button type="submit" disabled={pending} className="btn w-full border-red-400/60 text-red-200 hover:bg-red-500/10">
        {pending ? "Aguarde..." : "Excluir minha conta e meus dados"}
      </button>
    </form>
  );
}
