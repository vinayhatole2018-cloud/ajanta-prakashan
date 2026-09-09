"use client";

import { useState } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { NotificationForm } from "@/components/admin/NotificationForm";
import { useToast } from "@/contexts/ToastContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { createNotification, deleteNotification, listNotificationsAdmin, updateNotification } from "@/services/notificationService";
import { logAdminAction } from "@/services/adminService";
import { NOTIFICATION_TYPE_LABELS, type NotificationItem } from "@/types";
import type { NotificationFormValues } from "@/schemas/notification";
import { formatDateTime } from "@/utils/date";

export default function AdminNotificationsPage() {
  const { admin } = useAdminAuth();
  const toast = useToast();
  const [editing, setEditing] = useState<NotificationItem | null | "new">(null);
  const [deleting, setDeleting] = useState<NotificationItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { items, loading, hasMore, hasPrevious, pageIndex, goNext, goPrevious, refresh } = useCursorPagination(
    (cursor: QueryDocumentSnapshot<DocumentData> | null) => listNotificationsAdmin({ cursor, pageSize: 25 }),
    []
  );

  async function handleSave(values: NotificationFormValues) {
    setSubmitting(true);
    try {
      const payload = { ...values, conferenceId: values.conferenceId || null, eventId: values.eventId || null };
      if (editing === "new") {
        const id = await createNotification(payload);
        if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "CREATE", resource: "notifications", resourceId: id });
        toast.success("Notification created.");
      } else if (editing) {
        await updateNotification(editing.id, payload);
        if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "UPDATE", resource: "notifications", resourceId: editing.id });
        toast.success("Notification updated.");
      }
      setEditing(null);
      refresh();
    } catch {
      toast.error("Failed to save notification.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteNotification(deleting.id);
      if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "DELETE", resource: "notifications", resourceId: deleting.id });
      toast.success("Notification deleted.");
      setDeleting(null);
      refresh();
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<NotificationItem>[] = [
    { key: "title", header: "Title", render: (n) => <span className="font-medium text-ink-900">{n.title}</span> },
    { key: "type", header: "Type", render: (n) => NOTIFICATION_TYPE_LABELS[n.type] },
    { key: "isPublished", header: "Status", render: (n) => <Badge tone={n.isPublished ? "success" : "warning"}>{n.isPublished ? "Published" : "Draft"}</Badge> },
    { key: "createdAt", header: "Created", render: (n) => formatDateTime(n.createdAt) },
  ];

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Announcements shown in the public Notification Center."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> Create Notification
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        emptyTitle="No notifications yet."
        onRefresh={refresh}
        pagination={{ pageIndex, hasPrevious, hasMore, onPrevious: goPrevious, onNext: goNext }}
        actions={(n) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(n)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleting(n)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Create Notification" : "Edit Notification"}>
        <NotificationForm defaultValues={editing === "new" ? null : editing} submitting={submitting} onCancel={() => setEditing(null)} onSubmit={handleSave} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this notification?"
        description={`"${deleting?.title}" will be permanently removed.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
