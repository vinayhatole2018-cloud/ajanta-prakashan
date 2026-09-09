"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/common/Button";
import { FormField, Input, Select } from "@/components/common/FormControls";
import { mediaSchema, type MediaFormValues } from "@/schemas/media";
import { listAllConferencesForSelect } from "@/services/conferenceService";
import { MEDIA_TYPES, type MediaRecord } from "@/types";

export function MediaForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: {
  defaultValues: MediaRecord | null;
  onSubmit: (values: MediaFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MediaFormValues>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      type: defaultValues?.type || "banner",
      url: defaultValues?.url || "",
      conferenceId: defaultValues?.conferenceId || null,
    },
  });

  const [conferences, setConferences] = useState<{ id: string; title: string }[]>([]);
  useEffect(() => {
    listAllConferencesForSelect().then(setConferences);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5">
      <FormField label="Title" htmlFor="title" required error={errors.title?.message}>
        <Input id="title" invalid={!!errors.title} {...register("title")} />
      </FormField>
      <FormField label="Type" htmlFor="type">
        <Select id="type" {...register("type")}>
          {MEDIA_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="URL" htmlFor="url" required hint="Only https:// URLs are accepted." error={errors.url?.message}>
        <Input id="url" placeholder="https://..." invalid={!!errors.url} {...register("url")} />
      </FormField>
      <FormField label="Related Conference (optional)" htmlFor="conferenceId">
        <Select id="conferenceId" {...register("conferenceId")}>
          <option value="">None</option>
          {conferences.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="flex justify-end gap-3 border-t border-ink-200 pt-5">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save
        </Button>
      </div>
    </form>
  );
}
