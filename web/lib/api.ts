import type { paths } from "./api-types";

const API_URL = process.env.API_URL!;

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
    throw new Error("Login failed");
  }

  return res.json();
}

export async function searchIdioms(
  phrase: string,
  token: string,
  limit = 10
): Promise<SearchResponse> {
  const url = `${API_URL}/idioms/search/${encodeURIComponent(phrase)}?limit=${limit}`;
  console.log("API request: ", url);

  const res = await fetch(
    url,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  console.log("API response: ", res.status)

  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
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
    throw new Error(`Random failed: ${res.status}`);
  }

  return res.json();
}
