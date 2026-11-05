import orange from "@/dukaio-site/assets/pay/orange.png";
import mtn from "@/dukaio-site/assets/pay/mtn.png";
import wave from "@/dukaio-site/assets/pay/wave.png";
import moov from "@/dukaio-site/assets/pay/moov.png";
import airtel from "@/dukaio-site/assets/pay/airtel.png";
import mpesa from "@/dukaio-site/assets/pay/mpesa.png";
import visa from "@/dukaio-site/assets/pay/visa.png";
import mastercard from "@/dukaio-site/assets/pay/mastercard.png";
import paypal from "@/dukaio-site/assets/pay/paypal.png";

export type Method = { key: string; name: string; logo: string; fit?: "cover" | "contain" };

export const methods: Method[] = [
  { key: "orange", name: "Orange Money", logo: orange, fit: "cover" },
  { key: "mtn", name: "MTN MoMo", logo: mtn, fit: "cover" },
  { key: "wave", name: "Wave", logo: wave, fit: "cover" },
  { key: "moov", name: "Moov Money", logo: moov },
  { key: "airtel", name: "Airtel Money", logo: airtel, fit: "cover" },
  { key: "mpesa", name: "M-Pesa", logo: mpesa },
  { key: "visa", name: "Visa", logo: visa },
  { key: "mastercard", name: "Mastercard", logo: mastercard },
  { key: "paypal", name: "PayPal", logo: paypal },
];

export const method = (k: string) => methods.find((m) => m.key === k)!;

export function PayLogo({ m, className = "h-8 w-8", rounded = "rounded-lg" }: { m: Method; className?: string; rounded?: string }) {
  return (
    <span className={`${className} ${rounded} grid shrink-0 place-items-center overflow-hidden border border-border bg-card`}>
      <img src={m.logo} alt={m.name} loading="lazy" className={m.fit === "cover" ? "h-full w-full object-cover" : "h-[68%] w-[68%] object-contain"} />
    </span>
  );
}
