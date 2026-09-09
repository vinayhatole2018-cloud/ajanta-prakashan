"use client";

import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/common/Badge";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { listAdminLogs } from "@/services/adminService";
import type { AdminLog, AdminLogAction } from "@/types";
import { formatDateTime } from "@/utils/date";

const ACTION_TONE: Record<AdminLogAction, "success" | "danger" | "warning" | "info" | "neutral"> = {
  LOGIN: "info",
  LOGOUT: "neutral",
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "danger",
  ARCHIVE: "neutral",
  PUBLISH: "success",
  UNPUBLISH: "warning",
};

export default function AdminLogsPage() {
  const { items, loading, hasMore, hasPrevious, pageIndex, goNext, goPrevious, refresh } = useCursorPagination(
    (cursor: QueryDocumentSnapshot<DocumentData> | null) => listAdminLogs({ cursor, pageSize: 50 }),
    []
  );

  const columns: Column<AdminLog>[] = [
    { key: "action", header: "Action", render: (l) => <Badge tone={ACTION_TONE[l.action]}>{l.action}</Badge> },
    { key: "resource", header: "Resource", render: (l) => l.resource },
    { key: "resourceId", header: "Resource ID", render: (l) => <span className="font-mono text-xs">{l.resourceId}</span> },
    { key: "adminEmail", header: "Admin", render: (l) => l.adminEmail },
    { key: "timestamp", header: "When", render: (l) => formatDateTime(l.timestamp) },
  ];

  return (
    <div>
      <PageHeader title="Activity Logs" description="Audit trail of administrator actions." />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        emptyTitle="No activity logged yet."
        onRefresh={refresh}
        pagination={{ pageIndex, hasPrevious, hasMore, onPrevious: goPrevious, onNext: goNext }}
      />
    </div>
  );
}
