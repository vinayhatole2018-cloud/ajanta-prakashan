"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/common/Button";
import { Checkbox, FormField, Input, Select, Textarea } from "@/components/common/FormControls";
import { notificationSchema, type NotificationFormValues } from "@/schemas/notification";
import { listAllConferencesForSelect } from "@/services/conferenceService";
import { NOTIFICATION_TYPE_LABELS, type NotificationItem, type NotificationType } from "@/types";

export function NotificationForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: {
  defaultValues: NotificationItem | null;
  onSubmit: (values: NotificationFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      message: defaultValues?.message || "",
      type: defaultValues?.type || "general",
      conferenceId: defaultValues?.conferenceId || null,
      eventId: defaultValues?.eventId || null,
      imageUrl: defaultValues?.imageUrl || "",
      scheduledAt: defaultValues?.scheduledAt || null,
      isPublished: defaultValues?.isPublished ?? false,
    },
  });

  const [conferences, setConferences] = useState<{ id: string; title: string }[]>([]);
  useEffect(() => {
    listAllConferencesForSelect().then(setConferences);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <FormField label="Title" htmlFor="title" required error={errors.title?.message}>
        <Input id="title" invalid={!!errors.title} {...register("title")} />
      </FormField>
      <FormField label="Message" htmlFor="message" required error={errors.message?.message}>
        <Textarea id="message" rows={3} invalid={!!errors.message} {...register("message")} />
      </FormField>
      <FormField label="Type" htmlFor="type">
        <Select id="type" {...register("type")}>
          {(Object.keys(NOTIFICATION_TYPE_LABELS) as NotificationType[]).map((t) => (
            <option key={t} value={t}>
              {NOTIFICATION_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Related Conference" htmlFor="conferenceId">
        <Select id="conferenceId" {...register("conferenceId")}>
          <option value="">None</option>
          {conferences.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Image URL (optional)" htmlFor="imageUrl" error={errors.imageUrl?.message}>
        <Input id="imageUrl" placeholder="https://..." {...register("imageUrl")} />
      </FormField>
      <FormField label="Schedule For (optional)" htmlFor="scheduledAt" hint="Leave blank to publish immediately when marked published.">
        <Input id="scheduledAt" type="datetime-local" {...register("scheduledAt")} />
      </FormField>
      <Checkbox label="Published (visible on public site)" {...register("isPublished")} />

      <div className="flex justify-end gap-3 border-t border-ink-200 pt-5">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save Notification
        </Button>
      </div>
    </form>
  );
}
