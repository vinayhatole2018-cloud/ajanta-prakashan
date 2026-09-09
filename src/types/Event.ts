import type { ContentStatus } from "./common";

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date
  time: string;
  venue: string;
  conferenceId: string | null;
  status: ContentStatus;
  registrationUrl: string | null;
  whatsappUrl: string | null;
  /** Phone number (e.g. "919579260877") the "Register Now" CTA opens a pre-filled WhatsApp chat to, in place of registrationUrl when set. */
  whatsappNumber: string | null;
  eventUrl: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export type EventInput = Omit<EventItem, "id" | "createdAt" | "updatedAt">;
