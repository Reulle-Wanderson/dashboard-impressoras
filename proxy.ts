import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas protegidas
export const config = {
  matcher: [
    "/impressoras/nova",
    "/impressoras/substituir",
    "/impressoras/:path*/editar",
  ],
};

export function proxy(request: NextRequest) {
  const url = new URL(request.url);

  const senhaCorreta = process.env.PRIVATE_PASSWORD;

  // 1) senha via query param (?senha=xxx)
  const senhaQuery = url.searchParams.get("senha");

  // 2) senha via header (x-access)
  const senhaHeader = request.headers.get("x-access");

  // 3) senha via COOKIE (auth=logado)
  const cookieAuth = request.cookies.get("auth")?.value;

  // Se já tiver cookie válido → permitir acesso
  if (cookieAuth === "logado") {
    return NextResponse.next();
  }

  // Se senha da URL ou header estiver correta → liberar + criar cookie
  if (senhaQuery === senhaCorreta || senhaHeader === senhaCorreta) {
    const response = NextResponse.next();

    // cria cookie que dura 30 minutos
    response.cookies.set("auth", "logado", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 30, // 30 minutos
    });

    return response;
  }

  // Senha errada → redireciona para /auth
  const redirectUrl = new URL("/auth", request.url);
  return NextResponse.redirect(redirectUrl);
}
