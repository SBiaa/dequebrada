"use client";

import { useActionState } from "react";
import { FormMessage, inputClass } from "@/components/forms/Field";
import { saveCategoryAction } from "../actions";

export function CategoryForm({ id, name = "", compact }: { id?: number; name?: string; compact?: boolean }) {
  const [state, action, pending] = useActionState(saveCategoryAction, undefined);
  const fieldId = id ? `cat-${id}` : "cat-nova";
  return (
    <form action={action} className="space-y-3">
      {id && <input type="hidden" name="id" value={id} />}
      <FormMessage state={state} />
      <label htmlFor={fieldId} className={compact ? "sr-only" : "block font-semibold"}>
        {id ? `Nome da categoria ${name}` : "Nova categoria"}
      </label>
      <div className="flex gap-2">
        <input id={fieldId} name="name" defaultValue={name} maxLength={60} required className={`${inputClass} !mt-0`} />
        <button type="submit" className="btn btn-primary shrink-0" disabled={pending}>
          {id ? "Renomear" : "Adicionar"}
        </button>
      </div>
    </form>
  );
}
