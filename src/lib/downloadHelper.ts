/**
 * Safely parses download_url stored in DB which can be:
 * - A JSON stringified array of URLs: '["https://..."]'
 * - An array of URLs: ['https://...']
 * - A single raw URL string: 'https://...'
 * - A quoted or escaped string: '"https://..."'
 */
export function extractDownloadUrls(raw?: string | string[] | null): string[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((u) => (typeof u === "string" ? cleanUrl(u) : ""))
      .filter(Boolean);
  }

  const str = String(raw).trim();
  if (!str || str === "[]" || str === '""' || str === "null") return [];

  // Try parsing as JSON
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) {
      return parsed
        .map((u) => (typeof u === "string" ? cleanUrl(u) : ""))
        .filter(Boolean);
    }
    if (typeof parsed === "string") {
      const clean = cleanUrl(parsed);
      if (clean) return [clean];
    }
  } catch {}

  // Strip leading/trailing brackets, quotes, and whitespace
  const clean = cleanUrl(str);
  if (clean) return [clean];

  return [];
}

function cleanUrl(u: string): string {
  let cleaned = u.trim().replace(/^[\["'\s]+|[\]"'\s]+$/g, "");
  cleaned = cleaned.replace(/\\"/g, '"').replace(/\\'/g, "'").trim();
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }
  return "";
}

export function getPrimaryDownloadUrl(raw?: string | string[] | null): string | null {
  const urls = extractDownloadUrls(raw);
  return urls.length > 0 ? urls[0] : null;
}

