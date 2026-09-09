"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/common/LoadingSpinner";
import { usePublicAuth } from "@/contexts/PublicAuthContext";

/**
 * Full-page gate: only lets the wrapped page render its children once the
 * visitor has completed registration. This mirrors the Firestore rule
 * (isRegistered()) that actually enforces this server-side — the gate here
 * just gives a friendly prompt instead of a blank/broken page, and avoids
 * even attempting a read that the rules would reject.
 */
export function RequireRegistration({ children }: { children: React.ReactNode }) {
  const { loading, profile, isAdmin } = usePublicAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const conferenceId = searchParams.get("conferenceId") ?? undefined;

  if (loading) {
    return (
      <div className="container-page py-12">
        <Skeleton className="h-8 w-1/3 rounded-md" />
        <Skeleton className="mt-6 h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile && !isAdmin) {
    const registerHref = conferenceId
      ? `/register?conferenceId=${conferenceId}&next=${encodeURIComponent(pathname)}`
      : `/register?next=${encodeURIComponent(pathname)}`;
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md rounded-xl border border-ink-200 bg-white p-8 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-serif text-xl font-semibold text-ink-900">Registration required</h1>
          <p className="mt-2 text-sm text-ink-500">
            Conference details are only visible to registered visitors. It takes under a minute — no OTP, no password.
          </p>
          <Link
            href={registerHref}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
          >
            Register to continue
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
