import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/impressoras/nova",
    "/impressoras/substituir",
    "/impressoras/:path*/editar",
  ],
};

export function middleware(request: NextRequest) {
  // 🔓 LIBERA TOTALMENTE EM AMBIENTE LOCAL
  if (process.env.NEXT_PUBLIC_APP_ENV === "local") {
    return NextResponse.next();
  }

  const url = new URL(request.url);
  const senhaCorreta = process.env.PRIVATE_PASSWORD;

  const senhaQuery = url.searchParams.get("senha");
  const senhaHeader = request.headers.get("x-access");
  const cookieAuth = request.cookies.get("auth")?.value;

  if (cookieAuth === "logado") {
    return NextResponse.next();
  }

  if (senhaQuery === senhaCorreta || senhaHeader === senhaCorreta) {
    const response = NextResponse.next();

    response.cookies.set("auth", "logado", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 30,
    });

    return response;
  }

  // 🔒 PRODUÇÃO SEM AUTORIZAÇÃO → /auth
  const redirectUrl = new URL("/auth", request.url);
  return NextResponse.redirect(redirectUrl);
}
