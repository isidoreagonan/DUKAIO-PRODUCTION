import { useState, type CSSProperties } from "react";
import { Check } from "lucide-react";
import { APP_URL } from "@/dukaio-site/site/Header";
import { fcfa, payout } from "@/dukaio-site/lib/pricing";

function Slider({ label, value, min, max, step, onChange, fmt }: { label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; fmt: (n: number) => string }) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[0.8rem]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{fmt(value)}</span>
      </span>
      <input type="range" className="range mt-3" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} style={{ "--p": `${p}%` } as CSSProperties} />
    </label>
  );
}

export function Pricing() {
  const [price, setPrice] = useState(10000);
  const [sales, setSales] = useState(30);
  const r = payout(price, sales);

  return (
    <section id="tarif" className="wrap pt-28 md:pt-40">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <p data-reveal="" className="eyebrow">Tarif</p>
          <h2 data-reveal="" style={{ "--d": "80ms" } as CSSProperties} className="font-display mt-3 text-[clamp(2rem,4.4vw,3.2rem)]">
            Pas d’abonnement.<br /><span className="text-faint">Seulement 10 % quand vous vendez.</span>
          </h2>
          <p data-reveal="" style={{ "--d": "140ms" } as CSSProperties} className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-muted-foreground">
            Ouvrir votre boutique ne coûte rien. Dukaio prélève 10 % sur chaque vente, et rien du tout tant que vous ne vendez pas.
          </p>
          <ul data-reveal="" style={{ "--d": "200ms" } as CSSProperties} className="mt-7 space-y-3 text-[0.88rem]">
            {["Ouverture de boutique gratuite", "Aucun frais mensuel, aucun engagement", "Toutes les fonctionnalités dès le premier jour", "10 % prélevés uniquement sur les ventes"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full text-primary-foreground" style={{ background: "var(--grad-tile)" }}><Check className="h-3 w-3" /></span>
                {t}
              </li>
            ))}
          </ul>
          <div data-reveal="" style={{ "--d": "260ms" } as CSSProperties} className="mt-8">
            <a href={APP_URL} className="btn btn-primary">Ouvrir ma boutique gratuitement</a>
          </div>
        </div>

        <div data-reveal="" style={{ "--d": "120ms", background: "var(--grad-tile-soft)" } as CSSProperties} className="rounded-[1.4rem] p-3 md:p-5">
          <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-ui)] md:p-8">
            <p className="text-sm font-semibold">Simulez vos gains</p>
            <div className="mt-6 space-y-7">
              <Slider label="Prix de votre produit" value={price} min={1000} max={100000} step={500} onChange={setPrice} fmt={fcfa} />
              <Slider label="Ventes par mois" value={sales} min={1} max={300} step={1} onChange={setSales} fmt={(n) => `${n}`} />
            </div>
            <dl className="mt-8 space-y-2.5 border-t border-border pt-6 text-[0.85rem]">
              <div className="flex justify-between"><dt className="text-muted-foreground">Chiffre d’affaires</dt><dd className="font-medium">{fcfa(r.gross)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Commission Dukaio (10 %)</dt><dd className="font-medium">− {fcfa(r.fee)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Abonnement</dt><dd className="font-medium">0 F</dd></div>
            </dl>
            <div className="mt-6 flex items-end justify-between rounded-xl p-5" style={{ background: "var(--grad-tile)" }}>
              <span className="text-[0.8rem] font-medium">Vous recevez</span>
              <span className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-none">{fcfa(r.net)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
