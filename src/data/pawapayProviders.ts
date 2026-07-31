// PawaPay providers — actifs sur le compte LIVE Dukaio
// Source: GET https://api.pawapay.io/v2/active-conf (DOLAPO ECOM LLC)
// Logos téléchargés dans src/assets/payment-logos/providers/
// Drapeaux téléchargés dans src/assets/payment-logos/flags/

import mtnLogo from "@/assets/payment-logos/providers/mtn.png";
import moovLogo from "@/assets/payment-logos/providers/moov.png";
import orangeLogo from "@/assets/payment-logos/providers/orange.png";
import airtelLogo from "@/assets/payment-logos/providers/airtel.png";
import vodacomLogo from "@/assets/payment-logos/providers/vodacom.png";
import mpesaLogo from "@/assets/payment-logos/providers/mpesa.png";
import zamtelLogo from "@/assets/payment-logos/providers/zamtel.png";

import benFlag from "@/assets/payment-logos/flags/ben.svg";
import civFlag from "@/assets/payment-logos/flags/civ.svg";
import cmrFlag from "@/assets/payment-logos/flags/cmr.svg";
import codFlag from "@/assets/payment-logos/flags/cod.svg";
import cogFlag from "@/assets/payment-logos/flags/cog.svg";
import gabFlag from "@/assets/payment-logos/flags/gab.svg";
import kenFlag from "@/assets/payment-logos/flags/ken.svg";
import rwaFlag from "@/assets/payment-logos/flags/rwa.svg";
import senFlag from "@/assets/payment-logos/flags/sen.svg";
import sleFlag from "@/assets/payment-logos/flags/sle.svg";
import ugaFlag from "@/assets/payment-logos/flags/uga.svg";
import zmbFlag from "@/assets/payment-logos/flags/zmb.svg";

export const providerLogos: Record<string, string> = {
  mtn: mtnLogo,
  moov: moovLogo,
  orange: orangeLogo,
  airtel: airtelLogo,
  vodacom: vodacomLogo,
  mpesa: mpesaLogo,
  zamtel: zamtelLogo,
};

export interface PawaPayProvider {
  /** PawaPay provider code (e.g. MTN_MOMO_BEN) — used in API calls */
  code: string;
  /** Family/brand for logo (mtn, moov, orange, airtel, vodacom, mpesa, zamtel) */
  family: keyof typeof providerLogos;
  /** Display name for the user */
  label: string;
  /** Currency code (XOF, XAF, KES, RWF, UGX, ZMW, CDF, USD, SLE) */
  currency: string;
  /** Min amount in the currency unit */
  minAmount: number;
  /** Max amount */
  maxAmount: number;
}

export interface PawaPayCountry {
  /** ISO3 country code used by PawaPay (BEN, CIV...) */
  code: string;
  /** Display name (FR) */
  name: string;
  /** International dial prefix without + */
  dial: string;
  /** Local flag URL */
  flag: string;
  /** Available DEPOSIT (pay-in) providers */
  deposit: PawaPayProvider[];
}

