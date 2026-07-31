import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface StoreData {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  brand_color: string | null;
  font: string | null;
  corner_style: string | null;
  button_animation: string | null;
  show_featured: boolean | null;
  show_buy_button: boolean | null;
  show_recommended: boolean | null;
  product_layout: string | null;
  sort_order: string | null;
  theme: string | null;
  keywords: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export const useActiveStore = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as StoreData[];
    },
    enabled: !!user?.id,
  });

  const activeStores = stores.filter((s) => !s.is_archived);
  
  // Auto-select first active store
  useEffect(() => {
    if (!activeStoreId && activeStores.length > 0) {
      setActiveStoreId(activeStores[0].id);
    }
    // If selected store was archived, switch to first active
    if (activeStoreId && !stores.find((s) => s.id === activeStoreId)) {
      setActiveStoreId(activeStores[0]?.id || null);
    }
  }, [stores, activeStoreId]);

  const activeStore = stores.find((s) => s.id === activeStoreId) || null;

  const updateStore = useMutation({
    mutationFn: async (updates: Partial<StoreData>) => {
      if (!activeStoreId) throw new Error("No active store");
      const { error } = await supabase
        .from("stores")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", activeStoreId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });

  return {
    stores,
    activeStores,
    activeStore,
    activeStoreId,
    setActiveStoreId,
    updateStore,
    isLoading,
    hasStores: stores.length > 0,
  };
};
