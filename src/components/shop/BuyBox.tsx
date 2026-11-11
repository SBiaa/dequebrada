"use client";

import { useId, useState } from "react";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { BuyAction } from "@/data/products";

type Props = {
  sku: string;
  name: string;
  price: string;
  buy: BuyAction;
  variants?: { label: string; options: string[] };
};

/** Escolha de variação (se houver) e botão de compra do produto. */
export function BuyBox({ sku, name, price, buy, variants }: Props) {
  const [variant, setVariant] = useState(variants?.options[0] ?? "");
  const selectId = useId();
  const cleanName = name.replace(/\[[^\]]*\]\s*/g, "").trim() || name;
  const message =
    `Oi! Vim pela loja do site do De Quebrada e quero comprar: ${cleanName}` +
    (variants ? ` (${variants.label}: ${variant})` : "") +
    // Sem preço definido, o marcador [ ] não vai para a mensagem.
    (price.startsWith("[") ? "" : ` · ${price}`) +
    ` · código ${sku}`;

  return (
    <div className="mt-5 space-y-3">
      {variants && (
        <div>
          <label htmlFor={selectId} className="block text-sm font-semibold">
            {variants.label}
          </label>
          <select
            id={selectId}
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {variants.options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      )}
      {buy.type === "whatsapp" ? (
        <WhatsAppButton message={message} source={`loja-${sku}`} className="btn btn-wa w-full">
          Comprar pelo WhatsApp
        </WhatsAppButton>
      ) : (
        <TrackedLink href={buy.url} source={`loja-${sku}`} external className="btn btn-primary w-full">
          {buy.label}
        </TrackedLink>
      )}
    </div>
  );
}
