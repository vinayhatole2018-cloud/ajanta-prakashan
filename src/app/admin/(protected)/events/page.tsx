"use client";

import { useState } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Archive, CheckCircle2, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge, statusTone } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/FormControls";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EventForm } from "@/components/admin/EventForm";
import { useToast } from "@/contexts/ToastContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { createEvent, deleteEvent, listEventsAdmin, setEventStatus, updateEvent } from "@/services/eventService";
import { logAdminAction } from "@/services/adminService";
import type { ContentStatus, EventItem } from "@/types";
import type { EventFormValues } from "@/schemas/event";
import { formatDate } from "@/utils/date";

export default function AdminEventsPage() {
  const { admin } = useAdminAuth();
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [editing, setEditing] = useState<EventItem | null | "new">(null);
  const [deleting, setDeleting] = useState<EventItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { items, loading, hasMore, hasPrevious, pageIndex, goNext, goPrevious, refresh } = useCursorPagination(
    (cursor: QueryDocumentSnapshot<DocumentData> | null) => listEventsAdmin({ cursor, pageSize: 25, status: statusFilter }),
    [statusFilter]
  );

  async function handleSave(values: EventFormValues) {
    setSubmitting(true);
    try {
      const payload = { ...values, conferenceId: values.conferenceId || null };
      if (editing === "new") {
        const id = await createEvent(payload);
        if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "CREATE", resource: "events", resourceId: id });
        toast.success("Event created.");
      } else if (editing) {
        await updateEvent(editing.id, payload);
        if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "UPDATE", resource: "events", resourceId: editing.id });
        toast.success("Event updated.");
      }
      setEditing(null);
      refresh();
    } catch {
      toast.error("Failed to save event.");
    } finally {
      setSubmitting(false);
    }
  }

  async function changeStatus(e: EventItem, status: ContentStatus) {
    await setEventStatus(e.id, status);
    if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: status === "archived" ? "ARCHIVE" : status === "published" ? "PUBLISH" : "UNPUBLISH", resource: "events", resourceId: e.id });
    toast.success(`Event ${status}.`);
    refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteEvent(deleting.id);
      if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "DELETE", resource: "events", resourceId: deleting.id });
      toast.success("Event deleted.");
      setDeleting(null);
      refresh();
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<EventItem>[] = [
    { key: "title", header: "Title", render: (e) => <span className="font-medium text-ink-900">{e.title}</span> },
    { key: "date", header: "Date", render: (e) => formatDate(e.date) },
    { key: "venue", header: "Venue", render: (e) => e.venue || "—" },
    { key: "status", header: "Status", render: (e) => <Badge tone={statusTone(e.status)}>{e.status}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        title="Events"
        description="Seminars, workshops and other academic events."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        }
      />

      <div className="mb-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ContentStatus | "all")} className="w-40">
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        emptyTitle="No events yet."
        onRefresh={refresh}
        pagination={{ pageIndex, hasPrevious, hasMore, onPrevious: goPrevious, onNext: goNext }}
        actions={(e) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(e)}>
              <Pencil className="h-4 w-4" />
            </Button>
            {e.status !== "published" ? (
              <Button variant="ghost" size="sm" onClick={() => changeStatus(e, "published")}>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => changeStatus(e, "draft")}>
                <EyeOff className="h-4 w-4 text-amber-600" />
              </Button>
            )}
            {e.status !== "archived" && (
              <Button variant="ghost" size="sm" onClick={() => changeStatus(e, "archived")}>
                <Archive className="h-4 w-4 text-ink-500" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setDeleting(e)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add Event" : "Edit Event"}>
        <EventForm
          defaultValues={editing === "new" ? null : editing}
          submitting={submitting}
          onCancel={() => setEditing(null)}
          onSubmit={handleSave}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this event?"
        description={`"${deleting?.title}" will be permanently removed.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
