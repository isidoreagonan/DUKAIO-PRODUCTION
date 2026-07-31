import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  store_slug: string | null;
  store_description: string | null;
  contact: string | null;
  onboarding_completed: boolean | null;
  last_2fa_verified_at: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  requires2FA: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const fallbackAuthContext: AuthContextType = {
  session: null,
  user: null,
  profile: null,
  loading: false,
  requires2FA: false,
  signOut: async () => {},
  refreshProfile: async () => {},
};

export const useAuth = () => {
  return useContext(AuthContext) ?? fallbackAuthContext;
};

const INACTIVITY_LIMIT_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
const TWOFA_VALIDITY_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
const ACTIVITY_KEY = "dukaio_last_activity";

const updateActivity = () => {
  try {
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
};

const getLastActivity = (): number | null => {
  try {
    const v = localStorage.getItem(ACTIVITY_KEY);
    return v ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const latestProfileUserIdRef = useRef<string | null>(null);
  const authEventReceivedRef = useRef(false);
  const bootstrapCompletedRef = useRef(false);
  const signingOutRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    latestProfileUserIdRef.current = userId;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (latestProfileUserIdRef.current !== userId) return;

      if (error) {
        console.error("Erreur chargement profil:", error.message);
        setProfile(null);
        return;
      }

      if (data) {
        setProfile(data as Profile);
        return;
      }

      const { data: createdProfile, error: createError } = await supabase
        .from("profiles")
        .upsert({ id: userId }, { onConflict: "id" })
        .select("*")
        .single();

      if (latestProfileUserIdRef.current !== userId) return;

      if (createError) {
        console.error("Erreur création profil:", createError.message);
        setProfile(null);
        return;
      }

      setProfile(createdProfile as Profile);
    } catch (err) {
      if (latestProfileUserIdRef.current !== userId) return;
      console.error("Erreur inattendue profil:", err);
      setProfile(null);
    }
  }, []);

  const syncSession = useCallback(async (nextSession: Session | null) => {
    const nextUser = nextSession?.user ?? null;

    setSession(nextSession);
    setUser(nextUser);

    if (!nextUser) {
      latestProfileUserIdRef.current = null;
      setProfile(null);
      return;
    }

    await fetchProfile(nextUser.id);
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [fetchProfile, user]);

  // Track activity (page load + visibility + interval)
  useEffect(() => {
    if (!user) return;
    updateActivity();
    const id = window.setInterval(updateActivity, 5 * 60 * 1000); // every 5 min
    const onVis = () => {
      if (document.visibilityState === "visible") updateActivity();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void supabase.auth.startAutoRefresh();
      } else {
        void supabase.auth.stopAutoRefresh();
      }
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const scheduleSessionSync = (nextSession: Session | null) => {
      window.setTimeout(() => {
        if (!mounted) return;

        void syncSession(nextSession).finally(() => {
          if (mounted && bootstrapCompletedRef.current) {
            setLoading(false);
          }
        });
      }, 0);
    };

    const recoverAfterUnexpectedSignedOut = () => {
      window.setTimeout(() => {
        if (!mounted) return;

        void supabase.auth.getSession()
          .then(async ({ data: { session: recoveredSession } }) => {
            if (!mounted) return;
            await syncSession(recoveredSession);
          })
          .finally(() => {
            if (mounted) setLoading(false);
          });
      }, 250);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION") return;

      authEventReceivedRef.current = true;
      bootstrapCompletedRef.current = true;

      if (event === "TOKEN_REFRESHED") {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        return;
      }

      if (event === "SIGNED_OUT" && !signingOutRef.current && !nextSession) {
        setLoading(true);
        recoverAfterUnexpectedSignedOut();
        return;
      }

      setLoading(true);
      scheduleSessionSync(nextSession);
    });

    const bootstrapAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        // Inactivity check: force logout if no activity for >5 days
        if (currentSession?.user) {
          const last = getLastActivity();
          if (last && Date.now() - last > INACTIVITY_LIMIT_MS) {
            console.log("Inactivité dépassée, déconnexion automatique");
            try {
              await supabase.auth.signOut();
            } catch {
              /* ignore */
            }
            try {
              localStorage.removeItem(ACTIVITY_KEY);
            } catch {
              /* ignore */
            }
            setSession(null);
            setUser(null);
            setProfile(null);
            return;
          }
        }

        if (!authEventReceivedRef.current) {
          await syncSession(currentSession);
        }
      } catch (err) {
        console.error("Erreur bootstrap auth:", err);
      } finally {
        if (mounted) {
          bootstrapCompletedRef.current = true;
          setLoading(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void supabase.auth.startAutoRefresh();
      subscription.unsubscribe();
    };
  }, [syncSession]);

  const signOut = useCallback(async () => {
    signingOutRef.current = true;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erreur déconnexion:", error.message);
      }
      try {
        localStorage.removeItem(ACTIVITY_KEY);
      } catch {
        /* ignore */
      }
      await syncSession(null);
    } finally {
      signingOutRef.current = false;
      setLoading(false);
    }
  }, [syncSession]);

  const requires2FA = useMemo(() => {
    if (!user || !profile) return false;
    if (!profile.last_2fa_verified_at) return true;
    const verifiedAt = new Date(profile.last_2fa_verified_at).getTime();
    if (Number.isNaN(verifiedAt)) return true;
    return Date.now() - verifiedAt > TWOFA_VALIDITY_MS;
  }, [user, profile]);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, requires2FA, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
