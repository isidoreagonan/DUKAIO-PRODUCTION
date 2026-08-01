import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand, GetObjectCommand } from "npm:@aws-sdk/client-s3@3.504.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.504.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, bucket, key, contentType } = await req.json();

    const accountId = Deno.env.get('VITE_R2_ACCOUNT_ID') || Deno.env.get('R2_ACCOUNT_ID');
    const accessKeyId = Deno.env.get('VITE_R2_ACCESS_KEY_ID') || Deno.env.get('R2_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('VITE_R2_SECRET_ACCESS_KEY') || Deno.env.get('R2_SECRET_ACCESS_KEY');

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('Cloudflare R2 credentials not configured');
    }

    if (!action || !bucket || !key) {
      throw new Error('Missing required parameters (action, bucket, key)');
    }

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    if (action === 'upload') {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      });

      // Generate a presigned URL that expires in 1 hour (3600 seconds)
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      return new Response(JSON.stringify({ url, method: 'PUT' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'download') {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      // Generate a presigned URL that expires in 1 hour
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      return new Response(JSON.stringify({ url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action. Use "upload" or "download".');

  } catch (error) {
    console.error("R2 Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
