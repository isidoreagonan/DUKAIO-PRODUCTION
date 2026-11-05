import type { CSSProperties } from "react";
import { BookOpen, FileText, KeyRound, Handshake, Wallet } from "lucide-react";
import { method, PayLogo } from "@/dukaio-site/site/Payments";

const products = [
  { icon: FileText, n: "Guide : lancer sa marque", p: "7 500 F", s: "En ligne" },
  { icon: BookOpen, n: "Formation Excel en 30 jours", p: "25 000 F", s: "En ligne" },
  { icon: Handshake, n: "Coaching business · 1 h", p: "15 000 F", s: "En ligne" },
  { icon: KeyRound, n: "Licence logiciel de caisse", p: "40 000 F", s: "Brouillon" },
];

const bars = [38, 62, 46, 74, 58, 88, 70];

export function Bento() {
  return (
    <section className="wrap">
      <div className="relative rounded-[1.75rem] border border-tint-line/70 bg-tint px-3 pb-3 pt-14 md:px-5 md:pb-5 md:pt-20">
        <span aria-hidden className="absolute -top-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-[3px] border-background bg-accent" />
        <div className="mx-auto max-w-2xl px-3 text-center">
          <p data-reveal="" className="eyebrow">Votre boutique, clé en main</p>
          <h2 data-reveal="" style={{ "--d": "80ms" } as CSSProperties} className="font-display mt-4 text-[clamp(2rem,4.4vw,3.4rem)]">
            Créez, vendez, encaissez.<br />Au même endroit.
          </h2>
          <p data-reveal="" style={{ "--d": "160ms" } as CSSProperties} className="mx-auto mt-4 max-w-md text-[0.92rem] leading-relaxed text-muted-foreground">
            Ajoutez vos produits, partagez votre lien et suivez chaque vente, sans site à construire ni outil à brancher.
          </p>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-[4fr_3fr_3fr] md:grid-rows-[auto_auto]">
          {/* Produits */}
          <div data-reveal="" className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-muted p-6 md:row-span-2 md:p-8">
            <div className="mx-auto w-full max-w-[19rem] rounded-xl bg-card p-4 shadow-[var(--shadow-ui)] md:mt-6">
              <div className="flex items-center justify-between">
                <p className="text-[0.78rem] font-semibold">Mes produits</p>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">4</span>
              </div>
              <ul className="mt-3 space-y-2">
                {products.map((p, i) => (
                  <li key={p.n} className="fade-up flex items-center gap-2.5 rounded-lg border border-border px-2.5 py-2" style={{ animationDelay: `${i * 90}ms` }}>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-tint text-highlight"><p.icon className="h-3.5 w-3.5" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.7rem] font-semibold">{p.n}</span>
                      <span className="block text-[0.62rem] text-muted-foreground">{p.p}</span>
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold ${p.s === "En ligne" ? "bg-tint text-accent" : "bg-muted text-muted-foreground"}`}>{p.s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10">
              <p className="font-display text-[2rem] text-highlight">Vos produits</p>
              <p className="mt-2 max-w-sm text-[0.85rem] leading-relaxed text-muted-foreground">
                Un ebook, une formation, un coaching ou une licence : chaque produit a sa page de vente et son prix, prêts en quelques minutes.
              </p>
            </div>
          </div>

          {/* Analytiques */}
          <div data-reveal="" style={{ "--d": "80ms" } as CSSProperties} className="grid gap-6 rounded-2xl border border-border bg-gradient-to-b from-card to-muted p-6 sm:grid-cols-2 md:col-span-2">
            <div>
              <p className="text-lg font-semibold tracking-[-0.03em]">Analytiques</p>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-muted-foreground">
                Ventes, revenus et produits les plus achetés : vous voyez ce qui marche, jour après jour.
              </p>
            </div>
            <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-ui)]">
              <div className="flex items-center justify-between">
                <p className="text-[0.7rem] font-semibold">Revenus · 7 jours</p>
                <span className="rounded-md bg-tint px-1.5 py-0.5 text-[0.6rem] font-semibold text-accent">+18 %</span>
              </div>
              <p className="mt-1 text-lg font-semibold tracking-[-0.03em]">184 500 F</p>
              <div className="mt-3 flex h-20 items-end gap-1.5 border-b border-border">
                {bars.map((h, i) => (
                  <span key={i} className="bar flex-1 rounded-t-[4px]" style={{ height: `${h}%`, background: i === 5 ? "var(--grad-button)" : "var(--grad-tile)", opacity: i === 5 ? 1 : 0.55, "--d": `${i * 70}ms` } as CSSProperties} />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[0.55rem] text-faint">
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <span key={i} className="flex-1 text-center">{d}</span>)}
              </div>
            </div>
          </div>

          {/* Ventes */}
          <div data-reveal="" style={{ "--d": "120ms" } as CSSProperties} className="overflow-hidden rounded-2xl border border-border bg-card p-6">
            <p className="text-lg font-semibold tracking-[-0.03em]">Ventes en direct</p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-muted-foreground">Chaque paiement vous est notifié, et le client reçoit son produit tout de suite.</p>
            <div className="mt-6 space-y-2 md:-mb-10">
              {[
                { m: "orange", n: "Awa D.", t: "Guide : lancer sa marque", a: "7 500 F", time: "à l’instant" },
                { m: "wave", n: "Moussa K.", t: "Formation Excel en 30 jours", a: "25 000 F", time: "il y a 12 min" },
              ].map((s) => (
                <div key={s.n} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-soft)]">
                  <PayLogo m={method(s.m)} className="h-8 w-8" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.72rem] font-semibold">{s.n} · {s.a}</span>
                    <span className="block truncate text-[0.62rem] text-muted-foreground">{s.t}</span>
                  </span>
                  <span className="text-[0.6rem] text-faint">{s.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Retraits */}
          <div data-reveal="" style={{ "--d": "160ms", background: "var(--grad-dark)" } as CSSProperties} className="relative min-h-[17rem] overflow-hidden rounded-2xl p-6 text-ink-foreground">
            <p className="font-display max-w-[13rem] text-[1.6rem] leading-[1.1]">Vos gains, sur votre Mobile Money</p>
            <div className="absolute -bottom-6 right-6">
              <div className="iso on-dark" style={{ "--s": "120px" } as CSSProperties}>
                <i /><i /><i><Wallet className="h-10 w-10" /></i>
              </div>
            </div>
            <div className="absolute bottom-24 right-36 opacity-70">
              <div className="iso on-dark" style={{ "--s": "46px" } as CSSProperties}>
                <i /><i /><i><span className="text-[0.6rem] font-bold">F</span></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
