import { z } from "zod";
import { isSafeHttpsUrlOrLocalPath } from "@/utils/url";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || isSafeHttpsUrlOrLocalPath(v), "Must be a valid https:// URL");

export const notificationSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  message: z.string().trim().min(3, "Message is required"),
  type: z.enum([
    "general",
    "conference",
    "registration",
    "deadline",
    "paper_submission",
    "acceptance",
    "event",
    "important",
    "venue_update",
  ]),
  conferenceId: z.string().trim().nullable().default(null),
  eventId: z.string().trim().nullable().default(null),
  imageUrl: optionalUrl.transform((v) => (v ? v : null)),
  scheduledAt: z.string().trim().nullable().default(null),
  isPublished: z.boolean().default(false),
});

export type NotificationFormValues = z.infer<typeof notificationSchema>;
