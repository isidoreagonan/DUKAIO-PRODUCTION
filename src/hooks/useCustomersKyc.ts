import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns a Set of customer IDs (among the given list) that have an approved KYC.
 * Used to display a blue verified badge next to customer reviews.
 */
export const useCustomersKyc = (customerIds: string[]) => {
  const [verifiedSet, setVerifiedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!customerIds.length) {
      setVerifiedSet(new Set());
      return;
    }
    const unique = Array.from(new Set(customerIds.filter(Boolean)));
    (async () => {
      // Fetch customers -> auth_id mapping
      const { data: customers } = await supabase
        .from("customers")
        .select("id, auth_id")
        .in("id", unique);
      const authIds = (customers || []).map((c: any) => c.auth_id).filter(Boolean);
      if (!authIds.length) {
        setVerifiedSet(new Set());
        return;
      }
      const { data: kyc } = await supabase
        .from("identity_verifications")
        .select("user_id, status")
        .in("user_id", authIds)
        .eq("status", "approved");
      const verifiedAuthIds = new Set((kyc || []).map((k: any) => k.user_id));
      const verifiedCustomerIds = new Set(
        (customers || [])
          .filter((c: any) => c.auth_id && verifiedAuthIds.has(c.auth_id))
          .map((c: any) => c.id),
      );
      setVerifiedSet(verifiedCustomerIds);
    })();
  }, [customerIds.join(",")]);

  return verifiedSet;
};
