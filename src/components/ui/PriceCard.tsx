import { Icon } from "./Icon";

type Props = {
  name: string;
  forWho: string;
  items: string[];
  price: string;
  note?: string;
  badge?: string;
};

export function PriceCard({ name, forWho, items, price, note, badge }: Props) {
  return (
    <article
      className={`relative flex h-full flex-col rounded-xl border bg-surface p-7 ${badge ? "border-accent" : "border-line"}`}
    >
      {badge && (
        <p className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-ink">
          {badge}
        </p>
      )}
      <h3 className="text-2xl font-bold tracking-tight">{name}</h3>
      <p className="mt-2 text-muted">{forWho}</p>
      <ul className="mt-6 flex-1 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="display mt-7 border-t border-line pt-6 text-5xl">{price}</p>
      {note && <p className="mt-2 text-sm text-muted">{note}</p>}
    </article>
  );
}
