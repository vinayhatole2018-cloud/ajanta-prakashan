"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarClock, GraduationCap, Lock, Newspaper, ShieldCheck } from "lucide-react";
import { Hero } from "@/components/public/Hero";
import { Section } from "@/components/public/Section";
import { ConferenceCard } from "@/components/public/ConferenceCard";
import { EventCard } from "@/components/public/EventCard";
import { NotificationCard } from "@/components/public/NotificationCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/LoadingSpinner";
import { getPublishedConferences } from "@/services/conferenceService";
import { getPublishedEvents } from "@/services/eventService";
import { getPublishedNotifications } from "@/services/notificationService";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import type { Conference, EventItem, NotificationItem } from "@/types";

const WHY_JOIN = [
  { icon: GraduationCap, title: "Peer-Reviewed Publication", text: "Accepted papers are published in Ajanta Prakashan's UGC-listed journals." },
  { icon: CalendarClock, title: "Multiple Disciplines", text: "Conferences across commerce, law, sciences, humanities and technology." },
  { icon: Newspaper, title: "Timely Updates", text: "Notifications for deadlines, acceptances and schedule changes." },
  { icon: ShieldCheck, title: "Trusted Process", text: "Transparent registration, fees and payment information for every conference." },
];

export default function HomePage() {
  const { settings } = useSiteSettings();
  const { loading: authLoading, profile, isAdmin } = usePublicAuth();
  const canSeeConferences = !!profile || isAdmin;
  const [upcoming, setUpcoming] = useState<Conference[] | null>(null);
  const [past, setPast] = useState<Conference[] | null>(null);
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);

  useEffect(() => {
    if (!canSeeConferences) return; // conferences are gated behind registration — don't even attempt the read
    getPublishedConferences({ when: "upcoming", pageSize: 3 })
      .then((r) => setUpcoming(r.items))
      .catch(() => setUpcoming([]));
    getPublishedConferences({ when: "past", pageSize: 3 })
      .then((r) => setPast(r.items))
      .catch(() => setPast([]));
  }, [canSeeConferences]);

  useEffect(() => {
    getPublishedEvents({ pageSize: 3 })
      .then((r) => setEvents(r.items))
      .catch(() => setEvents([]));
    getPublishedNotifications({ pageSize: 4 })
      .then((r) => setNotifications(r.items))
      .catch(() => setNotifications([]));
  }, []);

  return (
    <>
      <Hero />

      <Section title="Upcoming Conferences" subtitle="National and international conferences currently open for registration." viewAllHref="/conferences?tab=upcoming">
        {authLoading ? (
          <GridSkeleton />
        ) : !canSeeConferences ? (
          <ConferenceGatePrompt />
        ) : upcoming === null ? (
          <GridSkeleton />
        ) : upcoming.length === 0 ? (
          <EmptyState title="No upcoming conferences available." description="Please check back soon, or register to be notified when a new conference is announced." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((c) => (
              <ConferenceCard key={c.id} conference={c} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Latest Notifications" subtitle="Deadlines, acceptances and announcements." viewAllHref="/notifications" tone="muted">
        {notifications === null ? (
          <ListSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyState title="No notifications yet." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {notifications.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Upcoming Events" subtitle="Seminars, workshops and other academic events." viewAllHref="/events">
        {events === null ? (
          <ListSkeleton />
        ) : events.length === 0 ? (
          <EmptyState title="No upcoming events available." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Why Join Ajanta Prakashan Conferences" tone="muted">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_JOIN.map((item) => (
            <div key={item.title} className="rounded-xl border border-ink-200 bg-white p-5">
              <item.icon className="h-8 w-8 text-brand-500" />
              <h3 className="mt-3 font-medium text-ink-900">{item.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Past Conferences" subtitle="A record of conferences successfully concluded." viewAllHref="/conferences?tab=past">
        {authLoading ? (
          <GridSkeleton />
        ) : !canSeeConferences ? (
          <ConferenceGatePrompt />
        ) : past === null ? (
          <GridSkeleton />
        ) : past.length === 0 ? (
          <EmptyState title="No past conferences yet." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((c) => (
              <ConferenceCard key={c.id} conference={c} />
            ))}
          </div>
        )}
      </Section>

      <Section title="About" tone="muted">
        <p className="max-w-3xl text-base leading-relaxed text-ink-600">{settings.description}</p>
      </Section>
    </>
  );
}

function ConferenceGatePrompt() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white px-6 py-14 text-center">
      <Lock className="h-10 w-10 text-ink-300" aria-hidden />
      <p className="text-base font-medium text-ink-700">Register to view conferences</p>
      <p className="max-w-sm text-sm text-ink-500">Conference details are only visible to registered visitors. It takes under a minute.</p>
      <Link
        href="/register"
        className="mt-1 inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
      >
        Register now
      </Link>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-80 w-full rounded-xl" />
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}
