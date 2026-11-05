import { useState, type CSSProperties, type ReactNode } from "react";
import { BarChart3, Check, ChevronDown, CreditCard, Download, FileText, Globe, Send, Wallet } from "lucide-react";
import dashboard from "@/dukaio-site/assets/dukaio-analytics-dashboard.webp";
import { method, methods, PayLogo } from "@/dukaio-site/site/Payments";

function SalesPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]">
      <div className="grid aspect-[16/10] place-items-center rounded-xl sm:aspect-[4/5]" style={{ background: "var(--grad-tile)" }}>
        <div className="w-[46%] rounded-lg bg-card p-3 sm:w-[62%] shadow-[var(--shadow-ui)]">
          <FileText className="h-4 w-4 text-highlight" />
          <p className="mt-6 text-[0.7rem] font-bold leading-tight">Lancer sa marque en 30 jours</p>
          <p className="mt-1 text-[0.55rem] text-muted-foreground">Ebook · 84 pages</p>
        </div>
      </div>
      <div className="flex flex-col">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-faint">Ebook PDF</p>
        <p className="mt-1.5 text-base font-semibold leading-snug tracking-[-0.03em]">Guide : lancer sa marque en 30 jours</p>
        <p className="mt-2 text-[0.72rem] leading-relaxed text-muted-foreground">La méthode pas à pas pour trouver votre nom, votre offre et vos premiers clients.</p>
        <p className="mt-4 text-xl font-semibold tracking-[-0.03em]">7 500 F</p>
        <span className="btn btn-primary mt-3 h-9 w-full text-[0.78rem]">Acheter maintenant</span>
        <div className="mt-3 flex gap-1.5">
          {methods.slice(0, 6).map((m) => <PayLogo key={m.key} m={m} className="h-5 w-5" rounded="rounded" />)}
        </div>
      </div>
    </div>
  );
}

