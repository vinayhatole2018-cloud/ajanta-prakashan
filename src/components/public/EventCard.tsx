import { Calendar, Clock, ExternalLink, MapPin, MessageCircle } from "lucide-react";
import { Card } from "@/components/common/Card";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import type { EventItem } from "@/types";
import { formatDate } from "@/utils/date";
import { buildWhatsAppLink, interestWhatsAppMessage } from "@/utils/whatsapp";

export function EventCard({ event }: { event: EventItem }) {
  const { profile } = usePublicAuth();

  // Same pattern as conferences: a configured WhatsApp number takes priority
  // over an external registration form — one tap, no form to fill.
  const action = event.whatsappNumber
    ? {
        href: buildWhatsAppLink(event.whatsappNumber, interestWhatsAppMessage(event.title, formatDate(event.date), profile?.fullName)),
        label: "Register via WhatsApp",
        icon: MessageCircle,
      }
    : event.registrationUrl
      ? { href: event.registrationUrl, label: "Register Now", icon: ExternalLink }
      : event.eventUrl
        ? { href: event.eventUrl, label: "Learn more", icon: ExternalLink }
        : null;

  return (
    <Card className="p-5">
      <h3 className="font-serif text-lg font-semibold text-ink-900">{event.title}</h3>
      {event.description && <p className="mt-1.5 line-clamp-2 text-sm text-ink-600">{event.description}</p>}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-brand-500" /> {formatDate(event.date)}
        </span>
        {event.time && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand-500" /> {event.time}
          </span>
        )}
        {event.venue && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-brand-500" /> {event.venue}
          </span>
        )}
      </div>
      {action && (
        <a
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {action.label} <action.icon className="h-3.5 w-3.5" />
        </a>
      )}
    </Card>
  );
}
