// Supabase Edge Function: bunny-storage
// Unified storage handler for Bunny.net Storage & CDN (Media, Files, KYC)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-zone, x-path, x-file-name",
  "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
};

const BUNNY_ENDPOINT = Deno.env.get("BUNNY_STORAGE_ENDPOINT") || "storage.bunnycdn.com";

const ZONES: Record<string, { name: string; key: string; cdnUrl: string; isPrivate: boolean }> = {
  media: {
    name: Deno.env.get("BUNNY_STORAGE_MEDIA_ZONE") || "dukaio-media",
    key: Deno.env.get("BUNNY_STORAGE_MEDIA_KEY") || "f54ab9ae-24a4-4641-b564bf3b4eea-4a4d-4e59",
    cdnUrl: Deno.env.get("BUNNY_CDN_MEDIA_URL") || "https://dukaio-media.b-cdn.net",
    isPrivate: false,
  },
  files: {
    name: Deno.env.get("BUNNY_STORAGE_FILES_ZONE") || "dukaio-files",
    key: Deno.env.get("BUNNY_STORAGE_FILES_KEY") || "82f33962-59b2-483b-a53d70635e60-c9e4-4ad3",
    cdnUrl: Deno.env.get("BUNNY_CDN_FILES_URL") || "https://dukaio-files.b-cdn.net",
    isPrivate: false,
  },
  kyc: {
    name: Deno.env.get("BUNNY_STORAGE_KYC_ZONE") || "dukaio-kyc",
    key: Deno.env.get("BUNNY_STORAGE_KYC_KEY") || "3bc60ad7-f61f-4607-8374548ffc3d-de28-44bd",
    cdnUrl: "",
    isPrivate: true,
  },
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // If standard JSON command (upload request, delete, get-url)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const action = body.action;
      const zoneType = (body.zone || "media").toLowerCase();
      const zoneConfig = ZONES[zoneType] || ZONES.media;
      const path = (body.path || body.key || "").replace(/^\/+/, "");

      if (!path && action !== "list") {
        return json({ error: "Chemin (path) requis" }, 400);
      }

      // Action: DELETE
      if (action === "delete") {
        const deleteUrl = `https://${BUNNY_ENDPOINT}/${zoneConfig.name}/${path}`;
        const bunnyRes = await fetch(deleteUrl, {
          method: "DELETE",
          headers: { AccessKey: zoneConfig.key },
        });

        if (!bunnyRes.ok && bunnyRes.status !== 404) {
          const errText = await bunnyRes.text();
          return json({ error: `Erreur suppression Bunny: ${errText}` }, bunnyRes.status);
        }

        return json({ success: true, message: "Fichier supprimé de Bunny.net" });
      }

      // Action: GET_DOWNLOAD_URL
      if (action === "download" || action === "get_url") {
        const publicUrl = zoneConfig.cdnUrl
          ? `${zoneConfig.cdnUrl}/${path}`
          : `https://${BUNNY_ENDPOINT}/${zoneConfig.name}/${path}`;

        return json({
          success: true,
          url: publicUrl,
          path,
          zone: zoneConfig.name,
        });
      }

      // Action: UPLOAD (base64 payload)
      if (action === "upload_base64") {
        if (!body.base64Data) return json({ error: "base64Data manquant" }, 400);
        const binaryString = atob(body.base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const uploadUrl = `https://${BUNNY_ENDPOINT}/${zoneConfig.name}/${path}`;
        const bunnyRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            AccessKey: zoneConfig.key,
            "Content-Type": body.fileType || "application/octet-stream",
          },
          body: bytes,
        });

        if (!bunnyRes.ok) {
          const errText = await bunnyRes.text();
          return json({ error: `Erreur upload Bunny: ${errText}` }, bunnyRes.status);
        }

        const publicUrl = zoneConfig.cdnUrl ? `${zoneConfig.cdnUrl}/${path}` : uploadUrl;
        return json({
          success: true,
          url: publicUrl,
          path,
          zone: zoneConfig.name,
        });
      }
    }

    // Direct Binary / Stream upload: PUT or POST with x-zone and x-path headers
    const zoneHeader = (req.headers.get("x-zone") || "media").toLowerCase();
    const pathHeader = (req.headers.get("x-path") || "").replace(/^\/+/, "");
    const zoneConfig = ZONES[zoneHeader] || ZONES.media;

    if (!pathHeader) {
      return json({ error: "Header 'x-path' requis pour l'upload direct" }, 400);
    }

    const uploadUrl = `https://${BUNNY_ENDPOINT}/${zoneConfig.name}/${pathHeader}`;
    const bunnyRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: zoneConfig.key,
        "Content-Type": contentType || "application/octet-stream",
      },
      body: req.body,
    });

    if (!bunnyRes.ok) {
      const errText = await bunnyRes.text();
      return json({ error: `Échec upload Bunny: ${errText}` }, bunnyRes.status);
    }

    const publicUrl = zoneConfig.cdnUrl
      ? `${zoneConfig.cdnUrl}/${pathHeader}`
      : uploadUrl;

    return json({
      success: true,
      url: publicUrl,
      path: pathHeader,
      zone: zoneConfig.name,
    });
  } catch (err: any) {
    console.error("[bunny-storage] error:", err);
    return json({ error: err.message || "Erreur interne" }, 500);
  }
});

