"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  danger = true,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title="" widthClassName="max-w-md">
      <div className="flex gap-4">
        <div className={danger ? "shrink-0 rounded-full bg-red-100 p-2 text-red-600" : "shrink-0 rounded-full bg-brand-100 p-2 text-brand-600"}>
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h3 className="text-base font-semibold text-ink-900">{title}</h3>
          {description && <p className="mt-1 text-sm text-ink-600">{description}</p>}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
