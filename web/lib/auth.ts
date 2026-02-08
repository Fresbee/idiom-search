import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";

async function getAppOrigins(): Promise<string[]> {
  const origins: string[] = [];
  const headersList = await headers();
  const forwardedProto = headersList.get("x-forwarded-proto") ?? "http";
  const forwardedHost =
    headersList.get("x-forwarded-host") ??
    headersList.get("host");

  const internalEnv =
    process.env.INTERNAL_APP_URL ??
    process.env.NEXT_INTERNAL_APP_URL;

  if (internalEnv) origins.push(internalEnv);

  if (forwardedHost) {
    origins.push(`${forwardedProto}://${forwardedHost}`);
  }

  const publicEnv =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.APP_URL;

  if (publicEnv) origins.push(publicEnv);

  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000");
    origins.push("http://web:3000");
  }

  return Array.from(new Set(origins));
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const existingAccessToken = cookieStore.get("access_token")?.value ?? null;

  return existingAccessToken;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("refresh_token")?.value ?? null;
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const headerStore = await headers();
    const cookieHeader = headerStore.get("cookie") ?? "";
    const origins = await getAppOrigins();

    if (!origins.length) {
      console.warn("Missing app origin for refresh request.");
      return null;
    }

    for (const origin of origins) {
      try {
        const res = await fetch(`${origin}/api/auth/refresh`, {
          method: "POST",
          headers: {
            cookie: cookieHeader,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new ApiError(res.status, "Refresh failed");
        }

        const data = (await res.json()) as { access_token?: string };
        return data.access_token ?? null;
      } catch {
        // try next origin
      }
    }

    return null;
  } catch (error) {
    if (error instanceof ApiError) {
      console.warn(`Refresh failed with status ${error.status}: ${error.message}`);
    } else if (error instanceof Error) {
      console.warn(`Refresh failed with error: ${error.message}`);
    } else {
      console.warn("Refresh failed with unknown error.");
    }
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
