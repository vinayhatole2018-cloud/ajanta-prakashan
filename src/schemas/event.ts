import { z } from "zod";
import { optionalPhone, optionalUrl } from "./common";

export const eventSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  description: z.string().trim().default(""),
  date: z.string().trim().min(1, "Date is required"),
  time: z.string().trim().default(""),
  venue: z.string().trim().default(""),
  conferenceId: z.string().trim().nullable().default(null),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  registrationUrl: optionalUrl.transform((v) => (v ? v : null)),
  whatsappUrl: optionalUrl.transform((v) => (v ? v : null)),
  whatsappNumber: optionalPhone.transform((v) => (v ? v : null)),
  eventUrl: optionalUrl.transform((v) => (v ? v : null)),
});

export type EventFormValues = z.infer<typeof eventSchema>;
