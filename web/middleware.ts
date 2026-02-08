import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/api/auth/refresh",
  "/_next",
  "/favicon.ico",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isRefreshPath(pathname: string): boolean {
  return pathname.startsWith("/api/auth/refresh");
}

function decodeJwtExp(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    ) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value ?? null;
  const refreshToken = request.cookies.get("refresh_token")?.value ?? null;

  const exp = accessToken ? decodeJwtExp(accessToken) : null;
  const isExpired = exp !== null ? exp <= Math.floor(Date.now() / 1000) : !accessToken;

  if (isExpired && refreshToken) {
    if (isRefreshPath(pathname)) {
      return NextResponse.next();
    }
    const nextUrl = `${pathname}${search}`;
    const refreshUrl = request.nextUrl.clone();
    refreshUrl.pathname = "/api/auth/refresh";
    refreshUrl.search = "";
    refreshUrl.searchParams.set("next", nextUrl);
    return NextResponse.redirect(refreshUrl);
  }

  if (!accessToken && !refreshToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  if (isExpired && !refreshToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/healthcheck).*)"],
};
