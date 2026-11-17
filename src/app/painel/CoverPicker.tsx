"use client";

import { useEffect, useRef, useState } from "react";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Campo da capa: área de arrastar/clicar com prévia em 16:9.
 * Envia `cover` (arquivo) e `removeCover=on` quando a capa atual é removida.
 */
export function CoverPicker({
  currentUrl,
  currentAlt,
  onPreview,
}: {
  currentUrl: string | null;
  currentAlt: string;
  /** Avisa qual imagem está valendo agora (para a prévia do post). */
  onPreview?: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function accept(f: File | undefined) {
    setError("");
    if (!f) return;
    if (!TYPES.includes(f.type)) return fail("Use uma imagem JPG, PNG ou WEBP.");
    if (f.size > MAX_BYTES) return fail(`A imagem tem ${formatSize(f.size)}. O limite é 4 MB.`);
    // Garante que o arquivo vai no envio do formulário, mesmo vindo do arrastar.
    if (inputRef.current && inputRef.current.files?.[0] !== f) {
      const dt = new DataTransfer();
      dt.items.add(f);
      inputRef.current.files = dt.files;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setRemoved(false);
  }

  function fail(msg: string) {
    setError(msg);
    clearFile();
  }

  function clearFile() {
    if (inputRef.current) inputRef.current.value = "";
    setFile(null);
    setPreview(null);
  }

  const shown = preview ?? (!removed ? currentUrl : null);
  const pick = () => inputRef.current?.click();

  useEffect(() => {
    onPreview?.(shown);
  }, [shown, onPreview]);

  return (
    <div>
      <input
        ref={inputRef}
        id="cover"
        name="cover"
        type="file"
        accept={TYPES.join(",")}
        className="sr-only"
        aria-describedby="cover-help"
        onChange={(e) => accept(e.target.files?.[0])}
      />
      {removed && !file && <input type="hidden" name="removeCover" value="on" />}

      {shown ? (
        <div className="max-w-xl overflow-hidden rounded-xl border border-line bg-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shown} alt={file ? "Prévia da nova capa" : currentAlt} className="aspect-video w-full object-cover" />
          <div className="flex flex-wrap items-center gap-3 border-t border-line p-3">
            <p className="min-w-0 flex-1 truncate text-sm text-muted">
              {file ? (
                <>
                  <span className="text-ink">{file.name}</span> · {formatSize(file.size)} · nova capa
                </>
              ) : (
                "Capa atual"
              )}
            </p>
            <button type="button" onClick={pick} className="rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-accent">
              Trocar imagem
            </button>
            {file ? (
              <button type="button" onClick={clearFile} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-ink">
                {currentUrl && !removed ? "Manter a atual" : "Remover"}
              </button>
            ) : (
              <button type="button" onClick={() => setRemoved(true)} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-ink">
                Remover
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            accept(e.dataTransfer.files?.[0]);
          }}
          className={`flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging ? "border-accent bg-accent/10" : "border-line hover:border-accent/60 hover:bg-white/[0.02]"
          }`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10 text-accent" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="2" />
            <path d="m21 16-5-5-9 9" />
          </svg>
          <span className="font-semibold">
            Arraste a foto aqui ou <span className="text-accent underline underline-offset-4">escolha do computador</span>
          </span>
          <span className="text-sm text-muted">Horizontal fica melhor nos cards do blog</span>
        </button>
      )}

      <p id="cover-help" className="mt-2 text-sm text-muted">
        JPG, PNG ou WEBP, até 4 MB.
        {removed && !file && currentUrl && (
          <>
            {" "}A capa atual será removida ao salvar.{" "}
            <button type="button" onClick={() => setRemoved(false)} className="text-accent underline underline-offset-4">
              Desfazer
            </button>
          </>
        )}
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
