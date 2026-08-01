import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const accountId = "f57d75a3e9e9f18d7d248df3b9b5a603";
const accessKeyId = "51c5be5576b8ff9dc3685c8e4e9615d1";
const secretAccessKey = "48b9fe4c5c30e2120eec5439409b4d62c0f85fa5e7722529cf675a5d10c38c5a";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

const corsConfig = {
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedOrigins: ["*"],
        AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        AllowedHeaders: ["*"],
        ExposeHeaders: ["*"],
        MaxAgeSeconds: 3600,
      },
    ],
  },
};

async function setCors(bucketName) {
  try {
    console.log(`Setting CORS for ${bucketName}...`);
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: bucketName,
      ...corsConfig
    }));
    console.log(`✅ Successfully set CORS for ${bucketName}`);
  } catch (error) {
    console.error(`❌ Error setting CORS for ${bucketName}:`, error);
  }
}

async function run() {
  await setCors("dukaio-public");
  await setCors("dukaio-private");
}

run();
