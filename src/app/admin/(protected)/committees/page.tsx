"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/FormControls";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Card } from "@/components/common/Card";
import { CommitteeForm } from "@/components/admin/CommitteeForm";
import { useToast } from "@/contexts/ToastContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { listAllConferencesForSelect } from "@/services/conferenceService";
import { createCommitteeMember, deleteCommitteeMember, getCommitteesByConference, reorderCommitteeMember, updateCommitteeMember } from "@/services/committeeService";
import { logAdminAction } from "@/services/adminService";
import { COMMITTEE_CATEGORIES, type CommitteeMember } from "@/types";
import type { CommitteeMemberFormValues } from "@/schemas/committee";

export default function AdminCommitteesPage() {
  const { admin } = useAdminAuth();
  const toast = useToast();
  const [conferences, setConferences] = useState<{ id: string; title: string }[]>([]);
  const [conferenceId, setConferenceId] = useState("");
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<CommitteeMember | null | "new">(null);
  const [deleting, setDeleting] = useState<CommitteeMember | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listAllConferencesForSelect().then((list) => {
      setConferences(list);
      if (list.length && !conferenceId) setConferenceId(list[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refresh() {
    if (!conferenceId) return;
    setLoading(true);
    getCommitteesByConference(conferenceId).then(setMembers).finally(() => setLoading(false));
  }
  useEffect(refresh, [conferenceId]);

  async function handleSave(values: CommitteeMemberFormValues) {
    setSubmitting(true);
    try {
      if (editing === "new") {
        const id = await createCommitteeMember(values);
        if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "CREATE", resource: "committees", resourceId: id });
        toast.success("Committee member added.");
      } else if (editing) {
        await updateCommitteeMember(editing.id, values);
        if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "UPDATE", resource: "committees", resourceId: editing.id });
        toast.success("Committee member updated.");
      }
      setEditing(null);
      refresh();
    } catch {
      toast.error("Failed to save committee member.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteCommitteeMember(deleting.id);
      if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "DELETE", resource: "committees", resourceId: deleting.id });
      toast.success("Committee member removed.");
      setDeleting(null);
      refresh();
    } finally {
      setDeleteLoading(false);
    }
  }

  async function move(member: CommitteeMember, direction: -1 | 1) {
    const siblings = members.filter((m) => m.category === member.category).sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = siblings.findIndex((m) => m.id === member.id);
    const swapWith = siblings[idx + direction];
    if (!swapWith) return;
    await Promise.all([
      reorderCommitteeMember(member.id, swapWith.displayOrder),
      reorderCommitteeMember(swapWith.id, member.displayOrder),
    ]);
    refresh();
  }

  const grouped = COMMITTEE_CATEGORIES.map((cat) => ({
    category: cat,
    people: members.filter((m) => m.category === cat).sort((a, b) => a.displayOrder - b.displayOrder),
  })).filter((g) => g.people.length > 0);

  return (
    <div>
      <PageHeader
        title="Committees"
        description="Organizing, advisory and editorial committee members, per conference."
        actions={
          <Button onClick={() => setEditing("new")} disabled={!conferenceId}>
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        }
      />

      <div className="mb-6 max-w-sm">
        <Select value={conferenceId} onChange={(e) => setConferenceId(e.target.value)}>
          {conferences.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading committee…" />
      ) : grouped.length === 0 ? (
        <EmptyState title="No committee members yet for this conference." />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <Card key={group.category} className="p-5">
              <h3 className="mb-3 font-semibold text-ink-900">{group.category}</h3>
              <ul className="divide-y divide-ink-100">
                {group.people.map((person, i) => (
                  <li key={person.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-medium text-ink-800">{person.name}</p>
                      <p className="text-xs text-ink-500">
                        {person.designation}
                        {person.designation && person.institution ? ", " : ""}
                        {person.institution}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="sm" onClick={() => move(person, -1)} disabled={i === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => move(person, 1)} disabled={i === group.people.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(person)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleting(person)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add Committee Member" : "Edit Committee Member"}>
        <CommitteeForm
          conferenceId={conferenceId}
          defaultValues={editing === "new" ? null : editing}
          submitting={submitting}
          onCancel={() => setEditing(null)}
          onSubmit={handleSave}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Remove this committee member?"
        description={`"${deleting?.name}" will be permanently removed from this conference's committee.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
