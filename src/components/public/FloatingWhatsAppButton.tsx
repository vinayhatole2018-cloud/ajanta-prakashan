"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { normalizeToWaNumber, buildWhatsAppLink } from "@/utils/whatsapp";

/**
 * Site-wide floating WhatsApp contact bubble — for general inquiries, not
 * tied to any one conference. Uses settings/site.contactPhone as the single
 * source of truth (admin-editable at /admin/settings), never a hardcoded
 * number.
 */
export function FloatingWhatsAppButton() {
  const { settings, loading } = useSiteSettings();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);

  useEffect(() => {
    if (loading || !settings.contactPhone) return;
    const t = setTimeout(() => setTooltipOpen(true), 1500);
    return () => clearTimeout(t);
  }, [loading, settings.contactPhone]);

  if (loading || !settings.contactPhone) return null;

  const href = buildWhatsAppLink(
    normalizeToWaNumber(settings.contactPhone),
    `Hi, I have an inquiry about ${settings.websiteName || "Ajanta Prakashan"} conferences.`
  );

  return (
    <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-2">
      {tooltipOpen && (
        <div className="relative rounded-xl bg-white px-4 py-3 pr-8 text-sm text-ink-700 shadow-lg ring-1 ring-black/5">
          How can we help you?
          <button
            onClick={() => setTooltipOpen(false)}
            aria-label="Close"
            className="absolute right-1.5 top-1.5 rounded-full p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        onClick={() => setBadgeVisible(false)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-105"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-40" />
        <WhatsAppGlyph className="relative h-7 w-7 text-white" />
        {badgeVisible && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-semibold text-white ring-2 ring-white">
            1
          </span>
        )}
      </a>
    </div>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.07h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.15.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.09.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}
