/**
 * Dukaio IP Geolocation Engine
 * Fast, reliable, client-side IP-to-Country detection with multi-tier fallbacks and session caching.
 */
import { useEffect, useState } from "react";

const GEO_STORAGE_KEY = "dukaio_geo_country_code";
const GEO_TTL_KEY = "dukaio_geo_timestamp";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Timezone to Country Code fallback mapping
const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
  // Central & East Africa
  "Africa/Kinshasa": "cd",
  "Africa/Lubumbashi": "cd",
  "Africa/Lagos": "bj", // Default WAT (West Africa Time UTC+1) safely to Benin (XOF)
  "Africa/Nairobi": "ke",
  "Africa/Lusaka": "zm",
  "Africa/Kigali": "rw",
  "Africa/Kampala": "ug",
  "Africa/Dar_es_Salaam": "tz",
  "Africa/Blantyre": "mw",
  "Africa/Maputo": "mz",
  "Africa/Harare": "zw",

  // West Africa (UEMOA / WAMZ)
  "Africa/Porto-Novo": "bj",
  "Africa/Cotonou": "bj",
  "Africa/Abidjan": "ci",
  "Africa/Dakar": "sn",
  "Africa/Lome": "tg",
  "Africa/Ouagadougou": "bf",
  "Africa/Bamako": "ml",
  "Africa/Niamey": "ne",
  "Africa/Accra": "gh",
  "Africa/Conakry": "gn",
  "Africa/Bissau": "gw",
  "Africa/Freetown": "sl",
  "Africa/Monrovia": "lr",

  // Central Africa (CEMAC)
  "Africa/Douala": "cm",
  "Africa/Libreville": "ga",
  "Africa/Brazzaville": "cg",
  "Africa/Bangui": "cf",
  "Africa/Ndjamena": "td",
  "Africa/Malabo": "gq",

  // North Africa
  "Africa/Casablanca": "ma",
  "Africa/Algiers": "dz",
  "Africa/Tunis": "tn",
  "Africa/Cairo": "eg",

  // Europe & Americas
  "Europe/Paris": "fr",
  "Europe/Brussels": "be",
  "Europe/London": "gb",
  "Europe/Geneva": "ch",
  "America/New_York": "us",
  "America/Chicago": "us",
  "America/Denver": "us",
  "America/Los_Angeles": "us",
  "America/Toronto": "ca",
  "America/Montreal": "ca",
};

export interface UserGeo {
  countryCode: string; // 2-letter lowercase ISO code (bj, cd, ng, zm, ke, us, fr, etc.)
  countryName?: string;
  ip?: string;
  source: "cache" | "country.is" | "ipwho.is" | "timezone" | "default";
}

/**
 * Detect user country code via cached session or fastest available IP service
 */
export async function detectUserCountry(): Promise<UserGeo> {
  if (typeof window === "undefined") {
    return { countryCode: "bj", source: "default" };
  }

  // 1. Check cached detection (in sessionStorage or localStorage)
  try {
    const cachedCode = sessionStorage.getItem(GEO_STORAGE_KEY) || localStorage.getItem(GEO_STORAGE_KEY);
    const cachedTime = Number(localStorage.getItem(GEO_TTL_KEY) || 0);
    if (cachedCode && cachedCode.length === 2 && Date.now() - cachedTime < CACHE_TTL_MS) {
      return { countryCode: cachedCode.toLowerCase(), source: "cache" };
    }
  } catch {}

  // 2. Primary Fast Service: country.is (ultra lightweight ~50ms JSON { ip, country })
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch("https://api.country.is/", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.country && typeof data.country === "string" && data.country.length === 2) {
        const code = data.country.toLowerCase();
        saveGeoCache(code);
        return { countryCode: code, ip: data.ip, source: "country.is" };
      }
    }
  } catch (err) {
    // Non-blocking, continue to fallback
  }

  // 3. Secondary Service: ipwho.is (fallback)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch("https://ipwho.is/", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.country_code && typeof data.country_code === "string" && data.country_code.length === 2) {
        const code = data.country_code.toLowerCase();
        saveGeoCache(code);
        return { countryCode: code, countryName: data.country, ip: data.ip, source: "ipwho.is" };
      }
    }
  } catch (err) {
    // Non-blocking, continue to fallback
  }

  // 4. Intelligent Fallback: Browser Timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_COUNTRY_MAP[tz]) {
      const code = TIMEZONE_COUNTRY_MAP[tz];
      saveGeoCache(code);
      return { countryCode: code, source: "timezone" };
    }
  } catch {}

  // 5. Ultimate default: Benin (bj)
  saveGeoCache("bj");
  return { countryCode: "bj", source: "default" };
}

function saveGeoCache(code: string) {
  try {
    sessionStorage.setItem(GEO_STORAGE_KEY, code.toLowerCase());
    localStorage.setItem(GEO_STORAGE_KEY, code.toLowerCase());
    localStorage.setItem(GEO_TTL_KEY, String(Date.now()));
  } catch {}
}

/**
 * React Hook to get the user's detected country
 */
export function useUserCountry() {
  const [countryCode, setCountryCode] = useState<string>("bj");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    detectUserCountry().then((geo) => {
      if (isMounted) {
        setCountryCode(geo.countryCode);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return { countryCode, loading };
}

