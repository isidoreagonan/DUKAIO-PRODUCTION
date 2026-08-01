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
      forcePathStyle: true,
    });

    if (req.method === 'POST') {
      // Direct upload proxy to bypass CORS
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const bucketName = formData.get('bucket') as string;
      const keyName = formData.get('key') as string;
      
      if (!file || !bucketName || !keyName) {
        throw new Error('Missing file, bucket, or key');
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: keyName,
        ContentType: file.type,
        Body: buffer,
      });

      await s3Client.send(command);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Legacy presigned URL handling
    const { action, bucket, key, contentType } = await req.json();

    if (!action || !bucket || !key) {
      throw new Error('Missing required parameters (action, bucket, key)');
    }

    if (action === 'upload') {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      });

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

      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      return new Response(JSON.stringify({ url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
