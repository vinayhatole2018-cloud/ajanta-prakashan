"use client";

import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function PrivacyPolicyPage() {
  const { settings } = useSiteSettings();
  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="font-serif text-3xl font-bold text-ink-900">Privacy Policy</h1>
      <div className="prose-content mt-6 whitespace-pre-line">
        {settings.privacyPolicy || "The privacy policy will be published here soon."}
      </div>
    </div>
  );
}
