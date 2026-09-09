import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/firebase/firestore";
import type { CommitteeMember, CommitteeMemberInput } from "@/types";

const COLLECTION = "committees";

export async function getCommitteesByConference(conferenceId: string): Promise<CommitteeMember[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("conferenceId", "==", conferenceId), orderBy("displayOrder", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CommitteeMember, "id">) }));
}

export async function createCommitteeMember(input: CommitteeMemberInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCommitteeMember(id: string, input: Partial<CommitteeMemberInput>): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { ...input, updatedAt: serverTimestamp() });
}

export async function deleteCommitteeMember(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}

export async function reorderCommitteeMember(id: string, displayOrder: number): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { displayOrder, updatedAt: serverTimestamp() });
}
