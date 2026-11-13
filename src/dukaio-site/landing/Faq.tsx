import { useState, type CSSProperties } from "react";
import { Plus } from "lucide-react";
import { APP_URL } from "@/dukaio-site/site/Header";

const faqs = [
  ["Combien coûte Dukaio ?", "Ouvrir une boutique est gratuit et il n’y a aucun abonnement. Dukaio prélève 5 % sur chaque vente réalisée. Si vous ne vendez pas, vous ne payez rien."],
  ["Quels produits puis-je vendre ?", "Des fichiers (ebooks, templates, packs), des cours en ligne, des services (coaching, prestations) et des licences de logiciels."],
  ["Comment mes clients paient-ils ?", "Par Mobile Money (Orange Money, MTN MoMo, Wave, Moov Money…), par carte bancaire Visa ou Mastercard, ou par PayPal."],
  ["Comment je récupère mon argent ?", "Vos gains s’affichent dans votre tableau de bord. Vous les retirez vers votre compte Mobile Money quand vous le souhaitez."],
  ["Faut-il des compétences techniques ?", "Non. Vous ajoutez votre produit, fixez un prix et partagez votre lien. Pas de site à construire, pas de code."],
  ["Qui est derrière Dukaio ?", "Dukaio est édité par Dolapo ECOM LLC, une société qui accompagne les créateurs et entrepreneurs africains dans la vente en ligne."],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="wrap pt-28 md:pt-40">
      <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div>
          <p data-reveal="" className="eyebrow">FAQ</p>
          <h2 data-reveal="" style={{ "--d": "80ms" } as CSSProperties} className="font-display mt-3 text-[clamp(2rem,4vw,2.8rem)]">Questions fréquentes</h2>
          <p data-reveal="" style={{ "--d": "140ms" } as CSSProperties} className="mt-4 max-w-xs text-[0.9rem] leading-relaxed text-muted-foreground">
            Vous ne trouvez pas votre réponse ? Créez votre compte et écrivez-nous depuis votre tableau de bord.
          </p>
          <a data-reveal="" href={APP_URL} className="btn mt-6 border border-border hover:bg-muted">Créer mon compte</a>
        </div>
        <div data-reveal="" style={{ "--d": "100ms" } as CSSProperties} className="divide-y divide-border border-y border-border">
          {faqs.map(([q, a], i) => {
            const on = open === i;
            return (
              <div key={q}>
                <button onClick={() => setOpen(on ? null : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left" aria-expanded={on}>
                  <span className="text-[0.95rem] font-semibold tracking-[-0.02em]">{q}</span>
                  <Plus className={`h-4 w-4 shrink-0 text-faint transition-transform duration-300 ${on ? "rotate-45" : ""}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <p className="overflow-hidden pr-10 text-[0.88rem] leading-relaxed text-muted-foreground">
                    <span className="block pb-5">{a}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
