import { useEffect, useRef, useState, type CSSProperties } from "react";

function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / 1400);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{v}</span>;
}

type Tile = { n: number; suf: string; l: string; bg: string; d: number };

function StatTile({ t }: { t: Tile }) {
  return (
    <div
      data-reveal=""
      style={{ "--d": `${t.d}ms`, background: `var(${t.bg})` } as CSSProperties}
      className={`flex aspect-[1/0.98] w-full flex-col justify-between rounded-xl p-5 md:p-6 ${
        t.bg === "--grad-tile-gray" ? "border border-border" : ""
      } shadow-[var(--shadow-soft)]`}
    >
      <p className="font-display text-[clamp(2.4rem,4.4vw,3.5rem)] leading-none">
        <Count to={t.n} />
        <span className="opacity-35">{t.suf}</span>
      </p>
      <p className={`text-[0.8rem] leading-snug ${t.bg === "--grad-tile" ? "font-medium" : "text-muted-foreground"}`}>{t.l}</p>
    </div>
  );
}

const top: Tile[] = [
  { n: 300, suf: "+", l: "Créateurs vendent déjà avec Dukaio", bg: "--grad-tile", d: 0 },
  { n: 10, suf: "%", l: "Seule commission, prélevée par vente", bg: "--grad-tile-gray", d: 100 },
];
const bottom: Tile[] = [
  { n: 0, suf: " F", l: "D’abonnement mensuel, pour toujours", bg: "--grad-tile-soft", d: 0 },
  { n: 4, suf: "", l: "Types de produits à vendre au même endroit", bg: "--grad-tile-gray", d: 100 },
];

export function Stats() {
  return (
    <section className="relative pt-24 md:pt-32">
      <div aria-hidden className="faint-grid pointer-events-none absolute inset-0" />
      <div className="wrap relative">
        <div className="grid gap-4 md:grid-cols-12">
          <p data-reveal="" className="text-sm font-semibold leading-tight md:col-span-4">Pourquoi<br />Dukaio</p>
          <div className="grid grid-cols-2 gap-4 md:col-span-5 md:col-start-5 lg:col-span-4 lg:col-start-5">
            {top.map((t) => <StatTile key={t.l} t={t} />)}
          </div>
        </div>

        <div className="mt-10 grid items-end gap-10 md:mt-16 md:grid-cols-12">
          <p data-reveal="" className="font-display text-[clamp(1.5rem,2.6vw,2.15rem)] leading-[1.18] tracking-[-0.035em] md:col-span-6 lg:col-span-5">
            Dukaio donne aux créateurs africains <span className="text-highlight">une boutique complète</span> pour vendre en ligne,{" "}
            <span className="text-faint">encaisser en Mobile Money et grandir à leur rythme.</span>
          </p>
          <div className="grid grid-cols-2 gap-4 md:col-span-6 md:col-start-7 lg:col-span-4 lg:col-start-9">
            {bottom.map((t) => <StatTile key={t.l} t={t} />)}
          </div>
        </div>

        <div aria-hidden className="mx-auto mt-16 h-28 w-px bg-gradient-to-b from-transparent to-tint-line" />
      </div>
    </section>
  );
}
