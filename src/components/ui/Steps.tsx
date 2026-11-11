import { Marked } from "./Marked";
import { stagger } from "@/lib/motion";
import { IconTile, type IconName } from "./Icon";

export type StepItem = { title: string; text: string; icon?: IconName };

export function Steps({ items }: { items: StepItem[] }) {
  const cols =
    items.length === 5 ? "lg:grid-cols-5" : items.length === 4 ? "lg:grid-cols-4" : "md:grid-cols-3";
  return (
    <ol className={`grid gap-x-8 gap-y-10 sm:grid-cols-2 ${cols}`}>
      {items.map((step, i) => (
        <li
          key={step.title}
          data-reveal=""
          style={stagger(i, 110)}
          className="border-t-2 border-accent pt-5"
        >
          <div className="flex items-center justify-between">
            {step.icon ? <IconTile name={step.icon} /> : null}
            <span aria-hidden="true" className="display text-4xl text-accent/60">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight">{step.title}</h3>
          <p className="mt-2 text-muted"><Marked>{step.text}</Marked></p>
        </li>
      ))}
    </ol>
  );
}
