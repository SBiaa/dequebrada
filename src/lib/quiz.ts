/** Tipos e validação dos passos de um quiz (guardados como JSON em quizzes.steps). */

export const STEP_KINDS = {
  single: "Escolha única",
  multi: "Várias escolhas",
  text: "Resposta escrita",
  info: "Tela de texto (sem pergunta)",
} as const;

export type StepKind = keyof typeof STEP_KINDS;

export type QuizStep = {
  id: string;
  kind: StepKind;
  /** Pergunta, ou título da tela de texto. */
  question: string;
  /** Texto de apoio abaixo do título. */
  hint: string;
  /** Opções (só em single/multi). */
  options: string[];
  /** Placeholder da resposta escrita. */
  placeholder: string;
  /** Texto do botão de seguir (multi, text e info). */
  buttonLabel: string;
};

const MAX_STEPS = 20;

export function newStepId() {
  return Math.random().toString(36).slice(2, 10);
}

function str(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Lê e limpa o JSON de passos. Passos inválidos são descartados. */
export function parseSteps(raw: string): QuizStep[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out: QuizStep[] = [];
  const seen = new Set<string>();
  for (const item of data.slice(0, MAX_STEPS)) {
    if (!item || typeof item !== "object") continue;
    const s = item as Record<string, unknown>;
    const kind = (typeof s.kind === "string" && s.kind in STEP_KINDS ? s.kind : "single") as StepKind;
    let id = str(s.id, 20).replace(/[^a-z0-9]/gi, "") || newStepId();
    while (seen.has(id)) id = newStepId();
    seen.add(id);
    const options = Array.isArray(s.options)
      ? [...new Set(s.options.map((o) => str(o, 150)).filter(Boolean))].slice(0, 12)
      : [];
    const step: QuizStep = {
      id,
      kind,
      question: str(s.question, 300),
      hint: str(s.hint, 600),
      options: kind === "single" || kind === "multi" ? options : [],
      placeholder: str(s.placeholder, 150),
      buttonLabel: str(s.buttonLabel, 60),
    };
    if (!step.question) continue;
    if ((kind === "single" || kind === "multi") && step.options.length < 2) continue;
    out.push(step);
  }
  return out;
}

/** Problemas que impedem salvar o quiz (mostrados no painel). */
export function stepProblems(steps: QuizStep[]): string | null {
  const asks = steps.filter((s) => s.kind !== "info");
  if (asks.length === 0) return "Coloque pelo menos uma pergunta.";
  return null;
}

/** Confere as respostas recebidas contra os passos e devolve { pergunta: resposta }. */
export function cleanAnswers(steps: QuizStep[], input: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of steps) {
    const v = input?.[s.id];
    if (s.kind === "single" && typeof v === "string" && s.options.includes(v)) out[s.question] = v;
    if (s.kind === "multi" && Array.isArray(v)) {
      const picked = s.options.filter((o) => v.includes(o));
      if (picked.length) out[s.question] = picked.join(", ");
    }
    if (s.kind === "text" && typeof v === "string" && v.trim()) out[s.question] = v.trim().slice(0, 1000);
  }
  return out;
}
