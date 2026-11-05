import type { CSSProperties } from "react";
import { APP_URL } from "@/dukaio-site/site/Header";
import { method, PayLogo } from "@/dukaio-site/site/Payments";

const arc = ["paypal", "mastercard", "moov", "orange", "mtn", "wave", "visa"];

export function Dome() {
  return (
    <section id="paiements" className="wrap pt-28 md:pt-40">
      <div className="relative mx-auto w-full max-w-[760px]">
        <div className="relative aspect-[2/1] w-full overflow-hidden [mask-image:linear-gradient(black_55%,transparent_96%)]">
          <div className="absolute left-0 top-0 aspect-square w-full rounded-full" style={{ background: "var(--grad-dome)" }} />
          <div className="absolute left-[9%] top-[18%] aspect-square w-[82%] rounded-full bg-gradient-to-b from-background/45 to-transparent" />
          {arc.map((k, i) => {
            const a = Math.PI - (i * Math.PI) / (arc.length - 1);
            const ang = 0.16 + (a / Math.PI) * (Math.PI - 0.32);
            const left = 50 + 39 * Math.cos(ang);
            const top = 100 - 78 * Math.sin(ang);
            return (
              <span
                key={k}
                data-reveal=""
                className="absolute"
                style={{ left: `${left}%`, top: `${top}%`, "--d": `${i * 70}ms` } as CSSProperties}
              >
                <span className="float-a -translate-x-1/2 -translate-y-1/2 grid h-[clamp(2.4rem,8vw,4rem)] w-[clamp(2.4rem,8vw,4rem)] place-items-center rounded-2xl bg-card p-2 shadow-[var(--shadow-ui)]" style={{ animationDelay: `${i * 0.6}s` }}>
                  <PayLogo m={method(k)} className="h-full w-full" rounded="rounded-xl" />
                </span>
              </span>
            );
          })}
        </div>

        <div className="relative -mt-[11%] text-center">
          <p data-reveal="" className="eyebrow">Paiements locaux</p>
          <h2 data-reveal="" style={{ "--d": "80ms" } as CSSProperties} className="font-display mt-3 text-[clamp(2rem,4.4vw,3.2rem)]">
            Encaissez comme<br />vos clients paient
          </h2>
          <p data-reveal="" style={{ "--d": "140ms" } as CSSProperties} className="mx-auto mt-4 max-w-md text-[0.92rem] leading-relaxed text-muted-foreground">
            Mobile Money, carte bancaire ou PayPal : vos acheteurs paient avec ce qu’ils utilisent déjà, où qu’ils soient.
          </p>
          <div data-reveal="" style={{ "--d": "200ms" } as CSSProperties} className="mt-7">
            <a href={APP_URL} className="btn btn-primary">Commencer à encaisser</a>
          </div>
        </div>
      </div>
    </section>
  );
}
