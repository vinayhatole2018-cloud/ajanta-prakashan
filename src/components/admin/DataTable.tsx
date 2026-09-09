import { RefreshCw } from "lucide-react";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  emptyTitle,
  emptyDescription,
  onRefresh,
  pagination,
  actions,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  onRefresh?: () => void;
  pagination?: {
    pageIndex: number;
    hasPrevious: boolean;
    hasMore: boolean;
    onPrevious: () => void;
    onNext: () => void;
  };
  actions?: (row: T) => React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
      {onRefresh && (
        <div className="flex justify-end border-b border-ink-100 px-4 py-2">
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} /> Refresh
          </Button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading…" />
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className={"px-4 py-3 font-medium " + (col.className || "")}>
                      {col.header}
                    </th>
                  ))}
                  {actions && <th className="px-4 py-3 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-ink-50/60">
                    {columns.map((col) => (
                      <td key={col.key} className={"px-4 py-3 align-top text-ink-700 " + (col.className || "")}>
                        {col.render(row)}
                      </td>
                    ))}
                    {actions && <td className="px-4 py-3 align-top"><div className="flex gap-2">{actions(row)}</div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-ink-100 md:hidden">
            {rows.map((row) => (
              <div key={row.id} className="space-y-1.5 p-4">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-start justify-between gap-3 text-sm">
                    <span className="shrink-0 text-xs uppercase tracking-wide text-ink-400">{col.header}</span>
                    <span className="text-right text-ink-700">{col.render(row)}</span>
                  </div>
                ))}
                {actions && <div className="mt-2 flex flex-wrap justify-end gap-2">{actions(row)}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {pagination && !loading && rows.length > 0 && (
        <Pagination
          pageIndex={pagination.pageIndex}
          hasPrevious={pagination.hasPrevious}
          hasMore={pagination.hasMore}
          onPrevious={pagination.onPrevious}
          onNext={pagination.onNext}
        />
      )}
    </div>
  );
}
