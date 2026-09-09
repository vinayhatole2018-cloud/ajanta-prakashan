import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Section({
  title,
  subtitle,
  viewAllHref,
  tone = "light",
  children,
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  tone?: "light" | "muted";
  children: React.ReactNode;
}) {
  return (
    <section className={tone === "muted" ? "bg-white py-14 sm:py-16" : "py-14 sm:py-16"}>
      <div className="container-page">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-ink-900 sm:text-3xl">{title}</h2>
            {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-ink-500">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
