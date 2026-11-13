import type { CSSProperties, ReactNode } from "react";
import { ChevronRight, FileText, Handshake, KeyRound, PlayCircle, Smartphone, Wallet } from "lucide-react";
import pCours from "@/dukaio-site/assets/p-cours.jpg";
import pFichiers from "@/dukaio-site/assets/p-fichiers.jpg";
import pServices from "@/dukaio-site/assets/p-services.jpg";
import pLicences from "@/dukaio-site/assets/p-licences.jpg";
import studio from "@/dukaio-site/assets/creator-studio.jpg";
import { APP_URL } from "@/dukaio-site/site/Header";
import { methods, PayLogo } from "@/dukaio-site/site/Payments";

function Iso({ icon, s = 84, className, style }: { icon: ReactNode; s?: number; className?: string; style?: CSSProperties }) {
  return (
    <div className={`pointer-events-none absolute hidden lg:block ${className}`} style={style} aria-hidden>
      <div className="iso" style={{ "--s": `${s}px` } as CSSProperties}>
        <i /><i /><i>{icon}</i>
      </div>
    </div>
  );
}

const avatars = [
  { src: studio, size: "h-12 w-12 md:h-14 md:w-14", pos: "object-[60%_30%]" },
  { src: pCours, size: "h-14 w-14 md:h-16 md:w-16", pos: "object-[50%_18%]" },
  { src: pServices, size: "h-[4.5rem] w-[4.5rem] md:h-[5.5rem] md:w-[5.5rem]", pos: "object-[50%_20%]", main: true },
  { src: pFichiers, size: "h-14 w-14 md:h-16 md:w-16", pos: "object-[50%_25%]" },
  { src: pLicences, size: "h-12 w-12 md:h-14 md:w-14", pos: "object-[55%_15%]" },
];

function Hl({ children }: { children: ReactNode }) {
  return <span className="text-highlight">{children}</span>;
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-32">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-24 -z-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-tint blur-3xl" />

      <Iso icon={<FileText className="h-6 w-6" />} className="float-a left-[7%] top-[26%]" s={70} />
      <Iso icon={<PlayCircle className="h-7 w-7" />} className="float-b left-[3%] top-[50%]" s={88} />
      <Iso icon={<Wallet className="h-8 w-8" />} className="float-a left-[14%] top-[74%]" s={104} />
      <Iso icon={<KeyRound className="h-6 w-6" />} className="float-b right-[7%] top-[26%]" s={70} />
      <Iso icon={<Handshake className="h-7 w-7" />} className="float-a right-[3%] top-[50%]" s={88} />
      <Iso icon={<Smartphone className="h-8 w-8" />} className="float-b right-[14%] top-[74%]" s={104} />

      <div className="wrap relative z-10 flex flex-col items-center text-center">
        <a
          href={APP_URL}
          data-reveal=""
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3 text-xs text-muted-foreground shadow-[var(--shadow-soft)]"
        >
          <span className="rounded-full border border-tint-line bg-tint px-2 py-0.5 font-semibold text-accent">Nouveau</span>
          Sans abonnement · 5 % par vente
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>

        <div data-reveal="" style={{ "--d": "80ms" } as CSSProperties} className="mt-12 flex items-center">
          {avatars.map((a, i) => (
            <span
              key={i}
              className={`${a.size} ${i ? "-ml-2.5" : ""} relative shrink-0 overflow-hidden rounded-full ${
                a.main ? "z-10 p-[3px] shadow-[var(--shadow-ui)]" : "border-[3px] border-background"
              }`}
              style={a.main ? { background: "var(--grad-tile)" } : undefined}
            >
              <img src={a.src} alt="" width={160} height={160} className={`h-full w-full rounded-full object-cover ${a.pos} ${a.main ? "" : "grayscale"}`} />
            </span>
          ))}
        </div>

        <h1 data-reveal="" style={{ "--d": "160ms" } as CSSProperties} className="font-display mt-8 text-[clamp(2.6rem,7.2vw,5.4rem)]">
          Vendez ce que vous savez.
        </h1>
        <p data-reveal="" style={{ "--d": "240ms" } as CSSProperties} className="mt-5 max-w-[34rem] text-[0.95rem] leading-relaxed text-muted-foreground md:text-base">
          Plus de 300 créateurs utilisent Dukaio pour vendre leurs <Hl>fichiers</Hl>, leurs <Hl>cours</Hl>, leurs{" "}
          <Hl>services</Hl> et leurs <Hl>licences</Hl>, puis encaisser en <Hl>Mobile Money</Hl>. Sans abonnement.
        </p>
        <div data-reveal="" style={{ "--d": "320ms" } as CSSProperties} className="mt-8">
          <a href={APP_URL} className="btn btn-primary h-11 px-6">Créer ma boutique gratuitement</a>
        </div>
        <div data-reveal="" style={{ "--d": "400ms" } as CSSProperties} className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><b className="font-semibold text-foreground">0 F</b> par mois</span>
          <span className="h-3 w-px bg-border" />
          <span className="flex items-center gap-2"><b className="font-semibold text-foreground">5 %</b> par vente, c’est tout</span>
        </div>
      </div>

      <div className="wrap relative mt-24 md:mt-32">
        <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-faint">
          Les moyens de paiement de vos clients, réunis
        </p>
        <div className="hairline-x mt-6" />
        <div className="relative overflow-hidden py-6 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="marquee flex w-max items-center gap-14">
            {[...methods, ...methods].map((m, i) => (
              <span key={i} className="flex items-center gap-2.5 whitespace-nowrap text-[0.95rem] font-semibold tracking-[-0.02em] text-faint grayscale transition hover:text-foreground hover:grayscale-0">
                <PayLogo m={m} className="h-6 w-6" rounded="rounded-md" />
                {m.name}
              </span>
            ))}
          </div>
        </div>
        <div className="hairline-x" />
      </div>
    </section>
  );
}
