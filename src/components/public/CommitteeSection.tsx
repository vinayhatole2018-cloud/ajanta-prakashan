import { COMMITTEE_CATEGORIES, type CommitteeMember } from "@/types";

export function CommitteeSection({ members }: { members: CommitteeMember[] }) {
  if (!members?.length) return null;
  const byCategory = COMMITTEE_CATEGORIES.map((category) => ({
    category,
    people: members.filter((m) => m.category === category).sort((a, b) => a.displayOrder - b.displayOrder),
  })).filter((g) => g.people.length > 0);

  return (
    <div className="space-y-8">
      {byCategory.map((group) => (
        <div key={group.category}>
          <h4 className="font-serif text-base font-semibold text-ink-900">{group.category}</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {group.people.map((person) => (
              <div key={person.id} className="rounded-lg border border-ink-200 bg-white p-3.5">
                <p className="font-medium text-ink-900">{person.name}</p>
                {(person.designation || person.institution) && (
                  <p className="mt-0.5 text-sm text-ink-500">
                    {person.designation}
                    {person.designation && person.institution && ", "}
                    {person.institution}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
