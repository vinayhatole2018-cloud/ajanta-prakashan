"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Database,
  FileImage,
  GalleryHorizontalEnd,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  UserSquare2,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/conferences", label: "Conferences", icon: CalendarDays },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/landing-images", label: "Landing Images", icon: GalleryHorizontalEnd },
  { href: "/admin/media", label: "Media", icon: FileImage },
  { href: "/admin/committees", label: "Committees", icon: UserSquare2 },
  { href: "/admin/payment", label: "Payment Info", icon: Wallet },
  { href: "/admin/database", label: "Database", icon: Database },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/profile", label: "Admin Profile", icon: ShieldCheck },
  { href: "/admin/logs", label: "Activity Logs", icon: ListChecks },
];

export function AdminSidebar({ onNavigate, onLogout }: { onNavigate?: () => void; onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-ink-900 text-ink-200">
      <div className="flex h-16 items-center gap-2.5 border-b border-ink-800 px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="" className="h-8 w-8 rounded object-cover" />
        <div>
          <p className="text-sm font-semibold text-white">Ajanta Prakashan</p>
          <p className="text-xs text-ink-400">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-brand-500 text-white" : "text-ink-300 hover:bg-ink-800 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ink-800 p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 hover:bg-ink-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );
}
