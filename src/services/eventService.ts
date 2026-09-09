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
import type { ContentStatus, EventInput, EventItem } from "@/types";

const COLLECTION = "events";

function eventFromDoc(snap: QueryDocumentSnapshot<DocumentData>): EventItem {
  return { id: snap.id, ...(snap.data() as Omit<EventItem, "id">) };
}

export async function getEventById(id: string): Promise<EventItem | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<EventItem, "id">) };
}

export async function createEvent(input: EventInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEvent(id: string, input: Partial<EventInput>): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { ...input, updatedAt: serverTimestamp() });
}

export async function setEventStatus(id: string, status: ContentStatus): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { status, updatedAt: serverTimestamp() });
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}

export interface EventListPage {
  items: EventItem[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export async function listEventsAdmin(opts: {
  status?: ContentStatus | "all";
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}): Promise<EventListPage> {
  const pageSize = opts.pageSize ?? 25;
  const clauses = [] as ReturnType<typeof where>[];
  if (opts.status && opts.status !== "all") clauses.push(where("status", "==", opts.status));

  let q = query(collection(getFirebaseDb(), COLLECTION), ...clauses, orderBy("updatedAt", "desc"), limit(pageSize + 1));
  if (opts.cursor) {
    q = query(collection(getFirebaseDb(), COLLECTION), ...clauses, orderBy("updatedAt", "desc"), startAfter(opts.cursor), limit(pageSize + 1));
  }
  const snap = await getDocs(q);
  const docs = snap.docs.slice(0, pageSize);
  return { items: docs.map(eventFromDoc), lastDoc: docs.length ? docs[docs.length - 1] : null, hasMore: snap.docs.length > pageSize };
}

export async function getPublishedEvents(opts: { pageSize?: number; cursor?: QueryDocumentSnapshot<DocumentData> | null }): Promise<EventListPage> {
  const pageSize = opts.pageSize ?? 12;
  const today = new Date().toISOString().slice(0, 10);
  const db = getFirebaseDb();
  let q = query(
    collection(db, COLLECTION),
    where("status", "==", "published"),
    where("date", ">=", today),
    orderBy("date", "asc"),
    limit(pageSize + 1)
  );
  if (opts.cursor) {
    q = query(
      collection(db, COLLECTION),
      where("status", "==", "published"),
      where("date", ">=", today),
      orderBy("date", "asc"),
      startAfter(opts.cursor),
      limit(pageSize + 1)
    );
  }
  const snap = await getDocs(q);
  const docs = snap.docs.slice(0, pageSize);
  return { items: docs.map(eventFromDoc), lastDoc: docs.length ? docs[docs.length - 1] : null, hasMore: snap.docs.length > pageSize };
}

export async function getEventsByConference(conferenceId: string): Promise<EventItem[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("conferenceId", "==", conferenceId), where("status", "==", "published"), orderBy("date", "asc"))
  );
  return snap.docs.map(eventFromDoc);
}

export async function countEvents(): Promise<{ total: number; published: number; active: number }> {
  const db = getFirebaseDb();
  const today = new Date().toISOString().slice(0, 10);
  const [all, published, active] = await Promise.all([
    getCountFromServer(query(collection(db, COLLECTION))),
    getCountFromServer(query(collection(db, COLLECTION), where("status", "==", "published"))),
    getCountFromServer(query(collection(db, COLLECTION), where("status", "==", "published"), where("date", ">=", today))),
  ]);
  return { total: all.data().count, published: published.data().count, active: active.data().count };
}
