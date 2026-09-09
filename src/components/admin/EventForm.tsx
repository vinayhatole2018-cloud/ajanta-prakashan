"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/common/Button";
import { FormField, Input, Select, Textarea } from "@/components/common/FormControls";
import { eventSchema, type EventFormValues } from "@/schemas/event";
import { listAllConferencesForSelect } from "@/services/conferenceService";
import type { EventItem } from "@/types";

export function EventForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: {
  defaultValues: EventItem | null;
  onSubmit: (values: EventFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      date: defaultValues?.date || "",
      time: defaultValues?.time || "",
      venue: defaultValues?.venue || "",
      conferenceId: defaultValues?.conferenceId || null,
      status: defaultValues?.status || "draft",
      registrationUrl: defaultValues?.registrationUrl || "",
      whatsappUrl: defaultValues?.whatsappUrl || "",
      whatsappNumber: defaultValues?.whatsappNumber || "",
      eventUrl: defaultValues?.eventUrl || "",
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
      <FormField label="Description" htmlFor="description">
        <Textarea id="description" rows={3} {...register("description")} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Date" htmlFor="date" required error={errors.date?.message}>
          <Input id="date" type="date" invalid={!!errors.date} {...register("date")} />
        </FormField>
        <FormField label="Time" htmlFor="time">
          <Input id="time" placeholder="11:00 AM" {...register("time")} />
        </FormField>
      </div>
      <FormField label="Venue" htmlFor="venue">
        <Input id="venue" {...register("venue")} />
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
      <FormField label="Status" htmlFor="status">
        <Select id="status" {...register("status")}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      </FormField>
      <FormField label="Registration URL" htmlFor="registrationUrl" error={errors.registrationUrl?.message} hint="Used only if no WhatsApp Number is set below.">
        <Input id="registrationUrl" placeholder="https://..." {...register("registrationUrl")} />
      </FormField>
      <FormField label="WhatsApp URL" htmlFor="whatsappUrl" error={errors.whatsappUrl?.message} hint="Invite link, for a 'Join WhatsApp Group' button">
        <Input id="whatsappUrl" placeholder="https://chat.whatsapp.com/..." {...register("whatsappUrl")} />
      </FormField>
      <FormField
        label="WhatsApp Number"
        htmlFor="whatsappNumber"
        error={errors.whatsappNumber?.message}
        hint="Country code + number, digits only. When set, 'Register Now' opens a pre-filled WhatsApp chat instead of the Registration URL."
      >
        <Input id="whatsappNumber" placeholder="919579260877" {...register("whatsappNumber")} />
      </FormField>
      <FormField label="Event URL" htmlFor="eventUrl" error={errors.eventUrl?.message}>
        <Input id="eventUrl" placeholder="https://..." {...register("eventUrl")} />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-ink-200 pt-5">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save Event
        </Button>
      </div>
    </form>
  );
}
