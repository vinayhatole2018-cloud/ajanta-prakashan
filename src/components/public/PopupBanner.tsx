"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getActiveLandingImages } from "@/services/landingImageService";
import type { LandingImage } from "@/types";

const DISMISSED_KEY = "ajanta-popup-dismissed-id";

/**
 * Site-wide promotional popup — admin-managed from the same Landing Images
 * screen used for the gallery (/admin/landing-images, "Also show as a popup
 * banner" checkbox). Shows the first active popup-flagged image, once per
 * browser session (sessionStorage, not localStorage — reappears on a fresh
 * visit, not on every page navigation within the same visit), and only once
 * per distinct image so a newly-flagged banner still shows even if an
 * earlier one was already dismissed this session.
 */
export function PopupBanner() {
  const [image, setImage] = useState<LandingImage | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getActiveLandingImages()
      .then((images) => {
        const candidate = images.find((img) => img.showAsPopup) || null;
        if (!candidate) return;
        let dismissedId: string | null = null;
        try {
          dismissedId = sessionStorage.getItem(DISMISSED_KEY);
        } catch {
          // sessionStorage unavailable (private mode, etc.) — just show it.
        }
        if (candidate.id === dismissedId) return;
        setImage(candidate);
        setOpen(true);
      })
      .catch(() => {});
  }, []);

  function dismiss() {
    setOpen(false);
    if (!image) return;
    try {
      sessionStorage.setItem(DISMISSED_KEY, image.id);
    } catch {
      // Nothing to persist to — it'll just show again next page load, which is fine.
    }
  }

  if (!open || !image) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.imageUrl} alt={image.caption} className="max-h-[70vh] w-full object-cover" />
        {(image.caption || image.linkUrl) && (
          <div className="space-y-3 p-5">
            {image.caption && <p className="text-sm font-medium text-ink-800">{image.caption}</p>}
            {image.linkUrl && (
              <a
                href={image.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismiss}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
              >
                Learn more
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
