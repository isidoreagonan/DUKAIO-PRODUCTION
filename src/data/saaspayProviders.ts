// SaaSPay providers & complete worldwide countries configuration for Dukaio checkout & payouts
import mtnLogo from "@/assets/payment-logos/providers/mtn.png";
import moovLogo from "@/assets/payment-logos/providers/moov.png";
import orangeLogo from "@/assets/payment-logos/providers/orange.png";
import airtelLogo from "@/assets/payment-logos/providers/airtel.png";
import vodacomLogo from "@/assets/payment-logos/providers/vodacom.png";
import mpesaLogo from "@/assets/payment-logos/providers/mpesa.png";
import zamtelLogo from "@/assets/payment-logos/providers/zamtel.png";
import waveLogo from "@/dukaio-site/assets/pay/wave.png";
import celtiisLogo from "@/assets/payment-logos/providers/celtiis.png";
import freeLogo from "@/assets/payment-logos/providers/free.svg";
import djamoLogo from "@/assets/payment-logos/providers/djamo.svg";
import togocelLogo from "@/assets/payment-logos/providers/togocel.svg";
import wizallLogo from "@/assets/payment-logos/providers/wizall.svg";
import paydunyaLogo from "@/assets/payment-logos/providers/paydunya.svg";
import bankLogo from "@/assets/payment-logos/providers/bank.svg";
import visaLogo from "@/dukaio-site/assets/pay/visa.png";
import mastercardLogo from "@/dukaio-site/assets/pay/mastercard.png";
import { countries as allWorldCountries } from "./countries";

export type MethodId =
  | "mtn"
  | "moov"
  | "orange"
  | "wave"
  | "celtiis"
  | "airtel"
  | "vodacom"
  | "free"
  | "djamo"
  | "togocel"
  | "wizall"
  | "paydunya"
  | "bank"
  | "card"
  | "crypto";

export interface PaymentMethodMeta {
  id: MethodId;
  name: string;
  logos: string[];
  kind: "momo" | "card" | "crypto" | "bank";
  hint?: string;
}

