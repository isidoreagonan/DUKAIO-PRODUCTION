// SaaSPay providers & countries configuration for Dukaio checkout
import mtnLogo from "@/assets/payment-logos/providers/mtn.png";
import moovLogo from "@/assets/payment-logos/providers/moov.png";
import orangeLogo from "@/assets/payment-logos/providers/orange.png";
import airtelLogo from "@/assets/payment-logos/providers/airtel.png";
import vodacomLogo from "@/assets/payment-logos/providers/vodacom.png";
import mpesaLogo from "@/assets/payment-logos/providers/mpesa.png";
import waveLogo from "@/dukaio-site/assets/pay/wave.png";
import visaLogo from "@/dukaio-site/assets/pay/visa.png";
import mastercardLogo from "@/dukaio-site/assets/pay/mastercard.png";

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
    logos: [moovLogo], // fallback or clean generic
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
  code: string; // ISO 2 lowercase (bj, ci, sn, tg, etc.)
  name: string;
  dial: string;
  currency: string;
  placeholder: string;
  methods: MethodId[];
}

export const SAASPAY_COUNTRIES: SaaSPayCountry[] = [
  {
    code: "bj",
    name: "Bénin",
    dial: "+229",
    currency: "XOF",
    placeholder: "01 97 00 00 00",
    methods: ["mtn", "moov", "celtiis", "card", "crypto"],
  },
  {
    code: "ci",
    name: "Côte d'Ivoire",
    dial: "+225",
    currency: "XOF",
    placeholder: "07 00 00 00 00",
    methods: ["orange", "mtn", "moov", "wave", "card", "crypto"],
  },
  {
    code: "sn",
    name: "Sénégal",
    dial: "+221",
    currency: "XOF",
    placeholder: "77 000 00 00",
    methods: ["wave", "orange", "free", "card", "crypto"],
  },
  {
    code: "tg",
    name: "Togo",
    dial: "+228",
    currency: "XOF",
    placeholder: "90 00 00 00",
    methods: ["moov", "card", "crypto"],
  },
  {
    code: "cm",
    name: "Cameroun",
    dial: "+237",
    currency: "XAF",
    placeholder: "6 70 00 00 00",
    methods: ["mtn", "orange", "card", "crypto"],
  },
  {
    code: "bf",
    name: "Burkina Faso",
    dial: "+226",
    currency: "XOF",
    placeholder: "70 00 00 00",
    methods: ["orange", "moov", "card", "crypto"],
  },
  {
    code: "ml",
    name: "Mali",
    dial: "+223",
    currency: "XOF",
    placeholder: "70 00 00 00",
    methods: ["orange", "moov", "card", "crypto"],
  },
  {
    code: "ga",
    name: "Gabon",
    dial: "+241",
    currency: "XAF",
    placeholder: "077 00 00 00",
    methods: ["airtel", "moov", "card", "crypto"],
  },
  {
    code: "cg",
    name: "Congo",
    dial: "+242",
    currency: "XAF",
    placeholder: "06 000 00 00",
    methods: ["airtel", "mtn", "card", "crypto"],
  },
  {
    code: "cd",
    name: "RDC",
    dial: "+243",
    currency: "CDF",
    placeholder: "081 000 00 00",
    methods: ["vodacom", "airtel", "orange", "card", "crypto"],
  },
  {
    code: "ne",
    name: "Niger",
    dial: "+227",
    currency: "XOF",
    placeholder: "90 00 00 00",
    methods: ["airtel", "moov", "card", "crypto"],
  },
  {
    code: "gn",
    name: "Guinée",
    dial: "+224",
    currency: "GNF",
    placeholder: "620 00 00 00",
    methods: ["mtn", "card", "crypto"],
  },
];

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

