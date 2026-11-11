"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

const KEY = "dq_cookies";
type Choice = "aceito" | "recusado" | null;

function readChoice(): Choice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "aceito" || v === "recusado" ? v : null;
  } catch {
    return null;
  }
}

export function ConsentedScripts({ pixelId, gaId }: { pixelId?: string; gaId?: string }) {
  const [choice, setChoice] = useState<Choice | "carregando">("carregando");

  useEffect(() => {
    // Lê a escolha salva só no navegador (evita diferença entre servidor e cliente).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(readChoice());
  }, []);

  function decide(value: "aceito" | "recusado") {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    setChoice(value);
  }

  return (
    <>
      {choice === null && (
        <div
          role="dialog"
          aria-labelledby="cookies-titulo"
          className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-2xl rounded-2xl border border-line bg-surface p-5 shadow-2xl md:inset-x-6"
        >
          <p id="cookies-titulo" className="font-bold">
            Cookies
          </p>
          <p className="mt-2 text-sm text-muted">
            Usamos cookies de métricas e anúncios (Google Analytics e Pixel da Meta) para entender as visitas e
            melhorar a divulgação. Você escolhe. Saiba mais na{" "}
            <Link href="/politica-de-privacidade" className="text-accent underline underline-offset-4">
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="button" className="btn btn-primary" onClick={() => decide("aceito")}>
              Aceitar
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => decide("recusado")}>
              Recusar
            </button>
          </div>
        </div>
      )}

      {choice === "aceito" && pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(pixelId)});fbq('track','PageView');`}
        </Script>
      )}
      {choice === "aceito" && gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`}
          </Script>
        </>
      )}
    </>
  );
}
