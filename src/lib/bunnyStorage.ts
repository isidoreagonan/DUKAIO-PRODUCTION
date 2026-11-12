import axios from "axios";
import { supabase } from "@/integrations/supabase/client";

export type StorageZone = "media" | "files" | "kyc";

export interface BunnyUploadResult {
  url: string;
  path: string;
  zone: string;
}

/**
 * Uploads a file directly to Bunny.net via the bunny-storage Edge Function.
 * Supports progress tracking and automatic zone routing.
 */
export async function uploadToBunny(
  file: File | Blob,
  path: string,
  zone: StorageZone = "media",
  onProgress?: (progress: number) => void
): Promise<BunnyUploadResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const endpoint = `${supabaseUrl}/functions/v1/bunny-storage`;

  const cleanPath = path.replace(/^\/+/, "");

  const response = await axios.post(endpoint, file, {
    headers: {
      "Content-Type": (file as File).type || "application/octet-stream",
      "x-zone": zone,
      "x-path": cleanPath,
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });

  if (response.status !== 200 || !response.data?.url) {
    throw new Error(response.data?.error || "Échec de l'upload sur Bunny.net");
  }

  return {
    url: response.data.url,
    path: response.data.path,
    zone: response.data.zone,
  };
}

/**
 * Deletes a file from Bunny.net
 */
export async function deleteFromBunny(
  path: string,
  zone: StorageZone = "media"
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke("bunny-storage", {
      body: {
        action: "delete",
        zone,
        path: path.replace(/^\/+/, ""),
      },
    });

    if (error) {
      console.error("[deleteFromBunny] Error:", error);
      return false;
    }
    return data?.success === true;
  } catch (err) {
    console.error("[deleteFromBunny] Exception:", err);
    return false;
  }
}
