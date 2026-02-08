import type { paths } from "./api-types";

const API_URL = process.env.API_URL!;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ---- Type aliases ----

type LoginRequest =
  paths["/auth/login"]["post"]["requestBody"]["content"]["application/json"];

type TokenResponse =
  paths["/auth/login"]["post"]["responses"]["200"]["content"]["application/json"];

type SearchResponse =
  paths["/idioms/search/{search_phrase}"]["get"]["responses"]["200"]["content"]["application/json"];

type RandomResponse =
  paths["/idioms/random"]["get"]["responses"]["200"]["content"]["application/json"];

// ---- Client functions ----

export async function login(
  data: LoginRequest
): Promise<TokenResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new ApiError(res.status, "Login failed");
  }

  return res.json();
}

export async function refreshTokens(
  refreshToken: string
): Promise<TokenResponse> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie: `refresh_token=${encodeURIComponent(refreshToken)}`,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, "Refresh failed");
  }

  return res.json();
}

export async function searchIdioms(
  phrase: string,
  token: string,
  limit = 10
): Promise<SearchResponse> {
  const url = `${API_URL}/idioms/search/${encodeURIComponent(phrase)}?limit=${limit}`;

  const res = await fetch(
    url,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (res.status === 404) {
    return [];
  }

  if (!res.ok) {
    throw new ApiError(res.status, `Search failed: ${res.status}`);
  }

  return res.json();
}

export async function getRandomIdiom(
  token: string
): Promise<RandomResponse> {
  const res = await fetch(`${API_URL}/idioms/random`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new ApiError(res.status, `Random failed: ${res.status}`);
  }

  return res.json();
}
