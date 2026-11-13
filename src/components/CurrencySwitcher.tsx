import React from "react";
import { useCurrency, CURRENCY_METAS } from "@/lib/currency";
import { Globe } from "lucide-react";

const SUPPORTED_OPTIONS = [
  { code: "bj", currency: "XOF", flag: "🇧🇯", label: "FCFA (UEMOA / CEMAC)" },
  { code: "us", currency: "USD", flag: "🇺🇸", label: "USD ($)" },
  { code: "cd", currency: "CDF", flag: "🇨🇩", label: "CDF (Franc Congolais)" },
  { code: "zm", currency: "ZMW", flag: "🇿🇲", label: "ZMW (Kwacha)" },
  { code: "fr", currency: "EUR", flag: "🇪🇺", label: "EUR (€)" },
  { code: "gb", currency: "GBP", flag: "🇬🇧", label: "GBP (£)" },
  { code: "ca", currency: "CAD", flag: "🇨🇦", label: "CAD ($)" },
];

export const CurrencySwitcher = ({ className = "" }: { className?: string }) => {
  const { countryCode, currency, setCountry } = useCurrency();

  const currentOption = SUPPORTED_OPTIONS.find((o) => o.code === countryCode.toLowerCase()) || {
    code: countryCode,
    currency,
    flag: "🌍",
    label: currency,
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="relative flex items-center bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-xl px-2.5 py-1.5 transition-colors text-xs font-semibold text-gray-700 shadow-2xs">
        <span className="mr-1.5 text-sm">{currentOption.flag}</span>
        <span className="font-bold">{currentOption.currency}</span>
        <select
          value={currentOption.code}
          onChange={(e) => setCountry(e.target.value)}
          aria-label="Sélectionner la devise"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
        >
          {SUPPORTED_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.flag} {opt.label}
            </option>
          ))}
        </select>
        <span className="ml-1 text-[10px] text-gray-400">▾</span>
      </div>
    </div>
  );
};

