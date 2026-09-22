import Link from "next/link";
import { Calendar, MapPin, Radio } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import type { Conference } from "@/types";
import { formatDate } from "@/utils/date";

export function ConferenceCard({ conference }: { conference: Conference }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="brand">{conference.mode.toUpperCase()}</Badge>
          {conference.tracks?.length > 0 && <Badge tone="neutral">{conference.tracks.length} tracks</Badge>}
        </div>
        <h3 className="line-clamp-2 font-serif text-lg font-semibold text-ink-900">{conference.title}</h3>
        {conference.theme && <p className="mt-1 line-clamp-2 text-sm text-ink-500">{conference.theme}</p>}
        <div className="mt-4 space-y-1.5 text-sm text-ink-600">
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-500" /> {formatDate(conference.date)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-500" /> {conference.city || conference.venue}
          </p>
        </div>
        <Link
          href={`/conferences/view?id=${conference.id}`}
          className="mt-5 inline-flex items-center justify-center rounded-lg border border-brand-500 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
        >
          <Radio className="mr-2 h-4 w-4" /> View Details
        </Link>
      </div>
    </Card>
  );
}
