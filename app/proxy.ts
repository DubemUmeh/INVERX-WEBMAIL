import { NextResponse, NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    const authOrigin = process.env.AUTH_APP_ORIGIN;
    const loginUrl = new URL("/login", authOrigin);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/access-control/:path*",
    "/activity/:path*",
    "/configuration/:path*",
    "/dashboard/:path*",
    "/domains/:path*",
    "/mails/:path*",
    "/settings/:path*",
    "/status/:path*",
  ],
};
