import Link from "next/link";

export function AppHeader() {
  return (
    <h1 className="mb-4 text-3xl font-bold">
      <Link href="/" className="hover:underline">
        Idiom Search
      </Link>
    </h1>
  );
}
