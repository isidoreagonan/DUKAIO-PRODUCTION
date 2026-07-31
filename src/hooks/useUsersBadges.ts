import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BadgeGrade } from "@/components/VerifiedBadge";

/**
 * Batch fetch active badges for multiple user ids.
 * Returns a map { userId: grade }.
 */
export const useUsersBadges = (userIds: (string | null | undefined)[]) => {
  const [badges, setBadges] = useState<Record<string, BadgeGrade>>({});

  const key = [...new Set(userIds.filter(Boolean) as string[])].sort().join(",");

  useEffect(() => {
    const ids = key ? key.split(",") : [];
    if (!ids.length) {
      setBadges({});
      return;
    }
    let cancelled = false;
    supabase
      .from("verified_badges")
      .select("user_id, grade, status, expires_at")
      .in("user_id", ids)
      .eq("status", "active")
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map: Record<string, BadgeGrade> = {};
        for (const row of data) {
          if (!row.expires_at || new Date(row.expires_at) > new Date()) {
            map[row.user_id] = row.grade as BadgeGrade;
          }
        }
        setBadges(map);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return badges;
};
