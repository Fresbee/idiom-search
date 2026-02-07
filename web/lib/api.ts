import type { paths } from "./api-types";

const API_URL = process.env.API_URL!;

// ---- Type aliases ----

type SearchResponse =
  paths["/idioms/search/{search_phrase}"]["get"]["responses"]["200"]["content"]["application/json"];

type RandomResponse =
  paths["/idioms/random"]["get"]["responses"]["200"]["content"]["application/json"];

// ---- Client functions ----

export async function searchIdioms(
  phrase: string,
  token: string,
  limit = 10
): Promise<SearchResponse> {
  const res = await fetch(
    `${API_URL}/idioms/search/${encodeURIComponent(phrase)}?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

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
