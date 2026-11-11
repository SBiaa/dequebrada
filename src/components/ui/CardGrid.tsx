import { Marked } from "./Marked";
import { stagger } from "@/lib/motion";
import { IconTile, type IconName } from "./Icon";

export type CardItem = { title: string; text: string; tag?: string; icon?: IconName };

type Props = {
  items: CardItem[];
  /** "cross" mostra o ✗ das dores; "number" numera os cards. */
  marker?: "cross" | "number" | "none";
  columns?: "2" | "3";
};

export function CardGrid({ items, marker = "none", columns = "3" }: Props) {
  return (
    <ul className={`grid gap-5 sm:grid-cols-2 ${columns === "3" ? "lg:grid-cols-3" : ""}`}>
      {items.map((item, i) => (
        <li key={item.title} data-reveal="" style={stagger(i % 3, 100)}>
          <div className="lift flex h-full flex-col gap-3 rounded-xl border border-line bg-surface p-6 md:p-7">
          {item.icon && <IconTile name={item.icon} />}
          {!item.icon && marker === "cross" && (
            <span aria-hidden="true" className="text-lg font-bold text-accent">
              ✗
            </span>
          )}
          {!item.icon && marker === "number" && (
            <span aria-hidden="true" className="display text-3xl text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
          )}
          {item.tag && <p className="eyebrow">{item.tag}</p>}
          <h3 className="text-lg font-bold leading-snug tracking-tight">{item.title}</h3>
          <p className="text-muted"><Marked>{item.text}</Marked></p>
          </div>
        </li>
      ))}
    </ul>
  );
}
