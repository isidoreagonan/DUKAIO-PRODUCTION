import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BadgeGrade } from "@/components/VerifiedBadge";

export const useUserBadge = (userId: string | null | undefined) => {
  const [grade, setGrade] = useState<BadgeGrade | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setGrade(null);
      setExpiresAt(null);
      return;
    }
    setLoading(true);
    supabase
      .from("verified_badges")
      .select("grade, status, expires_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle()
      .then(({ data }) => {
        if (data && (!data.expires_at || new Date(data.expires_at) > new Date())) {
          setGrade(data.grade as BadgeGrade);
          setExpiresAt(data.expires_at ?? null);
        } else {
          setGrade(null);
          setExpiresAt(null);
        }
        setLoading(false);
      });
  }, [userId]);

  return { grade, expiresAt, loading };
};
