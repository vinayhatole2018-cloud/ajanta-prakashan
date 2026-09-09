"use client";

import { Download, Share, X } from "lucide-react";
import { useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

/**
 * Global, site-wide (public + admin) install prompt. Reappears on every full
 * page load/visit until the app is actually installed — dismissing it only
 * hides it for the current visit (component state, never persisted), by
 * design: the ask was for it to keep showing up until installed, not to be
 * silence-able forever like a typical "don't show again" banner.
 */
export function InstallPromptBanner() {
  const { canInstall, isIOS, isStandalone, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isStandalone || dismissed) return null;
  if (!canInstall && !isIOS) return null; // nothing actionable to tell them yet

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-200 bg-white/98 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-900">Install the Ajanta Prakashan app</p>
          {isIOS && !canInstall ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
              Tap <Share className="mx-0.5 inline h-3.5 w-3.5" /> Share, then &quot;Add to Home Screen&quot;
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-ink-500">Quick access, offline support, no app store needed.</p>
          )}
        </div>
        {canInstall && (
          <button
            onClick={promptInstall}
            className="flex-shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
          >
            Install
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="flex-shrink-0 rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
