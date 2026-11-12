// SaaSPay providers & complete worldwide countries configuration for Dukaio checkout
import mtnLogo from "@/assets/payment-logos/providers/mtn.png";
import moovLogo from "@/assets/payment-logos/providers/moov.png";
import orangeLogo from "@/assets/payment-logos/providers/orange.png";
import airtelLogo from "@/assets/payment-logos/providers/airtel.png";
import vodacomLogo from "@/assets/payment-logos/providers/vodacom.png";
import mpesaLogo from "@/assets/payment-logos/providers/mpesa.png";
import waveLogo from "@/dukaio-site/assets/pay/wave.png";
import visaLogo from "@/dukaio-site/assets/pay/visa.png";
import mastercardLogo from "@/dukaio-site/assets/pay/mastercard.png";
import { countries as allWorldCountries } from "./countries";

export type MethodId = "mtn" | "moov" | "orange" | "wave" | "celtiis" | "airtel" | "vodacom" | "free" | "card" | "crypto";

export interface PaymentMethodMeta {
  id: MethodId;
  name: string;
  logos: string[];
  kind: "momo" | "card" | "crypto";
  hint?: string;
}

export const SAASPAY_METHODS: Record<MethodId, PaymentMethodMeta> = {
  mtn: {
    id: "mtn",
    name: "MTN MoMo",
    logos: [mtnLogo],
    kind: "momo",
    hint: "Push USSD direct sur votre téléphone",
  },
  moov: {
    id: "moov",
    name: "Moov Money",
    logos: [moovLogo],
    kind: "momo",
    hint: "Push USSD direct sur votre téléphone",
  },
  orange: {
    id: "orange",
    name: "Orange Money",
    logos: [orangeLogo],
    kind: "momo",
    hint: "Validation par code secret ou OTP",
  },
  wave: {
    id: "wave",
    name: "Wave",
    logos: [waveLogo],
    kind: "momo",
    hint: "Paiement 1-clic via l'application Wave",
  },
  celtiis: {
    id: "celtiis",
    name: "Celtiis Cash",
    logos: [moovLogo],
    kind: "momo",
    hint: "Push USSD direct Bénin",
  },
  airtel: {
    id: "airtel",
    name: "Airtel Money",
    logos: [airtelLogo],
    kind: "momo",
    hint: "Push USSD sur votre téléphone",
  },
  vodacom: {
    id: "vodacom",
    name: "Vodacom M-Pesa",
    logos: [vodacomLogo, mpesaLogo],
    kind: "momo",
    hint: "Validation M-Pesa directe",
  },
  free: {
    id: "free",
    name: "Free Money",
    logos: [orangeLogo],
    kind: "momo",
    hint: "Push USSD Sénégal",
  },
  card: {
    id: "card",
    name: "Visa / Mastercard",
    logos: [visaLogo, mastercardLogo],
    kind: "card",
    hint: "Paiement sécurisé 3D-Secure mondial",
  },
  crypto: {
    id: "crypto",
    name: "Crypto (USDT / USDC)",
    logos: [],
    kind: "crypto",
    hint: "Transfert stablecoin sur TRC20 / ERC20",
  },
};

export interface SaaSPayCountry {
  code: string; // ISO 2 lowercase (bj, ci, sn, tg, fr, us, ca, etc.)
  name: string;
  dial: string;
  currency: string;
  placeholder: string;
  methods: MethodId[];
}

