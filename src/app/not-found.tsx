import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center py-20">
        <div className="text-center">
          <p className="font-serif text-6xl font-bold text-brand-500">404</p>
          <h1 className="mt-4 text-xl font-semibold text-ink-900">Page not found</h1>
          <p className="mt-2 max-w-sm text-sm text-ink-500">
            The conference, event or notification you&apos;re looking for may have been removed or the link is incorrect.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              <Home className="h-4 w-4" /> Go Home
            </Link>
            <Link href="/conferences" className="inline-flex items-center gap-2 rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
              <Search className="h-4 w-4" /> Browse Conferences
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
