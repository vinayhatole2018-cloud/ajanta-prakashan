import { Bell } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { NOTIFICATION_TYPE_LABELS, type NotificationItem } from "@/types";
import { formatDateTime } from "@/utils/date";

const TYPE_TONE: Record<string, "brand" | "warning" | "danger" | "info" | "neutral" | "success"> = {
  deadline: "danger",
  important: "danger",
  paper_submission: "warning",
  acceptance: "success",
  registration: "info",
  venue_update: "warning",
  event: "brand",
  conference: "brand",
  general: "neutral",
};

export function NotificationCard({ notification }: { notification: NotificationItem }) {
  return (
    <Card className="flex gap-4 p-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Bell className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={TYPE_TONE[notification.type] || "neutral"}>{NOTIFICATION_TYPE_LABELS[notification.type]}</Badge>
          <span className="text-xs text-ink-400">{formatDateTime(notification.createdAt)}</span>
        </div>
        <h3 className="mt-1.5 font-medium text-ink-900">{notification.title}</h3>
        <p className="mt-1 text-sm text-ink-600">{notification.message}</p>
      </div>
    </Card>
  );
}
