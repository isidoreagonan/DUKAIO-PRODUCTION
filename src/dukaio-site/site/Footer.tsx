import { Link } from "@/dukaio-site/router";
import { ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { APP_URL } from "./Header";
import { legalPages } from "@/dukaio-site/lib/legal";

const cols: { t: string; items: { l: string; h?: string; href?: string; slug?: string; p?: string }[] }[] = [
  { t: "Produits", items: [{ l: "Fichiers", p: "fichiers" }, { l: "Cours", p: "cours" }, { l: "Services", p: "services" }, { l: "Licences", p: "licences" }] },
  { t: "Plateforme", items: [{ l: "Fonctionnalités", h: "outils" }, { l: "Paiements", h: "paiements" }, { l: "Tarif", h: "tarif" }, { l: "FAQ", h: "faq" }] },
  { t: "Compte", items: [{ l: "Créer ma boutique", href: APP_URL }, { l: "Connexion", href: "/connexion" }] },
  { t: "Légal", items: legalPages.map((p) => ({ l: p.short, slug: p.slug })) },
];

export function Footer() {
  return (
    <footer className="bg-background">
      <div className="wrap pt-20">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-[0.82rem] leading-relaxed text-muted-foreground">
              Dukaio aide les créateurs africains à vendre leurs fichiers, cours, services et licences en ligne, et à encaisser en Mobile Money.
            </p>
          </div>
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold">Prêt à vendre ?</p>
            <a
              href={APP_URL}
              className="group mt-3 flex h-12 items-center justify-between rounded-lg bg-muted pl-4 pr-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary"
            >
              Ouvrez votre boutique en quelques minutes
              <span className="btn btn-primary h-9">
                Commencer <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
            <p className="mt-3 text-xs text-faint">
              Sans abonnement. 5 % par vente uniquement. Voir nos{" "}
              <Link to="/legal/$slug" params={{ slug: "conditions-vente" }} className="text-highlight hover:underline">conditions de vente</Link>.
            </p>
          </div>
        </div>

        <div className="mt-14 h-px bg-border" />

        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
          {cols.map((c) => (
            <div key={c.t}>
              <p className="text-[0.82rem] font-semibold">{c.t}</p>
              <ul className="mt-4 space-y-2.5 text-[0.82rem] text-muted-foreground">
                {c.items.map((i) => (
                  <li key={i.l}>
                    {i.p ? (
                      <Link to="/produits/$type" params={{ type: i.p }} className="hover:text-foreground">{i.l}</Link>
                    ) : i.slug ? (
                      <Link to="/legal/$slug" params={{ slug: i.slug }} className="hover:text-foreground">{i.l}</Link>
                    ) : i.href ? (
                      <a href={i.href} className="hover:text-foreground">{i.l}</a>
                    ) : (
                      <Link to="/" hash={i.h ?? ""} className="hover:text-foreground">{i.l}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-5">
            <Link to="/legal/$slug" params={{ slug: "confidentialite" }} className="hover:text-foreground">Confidentialité</Link>
            <Link to="/legal/$slug" params={{ slug: "conditions-utilisation" }} className="hover:text-foreground">Conditions d’utilisation</Link>
            <Link to="/legal/$slug" params={{ slug: "mentions-legales" }} className="hover:text-foreground">Mentions légales</Link>
          </div>
          <p>© {new Date().getFullYear()} Dolapo ECOM LLC. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
