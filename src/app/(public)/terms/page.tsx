"use client";

import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function TermsPage() {
  const { settings } = useSiteSettings();
  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="font-serif text-3xl font-bold text-ink-900">Terms &amp; Conditions</h1>
      <div className="prose-content mt-6 whitespace-pre-line">
        {settings.terms || "Terms and conditions will be published here soon."}
      </div>
    </div>
  );
}
