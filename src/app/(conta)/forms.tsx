"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, FormMessage } from "@/components/forms/Field";
import { loginAction, requestResetAction, resetPasswordAction } from "./actions";

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
