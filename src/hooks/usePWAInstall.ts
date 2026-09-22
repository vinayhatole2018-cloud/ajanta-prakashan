"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __pwaInstallEvent?: BeforeInstallPromptEvent;
  }
}

function isStandaloneNow(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

/**
 * The browser fires `beforeinstallprompt` as soon as installability criteria
 * are met — which can happen before this hook's effect ever runs. A tiny
 * inline script in <head> (see RootLayout) captures it onto
 * window.__pwaInstallEvent the instant it fires, so late-mounting components
 * never miss it. iOS Safari never fires this event at all (Apple restriction)
 * — there `isIOS` tells the UI to show manual "Add to Home Screen" steps
 * instead of a native prompt button.
 */
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(isStandaloneNow());
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsIOS(isIOSDevice());
    setIsMobile(isMobileDevice());
    setIsStandalone(isStandaloneNow());
    if (window.__pwaInstallEvent) setCanInstall(true);

    const onAvailable = () => setCanInstall(true);
    const onInstalled = () => {
      setCanInstall(false);
      setIsStandalone(true);
    };
    window.addEventListener("pwa-install-available", onAvailable);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("pwa-install-available", onAvailable);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function promptInstall() {
    const evt = window.__pwaInstallEvent;
    if (!evt) return;
    await evt.prompt();
    const choice = await evt.userChoice;
    if (choice.outcome === "accepted") {
      window.__pwaInstallEvent = undefined;
      setCanInstall(false);
    }
  }

  return { canInstall, isIOS, isMobile, isStandalone, promptInstall };
}
