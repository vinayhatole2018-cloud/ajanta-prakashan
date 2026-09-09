import {
  type DocumentData,
  type QueryDocumentSnapshot,
  addDoc,
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
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/firebase/firestore";
import type { Conference, ConferenceInput, ContentStatus } from "@/types";

const COLLECTION = "conferences";

function conferenceFromDoc(snap: QueryDocumentSnapshot<DocumentData>): Conference {
  return { id: snap.id, ...(snap.data() as Omit<Conference, "id">) };
}

export async function getConferenceById(id: string): Promise<Conference | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Conference, "id">) };
}

export async function createConference(input: ConferenceInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateConference(id: string, input: Partial<ConferenceInput>): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function setConferenceStatus(id: string, status: ContentStatus): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { status, updatedAt: serverTimestamp() });
}

export async function deleteConference(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}

export interface ConferenceListPage {
  items: Conference[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

/** Admin: paginated listing, most recently updated first, optional status filter. */
export async function listConferencesAdmin(opts: {
  status?: ContentStatus | "all";
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}): Promise<ConferenceListPage> {
  const pageSize = opts.pageSize ?? 25;
  const clauses = [] as ReturnType<typeof where>[];
  if (opts.status && opts.status !== "all") clauses.push(where("status", "==", opts.status));

  let q = query(collection(getFirebaseDb(), COLLECTION), ...clauses, orderBy("updatedAt", "desc"), limit(pageSize + 1));
  if (opts.cursor) {
    q = query(collection(getFirebaseDb(), COLLECTION), ...clauses, orderBy("updatedAt", "desc"), startAfter(opts.cursor), limit(pageSize + 1));
  }

  const snap = await getDocs(q);
  const docs = snap.docs.slice(0, pageSize);
  return {
    items: docs.map(conferenceFromDoc),
    lastDoc: docs.length ? docs[docs.length - 1] : null,
    hasMore: snap.docs.length > pageSize,
  };
}

/** Public: published conferences, upcoming (date >= today) or past (date < today), paginated. */
export async function getPublishedConferences(opts: {
  when: "upcoming" | "past" | "all";
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}): Promise<ConferenceListPage> {
  const pageSize = opts.pageSize ?? 12;
  const today = new Date().toISOString().slice(0, 10);
  const db = getFirebaseDb();

  const baseClauses = [where("status", "==", "published")];
  const direction = opts.when === "past" ? "desc" : "asc";
  if (opts.when === "upcoming") baseClauses.push(where("date", ">=", today));
  if (opts.when === "past") baseClauses.push(where("date", "<", today));

  let q = query(collection(db, COLLECTION), ...baseClauses, orderBy("date", direction), limit(pageSize + 1));
  if (opts.cursor) {
    q = query(collection(db, COLLECTION), ...baseClauses, orderBy("date", direction), startAfter(opts.cursor), limit(pageSize + 1));
  }

  const snap = await getDocs(q);
  const docs = snap.docs.slice(0, pageSize);
  return {
    items: docs.map(conferenceFromDoc),
    lastDoc: docs.length ? docs[docs.length - 1] : null,
    hasMore: snap.docs.length > pageSize,
  };
}

/**
 * Firestore has no full-text search. This fetches a bounded page of published
 * conferences and filters client-side over title/theme/city/venue. Fine for a
 * single organizer's conference volume; if search needs to scale beyond a few
 * hundred documents, swap this function's internals for a dedicated search
 * service (e.g. Algolia/Typesense) — callers do not need to change.
 */
export async function searchPublishedConferences(searchText: string): Promise<Conference[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, COLLECTION), where("status", "==", "published"), orderBy("date", "desc"), limit(200));
  const snap = await getDocs(q);
  const items = snap.docs.map(conferenceFromDoc);
  const needle = searchText.trim().toLowerCase();
  if (!needle) return items;
  return items.filter((c) =>
    [c.title, c.theme, c.city, c.venue].some((field) => field?.toLowerCase().includes(needle))
  );
}

/** Lightweight list for select dropdowns (event/notification/committee/media forms). */
export async function listAllConferencesForSelect(): Promise<Pick<Conference, "id" | "title" | "date">[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy("date", "desc"), limit(200)));
  return snap.docs.map((d) => ({ id: d.id, title: (d.data() as Conference).title, date: (d.data() as Conference).date }));
}

export async function countConferences(): Promise<{ total: number; published: number; upcoming: number; past: number; archived: number }> {
  const db = getFirebaseDb();
  const today = new Date().toISOString().slice(0, 10);
  const [all, published, upcoming, past, archived] = await Promise.all([
    getCountFromServer(query(collection(db, COLLECTION))),
    getCountFromServer(query(collection(db, COLLECTION), where("status", "==", "published"))),
    getCountFromServer(query(collection(db, COLLECTION), where("status", "==", "published"), where("date", ">=", today))),
    getCountFromServer(query(collection(db, COLLECTION), where("status", "==", "published"), where("date", "<", today))),
    getCountFromServer(query(collection(db, COLLECTION), where("status", "==", "archived"))),
  ]);
  return {
    total: all.data().count,
    published: published.data().count,
    upcoming: upcoming.data().count,
    past: past.data().count,
    archived: archived.data().count,
  };
}
