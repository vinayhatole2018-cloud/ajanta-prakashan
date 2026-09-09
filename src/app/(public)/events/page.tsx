"use client";

import { useEffect, useState } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { EventCard } from "@/components/public/EventCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/common/Button";
import { getPublishedEvents } from "@/services/eventService";
import type { EventItem } from "@/types";

export default function EventsPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublishedEvents({ pageSize: 12 })
      .then((page) => {
        setItems(page.items);
        setCursor(page.lastDoc);
        setHasMore(page.hasMore);
      })
      .catch(() => setError("Could not load events."))
      .finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await getPublishedEvents({ pageSize: 12, cursor });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.lastDoc);
      setHasMore(page.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-ink-900">Events</h1>
        <p className="mt-2 text-ink-500">Seminars, workshops and other academic events.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="No upcoming events available." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={loadMore} loading={loadingMore}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
