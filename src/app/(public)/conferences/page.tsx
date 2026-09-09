"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Search } from "lucide-react";
import { ConferenceCard } from "@/components/public/ConferenceCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/FormControls";
import { RequireRegistration } from "@/components/public/RequireRegistration";
import { getPublishedConferences, searchPublishedConferences } from "@/services/conferenceService";
import type { Conference, ConferenceMode } from "@/types";
import { cn } from "@/utils/cn";

type Tab = "upcoming" | "past" | "all";

function ConferencesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as Tab) || "upcoming";

  const [items, setItems] = useState<Conference[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<ConferenceMode | "all">("all");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPublishedConferences({ when: tab, pageSize: 9 })
      .then((page) => {
        setItems(page.items);
        setCursor(page.lastDoc);
        setHasMore(page.hasMore);
      })
      .catch(() => setError("Could not load conferences."))
      .finally(() => setLoading(false));
  }, [tab]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await getPublishedConferences({ when: tab, pageSize: 9, cursor });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.lastDoc);
      setHasMore(page.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }

  const [searchResults, setSearchResults] = useState<Conference[] | null>(null);
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults(null);
      return;
    }
    const t = setTimeout(() => {
      searchPublishedConferences(search).then(setSearchResults);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const cities = useMemo(() => Array.from(new Set(items.map((c) => c.city).filter(Boolean))), [items]);

  const displayed = useMemo(() => {
    const base = searchResults ?? items;
    return base.filter((c) => (modeFilter === "all" || c.mode === modeFilter) && (cityFilter === "all" || c.city === cityFilter));
  }, [searchResults, items, modeFilter, cityFilter]);

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-ink-900">Conferences</h1>
        <p className="mt-2 text-ink-500">Browse national and international academic conferences.</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-1 rounded-lg border border-ink-200 bg-white p-1 w-fit">
        {(["upcoming", "past", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => router.push(`/conferences?tab=${t}`)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium capitalize",
              tab === t ? "bg-brand-500 text-white" : "text-ink-600 hover:bg-ink-100"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, theme or city..."
            className="w-full rounded-lg border border-ink-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <Select value={modeFilter} onChange={(e) => setModeFilter(e.target.value as ConferenceMode | "all")} className="w-40">
          <option value="all">All Modes</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="hybrid">Hybrid</option>
        </Select>
        {cities.length > 0 && (
          <Select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="w-44">
            <option value="all">All Locations</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => router.refresh()} />
      ) : displayed.length === 0 ? (
        <EmptyState
          title={tab === "past" ? "No past conferences available." : "No upcoming conferences available."}
          description="Please check back soon, or register to be notified when a new conference is announced."
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.map((c) => (
              <ConferenceCard key={c.id} conference={c} />
            ))}
          </div>
          {!searchResults && hasMore && (
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

export default function ConferencesPage() {
  return (
    <Suspense fallback={<div className="container-page py-12"><Skeleton className="h-96 w-full rounded-xl" /></div>}>
      <RequireRegistration>
        <ConferencesPageInner />
      </RequireRegistration>
    </Suspense>
  );
}
