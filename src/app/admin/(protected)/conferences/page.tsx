"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Archive, CheckCircle2, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge, statusTone } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { SearchInput } from "@/components/common/SearchInput";
import { Select } from "@/components/common/FormControls";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { useDebounce } from "@/hooks/useDebounce";
import { deleteConference, listConferencesAdmin, setConferenceStatus } from "@/services/conferenceService";
import { logAdminAction } from "@/services/adminService";
import type { Conference, ContentStatus } from "@/types";
import { formatDate } from "@/utils/date";

export default function AdminConferencesPage() {
  const { admin } = useAdminAuth();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [deleting, setDeleting] = useState<Conference | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { items, loading, hasMore, hasPrevious, pageIndex, goNext, goPrevious, refresh } = useCursorPagination(
    (cursor: QueryDocumentSnapshot<DocumentData> | null) => listConferencesAdmin({ cursor, pageSize: 25, status: statusFilter }),
    [statusFilter]
  );

  const filtered = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((c) => [c.title, c.theme, c.city].some((f) => f?.toLowerCase().includes(needle)));
  }, [items, debouncedSearch]);

  async function changeStatus(c: Conference, status: ContentStatus) {
    await setConferenceStatus(c.id, status);
    if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: status === "archived" ? "ARCHIVE" : status === "published" ? "PUBLISH" : "UNPUBLISH", resource: "conferences", resourceId: c.id });
    toast.success(`Conference ${status}.`);
    refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteConference(deleting.id);
      if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "DELETE", resource: "conferences", resourceId: deleting.id });
      toast.success("Conference deleted.");
      setDeleting(null);
      refresh();
    } catch {
      toast.error("Failed to delete conference.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<Conference>[] = [
    { key: "title", header: "Title", render: (c) => <span className="font-medium text-ink-900">{c.title}</span> },
    { key: "date", header: "Date", render: (c) => formatDate(c.date) },
    { key: "mode", header: "Mode", render: (c) => c.mode },
    { key: "status", header: "Status", render: (c) => <Badge tone={statusTone(c.status)}>{c.status}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        title="Conferences"
        description="Manage all conferences on the public website."
        actions={
          <Link href="/admin/conferences/new">
            <Button>
              <Plus className="h-4 w-4" /> Add Conference
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search title, theme, city..." />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ContentStatus | "all")} className="w-40">
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        emptyTitle="No conferences yet."
        emptyDescription="Click 'Add Conference' to create the first one."
        onRefresh={refresh}
        pagination={{ pageIndex, hasPrevious, hasMore, onPrevious: goPrevious, onNext: goNext }}
        actions={(c) => (
          <>
            <Link href={`/conferences/view?id=${c.id}`} target="_blank">
              <Button variant="ghost" size="sm">
                View
              </Button>
            </Link>
            <Link href={`/admin/conferences/edit?id=${c.id}`}>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            {c.status !== "published" ? (
              <Button variant="ghost" size="sm" onClick={() => changeStatus(c, "published")} title="Publish">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => changeStatus(c, "draft")} title="Unpublish">
                <EyeOff className="h-4 w-4 text-amber-600" />
              </Button>
            )}
            {c.status !== "archived" && (
              <Button variant="ghost" size="sm" onClick={() => changeStatus(c, "archived")} title="Archive">
                <Archive className="h-4 w-4 text-ink-500" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setDeleting(c)} title="Delete permanently">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Permanently delete this conference?"
        description={`"${deleting?.title}" and its public page will be removed immediately. Consider Archive instead if you may need this later.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
