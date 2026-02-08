import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refreshTokens } from "@/lib/api";

export async function getOrRefreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const existingAccessToken =  cookieStore.get("access_token")?.value ?? null;

  if (existingAccessToken) {
    return existingAccessToken;
  };

  return await refreshAccessToken();
}

export async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value ?? null;

  if (!refreshToken) {
    return null;
  }

  try {
    const tokens = await refreshTokens(refreshToken);

    cookieStore.set("access_token", tokens.access_token, {
      httpOnly: true,
      path: "/",
    });

    cookieStore.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      path: "/",
    });

    return tokens.access_token;
  } catch {
    return null;
  }
}

export async function logout() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  redirect("/login");
}
