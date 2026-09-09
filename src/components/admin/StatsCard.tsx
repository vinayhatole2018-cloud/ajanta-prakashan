import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Skeleton } from "@/components/common/LoadingSpinner";
import { cn } from "@/utils/cn";

export function StatsCard({
  label,
  value,
  icon: Icon,
  loading,
  tone = "brand",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  loading?: boolean;
  tone?: "brand" | "success" | "info" | "warning";
}) {
  const toneClasses = {
    brand: "bg-brand-50 text-brand-600",
    success: "bg-emerald-50 text-emerald-600",
    info: "bg-sky-50 text-sky-600",
    warning: "bg-amber-50 text-amber-600",
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-500">{label}</p>
          {loading ? <Skeleton className="mt-2 h-7 w-16" /> : <p className="mt-1 text-2xl font-semibold text-ink-900">{value}</p>}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", toneClasses)}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </Card>
  );
}
