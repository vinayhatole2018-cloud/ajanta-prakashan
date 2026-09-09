"use client";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function ContactPage() {
  const { settings } = useSiteSettings();
  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="font-serif text-3xl font-bold text-ink-900">Contact Us</h1>
      <p className="mt-2 text-ink-500">Reach out for queries about conferences, registration or publication.</p>

      <div className="mt-8 space-y-4">
        {settings.address && (
          <ContactRow icon={MapPin} label="Address" value={settings.address} />
        )}
        {settings.contactPhone && (
          <ContactRow icon={Phone} label="Phone" value={settings.contactPhone} href={`tel:${settings.contactPhone}`} />
        )}
        {settings.contactEmail && (
          <ContactRow icon={Mail} label="Email" value={settings.contactEmail} href={`mailto:${settings.contactEmail}`} />
        )}
        {settings.whatsappUrl && (
          <ContactRow icon={MessageCircle} label="WhatsApp" value="Chat with us" href={settings.whatsappUrl} external />
        )}
        {!settings.address && !settings.contactPhone && !settings.contactEmail && !settings.whatsappUrl && (
          <p className="text-sm text-ink-500">Contact details will be published here soon.</p>
        )}
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <div className="flex items-start gap-4 rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-400">{label}</p>
        <p className="mt-0.5 font-medium text-ink-900">{value}</p>
      </div>
    </div>
  );
  if (!href) return content;
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="block hover:opacity-90">
      {content}
    </a>
  );
}
