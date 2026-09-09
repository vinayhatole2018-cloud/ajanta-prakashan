"use client";

import { BookOpen, Building2, Landmark } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function AboutPage() {
  const { settings } = useSiteSettings();
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="font-serif text-3xl font-bold text-ink-900">About {settings.websiteName}</h1>
      <p className="prose-content mt-4 whitespace-pre-line">{settings.description}</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-ink-200 bg-white p-5">
          <BookOpen className="h-7 w-7 text-brand-500" />
          <h3 className="mt-3 font-medium text-ink-900">Publication</h3>
          <p className="mt-1 text-sm text-ink-500">Accepted conference papers are published in peer-reviewed journals.</p>
        </div>
        <div className="rounded-xl border border-ink-200 bg-white p-5">
          <Building2 className="h-7 w-7 text-brand-500" />
          <h3 className="mt-3 font-medium text-ink-900">Partner Institutions</h3>
          <p className="mt-1 text-sm text-ink-500">We work with colleges and universities to organize academic conferences.</p>
        </div>
        <div className="rounded-xl border border-ink-200 bg-white p-5">
          <Landmark className="h-7 w-7 text-brand-500" />
          <h3 className="mt-3 font-medium text-ink-900">Multi-Disciplinary</h3>
          <p className="mt-1 text-sm text-ink-500">Conferences span commerce, law, sciences, humanities and technology.</p>
        </div>
      </div>

      {settings.address && (
        <div className="mt-10 rounded-xl border border-ink-200 bg-white p-5">
          <h3 className="font-medium text-ink-900">Registered Address</h3>
          <p className="mt-1 text-sm text-ink-600">{settings.address}</p>
        </div>
      )}
    </div>
  );
}
