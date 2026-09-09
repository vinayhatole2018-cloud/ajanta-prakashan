"use client";

import { useEffect, useState } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { NotificationCard } from "@/components/public/NotificationCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/common/Button";
import { getPublishedNotifications } from "@/services/notificationService";
import type { NotificationItem } from "@/types";

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublishedNotifications({ pageSize: 15 })
      .then((page) => {
        setItems(page.items);
        setCursor(page.lastDoc);
        setHasMore(page.hasMore);
      })
      .catch(() => setError("Could not load notifications."))
      .finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await getPublishedNotifications({ pageSize: 15, cursor });
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
        <h1 className="font-serif text-3xl font-bold text-ink-900">Notification Center</h1>
        <p className="mt-2 text-ink-500">Deadlines, acceptances, schedule changes and important announcements.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="No notifications yet." />
      ) : (
        <>
          <div className="space-y-4">
            {items.map((n) => (
              <NotificationCard key={n.id} notification={n} />
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
