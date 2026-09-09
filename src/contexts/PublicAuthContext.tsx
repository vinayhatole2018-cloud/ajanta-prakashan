"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ensureAnonymousSignIn, watchAuthState } from "@/firebase/auth";
import { getMyProfile } from "@/services/userService";
import { getAdminAccount } from "@/services/adminService";
import type { RegisteredUser } from "@/types";

interface PublicAuthState {
  /** True until the silent anonymous sign-in + profile lookup has completed once. */
  loading: boolean;
  uid: string | null;
  profile: RegisteredUser | null;
  /** True if this browser is signed in as an authorized admin (e.g. browsing the public site from the same session as /admin) — Firestore rules already let admins read everything, so the registration gate treats them as passed too. */
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const PublicAuthContext = createContext<PublicAuthState>({
  loading: true,
  uid: null,
  profile: null,
  isAdmin: false,
  refreshProfile: async () => {},
});

export function PublicAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<RegisteredUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshProfile = useCallback(async () => {
    const p = await getMyProfile();
    setProfile(p);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = watchAuthState(async (user) => {
      if (cancelled) return;
      if (!user) {
        // No session yet — silently establish one. This is not a login: no
        // credentials, no visible UI, just a stable device identity so
        // Firestore rules can tell "registered" apart from "not registered".
        try {
          await ensureAnonymousSignIn();
        } catch {
          setLoading(false);
        }
        return;
      }
      setUid(user.uid);
      try {
        // Not a real (non-anonymous) user visiting the public site while
        // signed into /admin still passes the gate — Firestore rules already
        // let admins read everything, so blocking them here would just be a
        // client-side false negative.
        const [p, admin] = await Promise.all([
          getMyProfile(),
          user.isAnonymous ? Promise.resolve(null) : getAdminAccount(user.uid).catch(() => null),
        ]);
        if (!cancelled) {
          setProfile(p);
          setIsAdmin(!!admin);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <PublicAuthContext.Provider value={{ loading, uid, profile, isAdmin, refreshProfile }}>
      {children}
    </PublicAuthContext.Provider>
  );
}

export function usePublicAuth() {
  return useContext(PublicAuthContext);
}
