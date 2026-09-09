import { cn } from "@/utils/cn";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-xl border border-ink-200 bg-white shadow-card", className)}>{children}</div>;
}
