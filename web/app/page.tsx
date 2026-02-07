import { searchIdioms } from "@/lib/api";
import { IdiomList } from "@/components/IdiomList";
import { cookies } from "next/headers";
import { Idiom } from "@/lib/types";

type HomeProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function Home({ searchParams }: HomeProps) {
  const q = typeof searchParams?.q === "string"
    ? searchParams.q
    : undefined;


  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  let results: Idiom[] = [];

  if (q && token) {
    results = await searchIdioms(q, token);
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-4">Idiom Search</h1>
      <IdiomList idioms={results} />
    </main>
  );
}
