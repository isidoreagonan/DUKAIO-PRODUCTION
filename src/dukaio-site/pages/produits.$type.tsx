import { createFileRoute, Link, notFound } from "@/dukaio-site/router";
import { useState, type CSSProperties } from "react";
import { Check, ChevronDown, ChevronRight, FileText, Handshake, KeyRound, PlayCircle, Plus } from "lucide-react";
import pCours from "@/dukaio-site/assets/p-cours.jpg";
import pFichiers from "@/dukaio-site/assets/p-fichiers.jpg";
import pServices from "@/dukaio-site/assets/p-services.jpg";
import pLicences from "@/dukaio-site/assets/p-licences.jpg";
import { getProductPage, productPages, type ProductPage } from "@/dukaio-site/lib/products";
import { APP_URL } from "@/dukaio-site/site/Header";
import { useRevealAll } from "@/dukaio-site/site/Reveal";
import { methods, PayLogo } from "@/dukaio-site/site/Payments";
import { FinalCta } from "@/dukaio-site/landing/FinalCta";

const icons = { fichiers: FileText, cours: PlayCircle, services: Handshake, licences: KeyRound };
const photos = { fichiers: pFichiers, cours: pCours, services: pServices, licences: pLicences };

export const Route = createFileRoute("/produits/$type")({
  loader: ({ params }) => {
    const p = getProductPage(params.type);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => {
    const t = loaderData?.meta.title ?? "Produits — Dukaio";
    const d = loaderData?.meta.description ?? "Vendez vos produits digitaux avec Dukaio.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: ProductRoute,
});

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function ProductRoute() {
  const p = Route.useLoaderData();
  useRevealAll();
  return (
    <div key={p.slug}>
      <Hero p={p} />
      <Stats p={p} />
      <Steps p={p} />
      <Features p={p} />
      <Others p={p} />
      <Faq p={p} />
      <FinalCta />
    </div>
  );
}

function Hero({ p }: { p: ProductPage }) {
  const Icon = icons[p.slug];
  return (
    <section className="relative overflow-hidden pt-28 md:pt-32">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-tint blur-3xl" />
      <div className="wrap relative z-10 grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p data-reveal="" className="inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3 text-xs text-muted-foreground shadow-[var(--shadow-soft)]">
            <span className="flex items-center gap-1 rounded-full border border-tint-line bg-tint px-2 py-0.5 font-semibold text-accent"><Icon className="h-3 w-3" />{p.label}</span>
            {p.badge}
          </p>
          <h1 data-reveal="" style={d(80)} className="font-display mt-7 text-[clamp(2.4rem,5.6vw,4.4rem)]">{p.title}</h1>
          <p data-reveal="" style={d(160)} className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground md:text-base">{p.lead}</p>
          <div data-reveal="" style={d(240)} className="mt-8 flex flex-wrap items-center gap-3">
            <a href={APP_URL} className="btn btn-primary h-11 px-6">{p.cta}</a>
            <Link to="/" hash="tarif" className="btn btn-ghost h-11">Voir le tarif</Link>
          </div>
          <p data-reveal="" style={d(300)} className="mt-6 text-xs text-muted-foreground"><b className="font-semibold text-foreground">0 F</b> par mois · <b className="font-semibold text-foreground">10 %</b> par vente, c’est tout</p>
        </div>

        <div data-reveal="" style={{ ...d(150), background: "var(--grad-tile-soft)" }} className="relative rounded-[1.6rem] p-3 md:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[0.8fr_1fr]">
            <div className="h-52 overflow-hidden rounded-2xl sm:h-auto">
              <img src={photos[p.slug]} alt={`Créateur qui vend des ${p.label.toLowerCase()} avec Dukaio`} width={768} height={1024} className="h-full w-full object-cover object-[50%_22%] grayscale" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-ui)]">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-faint">{p.features[0]!.t}</p>
                <p className="mt-1.5 text-[0.85rem] font-semibold leading-snug tracking-[-0.02em]">{p.features[0]!.title}</p>
                <ul className="mt-3 space-y-2">
                  {p.features[0]!.rows.map((r) => (
                    <li key={r.a} className="flex items-center justify-between gap-2 text-[0.72rem] sm:text-[0.68rem]"><span className="flex min-w-0 items-center gap-2 truncate text-muted-foreground"><Icon className="h-3.5 w-3.5 shrink-0 text-highlight" />{r.a}</span><span className="shrink-0 text-right font-semibold">{r.b}</span></li>
                  ))}
                </ul>
                <span className="btn btn-primary mt-4 h-8 w-full text-[0.72rem]">Acheter maintenant</span>
              </div>
              <div className="float-a rounded-2xl bg-card p-3 shadow-[var(--shadow-ui)]">
                <div className="flex items-center gap-2.5">
                  <PayLogo m={methods[0]!} className="h-8 w-8" />
                  <span className="min-w-0">
                    <span className="block text-[0.7rem] font-semibold">Nouvelle vente</span>
                    <span className="block truncate text-[0.6rem] text-muted-foreground">Payée en Orange Money</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-1 items-end justify-between rounded-2xl p-4" style={{ background: "var(--grad-dark)" }}>
                <span className="text-[0.7rem] text-ink-foreground/70">Vous recevez</span>
                <span className="font-display text-xl text-ink-foreground">90 %</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats({ p }: { p: ProductPage }) {
  const bgs = ["--grad-tile", "--grad-tile-gray", "--grad-tile-soft"];
  return (
    <section className="wrap pt-24 md:pt-32">
      <div className="grid gap-4 sm:grid-cols-3">
        {p.stats.map((s, i) => (
          <div key={s.l} data-reveal="" style={{ ...d(i * 90), background: `var(${bgs[i]})` }} className={`flex min-h-[11rem] flex-col justify-between rounded-xl p-6 shadow-[var(--shadow-soft)] ${i === 1 ? "border border-border" : ""}`}>
            <p className="font-display text-[clamp(2.4rem,4.4vw,3.4rem)] leading-none">{s.n}<span className="opacity-35">{s.suf}</span></p>
            <p className={`text-[0.82rem] ${i === 0 ? "font-medium" : "text-muted-foreground"}`}>{s.l}</p>
          </div>
        ))}
      </div>
      <div data-reveal="" className="mt-10 flex flex-wrap justify-center gap-2">
        {p.examples.map((e) => <span key={e} className="rounded-full border border-border px-3.5 py-1.5 text-[0.8rem] text-muted-foreground">{e}</span>)}
      </div>
      <div aria-hidden className="mx-auto mt-16 h-24 w-px bg-gradient-to-b from-transparent to-tint-line" />
    </section>
  );
}

function Steps({ p }: { p: ProductPage }) {
  return (
    <section className="wrap">
      <div className="relative rounded-[1.75rem] border border-tint-line/70 bg-tint px-4 pb-4 pt-14 md:px-6 md:pb-6 md:pt-20">
        <span aria-hidden className="absolute -top-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-[3px] border-background bg-accent" />
        <div className="mx-auto max-w-2xl text-center">
          <p data-reveal="" className="eyebrow">Comment ça marche</p>
          <h2 data-reveal="" style={d(80)} className="font-display mt-3 text-[clamp(2rem,4.4vw,3.2rem)]">Trois étapes,<br />puis vous encaissez</h2>
        </div>
        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {p.steps.map((s, i) => (
            <div key={s.t} data-reveal="" style={d(i * 100)} className="rounded-2xl border border-border bg-gradient-to-b from-card to-muted p-6 md:p-7">
              <span className="grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold text-primary-foreground" style={{ background: i === 2 ? "var(--grad-dark)" : "var(--grad-tile)" }}>{i + 1}</span>
              <p className="mt-10 text-lg font-semibold tracking-[-0.03em]">{s.t}</p>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features({ p }: { p: ProductPage }) {
  const [open, setOpen] = useState(0);
  const f = p.features[open]!;
  const Icon = icons[p.slug];
  return (
    <section className="wrap pt-28 md:pt-40">
      <div className="mx-auto max-w-2xl text-center">
        <p data-reveal="" className="eyebrow">Tout est inclus</p>
        <h2 data-reveal="" style={d(80)} className="font-display mt-3 text-[clamp(2rem,4.4vw,3.2rem)]">Les outils pour vendre<br />vos {p.label.toLowerCase()}</h2>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-[0.85fr_1.15fr] md:gap-8">
        <div data-reveal="" className="flex flex-col gap-1">
          {p.features.map((it, i) => {
            const on = i === open;
            return (
              <button key={it.t} onClick={() => setOpen(i)} className={`rounded-xl px-5 text-left transition-colors duration-300 ${on ? "bg-muted py-5" : "py-4 hover:bg-muted/60"}`}>
                <span className="flex items-center gap-3">
                  <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-highlight" : "bg-faint"}`} />
                  <span className={`flex-1 text-[0.92rem] ${on ? "font-semibold" : "font-medium text-muted-foreground"}`}>{it.t}</span>
                  <ChevronDown className={`h-4 w-4 text-faint transition-transform duration-300 ${on ? "rotate-180" : ""}`} />
                </span>
                <span className={`grid transition-[grid-template-rows] duration-500 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <span className="overflow-hidden"><span className="block pl-[1.1rem] pt-2 text-[0.82rem] leading-relaxed text-muted-foreground">{it.d}</span></span>
                </span>
              </button>
            );
          })}
        </div>
        <div data-reveal="" style={{ ...d(100), background: "var(--grad-tile-soft)" }} className="rounded-[1.4rem] p-3 md:p-5">
          <div className="flex min-h-[20rem] items-center rounded-2xl bg-card p-5 shadow-[var(--shadow-ui)] md:p-8">
            <div key={open} className="fade-up mx-auto w-full max-w-md">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-faint">{f.t}</p>
              <p className="mt-1.5 text-base font-semibold tracking-[-0.03em]">{f.title}</p>
              <ul className="mt-5 space-y-2">
                {f.rows.map((r, i) => (
                  <li key={r.a} className="fade-up flex items-center gap-3 rounded-xl border border-border p-3" style={{ animationDelay: `${i * 80}ms` }}>
                    {r.tag ? (
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-primary-foreground" style={{ background: "var(--grad-tile)" }}><Check className="h-3 w-3" /></span>
                    ) : (
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-tint text-highlight"><Icon className="h-3.5 w-3.5" /></span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-[0.75rem] font-medium">{r.a}</span>
                    <span className="shrink-0 text-[0.72rem] font-semibold">{r.b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Others({ p }: { p: ProductPage }) {
  return (
    <section className="wrap pt-28 md:pt-40">
      <p data-reveal="" className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-faint">Vendez aussi</p>
      <div className="hairline-x mt-6" />
      <div className="grid sm:grid-cols-3">
        {productPages.filter((o) => o.slug !== p.slug).map((o) => {
          const I = icons[o.slug];
          return (
            <Link key={o.slug} to="/produits/$type" params={{ type: o.slug }} className="group flex items-center gap-3 px-2 py-6 sm:justify-center">
              <I className="h-4 w-4 text-highlight" />
              <span className="text-[0.95rem] font-semibold tracking-[-0.02em]">{o.label}</span>
              <ChevronRight className="h-4 w-4 text-faint transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
      <div className="hairline-x" />
    </section>
  );
}

function Faq({ p }: { p: ProductPage }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="wrap pt-28 md:pt-40">
      <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div>
          <p data-reveal="" className="eyebrow">FAQ · {p.label}</p>
          <h2 data-reveal="" style={d(80)} className="font-display mt-3 text-[clamp(2rem,4vw,2.8rem)]">Vos questions</h2>
        </div>
        <div data-reveal="" className="divide-y divide-border border-y border-border">
          {p.faqs.map(([q, a], i) => {
            const on = open === i;
            return (
              <div key={q}>
                <button onClick={() => setOpen(on ? null : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left" aria-expanded={on}>
                  <span className="text-[0.95rem] font-semibold tracking-[-0.02em]">{q}</span>
                  <Plus className={`h-4 w-4 shrink-0 text-faint transition-transform duration-300 ${on ? "rotate-45" : ""}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-500 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <p className="overflow-hidden pr-10 text-[0.88rem] leading-relaxed text-muted-foreground"><span className="block pb-5">{a}</span></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
