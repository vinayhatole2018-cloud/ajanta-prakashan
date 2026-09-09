"use client";

import { useEffect, useState } from "react";
import { Archive, Database, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/contexts/ToastContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { countConferences, listConferencesAdmin, setConferenceStatus } from "@/services/conferenceService";
import { countEvents } from "@/services/eventService";
import { countNotifications } from "@/services/notificationService";
import { countUsers } from "@/services/userService";
import { countMedia, deleteMedia, listMedia } from "@/services/mediaService";
import { logAdminAction } from "@/services/adminService";
import type { Conference, MediaRecord } from "@/types";

export default function AdminDatabasePage() {
  const { admin } = useAdminAuth();
  const toast = useToast();
  const [counts, setCounts] = useState<{
    users: number;
    conferences: Awaited<ReturnType<typeof countConferences>>;
    events: Awaited<ReturnType<typeof countEvents>>;
    notifications: Awaited<ReturnType<typeof countNotifications>>;
    media: number;
  } | null>(null);
  const [pastPublished, setPastPublished] = useState<Conference[]>([]);
  const [unusedMedia, setUnusedMedia] = useState<MediaRecord[]>([]);
  const [confirmArchiveAll, setConfirmArchiveAll] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<MediaRecord | null>(null);
  const [busy, setBusy] = useState(false);

  function loadAll() {
    Promise.all([countUsers(), countConferences(), countEvents(), countNotifications(), countMedia()]).then(
      ([users, conferences, events, notifications, media]) => setCounts({ users, conferences, events, notifications, media })
    );
    listConferencesAdmin({ status: "published", pageSize: 100 }).then((p) => {
      const today = new Date().toISOString().slice(0, 10);
      setPastPublished(p.items.filter((c) => c.date < today));
    });
    listMedia().then((all) => setUnusedMedia(all.filter((m) => !m.conferenceId)));
  }
  useEffect(loadAll, []);

  async function archiveAllPast() {
    setBusy(true);
    try {
      await Promise.all(pastPublished.map((c) => setConferenceStatus(c.id, "archived")));
      if (admin) {
        await Promise.all(
          pastPublished.map((c) => logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "ARCHIVE", resource: "conferences", resourceId: c.id }))
        );
      }
      toast.success(`Archived ${pastPublished.length} past conference(s).`);
      setConfirmArchiveAll(false);
      loadAll();
    } finally {
      setBusy(false);
    }
  }

  async function removeUnusedMedia() {
    if (!deletingMedia) return;
    setBusy(true);
    try {
      await deleteMedia(deletingMedia.id);
      if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "DELETE", resource: "media", resourceId: deletingMedia.id });
      toast.success("Media URL removed.");
      setDeletingMedia(null);
      loadAll();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Database Overview" description="Collection sizes and cleanup tools." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Users" value={counts?.users ?? 0} icon={Database} loading={!counts} />
        <StatsCard label="Total Conferences" value={counts?.conferences.total ?? 0} icon={Database} loading={!counts} />
        <StatsCard label="Total Events" value={counts?.events.total ?? 0} icon={Database} loading={!counts} />
        <StatsCard label="Total Notifications" value={counts?.notifications.total ?? 0} icon={Database} loading={!counts} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Archived Conferences" value={counts?.conferences.archived ?? 0} icon={Archive} loading={!counts} />
        <StatsCard label="Media URL Records" value={counts?.media ?? 0} icon={Database} loading={!counts} />
        <StatsCard label="Published Conferences" value={counts?.conferences.published ?? 0} icon={Database} loading={!counts} />
        <StatsCard label="Active Events" value={counts?.events.active ?? 0} icon={Database} loading={!counts} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold text-ink-900">Archive Concluded Conferences</h3>
          <p className="mt-1 text-sm text-ink-500">
            {pastPublished.length} published conference(s) have a date in the past and are still marked published.
          </p>
          {pastPublished.length > 0 ? (
            <>
              <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto text-sm text-ink-600">
                {pastPublished.map((c) => (
                  <li key={c.id}>• {c.title}</li>
                ))}
              </ul>
              <Button className="mt-4" variant="outline" onClick={() => setConfirmArchiveAll(true)}>
                <Archive className="h-4 w-4" /> Archive All
              </Button>
            </>
          ) : (
            <EmptyState title="Nothing to archive." />
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-ink-900">Unused Media URLs</h3>
          <p className="mt-1 text-sm text-ink-500">Media records not linked to any conference.</p>
          {unusedMedia.length > 0 ? (
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
              {unusedMedia.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-ink-700">{m.title}</span>
                  <Button variant="ghost" size="sm" onClick={() => setDeletingMedia(m)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No unused media URLs." />
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmArchiveAll}
        title="Archive all concluded conferences?"
        description={`${pastPublished.length} conference(s) will be archived and removed from public listings.`}
        confirmLabel="Archive All"
        danger={false}
        loading={busy}
        onConfirm={archiveAllPast}
        onCancel={() => setConfirmArchiveAll(false)}
      />

      <ConfirmDialog
        open={!!deletingMedia}
        title="Delete this media URL record?"
        description={`"${deletingMedia?.title}" will be permanently removed.`}
        loading={busy}
        onConfirm={removeUnusedMedia}
        onCancel={() => setDeletingMedia(null)}
      />
    </div>
  );
}
