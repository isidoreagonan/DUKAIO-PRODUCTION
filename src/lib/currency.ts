/**
 * Dukaio Multi-Currency & Live Exchange Rate Engine
 * Real-time currency conversion anchored to XOF (FCFA) using official open exchange rates.
 * Supports RDC (CDF/USD), Nigeria (NGN), Zambia (ZMW), Kenya (KES), Ghana (GHS), USA (USD), Europe (EUR), etc.
 */
import { useEffect, useState } from "react";
import { detectUserCountry, manuallySetCountry } from "./geo";

export interface CurrencyMeta {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  symbolPosition: "before" | "after";
}

export const CURRENCY_METAS: Record<string, CurrencyMeta> = {
  XOF: { code: "XOF", name: "Franc CFA (UEMOA)", symbol: "FCFA", decimals: 0, symbolPosition: "after" },
  XAF: { code: "XAF", name: "Franc CFA (CEMAC)", symbol: "FCFA", decimals: 0, symbolPosition: "after" },
  CDF: { code: "CDF", name: "Franc Congolais", symbol: "CDF", decimals: 0, symbolPosition: "after" },
  USD: { code: "USD", name: "Dollar US", symbol: "$", decimals: 2, symbolPosition: "before" },
  NGN: { code: "NGN", name: "Naira Nigérian", symbol: "₦", decimals: 0, symbolPosition: "before" },
  ZMW: { code: "ZMW", name: "Kwacha Zambien", symbol: "ZMW", decimals: 2, symbolPosition: "after" },
  KES: { code: "KES", name: "Shilling Kényan", symbol: "KSh", decimals: 0, symbolPosition: "before" },
  GHS: { code: "GHS", name: "Cedi Ghanéen", symbol: "GH₵", decimals: 2, symbolPosition: "before" },
  RWF: { code: "RWF", name: "Franc Rwandais", symbol: "RWF", decimals: 0, symbolPosition: "after" },
  UGX: { code: "UGX", name: "Shilling Ougandais", symbol: "UGX", decimals: 0, symbolPosition: "after" },
  TZS: { code: "TZS", name: "Shilling Tanzanien", symbol: "TZS", decimals: 0, symbolPosition: "after" },
  EUR: { code: "EUR", name: "Euro", symbol: "€", decimals: 2, symbolPosition: "after" },
  GBP: { code: "GBP", name: "Livre Sterling", symbol: "£", decimals: 2, symbolPosition: "before" },
  CAD: { code: "CAD", name: "Dollar Canadien", symbol: "CA$", decimals: 2, symbolPosition: "before" },
};

// Hardcoded fallback exchange rates (rates for 1 XOF) in case user is offline or API fails
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  XOF: 1,
  XAF: 1,
  EUR: 1 / 655.957,       // Official fixed peg: 0.00152449
  USD: 0.001687,          // 1 USD ≈ 592.7 XOF
  CDF: 3.91788,           // 1 XOF ≈ 3.918 CDF (e.g. 3 000 FCFA ≈ 11 754 CDF)
  NGN: 2.26243,           // 1 XOF ≈ 2.262 NGN (e.g. 3 000 FCFA ≈ 6 787 NGN)
  ZMW: 0.03447,           // 1 XOF ≈ 0.0345 ZMW (e.g. 3 000 FCFA ≈ 103.4 ZMW)
  KES: 0.21981,           // 1 XOF ≈ 0.22 KES (e.g. 3 000 FCFA ≈ 659 KES)
  GHS: 0.01979,           // 1 XOF ≈ 0.0198 GHS
  RWF: 2.50218,           // 1 XOF ≈ 2.502 RWF
  UGX: 6.79578,           // 1 XOF ≈ 6.796 UGX
  TZS: 4.44012,           // 1 XOF ≈ 4.440 TZS
  GBP: 0.001274,          // 1 GBP ≈ 785 XOF
  CAD: 0.002405,          // 1 CAD ≈ 416 XOF
};

// Country Code to Primary Currency Mapping
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // RD Congo
  cd: "CDF",
  // Nigeria
  ng: "NGN",
  // Zambia
  zm: "ZMW",
  // Kenya
  ke: "KES",
  // Ghana
  gh: "GHS",
  // Rwanda
  rw: "RWF",
  // Uganda
  ug: "UGX",
  // Tanzania
  tz: "TZS",
  // CEMAC (Central Africa)
  cm: "XAF",
  ga: "XAF",
  cg: "XAF",
  td: "XAF",
  cf: "XAF",
  gq: "XAF",
  // UEMOA (West Africa)
  bj: "XOF",
  ci: "XOF",
  sn: "XOF",
  tg: "XOF",
  bf: "XOF",
  ml: "XOF",
  ne: "XOF",
  gw: "XOF",
  // International
  us: "USD",
  ca: "CAD",
  gb: "GBP",
  fr: "EUR",
  be: "EUR",
  de: "EUR",
  es: "EUR",
  it: "EUR",
  nl: "EUR",
  pt: "EUR",
  ch: "EUR",
};

