import { useCallback, useEffect, useRef, useState } from "react";

interface Page<T, C> {
  items: T[];
  lastDoc: C | null;
  hasMore: boolean;
}

/**
 * Generic Firestore cursor-pagination helper: Previous/Next semantics backed by
 * a stack of cursors (no arbitrary page jumps, matching how Firestore
 * startAfter() cursors actually work) instead of re-fetching whole collections.
 */
export function useCursorPagination<T, C>(fetchPage: (cursor: C | null) => Promise<Page<T, C>>, deps: unknown[] = []) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const cursorStack = useRef<(C | null)[]>([null]);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const load = useCallback(async (index: number) => {
    setLoading(true);
    setError(null);
    try {
      const cursor = cursorStack.current[index] ?? null;
      const page = await fetchRef.current(cursor);
      setItems(page.items);
      setHasMore(page.hasMore);
      if (page.lastDoc && cursorStack.current.length === index + 1) {
        cursorStack.current.push(page.lastDoc);
      }
      setPageIndex(index);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    cursorStack.current = [null];
    load(0);
  }, [load]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    items,
    loading,
    error,
    hasMore,
    hasPrevious: pageIndex > 0,
    pageIndex,
    goNext: () => hasMore && load(pageIndex + 1),
    goPrevious: () => pageIndex > 0 && load(pageIndex - 1),
    refresh,
  };
}
