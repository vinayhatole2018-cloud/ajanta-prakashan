import { Layers } from "lucide-react";
import type { ConferenceSubThemeGroup, ConferenceTrack } from "@/types";

export function TracksList({ tracks }: { tracks: ConferenceTrack[] }) {
  if (!tracks?.length) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tracks.map((track, i) => (
        <div key={track.id} className="rounded-xl border border-ink-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Track {i + 1}</p>
              <h4 className="mt-0.5 font-medium text-ink-900">{track.title}</h4>
              {track.disciplines?.length > 0 && <p className="mt-1 text-sm text-ink-500">{track.disciplines.join(", ")}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SubThemesList({ groups }: { groups: ConferenceSubThemeGroup[] }) {
  if (!groups?.length) return null;
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.id}>
          <h4 className="font-medium text-ink-900">{group.category}</h4>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {group.items.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-600">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
