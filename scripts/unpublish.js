import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Fetching stores to determine users with stores...");
  
  const { data: stores, error: storesError } = await supabaseAdmin.from("stores").select("owner_id");
  if (storesError) {
    console.error("Error fetching stores:", storesError);
    return;
  }
  
  const ownersWithStores = new Set(stores?.map(s => s.owner_id));
  console.log(`Found ${ownersWithStores.size} unique users with stores.`);
  
  console.log("Fetching published products...");
  const { data: products, error: productsError } = await supabaseAdmin.from("products").select("id, title, creator_id").eq("is_published", true);
  if (productsError) {
    console.error("Error fetching products:", productsError);
    return;
  }
  
  const orphanedProducts = products?.filter(p => !ownersWithStores.has(p.creator_id)) || [];
  console.log(`Found ${orphanedProducts.length} published products created by users with NO stores.`);
  
  if (orphanedProducts.length === 0) {
    console.log("Nothing to do.");
    return;
  }
  
  console.log("Unpublishing orphaned products...");
  let count = 0;
  for (const p of orphanedProducts) {
    const { error } = await supabaseAdmin.from("products").update({ is_published: false }).eq("id", p.id);
    if (error) {
      console.error(`Failed to unpublish product ${p.id} (${p.title}):`, error);
    } else {
      console.log(`Unpublished product: ${p.title}`);
      count++;
    }
  }
  
  console.log(`Successfully unpublished ${count} products.`);
}

run();
