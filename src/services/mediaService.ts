import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/firebase/firestore";
import type { MediaInput, MediaRecord, MediaType } from "@/types";

const COLLECTION = "media";

export async function listMedia(opts?: { type?: MediaType | "all"; conferenceId?: string }): Promise<MediaRecord[]> {
  const db = getFirebaseDb();
  const clauses = [] as ReturnType<typeof where>[];
  if (opts?.type && opts.type !== "all") clauses.push(where("type", "==", opts.type));
  if (opts?.conferenceId) clauses.push(where("conferenceId", "==", opts.conferenceId));
  const snap = await getDocs(query(collection(db, COLLECTION), ...clauses, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MediaRecord, "id">) }));
}

export async function createMedia(input: MediaInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMedia(id: string, input: Partial<MediaInput>): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { ...input, updatedAt: serverTimestamp() });
}

export async function deleteMedia(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}

export async function countMedia(): Promise<number> {
  const snap = await getCountFromServer(query(collection(getFirebaseDb(), COLLECTION)));
  return snap.data().count;
}
