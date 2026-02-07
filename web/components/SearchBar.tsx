"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SearchBarProps = {
  initialQuery?: string;
};

export function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        className="flex-1 border rounded px-4 py-2"
        placeholder="Search idioms..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        className="bg-black text-white px-4 py-2 rounded"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}
