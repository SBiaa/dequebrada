import { NextResponse, type NextRequest } from "next/server";

/**
 * Primeira barreira do painel: sem cookie de sessão, manda para o login.
 * A checagem de verdade (sessão válida, papel de admin, assinatura) é feita no servidor,
 * no layout do painel e em cada Server Action.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("dq_session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // /membros (página inicial) é pública; as subpáginas exigem login.
  matcher: ["/painel/:path*", "/membros/:path+", "/conta"],
};