const FX_CACHE_KEY = "dukaio_fx_rates_cache";
const FX_CACHE_TS_KEY = "dukaio_fx_rates_ts";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// In-memory active rates
let activeRates: Record<string, number> = { ...DEFAULT_EXCHANGE_RATES };
let fetchPromise: Promise<Record<string, number>> | null = null;

/**
 * Fetch latest live exchange rates from open.er-api.com (anchored to XOF)
 */
export async function getLiveExchangeRates(): Promise<Record<string, number>> {
  if (typeof window === "undefined") return activeRates;

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(FX_CACHE_KEY);
    const ts = Number(localStorage.getItem(FX_CACHE_TS_KEY) || 0);
    if (cached && Date.now() - ts < CACHE_TTL_MS) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === "object" && parsed.USD) {
        activeRates = { ...DEFAULT_EXCHANGE_RATES, ...parsed };
        return activeRates;
      }
    }
  } catch {}

  // Deduplicate inflight requests
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch("https://open.er-api.com/v6/latest/XOF", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data?.rates && typeof data.rates === "object") {
          activeRates = { ...DEFAULT_EXCHANGE_RATES, ...data.rates };
          try {
            localStorage.setItem(FX_CACHE_KEY, JSON.stringify(activeRates));
            localStorage.setItem(FX_CACHE_TS_KEY, String(Date.now()));
          } catch {}
          return activeRates;
        }
      }
    } catch (err) {
      // Non-blocking, fallback to active rates
    } finally {
      fetchPromise = null;
    }
    return activeRates;
  })();

  return fetchPromise;
}

// Preload rates on module load in client environment
if (typeof window !== "undefined") {
  getLiveExchangeRates().catch(() => {});
}

/**
 * Get currency code for a given 2-letter ISO country code
 */
export function getCurrencyForCountry(countryCode?: string | null): string {
  if (!countryCode) return "XOF";
  const code = countryCode.toLowerCase().trim();
  return COUNTRY_CURRENCY_MAP[code] || "XOF";
}

/**
 * Convert an amount from XOF (FCFA) to a target currency
 */
export function convertFromXOF(amountXof: number, targetCurrency: string, rates?: Record<string, number>): number {
  if (!amountXof || amountXof <= 0) return 0;
  const target = (targetCurrency || "XOF").toUpperCase();
  if (target === "XOF" || target === "XAF") return amountXof;

  const rateTable = rates || activeRates;
  const rate = rateTable[target] || DEFAULT_EXCHANGE_RATES[target];
  if (!rate || rate <= 0) return amountXof;

  const meta = CURRENCY_METAS[target];
  const converted = amountXof * rate;

  if (!meta || meta.decimals === 0) {
    // For zero-decimal currencies like CDF, NGN, KES: round to nearest whole unit (or nearest 50 for CDF)
    if (target === "CDF") {
      return Math.round(converted / 50) * 50;
    }
    return Math.round(converted);
  }

  // For 2-decimal currencies like USD, EUR, GBP: round to 2 decimals
  return Number(converted.toFixed(meta.decimals));
}

/**
 * Convert an amount from a given currency back into XOF (FCFA)
 */
export function convertToXOF(amount: number, fromCurrency: string, rates?: Record<string, number>): number {
  if (!amount || amount <= 0) return 0;
  const from = (fromCurrency || "XOF").toUpperCase();
  if (from === "XOF" || from === "XAF") return Math.round(amount);

  const rateTable = rates || activeRates;
  const rate = rateTable[from] || DEFAULT_EXCHANGE_RATES[from];
  if (!rate || rate <= 0) return Math.round(amount);

  return Math.round(amount / rate);
}

/**
 * Format currency amount with symbol and proper regional spacing
 */
