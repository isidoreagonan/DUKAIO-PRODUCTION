import type { CSSProperties } from "react";
import { APP_URL } from "@/dukaio-site/site/Header";

export function FinalCta() {
  return (
    <section className="relative mt-28 overflow-hidden md:mt-40">
      <div className="wrap">
        <div className="hairline-x" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-full">
        <div className="absolute left-[18%] top-[18%] h-64 w-[40%] rounded-full bg-tint-line/60 blur-[90px]" />
        <div className="absolute right-[16%] top-[30%] h-56 w-[36%] rounded-full blur-[90px]" style={{ background: "var(--grad-tile-soft)" }} />
        <div className="absolute left-1/2 top-[45%] h-40 w-[30%] -translate-x-1/2 rounded-full bg-highlight/15 blur-[80px]" />
      </div>
      <div className="wrap relative flex flex-col items-center py-24 text-center md:py-32">
        <h2 data-reveal="" className="font-display text-[clamp(2.2rem,5vw,3.8rem)]">
          Votre première vente<br />peut arriver aujourd’hui
        </h2>
        <p data-reveal="" style={{ "--d": "80ms" } as CSSProperties} className="mt-4 text-[0.95rem] text-muted-foreground">
          Créez votre boutique gratuitement. Vous ne payez que lorsque vous vendez.
        </p>
        <div data-reveal="" style={{ "--d": "140ms" } as CSSProperties} className="mt-8">
          <a href={APP_URL} className="btn btn-primary h-11 px-6">Créer ma boutique</a>
        </div>
        <div data-reveal="" style={{ "--d": "200ms" } as CSSProperties} className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
          <span><b className="font-semibold text-foreground">300+</b> créateurs</span>
          <span className="h-3 w-px bg-border" />
          <span><b className="font-semibold text-foreground">0 F</b> d’abonnement</span>
        </div>
      </div>
    </section>
  );
}
