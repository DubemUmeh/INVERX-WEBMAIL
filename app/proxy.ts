import { NextResponse, NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    const authOrigin =
      process.env.AUTH_APP_ORIGIN ??
      process.env.NEXT_PUBLIC_AUTH_URL?.replace(/\/+api\/auth\/?$/i, "") ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "https://inverx.pro";

    const normalizedOrigin = authOrigin.startsWith("http")
      ? authOrigin
      : `https://${authOrigin}`;
    const loginUrl = new URL("/login", normalizedOrigin);

    // full original URL (origin + pathname + search)
    const originalFullUrl = `${request.nextUrl.origin}${request.nextUrl.pathname}${request.nextUrl.search || ""}`;
    loginUrl.searchParams.set("redirect", originalFullUrl);

    console.log(
      `[proxy] No session token; redirecting to: ${loginUrl.toString()} (original: ${originalFullUrl})`,
    );

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
