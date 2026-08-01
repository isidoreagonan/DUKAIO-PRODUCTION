import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const oldUrl = 'https://nexozjpjbhqfjplrogvz.supabase.co';
const newUrl = 'https://lljbqdkygwhsngyhrxmx.supabase.co';

async function importStores() {
  try {
    const storesCsv = fs.readFileSync('C:/Users/DELL/Downloads/stores.csv', 'utf-8');
    
    // Parse using csv-parse to handle quotes and newlines properly
    const records = parse(storesCsv, {
      delimiter: ';',
      columns: true,
      skip_empty_lines: true
    });
    
    const storesToImport = [];
    
    for (const record of records) {
      const store = {};
      for (const key of Object.keys(record)) {
         let val = record[key];
         if (val === 't' || val === 'TRUE' || val === 'true') val = true;
         if (val === 'f' || val === 'FALSE' || val === 'false') val = false;
         if (val === '') val = null;
         
         // Fix URLs
         if (typeof val === 'string' && val.includes(oldUrl)) {
             val = val.replace(oldUrl, newUrl);
         }
         
         store[key] = val;
      }
      storesToImport.push(store);
    }
    
    console.log(`⏳ Importation de [stores] (${storesToImport.length} lignes)...`);
    const { error } = await supabase.from('stores').upsert(storesToImport, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Erreur sur la table [stores]:`, error.message);
    } else {
      console.log(`✅ Table [stores] importée avec succès (${storesToImport.length} boutiques insérées) !`);
    }
  } catch(e) {
    console.error(e);
  }
}
importStores();
