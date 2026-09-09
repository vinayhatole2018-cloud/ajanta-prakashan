export type NotificationType =
  | "general"
  | "conference"
  | "registration"
  | "deadline"
  | "paper_submission"
  | "acceptance"
  | "event"
  | "important"
  | "venue_update";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  conferenceId: string | null;
  eventId: string | null;
  imageUrl: string | null;
  scheduledAt: string | null; // ISO datetime, null = publish immediately
  isPublished: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}

export type NotificationInput = Omit<NotificationItem, "id" | "createdAt" | "updatedAt">;

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  general: "General",
  conference: "Conference",
  registration: "Registration",
  deadline: "Deadline",
  paper_submission: "Paper Submission",
  acceptance: "Acceptance",
  event: "Event",
  important: "Important",
  venue_update: "Venue Update",
};
