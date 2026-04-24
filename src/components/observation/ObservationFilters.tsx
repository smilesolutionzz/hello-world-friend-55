import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type FilterMode = "all" | "ai" | "no_ai";
export type SortMode = "newest" | "oldest";

interface Props {
  query: string;
  onQueryChange: (v: string) => void;
  filter: FilterMode;
  onFilterChange: (v: FilterMode) => void;
  sort: SortMode;
  onSortChange: (v: SortMode) => void;
}

export default function ObservationFilters({
  query, onQueryChange, filter, onFilterChange, sort, onSortChange,
}: Props) {
  const filters: { key: FilterMode; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "ai", label: "AI 분석 완료" },
    { key: "no_ai", label: "분석 대기" },
  ];

  return (
    <div className="space-y-3 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
        <Input
          placeholder="제목·내용으로 검색"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-9 bg-white/70 backdrop-blur-sm border-amber-200/60 focus-visible:ring-amber-400 placeholder:text-amber-400"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {filters.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? "default" : "outline"}
              onClick={() => onFilterChange(f.key)}
              className={
                filter === f.key
                  ? "h-8 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                  : "h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
              }
            >
              {f.label}
            </Button>
          ))}
        </div>

        <div className="ml-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSortChange(sort === "newest" ? "oldest" : "newest")}
            className="h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {sort === "newest" ? "최신순" : "오래된순"}
          </Button>
        </div>
      </div>
    </div>
  );
}
