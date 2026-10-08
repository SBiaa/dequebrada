import { CountUp } from "@/components/motion/CountUp";
import { stagger } from "@/lib/motion";

export type StatItem = { value: string; label: string };

export function Stats({
  items,
  label = "De Quebrada em números",
}: {
  items: StatItem[];
  label?: string;
}) {
  return (
    <section aria-label={label} className="border-y border-line bg-surface px-5">
      <dl
        className={`mx-auto grid max-w-6xl grid-cols-2 ${items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}
      >
        {items.map((s, i) => (
          <div
            key={s.label}
            data-reveal=""
            style={stagger(i, 110)}
            className={`px-4 py-8 md:px-8 md:py-10 ${i > 0 ? "md:border-l md:border-line" : ""} ${i % 2 === 1 ? "border-l border-line md:border-l" : ""} ${i >= 2 ? "border-t border-line md:border-t-0" : ""}`}
          >
            <dd className="display text-5xl text-ink md:text-6xl">
              <CountUp value={s.value} />
            </dd>
            <dt className="mt-2 text-sm text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

export const BRAND_STATS: StatItem[] = [
  { value: "1,3M+", label: "views por mês" },
  { value: "5 anos", label: "construindo" },
  { value: "4x", label: "premiado" },
  { value: "600+", label: "episódios" },
];