// Special Mobile Money setups for African countries supported by SaaSPay
const AFRICAN_MOMO_MAP: Record<string, { methods: MethodId[]; currency: string; placeholder: string }> = {
  bj: { methods: ["mtn", "moov", "celtiis", "card", "crypto"], currency: "XOF", placeholder: "01 97 00 00 00" },
  ci: { methods: ["orange", "mtn", "moov", "wave", "card", "crypto"], currency: "XOF", placeholder: "07 00 00 00 00" },
  sn: { methods: ["wave", "orange", "free", "card", "crypto"], currency: "XOF", placeholder: "77 000 00 00" },
  tg: { methods: ["moov", "card", "crypto"], currency: "XOF", placeholder: "90 00 00 00" },
  cm: { methods: ["mtn", "orange", "card", "crypto"], currency: "XAF", placeholder: "6 70 00 00 00" },
  bf: { methods: ["orange", "moov", "card", "crypto"], currency: "XOF", placeholder: "70 00 00 00" },
  ml: { methods: ["orange", "moov", "card", "crypto"], currency: "XOF", placeholder: "70 00 00 00" },
  ga: { methods: ["airtel", "moov", "card", "crypto"], currency: "XAF", placeholder: "077 00 00 00" },
  cg: { methods: ["airtel", "mtn", "card", "crypto"], currency: "XAF", placeholder: "06 000 00 00" },
  cd: { methods: ["vodacom", "airtel", "orange", "card", "crypto"], currency: "CDF", placeholder: "081 000 00 00" },
  ne: { methods: ["airtel", "moov", "card", "crypto"], currency: "XOF", placeholder: "90 00 00 00" },
  gn: { methods: ["mtn", "card", "crypto"], currency: "GNF", placeholder: "620 00 00 00" },
  gh: { methods: ["mtn", "airtel", "card", "crypto"], currency: "GHS", placeholder: "024 000 0000" },
  ke: { methods: ["vodacom", "airtel", "card", "crypto"], currency: "KES", placeholder: "0700 000000" },
  rw: { methods: ["mtn", "airtel", "card", "crypto"], currency: "RWF", placeholder: "078 000 0000" },
  ug: { methods: ["mtn", "airtel", "card", "crypto"], currency: "UGX", placeholder: "077 000 0000" },
  tz: { methods: ["vodacom", "airtel", "card", "crypto"], currency: "TZS", placeholder: "075 000 0000" },
  zm: { methods: ["mtn", "airtel", "card", "crypto"], currency: "ZMW", placeholder: "097 000 0000" },
};

// Priority list for top countries to appear first in the dropdown
const PRIORITY_ORDER = [
  "bj", "ci", "sn", "tg", "cm", "bf", "ml", "ga", "cg", "cd", "ne", "gn",
  "fr", "us", "ca", "be", "gb", "ch", "de", "es", "it", "ng", "gh", "ke", "rw"
];

// Build comprehensive worldwide list
function buildWorldwideCountries(): SaaSPayCountry[] {
  const map = new Map<string, SaaSPayCountry>();

  // 1. Process all countries from ISO 3166 database
  allWorldCountries.forEach((c) => {
    const code = c.code.toLowerCase();
    const momo = AFRICAN_MOMO_MAP[code];

    map.set(code, {
      code,
      name: c.name,
      dial: c.dial,
      currency: momo ? momo.currency : "XOF",
      placeholder: momo ? momo.placeholder : "000 000 0000",
      methods: momo ? momo.methods : ["card", "crypto"],
    });
  });

  // 2. Sort prioritizing African hubs, diaspora countries, then alphabetically
  const result: SaaSPayCountry[] = [];
  const added = new Set<string>();

  // Add priority list first
  PRIORITY_ORDER.forEach((code) => {
    const item = map.get(code);
    if (item && !added.has(code)) {
      result.push(item);
      added.add(code);
    }
  });

  // Add all remaining worldwide countries sorted by French name
  const remaining: SaaSPayCountry[] = [];
  map.forEach((item, code) => {
    if (!added.has(code)) {
      remaining.push(item);
    }
  });

  remaining.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return [...result, ...remaining];
}

export const SAASPAY_COUNTRIES: SaaSPayCountry[] = buildWorldwideCountries();

/**
 * Maps frontend method + country to exact SaaSPay payment_method string
 */
export function getSaaSPayMethodCode(method: MethodId, countryCode: string): string {
  if (method === "card") return "card";
  if (method === "crypto") return "crypto";

  const cc = countryCode.toLowerCase();
  switch (method) {
    case "mtn":
      return `mtn_${cc}`;
    case "moov":
      return `moov_${cc}`;
    case "orange":
      return `orange_${cc}`;
    case "wave":
      return `wave_${cc}`;
    case "celtiis":
      return "celtiis_bj";
    case "airtel":
      return `airtel_${cc}`;
    case "vodacom":
      return "vodacom_cd";
    case "free":
      return "free_sn";
    default:
      return `${method}_${cc}`;
  }
}