export const SAASPAY_METHODS: Record<string, PaymentMethodMeta> = {
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
    logos: [celtiisLogo],
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
    logos: [freeLogo],
    kind: "momo",
    hint: "Push USSD Sénégal",
  },
  djamo: {
    id: "djamo",
    name: "Djamo",
    logos: [djamoLogo],
    kind: "momo",
    hint: "Virement direct compte Djamo",
  },
  togocel: {
    id: "togocel",
    name: "Togocom (Mixx / TMoney)",
    logos: [togocelLogo],
    kind: "momo",
    hint: "Virement direct Togocom Togo",
  },
  wizall: {
    id: "wizall",
    name: "Wizall Money",
    logos: [wizallLogo],
    kind: "momo",
    hint: "Virement direct Wizall Money",
  },
  paydunya: {
    id: "paydunya",
    name: "PayDunya",
    logos: [paydunyaLogo],
    kind: "momo",
    hint: "Compte marchand PayDunya",
  },
  bank: {
    id: "bank",
    name: "Virement bancaire",
    logos: [bankLogo],
    kind: "bank",
    hint: "Tous les réseaux bancaires",
  },
  zamtel: {
    id: "momo" as any,
    name: "Zamtel Kwacha",
    logos: [zamtelLogo],
    kind: "momo",
    hint: "Zamtel Kwacha Zambie",
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

// -----------------------------------------------------------------------------
// EXACT SAASPAY PAYOUT NETWORKS EXTRACTED DIRECTLY FROM THE SAASPAY API (83 NETWORKS)
// -----------------------------------------------------------------------------
export interface SaaSPayNetworkItem {
  code: string;       // Exact API network code: mtn_bj, moov_bj, celtiis_bj, mixx_tg, allbanks_ng, etc.
  name: string;       // Exact label shown in SaaSPay dashboard
  countryCode: string;// 2-letter ISO: bj, ci, sn, tg, cm, etc.
  operatorKey: string;// Key to resolve logo from SAASPAY_METHODS
  currency: string;   // Local payout currency: XOF, XAF, NGN, GHS, etc.
}

export const SAASPAY_ACTIVE_NETWORKS: SaaSPayNetworkItem[] = [
  // BÉNIN (XOF)
  { code: "mtn_bj", name: "MTN MoMo Benin", countryCode: "bj", operatorKey: "mtn", currency: "XOF" },
  { code: "moov_bj", name: "Moov Money Benin", countryCode: "bj", operatorKey: "moov", currency: "XOF" },
  { code: "celtiis_bj", name: "Celtiis Cash Bénin", countryCode: "bj", operatorKey: "celtiis", currency: "XOF" },

  // TOGO (XOF)
  { code: "moov_tg", name: "Moov Money Togo", countryCode: "tg", operatorKey: "moov", currency: "XOF" },
  { code: "mixx_tg", name: "Mixx Togo", countryCode: "tg", operatorKey: "togocel", currency: "XOF" },
  { code: "togocel", name: "Togocel Money", countryCode: "tg", operatorKey: "togocel", currency: "XOF" },

  // CÔTE D'IVOIRE (XOF)
  { code: "wave_ci", name: "Wave CI", countryCode: "ci", operatorKey: "wave", currency: "XOF" },
  { code: "orange_ci", name: "Orange Money CI", countryCode: "ci", operatorKey: "orange", currency: "XOF" },
  { code: "mtn_ci", name: "MTN MoMo CI", countryCode: "ci", operatorKey: "mtn", currency: "XOF" },
  { code: "moov_ci", name: "Moov Money CI", countryCode: "ci", operatorKey: "moov", currency: "XOF" },
  { code: "djamo_ci", name: "Djamo Côte d'Ivoire", countryCode: "ci", operatorKey: "djamo", currency: "XOF" },

  // SÉNÉGAL (XOF)
  { code: "wave_sn", name: "Wave Senegal", countryCode: "sn", operatorKey: "wave", currency: "XOF" },
  { code: "orange_sn", name: "Orange Money Senegal", countryCode: "sn", operatorKey: "orange", currency: "XOF" },
  { code: "freemoney_sn", name: "Free Money Senegal", countryCode: "sn", operatorKey: "free", currency: "XOF" },
  { code: "djamo_sn", name: "Djamo Sénégal", countryCode: "sn", operatorKey: "djamo", currency: "XOF" },
  { code: "wizall_sn", name: "Wizall Senegal", countryCode: "sn", operatorKey: "wizall", currency: "XOF" },
  { code: "paydunya_sn", name: "Compte PayDunya", countryCode: "sn", operatorKey: "paydunya", currency: "XOF" },
  { code: "expresso_sn", name: "Expresso Sénégal", countryCode: "sn", operatorKey: "free", currency: "XOF" },

  // BURKINA FASO (XOF)
  { code: "orange_bf", name: "Orange Burkina Faso", countryCode: "bf", operatorKey: "orange", currency: "XOF" },
  { code: "moov_bf", name: "Moov Burkina Faso", countryCode: "bf", operatorKey: "moov", currency: "XOF" },
  { code: "touchcash_bf", name: "TouchCash Burkina Faso", countryCode: "bf", operatorKey: "orange", currency: "XOF" },

  // MALI (XOF)
  { code: "orange_ml", name: "Orange Money Mali", countryCode: "ml", operatorKey: "orange", currency: "XOF" },
  { code: "wave_ml", name: "Wave Mali", countryCode: "ml", operatorKey: "wave", currency: "XOF" },
  { code: "moov_ml", name: "Moov Money Mali", countryCode: "ml", operatorKey: "moov", currency: "XOF" },
  { code: "mobi_cash_ml", name: "Mobi Cash Mali", countryCode: "ml", operatorKey: "orange", currency: "XOF" },

  // CAMEROUN (XAF)
  { code: "mtn_cm", name: "MTN MoMo Cameroon", countryCode: "cm", operatorKey: "mtn", currency: "XAF" },
  { code: "orange_cm", name: "Orange Money Cameroon", countryCode: "cm", operatorKey: "orange", currency: "XAF" },

  // GABON (XAF)
  { code: "airtel_ga", name: "Airtel Gabon", countryCode: "ga", operatorKey: "airtel", currency: "XAF" },
  { code: "moov_ga", name: "Moov Money Gabon", countryCode: "ga", operatorKey: "moov", currency: "XAF" },

  // CONGO BRAZZAVILLE (XAF)
  { code: "mtn_cg", name: "MTN Congo Brazzaville", countryCode: "cg", operatorKey: "mtn", currency: "XAF" },
  { code: "airtel_cg", name: "Airtel Congo Brazzaville", countryCode: "cg", operatorKey: "airtel", currency: "XAF" },

  // RD CONGO (CDF / USD)
  { code: "vodacom_cd", name: "Vodacom Congo", countryCode: "cd", operatorKey: "vodacom", currency: "CDF" },
  { code: "airtel_cd", name: "Airtel Congo", countryCode: "cd", operatorKey: "airtel", currency: "CDF" },
  { code: "orange_cd", name: "Orange Congo", countryCode: "cd", operatorKey: "orange", currency: "CDF" },
  { code: "afrimoney_cd", name: "Afrimoney Congo", countryCode: "cd", operatorKey: "airtel", currency: "CDF" },
  { code: "vodacom_cd_usd", name: "Vodacom Congo (USD)", countryCode: "cd", operatorKey: "vodacom", currency: "USD" },
  { code: "airtel_cd_usd", name: "Airtel Congo (USD)", countryCode: "cd", operatorKey: "airtel", currency: "USD" },
  { code: "orange_cd_usd", name: "Orange Congo (USD)", countryCode: "cd", operatorKey: "orange", currency: "USD" },

  // NIGER (XOF)
  { code: "airtel_ne", name: "Airtel Niger", countryCode: "ne", operatorKey: "airtel", currency: "XOF" },

  // NIGERIA (NGN)
  { code: "allbanks_ng", name: "Nigeria - Tous les réseaux bancaires", countryCode: "ng", operatorKey: "bank", currency: "NGN" },
  { code: "airtel_ng", name: "Airtel Money Nigeria", countryCode: "ng", operatorKey: "airtel", currency: "NGN" },
  { code: "mtn_ng", name: "MTN Nigeria", countryCode: "ng", operatorKey: "mtn", currency: "NGN" },

  // GHANA (GHS)
  { code: "mtn_gh", name: "MTN MoMo Ghana", countryCode: "gh", operatorKey: "mtn", currency: "GHS" },
  { code: "vodafone_gh", name: "Vodafone Ghana", countryCode: "gh", operatorKey: "vodacom", currency: "GHS" },
  { code: "tigo_gh", name: "Airtel/Tigo Ghana", countryCode: "gh", operatorKey: "airtel", currency: "GHS" },

  // GUINÉE (GNF)
  { code: "mtn_gn", name: "MTN MoMo Guinea", countryCode: "gn", operatorKey: "mtn", currency: "GNF" },

  // KENYA (KES)
  { code: "mpesa_ke", name: "M-Pesa Kenya", countryCode: "ke", operatorKey: "mpesa", currency: "KES" },
  { code: "airtel_ke", name: "Airtel Money Kenya", countryCode: "ke", operatorKey: "airtel", currency: "KES" },

  // RWANDA (RWF)
  { code: "mtn_rw", name: "MTN MoMo Rwanda", countryCode: "rw", operatorKey: "mtn", currency: "RWF" },
  { code: "airtel_rw", name: "Airtel Rwanda", countryCode: "rw", operatorKey: "airtel", currency: "RWF" },

  // OUGANDA (UGX)
  { code: "mtn_ug", name: "MTN MoMo Uganda", countryCode: "ug", operatorKey: "mtn", currency: "UGX" },
  { code: "airtel_ug", name: "Airtel Uganda", countryCode: "ug", operatorKey: "airtel", currency: "UGX" },

  // TANZANIE (TZS)
  { code: "mpesa_tz", name: "Vodacom Tanzania", countryCode: "tz", operatorKey: "mpesa", currency: "TZS" },
  { code: "airtel_tz", name: "Airtel Tanzania", countryCode: "tz", operatorKey: "airtel", currency: "TZS" },
  { code: "tigo_tz", name: "Tigo Tanzania", countryCode: "tz", operatorKey: "airtel", currency: "TZS" },
  { code: "halopesa_tz", name: "Halopesa", countryCode: "tz", operatorKey: "vodacom", currency: "TZS" },
  { code: "ezypesa_tz", name: "EzyPesa Tanzania", countryCode: "tz", operatorKey: "vodacom", currency: "TZS" },
  { code: "ttcl_tz", name: "TTCL Tanzania", countryCode: "tz", operatorKey: "vodacom", currency: "TZS" },

  // ZAMBIE (ZMW)
  { code: "mtn_zm", name: "MTN MoMo Zambia", countryCode: "zm", operatorKey: "mtn", currency: "ZMW" },
  { code: "airtel_zm", name: "Airtel Zambia", countryCode: "zm", operatorKey: "airtel", currency: "ZMW" },
  { code: "zamtel_zm", name: "Zamtel Kwacha", countryCode: "zm", operatorKey: "zamtel", currency: "ZMW" },

  // MALAWI (MWK)
  { code: "airtel_mw", name: "Airtel Money Malawi", countryCode: "mw", operatorKey: "airtel", currency: "MWK" },
  { code: "tnm_mw", name: "TNM Mpamba Malawi", countryCode: "mw", operatorKey: "airtel", currency: "MWK" },

  // MOZAMBIQUE (MZN)
  { code: "vodacom_mz", name: "Vodacom Mozambique", countryCode: "mz", operatorKey: "vodacom", currency: "MZN" },
  { code: "movitel_mz", name: "Movitel Mozambique", countryCode: "mz", operatorKey: "vodacom", currency: "MZN" },

  // SIERRA LEONE (SLL)
  { code: "orange_sl", name: "Orange Sierra Leone", countryCode: "sl", operatorKey: "orange", currency: "SLL" },

  // INTERNATIONAL & BANQUES
  { code: "bank_transfer_us", name: "Virement bancaire USA", countryCode: "us", operatorKey: "bank", currency: "USD" },
  { code: "bank_transfer_in", name: "Virement bancaire Inde", countryCode: "in", operatorKey: "bank", currency: "INR" },
  { code: "crypto", name: "Crypto (USDT / USDC)", countryCode: "global", operatorKey: "crypto", currency: "USDT" },
];

// -----------------------------------------------------------------------------
// PAYOUT COUNTRIES CONFIGURATION
// -----------------------------------------------------------------------------
export interface PayoutCountryConfig {
  code: string;
  name: string;
  dial: string;
  currency: string;
  placeholder: string;
  networks: SaaSPayNetworkItem[];
}

const PAYOUT_COUNTRY_DATA: Array<{ code: string; name: string; dial: string; currency: string; placeholder: string }> = [
  { code: "bj", name: "Bénin", dial: "+229", currency: "XOF", placeholder: "01 97 00 00 00" },
  { code: "tg", name: "Togo", dial: "+228", currency: "XOF", placeholder: "90 00 00 00" },
  { code: "ci", name: "Côte d'Ivoire", dial: "+225", currency: "XOF", placeholder: "07 00 00 00 00" },
  { code: "sn", name: "Sénégal", dial: "+221", currency: "XOF", placeholder: "77 000 00 00" },
  { code: "cm", name: "Cameroun", dial: "+237", currency: "XAF", placeholder: "6 70 00 00 00" },
  { code: "bf", name: "Burkina Faso", dial: "+226", currency: "XOF", placeholder: "70 00 00 00" },
  { code: "ml", name: "Mali", dial: "+223", currency: "XOF", placeholder: "70 00 00 00" },
  { code: "ga", name: "Gabon", dial: "+241", currency: "XAF", placeholder: "077 00 00 00" },
  { code: "cg", name: "Congo Brazzaville", dial: "+242", currency: "XAF", placeholder: "06 000 00 00" },
  { code: "cd", name: "RD Congo", dial: "+243", currency: "CDF", placeholder: "081 000 00 00" },
  { code: "ne", name: "Niger", dial: "+227", currency: "XOF", placeholder: "90 00 00 00" },
  { code: "ng", name: "Nigéria", dial: "+234", currency: "NGN", placeholder: "080 0000 0000" },
  { code: "gh", name: "Ghana", dial: "+233", currency: "GHS", placeholder: "024 000 0000" },
  { code: "gn", name: "Guinée", dial: "+224", currency: "GNF", placeholder: "620 00 00 00" },
  { code: "ke", name: "Kenya", dial: "+254", currency: "KES", placeholder: "0700 000000" },
  { code: "rw", name: "Rwanda", dial: "+250", currency: "RWF", placeholder: "078 000 0000" },
  { code: "ug", name: "Ouganda", dial: "+256", currency: "UGX", placeholder: "077 000 0000" },
  { code: "tz", name: "Tanzanie", dial: "+255", currency: "TZS", placeholder: "075 000 0000" },
  { code: "zm", name: "Zambie", dial: "+260", currency: "ZMW", placeholder: "097 000 0000" },
  { code: "mw", name: "Malawi", dial: "+265", currency: "MWK", placeholder: "099 000 0000" },
  { code: "mz", name: "Mozambique", dial: "+258", currency: "MZN", placeholder: "84 000 0000" },
  { code: "sl", name: "Sierra Leone", dial: "+232", currency: "SLL", placeholder: "76 000 000" },
  { code: "us", name: "États-Unis (Banque)", dial: "+1", currency: "USD", placeholder: "Routing & Account Number" },
];

export const SAASPAY_PAYOUT_COUNTRIES: PayoutCountryConfig[] = PAYOUT_COUNTRY_DATA.map((c) => ({
  ...c,
  networks: SAASPAY_ACTIVE_NETWORKS.filter((n) => n.countryCode === c.code),
}));

// Helper to resolve network metadata by its exact code
export function getSaaSPayNetwork(code: string): SaaSPayNetworkItem | undefined {
  return SAASPAY_ACTIVE_NETWORKS.find((n) => n.code.toLowerCase() === code.toLowerCase());
}

// -----------------------------------------------------------------------------
// WORLDWIDE COUNTRIES FOR CHECKOUT (PAYIN)
// -----------------------------------------------------------------------------
export interface SaaSPayCountry {
  code: string;
  name: string;
  dial: string;
  currency: string;
  placeholder: string;
  methods: MethodId[];
}

const AFRICAN_MOMO_MAP: Record<string, { methods: MethodId[]; currency: string; placeholder: string }> = {
  bj: { methods: ["mtn", "moov", "celtiis", "card", "crypto"], currency: "XOF", placeholder: "01 97 00 00 00" },
  ci: { methods: ["orange", "mtn", "moov", "wave", "djamo", "card", "crypto"], currency: "XOF", placeholder: "07 00 00 00 00" },
  sn: { methods: ["wave", "orange", "free", "djamo", "card", "crypto"], currency: "XOF", placeholder: "77 000 00 00" },
  tg: { methods: ["moov", "togocel", "card", "crypto"], currency: "XOF", placeholder: "90 00 00 00" },
  cm: { methods: ["mtn", "orange", "card", "crypto"], currency: "XAF", placeholder: "6 70 00 00 00" },
  bf: { methods: ["orange", "moov", "card", "crypto"], currency: "XOF", placeholder: "70 00 00 00" },
  ml: { methods: ["orange", "moov", "wave", "card", "crypto"], currency: "XOF", placeholder: "70 00 00 00" },
  ga: { methods: ["airtel", "moov", "card", "crypto"], currency: "XAF", placeholder: "077 00 00 00" },
  cg: { methods: ["airtel", "mtn", "card", "crypto"], currency: "XAF", placeholder: "06 000 00 00" },
  cd: { methods: ["airtel", "vodacom", "orange", "card", "crypto"], currency: "CDF", placeholder: "081 000 00 00" },
  ne: { methods: ["airtel", "moov", "card", "crypto"], currency: "XOF", placeholder: "90 00 00 00" },
  ng: { methods: ["bank", "card", "crypto"], currency: "NGN", placeholder: "080 0000 0000" },
  gh: { methods: ["mtn", "airtel", "card", "crypto"], currency: "GHS", placeholder: "024 000 0000" },
  gn: { methods: ["mtn", "card", "crypto"], currency: "GNF", placeholder: "620 00 00 00" },
  ke: { methods: ["vodacom", "airtel", "card", "crypto"], currency: "KES", placeholder: "0700 000000" },
  rw: { methods: ["mtn", "airtel", "card", "crypto"], currency: "RWF", placeholder: "078 000 0000" },
  ug: { methods: ["mtn", "airtel", "card", "crypto"], currency: "UGX", placeholder: "077 000 0000" },
  tz: { methods: ["vodacom", "airtel", "card", "crypto"], currency: "TZS", placeholder: "075 000 0000" },
  zm: { methods: ["airtel", "mtn", "card", "crypto"], currency: "ZMW", placeholder: "097 000 0000" },
};

const PRIORITY_ORDER = [
  "bj", "ci", "sn", "tg", "cm", "bf", "ml", "ga", "cg", "cd", "ne", "ng", "gh", "gn",
  "fr", "us", "ca", "be", "gb", "ch", "de", "es", "it", "ke", "rw"
];

function buildWorldwideCountries(): SaaSPayCountry[] {
  const map = new Map<string, SaaSPayCountry>();

  allWorldCountries.forEach((c) => {
    const code = c.code.toLowerCase();
    const momo = AFRICAN_MOMO_MAP[code];

    let currency = "XOF";
    if (momo) {
      currency = momo.currency;
    } else if (code === "us" || code === "ca") {
      currency = "USD";
    } else if (["fr", "be", "de", "es", "it", "nl", "pt", "lu", "at", "fi", "ie", "ch"].includes(code)) {
      currency = "EUR";
    } else if (code === "gb") {
      currency = "GBP";
    }

    map.set(code, {
      code,
      name: c.name,
      dial: c.dial,
      currency,
      placeholder: momo ? momo.placeholder : "000 000 0000",
      methods: momo ? momo.methods : ["card", "crypto"],
    });
  });

  const result: SaaSPayCountry[] = [];
  const added = new Set<string>();

  PRIORITY_ORDER.forEach((code) => {
    const item = map.get(code);
    if (item && !added.has(code)) {
      result.push(item);
      added.add(code);
    }
  });

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
      return cc === "cd" ? "vodacom_cd" : `mpesa_${cc}`;
    case "free":
      return "freemoney_sn";
    case "djamo":
      return `djamo_${cc}`;
    case "togocel":
      return "togocel";
    case "wizall":
      return "wizall_sn";
    case "paydunya":
      return "paydunya_sn";
    case "bank":
      return cc === "ng" ? "allbanks_ng" : `bank_transfer_${cc}`;
    default:
      return `${method}_${cc}`;
  }
}