export function formatMoney(amount: number, currencyCode: string): string {
  const code = (currencyCode || "XOF").toUpperCase();
  const meta = CURRENCY_METAS[code] || {
    code,
    name: code,
    symbol: code,
    decimals: 0,
    symbolPosition: "after",
  };

  const num = Number(amount || 0);
  const formattedNumber = meta.decimals > 0
    ? num.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u202f|\u00a0/g, " ")
    : Math.round(num).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");

  if (meta.symbolPosition === "before") {
    return `${meta.symbol}${formattedNumber}`;
  }
  return `${formattedNumber} ${meta.symbol}`;
}

/**
 * Dual price display: e.g. "3 000 FCFA (~11 750 CDF)" or "$4.90 (~3 000 FCFA)"
 */
export function formatDualPrice(
  amountXof: number,
  targetCountryOrCurrency: string,
  rates?: Record<string, number>
): {
  basePriceFormatted: string; // e.g. "1 000 FCFA"
  localPriceFormatted: string | null; // e.g. "1,52 €" or "$1.69 USD"
  displayPrimary: string; // The MAIN BIG price: "1,52 €" if foreign, "1 000 FCFA" if local
  displaySecondary: string | null; // Secondary reference: "(1 000 FCFA)" if foreign, null if local
  fullBadge: string; // e.g. "1,52 € (1 000 FCFA)"
  isLocalDifferent: boolean;
  targetCurrency: string;
} {
  const baseFormatted = formatMoney(amountXof, "XOF");
  const targetCurrency = targetCountryOrCurrency.length === 2
    ? getCurrencyForCountry(targetCountryOrCurrency)
    : (targetCountryOrCurrency || "XOF").toUpperCase();

  const isLocalDifferent = targetCurrency !== "XOF" && targetCurrency !== "XAF";

  if (!isLocalDifferent) {
    return {
      basePriceFormatted: baseFormatted,
      localPriceFormatted: null,
      displayPrimary: baseFormatted,
      displaySecondary: null,
      fullBadge: baseFormatted,
      isLocalDifferent: false,
      targetCurrency,
    };
  }

  const converted = convertFromXOF(amountXof, targetCurrency, rates);
  const formattedConverted = formatMoney(converted, targetCurrency);
  const localFormatted = targetCurrency === "USD" ? `${formattedConverted} USD` : formattedConverted;

  return {
    basePriceFormatted: baseFormatted,
    localPriceFormatted: localFormatted,
    displayPrimary: localFormatted,
    displaySecondary: baseFormatted,
    fullBadge: `${localFormatted} (${baseFormatted})`,
    isLocalDifferent: true,
    targetCurrency,
  };
}

/**
 * React Hook for automatic localized currency conversion
 */
export function useCurrency(userCountryCode?: string) {
  const [rates, setRates] = useState<Record<string, number>>(activeRates);
  const [countryCode, setCountryCode] = useState<string>(() => {
    if (userCountryCode) return userCountryCode.toLowerCase();
    if (typeof window !== "undefined") {
      const urlParam = new URLSearchParams(window.location.search).get("country");
      if (urlParam && urlParam.length === 2) return urlParam.toLowerCase();
      const saved = sessionStorage.getItem("dukaio_geo_country_code") || localStorage.getItem("dukaio_geo_country_code");
      if (saved && saved.length === 2) return saved.toLowerCase();
    }
    return "bj";
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getLiveExchangeRates().then((live) => {
      if (isMounted) setRates(live);
    });

    if (!userCountryCode) {
      // Always run a fresh real-time IP detection to detect VPN switches immediately
      detectUserCountry(true).then((geo) => {
        if (isMounted) {
          setCountryCode(geo.countryCode);
          setLoading(false);
        }
      });

      const handleGeo = (e: Event) => {
        const customEvent = e as CustomEvent<{ countryCode: string }>;
        if (customEvent.detail?.countryCode && isMounted) {
          setCountryCode(customEvent.detail.countryCode);
        }
      };
      window.addEventListener("dukaio_geo_change", handleGeo);

      return () => {
        isMounted = false;
        window.removeEventListener("dukaio_geo_change", handleGeo);
      };
    } else {
      setCountryCode(userCountryCode);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [userCountryCode]);

  const currency = getCurrencyForCountry(countryCode);
  const meta = CURRENCY_METAS[currency] || CURRENCY_METAS.XOF;

  return {
    countryCode,
    currency,
    meta,
    rates,
    loading,
    setCountry: (newCode: string) => manuallySetCountry(newCode),
    convert: (amountXof: number) => convertFromXOF(amountXof, currency, rates),
    format: (amount: number, curr?: string) => formatMoney(amount, curr || currency),
    formatDual: (amountXof: number) => formatDualPrice(amountXof, currency, rates),
  };
}

