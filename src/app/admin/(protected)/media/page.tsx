"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/FormControls";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { MediaForm } from "@/components/admin/MediaForm";
import { useToast } from "@/contexts/ToastContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { createMedia, deleteMedia, listMedia, updateMedia } from "@/services/mediaService";
import { logAdminAction } from "@/services/adminService";
import { MEDIA_TYPES, type MediaRecord, type MediaType } from "@/types";
import type { MediaFormValues } from "@/schemas/media";

export default function AdminMediaPage() {
  const { admin } = useAdminAuth();
  const toast = useToast();
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");
  const [editing, setEditing] = useState<MediaRecord | null | "new">(null);
  const [deleting, setDeleting] = useState<MediaRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    setLoading(true);
    listMedia({ type: typeFilter }).then(setItems).finally(() => setLoading(false));
  }
  useEffect(refresh, [typeFilter]);

  async function handleSave(values: MediaFormValues) {
    setSubmitting(true);
    try {
      const payload = { ...values, conferenceId: values.conferenceId || null };
      if (editing === "new") {
        const id = await createMedia(payload);
        if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "CREATE", resource: "media", resourceId: id });
        toast.success("Media URL added.");
      } else if (editing) {
        await updateMedia(editing.id, payload);
        if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "UPDATE", resource: "media", resourceId: editing.id });
        toast.success("Media URL updated.");
      }
      setEditing(null);
      refresh();
    } catch {
      toast.error("Failed to save media URL.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteMedia(deleting.id);
      if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "DELETE", resource: "media", resourceId: deleting.id });
      toast.success("Media URL deleted.");
      setDeleting(null);
      refresh();
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<MediaRecord>[] = [
    { key: "title", header: "Title", render: (m) => <span className="font-medium text-ink-900">{m.title}</span> },
    { key: "type", header: "Type", render: (m) => <Badge tone="brand">{m.type.replace("_", " ")}</Badge> },
    {
      key: "url",
      header: "URL",
      render: (m) => (
        <a href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
          <span className="max-w-[220px] truncate">{m.url}</span> <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Media URLs"
        description="Banners, posters, brochures, logos and payment QR codes — all external URLs, never uploaded files."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> Add Media URL
          </Button>
        }
      />

      <div className="mb-4">
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as MediaType | "all")} className="w-44">
          <option value="all">All Types</option>
          {MEDIA_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        emptyTitle="No media URLs yet."
        onRefresh={refresh}
        actions={(m) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(m)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleting(m)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add Media URL" : "Edit Media URL"}>
        <MediaForm defaultValues={editing === "new" ? null : editing} submitting={submitting} onCancel={() => setEditing(null)} onSubmit={handleSave} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this media URL?"
        description={`"${deleting?.title}" will be permanently removed. This does not affect the referenced file itself.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
