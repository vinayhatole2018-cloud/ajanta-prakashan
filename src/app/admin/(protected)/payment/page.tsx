"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Wallet } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { listConferencesAdmin } from "@/services/conferenceService";
import type { Conference } from "@/types";

export default function AdminPaymentPage() {
  const [conferences, setConferences] = useState<Conference[] | null>(null);

  useEffect(() => {
    listConferencesAdmin({ status: "all", pageSize: 100 }).then((p) => setConferences(p.items));
  }, []);

  return (
    <div>
      <PageHeader
        title="Payment Information"
        description="Registration fee payment details, per conference. Edit within each conference's form."
      />

      {conferences === null ? (
        <LoadingSpinner label="Loading…" />
      ) : conferences.length === 0 ? (
        <EmptyState title="No conferences yet." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {conferences.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-ink-900">{c.title}</p>
                    {c.paymentInformation ? (
                      <dl className="mt-2 space-y-1 text-sm text-ink-600">
                        <p>{c.paymentInformation.accountName}</p>
                        <p>
                          {c.paymentInformation.bank} · {c.paymentInformation.branch}
                        </p>
                        <p>A/c: {c.paymentInformation.accountNumber} · IFSC: {c.paymentInformation.ifsc}</p>
                      </dl>
                    ) : (
                      <p className="mt-2 text-sm text-ink-400">No payment information configured.</p>
                    )}
                  </div>
                </div>
                <Link href={`/admin/conferences/edit?id=${c.id}`}>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
