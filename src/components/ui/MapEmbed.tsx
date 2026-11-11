"use client";

import { useState } from "react";

/**
 * Mapa do Google carregado só quando a pessoa clica.
 * Assim nenhum cookie do Google é gravado antes do consentimento.
 */
export function MapEmbed({ query, title }: { query: string; title: string }) {
  const [show, setShow] = useState(false);
  const q = encodeURIComponent(query);

  if (show) {
    return (
      <iframe
        title={title}
        src={`https://www.google.com/maps?q=${q}&output=embed`}
        className="h-80 w-full rounded-2xl border border-line"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div className="flex h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-surface-2 p-6 text-center">
      <p className="max-w-sm text-muted">
        O mapa é carregado do Google Maps, que pode gravar cookies no seu navegador.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn btn-primary" onClick={() => setShow(true)}>
          Mostrar mapa
        </button>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${q}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
        >
          Abrir no Google Maps
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      </div>
    </div>
  );
}
