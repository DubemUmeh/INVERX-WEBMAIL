import { NextResponse, NextRequest } from "next/server";

function getOriginFromEnv(...keys: string[]): string | null {
  for (const key of keys) {
    const value = process.env[key];
    if (!value) continue;

    try {
      return new URL(value).origin;
    } catch {
      continue;
    }
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("__Host-better-auth.session_token")?.value;

  if (!sessionToken) {
    const webOrigin =
      getOriginFromEnv("NEXT_PUBLIC_WEB_ORIGIN", "NEXT_PUBLIC_WEB_ORIGINL") ||
      request.nextUrl.origin;
    const appOrigin =
      getOriginFromEnv("NEXT_PUBLIC_APP_ORIGIN", "NEXT_PUBLIC_APP_ORIGINL") ||
      request.nextUrl.origin;

    const loginUrl = new URL("/login", webOrigin);
    const redirectTarget = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      appOrigin,
    ).toString();
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
