"use client";

import { useEffect, useState } from "react";
import { Bell, CalendarDays, PartyPopper, Users } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card } from "@/components/common/Card";
import { Badge, statusTone } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { countConferences, listConferencesAdmin } from "@/services/conferenceService";
import { countEvents } from "@/services/eventService";
import { countNotifications, listNotificationsAdmin } from "@/services/notificationService";
import { countUsers, listUsersAdmin } from "@/services/userService";
import type { Conference, NotificationItem, RegisteredUser } from "@/types";
import { formatDateTime } from "@/utils/date";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const PIE_COLORS = ["#b5651d", "#dc8935", "#e8a862", "#4a5563"];

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<{
    users: number;
    conferences: Awaited<ReturnType<typeof countConferences>>;
    events: Awaited<ReturnType<typeof countEvents>>;
    notifications: Awaited<ReturnType<typeof countNotifications>>;
  } | null>(null);
  const [recentUsers, setRecentUsers] = useState<RegisteredUser[]>([]);
  const [recentConferences, setRecentConferences] = useState<Conference[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    Promise.all([countUsers(), countConferences(), countEvents(), countNotifications()]).then(
      ([users, conferences, events, notifications]) => setCounts({ users, conferences, events, notifications })
    );
    listUsersAdmin({ pageSize: 5 }).then((p) => setRecentUsers(p.items));
    listConferencesAdmin({ pageSize: 5, status: "all" }).then((p) => setRecentConferences(p.items));
    listNotificationsAdmin({ pageSize: 5 }).then((p) => setRecentNotifications(p.items));
  }, []);

  const statusPieData = counts
    ? [
        { name: "Published", value: counts.conferences.published },
        { name: "Draft", value: counts.conferences.total - counts.conferences.published - (counts.conferences.archived || 0) },
        { name: "Archived", value: counts.conferences.archived },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of Ajanta Prakashan's conference platform." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Users" value={counts?.users ?? 0} icon={Users} loading={!counts} tone="brand" />
        <StatsCard label="Total Conferences" value={counts?.conferences.total ?? 0} icon={CalendarDays} loading={!counts} tone="info" />
        <StatsCard label="Upcoming Conferences" value={counts?.conferences.upcoming ?? 0} icon={CalendarDays} loading={!counts} tone="success" />
        <StatsCard label="Total Events" value={counts?.events.total ?? 0} icon={PartyPopper} loading={!counts} tone="warning" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Past Conferences" value={counts?.conferences.past ?? 0} icon={CalendarDays} loading={!counts} />
        <StatsCard label="Active Events" value={counts?.events.active ?? 0} icon={PartyPopper} loading={!counts} />
        <StatsCard label="Total Notifications" value={counts?.notifications.total ?? 0} icon={Bell} loading={!counts} />
        <StatsCard label="Published Conferences" value={counts?.conferences.published ?? 0} icon={CalendarDays} loading={!counts} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h3 className="mb-4 text-sm font-semibold text-ink-700">Conferences by Status</h3>
          {statusPieData.length === 0 ? (
            <EmptyState title="No conference data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {statusPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-ink-700">Recent Conferences</h3>
          {recentConferences.length === 0 ? (
            <EmptyState title="No conferences yet" />
          ) : (
            <ul className="divide-y divide-ink-100">
              {recentConferences.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="truncate pr-3 text-ink-800">{c.title}</span>
                  <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink-700">Recent Registrations</h3>
          {recentUsers.length === 0 ? (
            <EmptyState title="No registrations yet" />
          ) : (
            <ul className="divide-y divide-ink-100">
              {recentUsers.map((u) => (
                <li key={u.id} className="py-2.5 text-sm">
                  <p className="font-medium text-ink-800">{u.fullName}</p>
                  <p className="text-xs text-ink-500">
                    {u.institution} · {u.city} · {formatDateTime(u.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink-700">Recent Notifications</h3>
          {recentNotifications.length === 0 ? (
            <EmptyState title="No notifications yet" />
          ) : (
            <ul className="divide-y divide-ink-100">
              {recentNotifications.map((n) => (
                <li key={n.id} className="py-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-ink-800">{n.title}</p>
                    <Badge tone={n.isPublished ? "success" : "warning"}>{n.isPublished ? "Published" : "Draft"}</Badge>
                  </div>
                  <p className="text-xs text-ink-500">{formatDateTime(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
