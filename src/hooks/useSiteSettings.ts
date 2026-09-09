"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, watchSiteSettings } from "@/services/settingsService";
import type { SiteSettings } from "@/types";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = watchSiteSettings((s) => {
      setSettings(s);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { settings, loading };
}
