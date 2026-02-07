import { searchIdioms } from "@/lib/api";
import { IdiomList } from "@/components/IdiomList";
import { SearchBar } from "@/components/SearchBar";
import { Idiom } from "@/lib/types";
import { getAccessToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logout } from "@/lib/auth";

type HomeProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomeProps) {
  // Check if the user has an authenticated session
  const token = await getAccessToken();
  if (!token) {
    redirect("/login");
  }

  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q : undefined;

  let results: Idiom[] = [];

  console.log(`query = ${query}, token = ${token}`);
  if (query && token) {
    results = await searchIdioms(query, token);
  } else {
    if (!query) {
      console.warn("Idiom search skipped: missing query.");
    } else if (!token) {
      console.error("Idiom search skipped: missing access_token cookie.");
    }
  }

  return (
    <main className="p-10 relative">
      <LogoutButton />
      <h1 className="text-3xl font-bold mb-4">Idiom Search</h1>
      <SearchBar initialQuery={query} />
      <IdiomList idioms={results} hasSearched={Boolean(query)} />
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
