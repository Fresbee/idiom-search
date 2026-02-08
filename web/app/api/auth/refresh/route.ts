import { NextRequest, NextResponse } from "next/server";
import { refreshTokens } from "@/lib/api";

async function handleRefresh(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const nextUrl = request.nextUrl.searchParams.get("next");

  if (!refreshToken) {
    if (nextUrl) {
      return NextResponse.redirect(new URL("/login", request.url), 303);
    }
    return NextResponse.json({ error: "Missing refresh token" }, { status: 400 });
  }

  try {
    const tokens = await refreshTokens(refreshToken);
    const response = nextUrl
      ? NextResponse.redirect(new URL(nextUrl, request.url), 303)
      : NextResponse.json(tokens);

    response.cookies.set("access_token", tokens.access_token, {
      httpOnly: true,
      path: "/",
    });

    response.cookies.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      path: "/",
    });

    return response;
  } catch (error) {
    if (nextUrl) {
      return NextResponse.redirect(new URL("/login", request.url), 303);
    }
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }
}

export async function GET(request: NextRequest) {
  return handleRefresh(request);
}

export async function POST(request: NextRequest) {
  return handleRefresh(request);
}
