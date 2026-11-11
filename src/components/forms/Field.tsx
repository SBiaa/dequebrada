type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

const inputClass =
  "mt-2 block w-full rounded-lg border border-line bg-bg px-4 py-3 text-base text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function Field({ label, hint, id, name, ...rest }: Props) {
  const fieldId = id ?? name;
  return (
    <div>
      <label htmlFor={fieldId} className="block font-semibold">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        aria-describedby={hint ? `${fieldId}-hint` : undefined}
        className={inputClass}
        {...rest}
      />
      {hint && (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  label,
  hint,
  id,
  name,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  const fieldId = id ?? name;
  return (
    <div>
      <label htmlFor={fieldId} className="block font-semibold">
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        aria-describedby={hint ? `${fieldId}-hint` : undefined}
        className={`${inputClass} leading-relaxed`}
        {...rest}
      />
      {hint && (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

export function FormMessage({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (state?.error) {
    return (
      <p role="alert" className="rounded-lg border border-red-400/50 bg-red-500/10 px-4 py-3 text-red-200">
        {state.error}
      </p>
    );
  }
  if (state?.ok) {
    return (
      <p role="status" className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-3">
        {state.ok}
      </p>
    );
  }
  return null;
}

export { inputClass };
