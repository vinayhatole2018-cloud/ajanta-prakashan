"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const QUICK_LINKS = [
  { href: "/conferences", label: "Conferences" },
  { href: "/events", label: "Events" },
  { href: "/notifications", label: "Notifications" },
  { href: "/register", label: "Register" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export function Footer() {
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();
  const social = settings.socialLinks || {};

  return (
    <footer className="border-t border-ink-200 bg-ink-900 text-ink-200">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-serif text-lg font-semibold text-white">{settings.websiteName}</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-300">{settings.description}</p>
          <div className="mt-4 flex gap-3">
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-ink-300 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-ink-300 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {social.linkedin && (
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-ink-300 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {social.twitter && (
              <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-ink-300 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {social.youtube && (
              <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-ink-300 hover:text-white">
                <Youtube className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Quick Links</h4>
          <ul className="mt-3 space-y-2">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-ink-300 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Legal</h4>
          <ul className="mt-3 space-y-2">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-ink-300 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Contact</h4>
          <ul className="mt-3 space-y-3 text-sm text-ink-300">
            {settings.address && (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> <span>{settings.address}</span>
              </li>
            )}
            {settings.contactPhone && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" /> <span>{settings.contactPhone}</span>
              </li>
            )}
            {settings.contactEmail && (
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" /> <span>{settings.contactEmail}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800 py-5">
        <p className="container-page text-center text-xs text-ink-400">
          {settings.footerText || `© ${year} ${settings.websiteName}. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}
