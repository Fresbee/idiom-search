import type React from "react";
import type { Idiom } from "@/lib/types";

type IdiomListProps = {
  idioms: Idiom[];
  hasSearched?: boolean;
  query?: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, query?: string) {
  if (!query) return text;
  const trimmed = query.trim();
  if (!trimmed) return text;

  const regex = new RegExp(escapeRegExp(trimmed), "gi");
  const parts = text.split(regex);
  const matches = text.match(regex);

  if (!matches) return text;

  return parts.reduce<React.ReactNode[]>((acc, part, index) => {
    acc.push(part);
    if (index < matches.length) {
      acc.push(
        <span
          key={`${matches[index]}-${index}`}
          className="px-0.5"
          style={{ backgroundColor: "yellow" }}
        >
          {matches[index]}
        </span>
      );
    }
    return acc;
  }, []);
}

export function IdiomList({
  idioms,
  hasSearched = false,
  query,
}: IdiomListProps) {
  if (!idioms.length) {
    if (!hasSearched) {
      return null;
    }
    return <p className="text-gray-500">No matching entries</p>;
  }

  return (
    <div className="space-y-4 mt-6">
      {idioms.map((idiom) => (
        <div key={idiom.idiom} className="border p-4 rounded">
          <h2 className="font-semibold text-lg">
            {highlightMatch(idiom.idiom, query)}
          </h2>
          <p>{idiom.definition}</p>
          <p className="text-sm text-gray-600">
            Synonyms: {idiom.synonyms.join(", ")}
          </p>
          {idiom.example && (
            <p className="italic mt-2">{idiom.example}</p>
          )}
        </div>
      ))}
    </div>
  );
}
