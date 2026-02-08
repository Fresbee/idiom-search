import { ApiError, searchIdioms } from "@/lib/api";
import { IdiomList } from "@/components/IdiomList";
import { SearchBar } from "@/components/SearchBar";
import { AppHeader } from "@/components/AppHeader";
import { Idiom } from "@/lib/types";
import { getAccessToken } from "@/lib/auth";
import { logout } from "@/lib/auth";

type HomeProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomeProps) {
  // Check if the user has an authenticated session
  const token = await getAccessToken();

  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q : undefined;
  const rawLimit = typeof params?.limit === "string" ? Number(params.limit) : undefined;
  const limit = rawLimit === 5 || rawLimit === 10 || rawLimit === 20 ? rawLimit : 10;

  let results: Idiom[] = [];

  if (query && token) {
    try {
      results = await searchIdioms(query, token, limit);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        results = [];
      } else {
        console.error("Idiom search failed:", error);
        results = [];
      }
    }
  } else {
    if (!query) {
      console.warn("Idiom search skipped: missing query.");
    } else if (!token) {
      console.warn("Idiom search skipped: missing access_token cookie.");
    }
  }

  return (
    <main className="p-10 relative">
      <LogoutButton />
      <AppHeader />
      <SearchBar initialQuery={query} initialLimit={limit} />
      <IdiomList
        idioms={results}
        hasSearched={Boolean(query)}
        query={query}
      />
    </main>
  );
}

export function LogoutButton() {
  return (
    <form action={logout} className="absolute top-10 right-10">
      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </form>
  );
}
