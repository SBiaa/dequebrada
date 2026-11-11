import { ConsentedScripts } from "./ConsentedScripts";

/**
 * Meta Pixel e Google Analytics: só existem se as variáveis estiverem configuradas
 * (NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_GA_ID) e só carregam depois do aceite no aviso de cookies.
 */
export function Analytics() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || undefined;
  const gaId = process.env.NEXT_PUBLIC_GA_ID || undefined;
  if (!pixelId && !gaId) return null;
  return <ConsentedScripts pixelId={pixelId} gaId={gaId} />;
}
