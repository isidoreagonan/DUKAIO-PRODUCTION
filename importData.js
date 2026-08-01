import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// CONFIGURATION OBLIGATOIRE :
// Remplace 'TA_CLE_SERVICE_ROLE_ICI' par ta vraie clé service_role (Project Settings > API > service_role)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'TA_CLE_SERVICE_ROLE_ICI';

if (!SUPABASE_URL || SUPABASE_SERVICE_ROLE_KEY === 'TA_CLE_SERVICE_ROLE_ICI') {
  console.error("❌ ERREUR : Il manque l'URL ou la clé SERVICE_ROLE dans la configuration !");
  process.exit(1);
}

// Initialiser le client Supabase en mode ADMINISTRATEUR (contourne les sécurités)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const CSV_PATH = 'C:/Users/DELL/Downloads/full_database_backup.csv';

async function importData() {
  console.log('🔄 Démarrage de l\'importation des données...');

  try {
    // 1. Lire le fichier CSV
    console.log('📖 Lecture du fichier CSV géant...');
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');

    // 2. Extraire le JSON (Le CSV met des guillemets doubles "" pour échapper les guillemets)
    const lines = csvContent.split('\n');
    let jsonString = lines.slice(1).join('\n').trim();
    
    // Si la chaîne commence par des guillemets, on les enlève
    if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
      jsonString = jsonString.slice(1, -1);
      // Remplacer les doubles guillemets par des simples guillemets
      jsonString = jsonString.replace(/""/g, '"');
    }

    // REMPLACEMENT DES URLS LOVABLE PAR LES NOUVELLES URLS SUPABASE
    console.log('🔗 Correction des URLs de fichiers...');
    const oldUrl = 'https://nexozjpjbhqfjplrogvz.supabase.co';
    const newUrl = 'https://lljbqdkygwhsngyhrxmx.supabase.co';
    // Utiliser une expression régulière globale pour tout remplacer
    jsonString = jsonString.split(oldUrl).join(newUrl);

    // 3. Parser le JSON
    console.log('🧠 Analyse (Parsing) des données...');
    const data = JSON.parse(jsonString);

    // 4. Ordre d'importation
    const tablesToImport = [
      'users',
      'profiles',
      'stores',
      'products',
      'customers',
      'orders',
      'cart_events',
      'wallets',
      'user_wallets',
      'wallet_transactions',
      'withdrawals',
      'licenses',
      'license_activations',
      'promo_codes',
      'automations',
      'support_tickets',
      'support_ticket_messages'
    ];

    for (const table of tablesToImport) {
      if (table === 'users') {
         continue; // Skipped, already done via SQL
      }

      if (!data[table] || data[table].length === 0) {
        console.log(`⏩ Table [${table}] : Vide ou ignorée.`);
        continue;
      }

      console.log(`⏳ Importation de [${table}] (${data[table].length} lignes)...`);

      let conflictKey = 'id';
      if (table === 'user_wallets') conflictKey = 'user_id';
      if (table === 'wallet_pins') conflictKey = 'wallet_id'; // just in case

      const { error } = await supabase
        .from(table)
        .upsert(data[table], { onConflict: conflictKey });

      if (error) {
        console.error(`❌ Erreur sur la table [${table}]:`, error.message);
      } else {
        console.log(`✅ Table [${table}] importée avec succès !`);
      }
    }

    console.log('🎉 TOUTES LES DONNÉES ONT ÉTÉ IMPORTÉES AVEC SUCCÈS !');

  } catch (error) {
    console.error('❌ Une erreur critique est survenue :', error);
  }
}

importData();
