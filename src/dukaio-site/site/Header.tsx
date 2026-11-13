import { Link } from "@/dukaio-site/router";
import { SIGNUP_PATH } from "@/dukaio-site/config";
import { useEffect, useState } from "react";
import { ChevronDown, FileText, KeyRound, Menu, PlayCircle, Handshake, X } from "lucide-react";
import { Logo } from "./Logo";
import { getDashboardUrl } from "@/lib/subdomain";

export const APP_URL = SIGNUP_PATH;

const products = [
  { s: "fichiers", icon: FileText, t: "Fichiers", d: "Ebooks, templates, packs" },
  { s: "cours", icon: PlayCircle, t: "Cours", d: "Formations vidéo en modules" },
  { s: "services", icon: Handshake, t: "Services", d: "Coaching, prestations, appels" },
  { s: "licences", icon: KeyRound, t: "Licences", d: "Logiciels, clés, accès" },
];

const links = [
  { t: "Fonctionnalités", h: "outils" },
  { t: "Paiements", h: "paiements" },
  { t: "Tarif", h: "tarif" },
  { t: "FAQ", h: "faq" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="fixed inset-x-0 top-[var(--banner-height,0px)] z-50 px-3 pt-3 md:pt-4 transition-[top] duration-200">
      <div
        className={`mx-auto flex items-center justify-between rounded-[1.25rem] border border-border bg-background/80 pl-5 pr-2.5 shadow-[0_10px_40px_-14px_oklch(0.25_0.06_258/0.22)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:pl-7 lg:pr-3 ${
          scrolled ? "h-[4.75rem] max-w-[1040px]" : "h-[4.75rem] max-w-[1200px]"
        }`}
      >
        <Link to="/" onClick={() => setOpen(false)} aria-label="Dukaio, accueil">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 text-[0.95rem] font-medium lg:flex">
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-md px-3 py-2 text-foreground/80 hover:text-foreground">
              Produits <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full w-[22rem] -translate-x-1/2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-popover p-2 shadow-[var(--shadow-soft)]">
                {products.map((p) => (
                  <Link key={p.t} to="/produits/$type" params={{ type: p.s }} className="flex gap-3 rounded-lg p-2.5 hover:bg-muted">
                    <p.icon className="mt-0.5 h-4 w-4 text-highlight" />
                    <span>
                      <span className="block text-sm font-semibold">{p.t}</span>
                      <span className="block text-xs font-normal text-muted-foreground">{p.d}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {links.map((l) => (
            <Link key={l.h} to="/" hash={l.h} className="rounded-md px-3 py-2 text-foreground/80 hover:text-foreground">
              {l.t}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center lg:flex">
          <a
            href={getDashboardUrl("/connexion")}
            className={`btn overflow-hidden border border-border bg-muted/70 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-muted ${
              scrolled ? "pointer-events-none mr-0 max-w-0 border-transparent opacity-0" : "mr-2 max-w-[8rem] opacity-100"
            }`}
            tabIndex={scrolled ? -1 : 0}
          >
            <span className="whitespace-nowrap">Connexion</span>
          </a>
          <a href={getDashboardUrl("/inscription")} className="btn btn-primary">Commencer</a>
        </div>

        <button className="grid h-10 w-10 place-items-center rounded-md lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="fade-up mx-auto mt-2 max-w-[1200px] rounded-2xl border border-border/80 bg-background/95 shadow-[var(--shadow-soft)] backdrop-blur-2xl lg:hidden">
          <div className="flex max-h-[calc(100dvh-6rem)] flex-col px-4 gap-1 overflow-y-auto py-4">
            <p className="px-2 pb-1 text-xs font-semibold text-muted-foreground">Produits</p>
            <div className="grid grid-cols-2 gap-1">
              {products.map((p) => (
                <Link key={p.t} to="/produits/$type" params={{ type: p.s }} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg p-2.5 text-sm font-medium hover:bg-muted">
                  <p.icon className="h-4 w-4 text-highlight" /> {p.t}
                </Link>
              ))}
            </div>
            <div className="my-2 h-px bg-border" />
            {links.map((l) => (
              <Link key={l.h} to="/" hash={l.h} onClick={() => setOpen(false)} className="rounded-lg px-2.5 py-3 text-[0.95rem] font-medium hover:bg-muted">
                {l.t}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href={getDashboardUrl("/connexion")} onClick={() => setOpen(false)} className="btn border border-border">Connexion</a>
              <a href={getDashboardUrl("/inscription")} onClick={() => setOpen(false)} className="btn btn-primary">Commencer</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
