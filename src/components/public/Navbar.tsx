"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, X } from "lucide-react";
import { useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { cn } from "@/utils/cn";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/conferences", label: "Conferences" },
  { href: "/events", label: "Events" },
  { href: "/notifications", label: "Notifications" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const { settings } = useSiteSettings();
  const { loading, profile } = usePublicAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo URL is admin-controlled/external, see README on external media URLs */}
          <img
            src={settings.logoUrl || "/images/logo.png"}
            alt={settings.websiteName}
            width={36}
            height={36}
            className="h-9 w-9 rounded-md object-cover"
          />
          <span className="font-serif text-lg font-semibold text-ink-900">{settings.websiteName}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                pathname === link.href && "bg-brand-50 text-brand-700"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <AccountLink loading={loading} registered={!!profile} />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <AccountLink loading={loading} registered={!!profile} compact />
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-ink-700 hover:bg-ink-100"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-200 bg-white lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100",
                  pathname === link.href && "bg-brand-50 text-brand-700"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function AccountLink({ loading, registered, compact }: { loading: boolean; registered: boolean; compact?: boolean }) {
  if (loading) return <div className={compact ? "h-9 w-9" : "h-9 w-24"} />;

  if (registered) {
    return (
      <Link
        href="/profile"
        aria-label="My profile"
        title="My profile"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 hover:bg-brand-200"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <Link
      href="/register"
      className={cn(
        "rounded-lg bg-brand-500 font-medium text-white shadow-sm hover:bg-brand-600",
        compact ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"
      )}
    >
      Register
    </Link>
  );
}
