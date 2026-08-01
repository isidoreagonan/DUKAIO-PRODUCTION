import fs from 'fs';
const csvContent = fs.readFileSync('C:/Users/DELL/Downloads/full_database_backup.csv', 'utf-8');
const lines = csvContent.split('\n');
let jsonString = lines.slice(1).join('\n').trim();
if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
  jsonString = jsonString.slice(1, -1).replace(/""/g, '"');
}
const data = JSON.parse(jsonString);
console.log('Products:', data.products.slice(0, 2).map(p => ({
  id: p.id,
  thumbnail_url: p.thumbnail_url,
  download_url: p.download_url
})));
console.log('Stores:', data.stores.slice(0, 1).map(s => ({
  id: s.id,
  logo_url: s.logo_url
})));
