import {
  type DocumentData,
  type QueryDocumentSnapshot,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/firebase/firestore";
import { getFirebaseAuth } from "@/firebase/config";
import { ensureAnonymousSignIn } from "@/firebase/auth";
import type { RegisteredUser, RegisteredUserInput } from "@/types";

const COLLECTION = "users";

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): RegisteredUser {
  return { id: snap.id, ...(snap.data() as Omit<RegisteredUser, "id">) };
}

/**
 * The document ID is the registrant's own (anonymous, credential-free) auth
 * uid — see ensureAnonymousSignIn(). Firestore rules only let a visitor
 * create/update the doc at users/{their own uid}, so this doubles as both
 * "register" (first write) and "edit my profile" (any later write); there is
 * no separate update function for the public profile flow.
 */
export async function registerUser(input: RegisteredUserInput): Promise<void> {
  const { user } = await ensureAnonymousSignIn();
  await setDoc(doc(getFirebaseDb(), COLLECTION, user.uid), {
    ...input,
    email: input.email || null,
    state: input.state || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/** The current visitor's own registration, or null if they haven't registered on this device. */
export async function getMyProfile(): Promise<RegisteredUser | null> {
  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) return null;
  return getUserById(uid);
}

export async function getUserById(id: string): Promise<RegisteredUser | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<RegisteredUser, "id">) };
}

export async function updateUser(id: string, input: Partial<RegisteredUserInput>): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { ...input, updatedAt: serverTimestamp() });
}

export async function deleteUser(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}

export interface UserListPage {
  items: RegisteredUser[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export interface UserFilters {
  city?: string;
  state?: string;
  designation?: string;
}

/** Admin: paginated listing, newest first. Free-text search filters the fetched page client-side. */
export async function listUsersAdmin(opts: {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
  filters?: UserFilters;
}): Promise<UserListPage> {
  const pageSize = opts.pageSize ?? 25;
  const db = getFirebaseDb();
  const clauses = [] as ReturnType<typeof where>[];
  if (opts.filters?.city) clauses.push(where("city", "==", opts.filters.city));
  if (opts.filters?.state) clauses.push(where("state", "==", opts.filters.state));
  if (opts.filters?.designation) clauses.push(where("designation", "==", opts.filters.designation));

  let q = query(collection(db, COLLECTION), ...clauses, orderBy("createdAt", "desc"), limit(pageSize + 1));
  if (opts.cursor) {
    q = query(collection(db, COLLECTION), ...clauses, orderBy("createdAt", "desc"), startAfter(opts.cursor), limit(pageSize + 1));
  }
  const snap = await getDocs(q);
  const docs = snap.docs.slice(0, pageSize);
  return { items: docs.map(fromDoc), lastDoc: docs.length ? docs[docs.length - 1] : null, hasMore: snap.docs.length > pageSize };
}

export async function countUsers(): Promise<number> {
  const snap = await getCountFromServer(query(collection(getFirebaseDb(), COLLECTION)));
  return snap.data().count;
}

/**
 * For CSV export: fetches up to `max` users (respecting filters), newest first.
 * Bounded on purpose — export is explicit admin action, not an unbounded scan.
 */
export async function fetchUsersForExport(filters: UserFilters, max = 5000): Promise<RegisteredUser[]> {
  const db = getFirebaseDb();
  const clauses = [] as ReturnType<typeof where>[];
  if (filters.city) clauses.push(where("city", "==", filters.city));
  if (filters.state) clauses.push(where("state", "==", filters.state));
  if (filters.designation) clauses.push(where("designation", "==", filters.designation));
  const snap = await getDocs(query(collection(db, COLLECTION), ...clauses, orderBy("createdAt", "desc"), limit(max)));
  return snap.docs.map(fromDoc);
}
