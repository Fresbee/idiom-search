"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

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
