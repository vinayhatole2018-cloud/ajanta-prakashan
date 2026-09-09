import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export function Pagination({
  pageIndex,
  hasPrevious,
  hasMore,
  onPrevious,
  onNext,
  loading,
}: {
  pageIndex: number;
  hasPrevious: boolean;
  hasMore: boolean;
  onPrevious: () => void;
  onNext: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-t border-ink-200 px-4 py-3">
      <span className="text-sm text-ink-500">Page {pageIndex + 1}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrevious} disabled={!hasPrevious || loading}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={!hasMore || loading}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
