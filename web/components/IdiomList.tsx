import type { Idiom } from "@/lib/types";

type IdiomListProps = {
  idioms: Idiom[];
  hasSearched?: boolean;
};

export function IdiomList({ idioms, hasSearched = false }: IdiomListProps) {
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
