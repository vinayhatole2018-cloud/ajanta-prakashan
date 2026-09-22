"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { LandingImageForm } from "@/components/admin/LandingImageForm";
import { useToast } from "@/contexts/ToastContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  createLandingImage,
  deleteLandingImage,
  listLandingImagesAdmin,
  reorderLandingImage,
  updateLandingImage,
} from "@/services/landingImageService";
import { logAdminAction } from "@/services/adminService";
import type { LandingImage } from "@/types";
import type { LandingImageFormValues } from "@/schemas/landingImage";

export default function AdminLandingImagesPage() {
  const { admin } = useAdminAuth();
  const toast = useToast();
  const [images, setImages] = useState<LandingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LandingImage | null | "new">(null);
  const [deleting, setDeleting] = useState<LandingImage | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    setLoading(true);
    listLandingImagesAdmin()
      .then(setImages)
      .finally(() => setLoading(false));
  }
  useEffect(refresh, []);

  async function handleSave(values: LandingImageFormValues) {
    setSubmitting(true);
    try {
      if (editing === "new") {
        const id = await createLandingImage(values);
        if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "CREATE", resource: "landingImages", resourceId: id });
        toast.success("Image added to the home page.");
      } else if (editing) {
        await updateLandingImage(editing.id, values);
        if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "UPDATE", resource: "landingImages", resourceId: editing.id });
        toast.success("Image updated.");
      }
      setEditing(null);
      refresh();
    } catch {
      toast.error("Failed to save image.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteLandingImage(deleting.id);
      if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "DELETE", resource: "landingImages", resourceId: deleting.id });
      toast.success("Image removed.");
      setDeleting(null);
      refresh();
    } catch {
      toast.error("Failed to remove image.");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function toggleActive(image: LandingImage) {
    await updateLandingImage(image.id, { active: !image.active });
    refresh();
  }

  async function move(image: LandingImage, direction: -1 | 1) {
    const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex((i) => i.id === image.id);
    const swapWith = sorted[idx + direction];
    if (!swapWith) return;
    await Promise.all([
      reorderLandingImage(image.id, swapWith.displayOrder),
      reorderLandingImage(swapWith.id, image.displayOrder),
    ]);
    refresh();
  }

  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div>
      <PageHeader
        title="Landing Page Images"
        description="Images shown in the gallery on the public home page — order, activate, or remove them here."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> Add Image
          </Button>
        }
      />

      {loading ? (
        <LoadingSpinner label="Loading images…" />
      ) : sorted.length === 0 ? (
        <EmptyState title="No landing page images yet." description="Click 'Add Image' to feature the first one on the home page." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((image, i) => (
            <Card key={image.id} className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.imageUrl} alt={image.caption} className="h-36 w-full object-cover" />
              <div className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={image.active ? "success" : "neutral"}>{image.active ? "Active" : "Hidden"}</Badge>
                  {image.showAsPopup && <Badge tone="info">Popup</Badge>}
                  <span className="text-xs text-ink-400">Order {image.displayOrder}</span>
                </div>
                <p className="line-clamp-1 text-sm font-medium text-ink-800">{image.caption || "(no caption)"}</p>
                {image.linkUrl && <p className="truncate text-xs text-ink-400">Links to {image.linkUrl}</p>}
                <div className="flex flex-wrap gap-1 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => move(image, -1)} disabled={i === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => move(image, 1)} disabled={i === sorted.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(image)} title={image.active ? "Hide" : "Show"}>
                    {image.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(image)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(image)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add Landing Image" : "Edit Landing Image"}>
        <LandingImageForm
          defaultValues={editing === "new" ? null : editing}
          submitting={submitting}
          onCancel={() => setEditing(null)}
          onSubmit={handleSave}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Remove this image?"
        description="It will be permanently removed from the home page gallery. This cannot be undone."
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
