import type { Idiom } from "@/lib/types";

export function IdiomList({ idioms }: { idioms: Idiom[] }) {
  if (!idioms.length) {
    return <p className="text-gray-500">No results.</p>;
  }

  return (
    <div className="space-y-4 mt-6">
      {idioms.map((idiom) => (
        <div key={idiom.idiom} className="border p-4 rounded">
          <h2 className="font-semibold text-lg">{idiom.idiom}</h2>
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
