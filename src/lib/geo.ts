/**
 * Dukaio IP Geolocation Engine
 * Real-time, ultra-fast client-side IP-to-Country detection.
 * Prioritizes live network IP detection so VPN switches (e.g. USA, RD Congo, Europe) are detected immediately.
 */
import { useEffect, useState } from "react";

const GEO_STORAGE_KEY = "dukaio_geo_country_code";
const GEO_TTL_KEY = "dukaio_geo_timestamp";

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
  source: "country.is" | "ipwho.is" | "freeipapi" | "cache" | "timezone" | "default";
}

let cachedInFlight: Promise<UserGeo> | null = null;
let currentGeo: UserGeo | null = null;
let lastGeoDetectedAt = 0;
const LIVE_GEO_TTL_MS = 15 * 1000; // 15s cache in-memory so VPN changes are detected within seconds

/**
 * Detect user country code via real-time live IP check.
 * Immediately adapts when user switches VPN (e.g. USA, Canada, Congo, etc.).
 */
export async function detectUserCountry(forceRefresh = false): Promise<UserGeo> {
  if (typeof window === "undefined") {
    return { countryCode: "bj", source: "default" };
  }

  // Fast return only if fresh detection occurred in the last 15 seconds
  if (currentGeo && !forceRefresh && (Date.now() - lastGeoDetectedAt < LIVE_GEO_TTL_MS)) {
    return currentGeo;
  }

  if (cachedInFlight && !forceRefresh) {
    return cachedInFlight;
  }

  cachedInFlight = (async (): Promise<UserGeo> => {
    // 1. Primary Live Service: country.is (ultra-fast ~50-100ms)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      const res = await fetch("https://api.country.is/", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data?.country && typeof data.country === "string" && data.country.length === 2) {
          const code = data.country.toLowerCase();
          const geo: UserGeo = { countryCode: code, ip: data.ip, source: "country.is" };
          saveGeoCache(geo);
          return geo;
        }
      }
    } catch {}

    // 2. Secondary Live Service: ipwho.is (fast fallback)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch("https://ipwho.is/", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data?.country_code && typeof data.country_code === "string" && data.country_code.length === 2) {
          const code = data.country_code.toLowerCase();
          const geo: UserGeo = { countryCode: code, countryName: data.country, ip: data.ip, source: "ipwho.is" };
          saveGeoCache(geo);
          return geo;
        }
      }
    } catch {}

    // 3. Tertiary Live Service: freeipapi.com
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch("https://freeipapi.com/api/json", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data?.countryCode && typeof data.countryCode === "string" && data.countryCode.length === 2) {
          const code = data.countryCode.toLowerCase();
          const geo: UserGeo = { countryCode: code, countryName: data.countryName, ip: data.ipAddress, source: "freeipapi" };
          saveGeoCache(geo);
          return geo;
        }
      }
    } catch {}

    // 4. Session cache fallback (if network requests failed)
    try {
      const sessionCode = sessionStorage.getItem(GEO_STORAGE_KEY) || localStorage.getItem(GEO_STORAGE_KEY);
      if (sessionCode && sessionCode.length === 2) {
        return { countryCode: sessionCode.toLowerCase(), source: "cache" };
      }
    } catch {}

    // 5. Intelligent Fallback: Browser Timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && TIMEZONE_COUNTRY_MAP[tz]) {
        const code = TIMEZONE_COUNTRY_MAP[tz];
        return { countryCode: code, source: "timezone" };
      }
    } catch {}

    // 6. Default fallback: Benin (bj)
    return { countryCode: "bj", source: "default" };
  })();

  const result = await cachedInFlight;
  currentGeo = result;
  lastGeoDetectedAt = Date.now();
  cachedInFlight = null;
  return result;
}

function saveGeoCache(geo: UserGeo) {
  try {
    const prev = sessionStorage.getItem(GEO_STORAGE_KEY) || "";
    currentGeo = geo;
    lastGeoDetectedAt = Date.now();
    sessionStorage.setItem(GEO_STORAGE_KEY, geo.countryCode.toLowerCase());
    localStorage.setItem(GEO_STORAGE_KEY, geo.countryCode.toLowerCase());
    localStorage.setItem(GEO_TTL_KEY, String(Date.now()));
    window.dispatchEvent(new CustomEvent("dukaio_geo_change", { detail: geo }));
  } catch {}
}

/**
 * Clear cached country (useful when testing with VPN)
 */
export function clearGeoCache() {
  currentGeo = null;
  cachedInFlight = null;
  try {
    sessionStorage.removeItem(GEO_STORAGE_KEY);
    localStorage.removeItem(GEO_STORAGE_KEY);
    localStorage.removeItem(GEO_TTL_KEY);
  } catch {}
}

/**
 * React Hook to get the user's detected country in real-time
 */
export function useUserCountry() {
  const [countryCode, setCountryCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(GEO_STORAGE_KEY) || localStorage.getItem(GEO_STORAGE_KEY);
      if (saved && saved.length === 2) return saved.toLowerCase();
    }
    return "bj";
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    detectUserCountry().then((geo) => {
      if (isMounted) {
        setCountryCode(geo.countryCode);
        setLoading(false);
      }
    });

    const handleGeoChange = (e: Event) => {
      const customEvent = e as CustomEvent<UserGeo>;
      if (customEvent.detail?.countryCode && isMounted) {
        setCountryCode(customEvent.detail.countryCode);
      }
    };

    window.addEventListener("dukaio_geo_change", handleGeoChange);
    return () => {
      isMounted = false;
      window.removeEventListener("dukaio_geo_change", handleGeoChange);
    };
  }, []);

  return { countryCode, loading };
}
