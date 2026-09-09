import Link from "next/link";
import { ArrowRight, BookOpen, CalendarCheck } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function Hero() {
  const { settings } = useSiteSettings();
  return (
    <section className="relative overflow-hidden bg-ink-900">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(181,101,29,0.5), transparent 40%), radial-gradient(circle at 80% 60%, rgba(181,101,29,0.35), transparent 45%)",
        }}
        aria-hidden
      />
      <div className="container-page relative py-20 sm:py-28">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-200">
          <BookOpen className="h-3.5 w-3.5" /> Academic Conferences &amp; Publication
        </p>
        <h1 className="max-w-3xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
          {settings.websiteName}
        </h1>
        <p className="mt-5 max-w-2xl text-base text-ink-300 sm:text-lg">{settings.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/conferences"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
          >
            <CalendarCheck className="h-4 w-4" /> Explore Conferences
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
          >
            Register for Updates <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
