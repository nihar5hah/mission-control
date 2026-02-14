import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Brain, FileText, Clock, ListTodo, Search as SearchIcon } from "lucide-react";
import { useState } from "react";

interface SearchResult {
  _id: string;
  title: string;
  content?: string;
  description?: string;
  type: "memory" | "document" | "activity" | "task";
  date?: string;
  timestamp?: number;
}

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const searchResults = useQuery(api.search.search, {
    q: query.trim() ? query : "agent",
    limit: 20,
  });

  const memories = useQuery(api.search.getAllMemories, { limit: 10 });

  const getIcon = (type: string) => {
    switch (type) {
      case "memory":
        return <Brain className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      case "activity":
        return <Clock className="w-4 h-4" />;
      case "task":
        return <ListTodo className="w-4 h-4" />;
      default:
        return <SearchIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "memory":
        return "text-[#A855F7]";
      case "document":
        return "text-[#5E8FAD]";
      case "activity":
        return "text-[#5E6AD2]";
      case "task":
        return "text-[#5EAD5E]";
      default:
        return "text-[#8A8A8A]";
    }
  };

  if (!memories) {
    return <div className="text-[#8A8A8A]">Loading...</div>;
  }

  const allResults = searchResults
    ? [
        ...searchResults.documents.map((d: any) => ({
          ...d,
          type: "document" as const,
        })),
        ...searchResults.memories.map((m: any) => ({
          ...m,
          type: "memory" as const,
        })),
      ]
    : [];

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search memories, tasks, documents..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-[#141414] border-[#2A2A2A] text-white placeholder:text-[#8A8A8A]"
      />

      {query.trim() ? (
        <>
          {allResults.length === 0 ? (
            <p className="text-sm text-[#8A8A8A] text-center py-8">
              No results found
            </p>
          ) : (
            <div className="space-y-1">
              {allResults.map((result) => (
                <div
                  key={result._id}
                  className="p-3 rounded-md hover:bg-[#141414] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${getTypeColor(result.type)}`}>
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-white">
                          {result.title}
                        </p>
                        <span className={`text-xs ${getTypeColor(result.type)}`}>
                          {result.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#8A8A8A] line-clamp-2 mt-1">
                        {result.description || result.content || "No preview"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <h4 className="text-xs font-medium text-[#8A8A8A] uppercase mb-3">
            Recent Memories
          </h4>
          <div className="space-y-2">
            {memories.length === 0 ? (
              <p className="text-xs text-[#8A8A8A]">No memories yet</p>
            ) : (
              memories.map((mem: any) => (
                <div
                  key={mem._id}
                  className="p-3 rounded-md bg-[#141414] border border-[#2A2A2A]"
                >
                  <p className="font-medium text-sm text-white">{mem.date}</p>
                  <p className="text-xs text-[#8A8A8A] line-clamp-2 mt-1">
                    {mem.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
