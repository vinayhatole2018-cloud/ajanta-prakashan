"use client";

import { useMemo, useState } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Download, Eye, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { SearchInput } from "@/components/common/SearchInput";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { useDebounce } from "@/hooks/useDebounce";
import { deleteUser, fetchUsersForExport, listUsersAdmin } from "@/services/userService";
import { logAdminAction } from "@/services/adminService";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import type { RegisteredUser } from "@/types";
import { formatDateTime } from "@/utils/date";
import { downloadCsv, toCsv } from "@/utils/csv";

export default function AdminUsersPage() {
  const { admin } = useAdminAuth();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [viewing, setViewing] = useState<RegisteredUser | null>(null);
  const [deleting, setDeleting] = useState<RegisteredUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { items, loading, hasMore, hasPrevious, pageIndex, goNext, goPrevious, refresh } = useCursorPagination(
    (cursor: QueryDocumentSnapshot<DocumentData> | null) => listUsersAdmin({ cursor, pageSize: 25 }),
    []
  );

  const filtered = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((u) =>
      [u.fullName, u.mobile, u.email, u.city, u.designation, u.institution].some((f) => f?.toLowerCase().includes(needle))
    );
  }, [items, debouncedSearch]);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleting.id);
      if (admin) {
        await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "DELETE", resource: "users", resourceId: deleting.id });
      }
      toast.success("User deleted.");
      setDeleting(null);
      refresh();
    } catch {
      toast.error("Failed to delete user.");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const rows = await fetchUsersForExport({});
      const csv = toCsv(rows, [
        { key: "fullName", label: "Full Name" },
        { key: "mobile", label: "Mobile" },
        { key: "email", label: "Email" },
        { key: "city", label: "City" },
        { key: "designation", label: "Designation" },
        { key: "institution", label: "Institution" },
        { key: "state", label: "State" },
      ]);
      downloadCsv(`ajanta-prakashan-users-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } catch {
      toast.error("Failed to export users.");
    } finally {
      setExporting(false);
    }
  }

  const columns: Column<RegisteredUser>[] = [
    { key: "fullName", header: "Name", render: (u) => <span className="font-medium text-ink-900">{u.fullName}</span> },
    { key: "mobile", header: "Mobile", render: (u) => u.mobile },
    { key: "institution", header: "Institution", render: (u) => u.institution },
    { key: "city", header: "City", render: (u) => u.city },
    { key: "createdAt", header: "Registered", render: (u) => formatDateTime(u.createdAt) },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Everyone who registered for conference updates."
        actions={
          <Button variant="outline" onClick={handleExport} loading={exporting}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search name, mobile, city, institution..." />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        emptyTitle="No users registered yet."
        onRefresh={refresh}
        pagination={{ pageIndex, hasPrevious, hasMore, onPrevious: goPrevious, onNext: goNext }}
        actions={(u) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => setViewing(u)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleting(u)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="User Details">
        {viewing && (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Detail label="Full Name" value={viewing.fullName} />
            <Detail label="Mobile" value={viewing.mobile} />
            <Detail label="Email" value={viewing.email || "—"} />
            <Detail label="City" value={viewing.city} />
            <Detail label="State" value={viewing.state || "—"} />
            <Detail label="Designation" value={viewing.designation} />
            <Detail label="Institution" value={viewing.institution} />
            <Detail label="Registered" value={formatDateTime(viewing.createdAt)} />
          </dl>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this user?"
        description={`This will permanently remove ${deleting?.fullName}'s registration. This cannot be undone.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="mt-0.5 text-ink-900">{value}</dd>
    </div>
  );
}