function Delivery() {
  return (
    <div>
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-faint">E-mail envoyé à l’acheteur</p>
      <p className="mt-2 text-base font-semibold tracking-[-0.03em]">Merci pour votre achat, Awa !</p>
      <p className="mt-1 text-[0.72rem] text-muted-foreground">Votre produit est prêt. Téléchargez-le quand vous voulez.</p>
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border p-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-tint text-highlight"><FileText className="h-4 w-4" /></span>
        <span className="flex-1">
          <span className="block text-[0.72rem] font-semibold">guide-lancer-sa-marque.pdf</span>
          <span className="block text-[0.62rem] text-muted-foreground">4,2 Mo</span>
        </span>
        <span className="btn btn-primary h-8 px-3 text-[0.7rem]"><Download className="h-3 w-3" /> Télécharger</span>
      </div>
      <ol className="mt-5 space-y-3 border-l border-border pl-4">
        {["Paiement reçu · Orange Money", "Produit envoyé par e-mail", "Accès disponible dans l’espace client"].map((s) => (
          <li key={s} className="relative text-[0.72rem]">
            <span className="absolute -left-[1.42rem] top-0.5 grid h-3.5 w-3.5 place-items-center rounded-full text-primary-foreground" style={{ background: "var(--grad-tile)" }}>
              <Check className="h-2.5 w-2.5" />
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Checkout() {
  const opts = ["orange", "mtn", "wave", "visa"];
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-faint">Paiement</p>
        <p className="text-[0.72rem] font-semibold">7 500 F</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {opts.map((k, i) => (
          <div key={k} className={`flex items-center gap-2 rounded-lg border p-2.5 ${i === 0 ? "border-highlight bg-tint" : "border-border"}`}>
            <PayLogo m={method(k)} className="h-6 w-6" rounded="rounded-md" />
            <span className="text-[0.7rem] font-semibold">{method(k).name}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[0.65rem] font-medium text-muted-foreground">Numéro Orange Money</p>
      <div className="mt-1.5 rounded-lg border border-border px-3 py-2.5 text-[0.75rem] tracking-wide">+225 07 •• •• 21</div>
      <span className="btn btn-primary mt-4 h-9 w-full text-[0.78rem]">Payer 7 500 F</span>
      <p className="mt-2 text-center text-[0.6rem] text-faint">Paiement chiffré et sécurisé</p>
    </div>
  );
}

function Analytics() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <img src={dashboard} alt="Tableau de bord Analytiques de Dukaio" loading="lazy" className="w-full" />
    </div>
  );
}

function Payout() {
  return (
    <div>
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-faint">Solde disponible</p>
      <p className="mt-1 text-3xl font-semibold tracking-[-0.04em]">184 500 F</p>
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border p-3">
        <PayLogo m={method("orange")} className="h-9 w-9" />
        <span className="flex-1">
          <span className="block text-[0.72rem] font-semibold">Orange Money</span>
          <span className="block text-[0.62rem] text-muted-foreground">+225 07 •• •• 21</span>
        </span>
        <span className="btn btn-primary h-8 px-3 text-[0.7rem]"><Send className="h-3 w-3" /> Retirer</span>
      </div>
      <p className="mt-5 text-[0.65rem] font-semibold text-muted-foreground">Derniers retraits</p>
      <ul className="mt-2 divide-y divide-border text-[0.72rem]">
        {[["12 oct.", "95 000 F"], ["28 sept.", "61 500 F"], ["14 sept.", "40 000 F"]].map(([d, a]) => (
          <li key={d} className="flex justify-between py-2"><span className="text-muted-foreground">{d}</span><span className="font-semibold">{a}</span></li>
        ))}
      </ul>
    </div>
  );
}

const items: { icon: typeof Globe; t: string; d: string; view: ReactNode; wide?: boolean }[] = [
  { icon: Globe, t: "Page de vente", d: "Chaque produit a sa propre page, claire et prête à partager. Aucun site à construire.", view: <SalesPage /> },
  { icon: Send, t: "Livraison automatique", d: "Après le paiement, l’acheteur reçoit son produit par e-mail. Vous n’avez rien à faire.", view: <Delivery /> },
  { icon: CreditCard, t: "Paiement local", d: "Vos clients paient en Mobile Money ou par carte, depuis leur téléphone.", view: <Checkout /> },
  { icon: BarChart3, t: "Suivi des ventes", d: "Revenus, commandes et meilleurs produits dans un tableau de bord simple.", view: <Analytics />, wide: true },
  { icon: Wallet, t: "Retraits", d: "Retirez vos gains vers votre compte Mobile Money depuis votre tableau de bord.", view: <Payout /> },
];

export function Tools() {
  const [open, setOpen] = useState(0);
  const cur = items[open]!;
  return (
    <section id="outils" className="wrap pt-28 md:pt-40">
      <div className="mx-auto max-w-2xl text-center">
        <p data-reveal="" className="eyebrow">Tout est inclus</p>
        <h2 data-reveal="" style={{ "--d": "80ms" } as CSSProperties} className="font-display mt-3 text-[clamp(2rem,4.4vw,3.2rem)]">
          Chaque outil pour vendre<br />l’esprit tranquille
        </h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-[0.85fr_1.15fr] md:gap-8">
        <div data-reveal="" className="flex flex-col gap-1">
          {items.map((it, i) => {
            const on = i === open;
            return (
              <button
                key={it.t}
                onClick={() => setOpen(i)}
                className={`rounded-xl px-5 text-left transition-colors duration-300 ${on ? "bg-muted py-5" : "py-4 hover:bg-muted/60"}`}
              >
                <span className="flex items-center gap-3">
                  <it.icon className={`h-4 w-4 ${on ? "text-highlight" : "text-faint"}`} />
                  <span className={`flex-1 text-[0.92rem] ${on ? "font-semibold" : "font-medium text-muted-foreground"}`}>{it.t}</span>
                  <ChevronDown className={`h-4 w-4 text-faint transition-transform duration-300 ${on ? "rotate-180" : ""}`} />
                </span>
                <span className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <span className="overflow-hidden">
                    <span className="block pl-7 pt-2 text-[0.82rem] leading-relaxed text-muted-foreground">{it.d}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div data-reveal="" style={{ "--d": "100ms", background: "var(--grad-tile-soft)" } as CSSProperties} className="rounded-[1.4rem] p-3 md:p-5">
          <div className="flex h-full min-h-[22rem] items-center rounded-2xl bg-card p-5 shadow-[var(--shadow-ui)] md:p-7">
            <div key={open} className={`fade-up mx-auto w-full ${cur.wide ? "" : "max-w-md"}`}>{cur.view}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
