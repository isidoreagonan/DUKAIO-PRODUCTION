import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useActiveStore } from "@/hooks/useActiveStore";
import { getStoreUrl } from "@/lib/subdomain";
import {
  Store,
  User,
  Globe,
  FileText,
  Search,
  Code2,
  Shield,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface SettingItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  badge?: string;
}

const BOUTIQUE_SETTINGS: SettingItem[] = [
  {
    id: "identity",
    title: "Identité de la boutique",
    description: "Définissez le nom, le logo, la description et les réseaux sociaux de votre boutique.",
    href: "/dashboard/settings/identity",
    icon: Store,
    iconBg: "bg-rose-50 dark:bg-rose-950/40",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "profile",
    title: "Profil du Créateur",
    description: "Personnalisez votre profil créateur pour mettre en valeur votre expertise et vous connecter avec vos clients.",
    href: "/dashboard/settings/identity",
    icon: User,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "Nouveau",
  },
  {
    id: "domain",
    title: "Nom de domaine",
    description: "Connectez et personnalisez le nom de domaine de votre boutique.",
    href: "/dashboard/settings/domain",
    icon: Globe,
    iconBg: "bg-cyan-50 dark:bg-cyan-950/40",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "pages",
    title: "Pages",
    description: "Créez et gérez vos pages de contenu (mentions légales, politique de confidentialité, etc.).",
    href: "/dashboard/settings/pages",
    icon: FileText,
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
];

const MARKETING_SETTINGS: SettingItem[] = [
  {
    id: "seo",
    title: "SEO & Référencement",
    description: "Optimisez les titres, descriptions et métadonnées pour les moteurs de recherche.",
    href: "/dashboard/settings/seo",
    icon: Search,
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "pixels",
    title: "Pixels et Tracking",
    description: "Connectez Facebook Pixel, Google Tag Manager, TikTok Pixel et ajoutez vos propres scripts de suivi.",
    href: "/dashboard/settings/pixels",
    icon: Code2,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
];

const ACCOUNT_SETTINGS: SettingItem[] = [
  {
    id: "account",
    title: "Sécurité & Compte",
    description: "Gérez votre mot de passe, vos identifiants et la sécurité de votre compte.",
    href: "/dashboard/settings/account",
    icon: Shield,
    iconBg: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-700 dark:text-slate-300",
  },
];

export default function DashboardSettings() {
  const { activeStore } = useActiveStore();

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl space-y-10 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Paramètres
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Gérez votre boutique, votre profil et vos intégrations marketing.
            </p>
          </div>

          {activeStore?.slug && (
            <a
              href={getStoreUrl(activeStore.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visiter ma boutique
            </a>
          )}
        </div>

        {/* ─── SECTION 1: BOUTIQUE (Exact Capture 1) ─── */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
            Boutique
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {BOUTIQUE_SETTINGS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className="group relative flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted/30 hover:shadow-sm"
                >
                  {/* Left: Icon + Content */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div
                      className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${item.iconBg} ${item.iconColor} transition-transform duration-200 group-hover:scale-105`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-[15px] font-bold text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        {item.badge && (
                          <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Arrow */}
                  <div className="shrink-0 pl-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-foreground">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── SECTION 2: MARKETING (Exact Capture 1) ─── */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
            Marketing
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {MARKETING_SETTINGS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className="group relative flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted/30 hover:shadow-sm"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div
                      className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${item.iconBg} ${item.iconColor} transition-transform duration-200 group-hover:scale-105`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-[15px] font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-foreground">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── SECTION 3: COMPTE & SÉCURITÉ ─── */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
            Compte & Sécurité
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {ACCOUNT_SETTINGS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className="group relative flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted/30 hover:shadow-sm"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div
                      className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${item.iconBg} ${item.iconColor} transition-transform duration-200 group-hover:scale-105`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-[15px] font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-foreground">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
