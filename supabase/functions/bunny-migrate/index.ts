// Edge Function: bunny-migrate
// Migrates all existing product thumbnails, downloadable files, store logos and banners from Cloudflare R2 and Supabase Storage to Bunny.net
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { S3Client, GetObjectCommand } from "npm:@aws-sdk/client-s3@3.504.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.504.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUNNY_ENDPOINT = Deno.env.get("BUNNY_STORAGE_ENDPOINT") || "storage.bunnycdn.com";
const MEDIA_ZONE = Deno.env.get("BUNNY_STORAGE_MEDIA_ZONE") || "dukaio-media";
const MEDIA_KEY = Deno.env.get("BUNNY_STORAGE_MEDIA_KEY") || "f54ab9ae-24a4-4641-b564bf3b4eea-4a4d-4e59";
const MEDIA_CDN = Deno.env.get("BUNNY_CDN_MEDIA_URL") || "https://dukaio-media.b-cdn.net";

const FILES_ZONE = Deno.env.get("BUNNY_STORAGE_FILES_ZONE") || "dukaio-files";
const FILES_KEY = Deno.env.get("BUNNY_STORAGE_FILES_KEY") || "82f33962-59b2-483b-a53d70635e60-c9e4-4ad3";
const FILES_CDN = Deno.env.get("BUNNY_CDN_FILES_URL") || "https://dukaio-files.b-cdn.net";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Setup R2 S3 client if credentials exist
    const accountId = Deno.env.get("VITE_R2_ACCOUNT_ID") || Deno.env.get("R2_ACCOUNT_ID");
    const accessKeyId = Deno.env.get("VITE_R2_ACCESS_KEY_ID") || Deno.env.get("R2_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("VITE_R2_SECRET_ACCESS_KEY") || Deno.env.get("R2_SECRET_ACCESS_KEY");
    const privateBucket = Deno.env.get("VITE_R2_PRIVATE_BUCKET_NAME") || "dukaio-private";

    let s3Client: S3Client | null = null;
    if (accountId && accessKeyId && secretAccessKey) {
      s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
    }

    // Helper: Upload file to Bunny Storage
    const uploadToBunny = async (zone: string, key: string, path: string, data: Uint8Array, contentType: string) => {
      const cleanPath = path.replace(/^\/+/, "");
      const res = await fetch(`https://${BUNNY_ENDPOINT}/${zone}/${cleanPath}`, {
        method: "PUT",
        headers: {
          AccessKey: key,
          "Content-Type": contentType || "application/octet-stream",
        },
        body: data,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Bunny PUT error (${res.status}): ${text}`);
      }
    };

    let migratedThumbnails = 0;
    let migratedDownloads = 0;
    let migratedLogos = 0;
    let migratedBanners = 0;

    // ========================================================
    // 1. MIGRATE PRODUCT THUMBNAILS & DOWNLOADS
    // ========================================================
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("id, title, thumbnail_url, download_url, seo_image_url")
      .order("created_at", { ascending: false });

    if (pErr) throw pErr;
    log(`[MIGRATION] Found ${products?.length || 0} products to process`);

    for (const p of products || []) {
      const updates: Record<string, any> = {};

      // 1.A. Migrate Thumbnail
      if (p.thumbnail_url && !p.thumbnail_url.includes("dukaio-media.b-cdn.net")) {
        try {
          log(`[THUMBNAIL] Migrating product: ${p.title} (${p.thumbnail_url})`);
          const imgRes = await fetch(p.thumbnail_url);
          if (imgRes.ok) {
            const buf = new Uint8Array(await imgRes.arrayBuffer());
            const cType = imgRes.headers.get("content-type") || "image/png";
            const ext = cType.includes("jpeg") || cType.includes("jpg") ? "jpg" : "png";
            const bunnyPath = `thumbnails/${p.id}-${Date.now()}.${ext}`;

            await uploadToBunny(MEDIA_ZONE, MEDIA_KEY, bunnyPath, buf, cType);
            const newThumbUrl = `${MEDIA_CDN}/${bunnyPath}`;
            updates.thumbnail_url = newThumbUrl;
            migratedThumbnails++;
            log(`  -> Uploaded to Bunny: ${newThumbUrl}`);
          } else {
            log(`  -> Failed to fetch original thumbnail: status ${imgRes.status}`);
          }
        } catch (e: any) {
          log(`  -> Error migrating thumbnail for ${p.id}: ${e.message}`);
        }
      }

      // 1.B. Migrate Downloadable Files
      if (p.download_url && !p.download_url.includes("dukaio-files.b-cdn.net")) {
        try {
          let urls: string[] = [];
          let isJsonArray = false;
          try {
            const parsed = JSON.parse(p.download_url);
            if (Array.isArray(parsed)) {
              urls = parsed;
              isJsonArray = true;
            } else {
              urls = [p.download_url];
            }
          } catch {
            urls = [p.download_url];
          }

          const newUrls: string[] = [];
          for (const rawUrl of urls) {
            if (!rawUrl || rawUrl.includes("dukaio-files.b-cdn.net")) {
              if (rawUrl) newUrls.push(rawUrl);
              continue;
            }

            log(`[DOWNLOAD] Migrating file for: ${p.title} (${rawUrl})`);
            let fetchUrl = rawUrl;

            // If it's a relative path on R2 (e.g. "downloads/user/file.pdf")
            if (!rawUrl.startsWith("http") && s3Client) {
              const cmd = new GetObjectCommand({
                Bucket: privateBucket,
                Key: rawUrl,
              });
              fetchUrl = await getSignedUrl(s3Client, cmd, { expiresIn: 600 });
            }

            const fileRes = await fetch(fetchUrl);
            if (fileRes.ok) {
              const buf = new Uint8Array(await fileRes.arrayBuffer());
              const cType = fileRes.headers.get("content-type") || "application/octet-stream";
              const filename = rawUrl.split("/").pop() || `${Date.now()}.bin`;
              const bunnyPath = `downloads/${p.id}/${filename}`;

              await uploadToBunny(FILES_ZONE, FILES_KEY, bunnyPath, buf, cType);
              const newFileUrl = `${FILES_CDN}/${bunnyPath}`;
              newUrls.push(newFileUrl);
              migratedDownloads++;
              log(`  -> Uploaded deliverable to Bunny: ${newFileUrl} (${buf.byteLength} bytes)`);
            } else {
              log(`  -> Failed to fetch file ${fetchUrl}: status ${fileRes.status}`);
              newUrls.push(rawUrl); // preserve original if fetch failed
            }
          }

          if (newUrls.length > 0) {
            updates.download_url = isJsonArray ? JSON.stringify(newUrls) : newUrls[0];
          }
        } catch (e: any) {
          log(`  -> Error migrating download for ${p.id}: ${e.message}`);
        }
      }

      // If updates, save to DB
      if (Object.keys(updates).length > 0) {
        await supabase.from("products").update(updates).eq("id", p.id);
        log(`[DB] Updated product ${p.id} with new Bunny URLs`);
      }
    }

    // ========================================================
    // 2. MIGRATE STORE LOGOS & BANNERS
    // ========================================================
    const { data: stores } = await supabase.from("stores").select("id, name, logo_url, banner_url");
    log(`[MIGRATION] Found ${stores?.length || 0} stores to check`);

    for (const s of stores || []) {
      const storeUpdates: Record<string, any> = {};

      if (s.logo_url && !s.logo_url.includes("dukaio-media.b-cdn.net")) {
        try {
          const res = await fetch(s.logo_url);
          if (res.ok) {
            const buf = new Uint8Array(await res.arrayBuffer());
            const cType = res.headers.get("content-type") || "image/png";
            const filename = s.logo_url.split("/").pop()?.split("?")[0] || `${Date.now()}.png`;
            const bunnyPath = `logos/${s.id}/${filename}`;

            await uploadToBunny(MEDIA_ZONE, MEDIA_KEY, bunnyPath, buf, cType);
            storeUpdates.logo_url = `${MEDIA_CDN}/${bunnyPath}`;
            migratedLogos++;
            log(`[STORE LOGO] Migrated ${s.name} -> ${storeUpdates.logo_url}`);
          }
        } catch (e: any) {
          log(`[STORE LOGO] Error for ${s.name}: ${e.message}`);
        }
      }

      if (s.banner_url && !s.banner_url.includes("dukaio-media.b-cdn.net")) {
        try {
          const res = await fetch(s.banner_url);
          if (res.ok) {
            const buf = new Uint8Array(await res.arrayBuffer());
            const cType = res.headers.get("content-type") || "image/png";
            const filename = s.banner_url.split("/").pop()?.split("?")[0] || `${Date.now()}.png`;
            const bunnyPath = `banners/${s.id}/${filename}`;

            await uploadToBunny(MEDIA_ZONE, MEDIA_KEY, bunnyPath, buf, cType);
            storeUpdates.banner_url = `${MEDIA_CDN}/${bunnyPath}`;
            migratedBanners++;
            log(`[STORE BANNER] Migrated ${s.name} -> ${storeUpdates.banner_url}`);
          }
        } catch (e: any) {
          log(`[STORE BANNER] Error for ${s.name}: ${e.message}`);
        }
      }

      if (Object.keys(storeUpdates).length > 0) {
        await supabase.from("stores").update(storeUpdates).eq("id", s.id);
      }
    }

    log(`[MIGRATION COMPLETED] Thumbnails: ${migratedThumbnails}, Downloads: ${migratedDownloads}, Logos: ${migratedLogos}, Banners: ${migratedBanners}`);

    return new Response(
      JSON.stringify({
        success: true,
        migratedThumbnails,
        migratedDownloads,
        migratedLogos,
        migratedBanners,
        logs,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("[bunny-migrate] fatal error:", err);
    return new Response(
      JSON.stringify({ error: err.message, logs }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