export const pawapayCountries: PawaPayCountry[] = [
  {
    code: "BEN", name: "Bénin", dial: "229", flag: benFlag,
    deposit: [
      { code: "MTN_MOMO_BEN", family: "mtn", label: "MTN MoMo", currency: "XOF", minAmount: 1, maxAmount: 2000000 },
      { code: "MOOV_BEN", family: "moov", label: "Moov Money", currency: "XOF", minAmount: 100, maxAmount: 2000000 },
    ],
  },
  {
    code: "CIV", name: "Côte d'Ivoire", dial: "225", flag: civFlag,
    deposit: [
      { code: "MTN_MOMO_CIV", family: "mtn", label: "MTN MoMo", currency: "XOF", minAmount: 1, maxAmount: 2000000 },
      { code: "ORANGE_CIV", family: "orange", label: "Orange Money", currency: "XOF", minAmount: 1, maxAmount: 1500000 },
    ],
  },
  {
    code: "CMR", name: "Cameroun", dial: "237", flag: cmrFlag,
    deposit: [
      { code: "MTN_MOMO_CMR", family: "mtn", label: "MTN MoMo", currency: "XAF", minAmount: 1, maxAmount: 1000000 },
    ],
  },
  {
    code: "COD", name: "RD Congo", dial: "243", flag: codFlag,
    deposit: [
      { code: "AIRTEL_COD", family: "airtel", label: "Airtel Money (CDF)", currency: "CDF", minAmount: 100, maxAmount: 6250000 },
      { code: "ORANGE_COD", family: "orange", label: "Orange Money (CDF)", currency: "CDF", minAmount: 10, maxAmount: 1000000 },
      { code: "VODACOM_MPESA_COD", family: "vodacom", label: "Vodacom M-Pesa (CDF)", currency: "CDF", minAmount: 500, maxAmount: 1000000 },
    ],
  },
  {
    code: "COG", name: "Congo", dial: "242", flag: cogFlag,
    deposit: [
      { code: "MTN_MOMO_COG", family: "mtn", label: "MTN MoMo", currency: "XAF", minAmount: 1, maxAmount: 2000000 },
      { code: "AIRTEL_COG", family: "airtel", label: "Airtel Money", currency: "XAF", minAmount: 10, maxAmount: 1500000 },
    ],
  },
  {
    code: "GAB", name: "Gabon", dial: "241", flag: gabFlag,
    deposit: [
      { code: "AIRTEL_GAB", family: "airtel", label: "Airtel Money", currency: "XAF", minAmount: 100, maxAmount: 500000 },
    ],
  },
  {
    code: "KEN", name: "Kenya", dial: "254", flag: kenFlag,
    deposit: [
      { code: "MPESA_KEN", family: "mpesa", label: "M-Pesa", currency: "KES", minAmount: 1, maxAmount: 250000 },
    ],
  },
  {
    code: "RWA", name: "Rwanda", dial: "250", flag: rwaFlag,
    deposit: [
      { code: "MTN_MOMO_RWA", family: "mtn", label: "MTN MoMo", currency: "RWF", minAmount: 5, maxAmount: 2000000 },
      { code: "AIRTEL_RWA", family: "airtel", label: "Airtel Money", currency: "RWF", minAmount: 100, maxAmount: 1500000 },
    ],
  },
  {
    code: "SEN", name: "Sénégal", dial: "221", flag: senFlag,
    deposit: [
      { code: "ORANGE_SEN", family: "orange", label: "Orange Money", currency: "XOF", minAmount: 2, maxAmount: 100000000 },
    ],
  },
  {
    code: "SLE", name: "Sierra Leone", dial: "232", flag: sleFlag,
    deposit: [
      { code: "ORANGE_SLE", family: "orange", label: "Orange Money", currency: "SLE", minAmount: 1, maxAmount: 15000 },
    ],
  },
  {
    code: "UGA", name: "Ouganda", dial: "256", flag: ugaFlag,
    deposit: [
      { code: "MTN_MOMO_UGA", family: "mtn", label: "MTN MoMo", currency: "UGX", minAmount: 500, maxAmount: 5000000 },
      { code: "AIRTEL_OAPI_UGA", family: "airtel", label: "Airtel Money", currency: "UGX", minAmount: 500, maxAmount: 5000000 },
    ],
  },
  {
    code: "ZMB", name: "Zambie", dial: "260", flag: zmbFlag,
    deposit: [
      { code: "MTN_MOMO_ZMB", family: "mtn", label: "MTN MoMo", currency: "ZMW", minAmount: 1, maxAmount: 20000 },
      { code: "ZAMTEL_ZMB", family: "zamtel", label: "Zamtel Kwacha", currency: "ZMW", minAmount: 1, maxAmount: 20000 },
    ],
  },
];

/** Find a country by ISO3 code */
export const findCountry = (code: string) =>
  pawapayCountries.find((c) => c.code === code);

/** Find a country by dial prefix (longest match) */
export const findCountryByDial = (dial: string): PawaPayCountry | undefined => {
  const cleaned = dial.replace(/\D/g, "");
  // Try exact then prefix match (longest first)
  const sorted = [...pawapayCountries].sort((a, b) => b.dial.length - a.dial.length);
  return sorted.find((c) => cleaned.startsWith(c.dial));
};

/** Country code → currency (default deposit currency) */
export const defaultCurrencyForCountry = (code: string): string => {
  const c = findCountry(code);
  return c?.deposit[0]?.currency || "XOF";
};
