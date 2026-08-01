import fs from 'fs';

const CSV_PATH = 'C:/Users/DELL/Downloads/full_database_backup.csv';

function escapeSql(str) {
  if (!str) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

function generate() {
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = csvContent.split('\n');
  let jsonString = lines.slice(1).join('\n').trim();
  
  if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
    jsonString = jsonString.slice(1, -1);
    jsonString = jsonString.replace(/""/g, '"');
  }

  const data = JSON.parse(jsonString);
  const users = data['users'] || [];

  let sql = `-- INSERT SCRIPT FOR AUTH.USERS\n`;
  sql += `-- This script preserves the exact original IDs from Lovable.\n\n`;

  for (const user of users) {
    const raw_user_meta_data = user.raw_user_meta_data ? escapeSql(JSON.stringify(user.raw_user_meta_data)) : "'{}'";
    const raw_app_meta_data = user.raw_app_meta_data ? escapeSql(JSON.stringify(user.raw_app_meta_data)) : "'{}'";
    const encrypted_password = user.encrypted_password ? escapeSql(user.encrypted_password) : "'$2a$10$not_a_real_password_just_placeholder_12345678901234567'";
    
    sql += `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) \n`;
    sql += `VALUES (\n`;
    sql += `  '${user.id}',\n`;
    sql += `  '00000000-0000-0000-0000-000000000000',\n`;
    sql += `  'authenticated',\n`;
    sql += `  'authenticated',\n`;
    sql += `  ${escapeSql(user.email)},\n`;
    sql += `  ${encrypted_password},\n`;
    sql += `  now(),\n`;
    sql += `  now(),\n`;
    sql += `  now(),\n`;
    sql += `  ${raw_app_meta_data},\n`;
    sql += `  ${raw_user_meta_data},\n`;
    sql += `  ${escapeSql(user.created_at)},\n`;
    sql += `  ${escapeSql(user.updated_at)},\n`;
    sql += `  '',\n`;
    sql += `  '',\n`;
    sql += `  '',\n`;
    sql += `  ''\n`;
    sql += `) ON CONFLICT (id) DO NOTHING;\n\n`;
    
    // Also create the corresponding identity
    const identity_data = JSON.stringify({ sub: user.id, email: user.email });
    sql += `INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)\n`;
    sql += `VALUES (\n`;
    sql += `  gen_random_uuid(),\n`;
    sql += `  '${user.id}',\n`;
    sql += `  ${escapeSql(identity_data)},\n`;
    sql += `  'email',\n`;
    sql += `  '${user.id}',\n`;
    sql += `  now(),\n`;
    sql += `  ${escapeSql(user.created_at)},\n`;
    sql += `  ${escapeSql(user.updated_at)}\n`;
    sql += `) ON CONFLICT DO NOTHING;\n\n`;
  }
  
  fs.writeFileSync('C:/Users/DELL/Downloads/DUKAIO/ecomrevolut-main/import_users.sql', sql);
  console.log('✅ Generated import_users.sql');
}

generate();
