"use client";

import { getApps } from "firebase/app";
import { type Messaging, getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

let messaging: Messaging | undefined;

async function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  if (!getApps().length) return null;
  if (!(await isSupported().catch(() => false))) return null;
  if (!messaging) messaging = getMessaging();
  return messaging;
}

/**
 * User-friendly permission flow: only call this from an explicit user action
 * (e.g. clicking "Enable notifications"), never automatically on page load.
 */
export async function requestNotificationPermissionAndToken(): Promise<string | null> {
  const instance = await getMessagingInstance();
  if (!instance) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn("NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set; cannot register for push notifications.");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(instance, { vapidKey, serviceWorkerRegistration: registration });
    return token ?? null;
  } catch (err) {
    console.error("Failed to get FCM token", err);
    return null;
  }
}

export async function onForegroundMessage(callback: (payload: unknown) => void) {
  const instance = await getMessagingInstance();
  if (!instance) return () => {};
  return onMessage(instance, callback);
}

export async function isPushSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  return isSupported().catch(() => false);
}
