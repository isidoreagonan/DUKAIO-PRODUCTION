import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERREUR : Clés manquantes !");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CSV_PATH = 'C:/Users/DELL/Downloads/full_database_backup.csv';

// Fetch as array buffer (works in node 18+)
async function downloadFile(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return await response.arrayBuffer();
}

async function migrate() {
  console.log('🚀 Démarrage de la migration du Storage...');

  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = csvContent.split('\n');
  let jsonString = lines.slice(1).join('\n').trim();
  
  if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
    jsonString = jsonString.slice(1, -1).replace(/""/g, '"');
  }

  const data = JSON.parse(jsonString);
  const oldUrlBase = 'https://nexozjpjbhqfjplrogvz.supabase.co/storage/v1/object/public/';

  const urlsToMigrate = new Set();

  // Extract all old URLs from Products JSON
  if (data.products) {
    for (const p of data.products) {
      if (p.thumbnail_url && p.thumbnail_url.includes(oldUrlBase)) urlsToMigrate.add(p.thumbnail_url);
      if (p.download_url && p.download_url.includes(oldUrlBase)) urlsToMigrate.add(p.download_url);
    }
  }

  // Extract old URLs from stores.csv (since stores weren't in the massive JSON)
  try {
    const storesCsv = fs.readFileSync('C:/Users/DELL/Downloads/stores.csv', 'utf-8');
    const storeLines = storesCsv.split('\n');
    const headers = storeLines[0].split(';');
    const logoIdx = headers.indexOf('logo_url');
    const bannerIdx = headers.indexOf('banner_url');
    
    if (logoIdx !== -1 || bannerIdx !== -1) {
      for (let i = 1; i < storeLines.length; i++) {
        const cols = storeLines[i].split(';');
        if (cols.length > Math.max(logoIdx, bannerIdx)) {
          if (logoIdx !== -1 && cols[logoIdx] && cols[logoIdx].includes(oldUrlBase)) urlsToMigrate.add(cols[logoIdx]);
          if (bannerIdx !== -1 && cols[bannerIdx] && cols[bannerIdx].includes(oldUrlBase)) urlsToMigrate.add(cols[bannerIdx]);
        }
      }
    }
  } catch(e) {
    console.log('Note: stores.csv non trouvé ou ignoré.');
  }

  console.log(`📦 Trouvé ${urlsToMigrate.size} fichiers à migrer depuis les produits !`);

  // (Optional) add stores, course_lessons if needed, but since stores is missing in this JSON backup,
  // we could read stores.csv separately if requested. For now, products is the most critical.

  let count = 0;
  for (const url of urlsToMigrate) {
    count++;
    try {
      console.log(`\n[${count}/${urlsToMigrate.size}] Téléchargement: ${url}`);
      
      // Extract bucket and path
      // Example: https://.../public/product-assets/thumbnails/uuid/time.png
      const pathPart = url.replace(oldUrlBase, '');
      const parts = pathPart.split('/');
      const bucket = parts[0];
      const filePath = parts.slice(1).join('/');

      const fileData = await downloadFile(url);
      
      console.log(`✅ Téléchargé (${(fileData.byteLength / 1024 / 1024).toFixed(2)} MB). Upload en cours vers le bucket [${bucket}] -> ${filePath}...`);
      
      // Guess mime type from extension
      const ext = filePath.split('.').pop().toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === 'png') contentType = 'image/png';
      else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
      else if (ext === 'pdf') contentType = 'application/pdf';
      else if (ext === 'zip') contentType = 'application/zip';
      else if (ext === 'mp4') contentType = 'video/mp4';

      const { error } = await supabase.storage.from(bucket).upload(filePath, fileData, {
        contentType,
        upsert: true
      });

      if (error) {
         console.error(`❌ Erreur Upload:`, error.message);
      } else {
         console.log(`✅ Upload réussi !`);
      }
    } catch (e) {
      console.error(`❌ Erreur globale sur ce fichier:`, e.message);
    }
  }
  
  console.log('\n🎉 MIGRATION DU STORAGE TERMINÉE !');
}

migrate();
