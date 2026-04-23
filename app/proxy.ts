import { NextResponse, NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken) {
    const configuredOrigin = process.env.NEXT_PUBLIC_WEB_ORIGIN;

    let authOrigin = request.nextUrl.origin;
    if (configuredOrigin) {
      try {
        authOrigin = new URL(configuredOrigin).origin;
      } catch {
        authOrigin = request.nextUrl.origin;
      }
    }

    const loginUrl = new URL("/login", authOrigin);
    const redirectTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/access-control/:path*",
    "/activity/:path*",
    "/smtp/:path*",
    "/dashboard/:path*",
    "/domains/:path*",
    "/mails/:path*",
    "/settings/:path*",
    "/status/:path*",
  ],
};
