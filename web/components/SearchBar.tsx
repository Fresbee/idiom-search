"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SearchBarProps = {
  initialQuery?: string;
  initialLimit?: number;
};

export function SearchBar({ initialQuery = "", initialLimit = 10 }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [limit, setLimit] = useState(initialLimit);
  const router = useRouter();

  useEffect(() => {
    setQuery(initialQuery);
    setLimit(initialLimit);
  }, [initialQuery, initialLimit]);

  function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
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
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 mt-3">
        Max Number of Results
        <select
          className="border rounded px-3 py-2"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </label>
    </form>
  );
}
