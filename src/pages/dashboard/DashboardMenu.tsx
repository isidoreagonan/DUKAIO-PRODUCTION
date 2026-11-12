import { NavLink } from "react-router-dom";
import {
  Users, DollarSign, Wallet, BadgeCheck, Megaphone,
  Zap, Webhook, MessageCircle, Settings, Shield, BarChart3,
  Package, Store, Sparkles, Wrench, ArrowRight
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

type Tool = {
  title: string;
  subtitle: string;
  url: string;
  icon: any;
  iconColor: string;
  bg: string;
};

const tools: Tool[] = [
  {
    title: "Clients",
    subtitle: "Gérez votre base acheteurs",
    url: "/dashboard/clients",
    icon: Users,
    iconColor: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200/70 dark:border-blue-900/50",
  },
  {
    title: "Revenus",
    subtitle: "Historique & flux des encaissements",
    url: "/dashboard/revenue",
    icon: DollarSign,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/70 dark:border-emerald-900/50",
  },
  {
    title: "Wallet",
    subtitle: "Soldes & demandes de retrait",
    url: "/dashboard/wallet",
    icon: Wallet,
    iconColor: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200/70 dark:border-teal-900/50",
  },
  {
    title: "Badge Verify",
    subtitle: "Certification boutique & confiance",
    url: "/dashboard/badge",
    icon: BadgeCheck,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/70 dark:border-indigo-900/50",
  },
  {
    title: "Marketing",
    subtitle: "Codes promo & réductions",
    url: "/dashboard/marketing",
    icon: Megaphone,
    iconColor: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-900/50",
  },
  {
    title: "Affiliation",
    subtitle: "Programme apporteurs d'affaires",
    url: "/dashboard/affiliation",
    icon: Sparkles,
    iconColor: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200/70 dark:border-purple-900/50",
  },
  {
    title: "Automatisations",
    subtitle: "Workflows & déclencheurs",
    url: "/dashboard/automations",
    icon: Zap,
    iconColor: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200/70 dark:border-orange-900/50",
  },
  {
    title: "Webhooks",
    subtitle: "Intégrations API en temps réel",
    url: "/dashboard/webhooks",
    icon: Webhook,
    iconColor: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200/70 dark:border-cyan-900/50",
  },
  {
    title: "Messages",
    subtitle: "Support client & litiges",
    url: "/dashboard/support",
    icon: MessageCircle,
    iconColor: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200/70 dark:border-sky-900/50",
  },
  {
    title: "Boutiques",
    subtitle: "Gérer vos boutiques en ligne",
    url: "/dashboard/stores",
    icon: Store,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/70 dark:border-emerald-900/50",
  },
  {
    title: "Nova IA",
    subtitle: "Assistant & générateur de contenu",
    url: "/dashboard/nova",
    icon: Sparkles,
    iconColor: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/40 border-pink-200/70 dark:border-pink-900/50",
  },
  {
    title: "Outils",
    subtitle: "Utilitaires & extensions",
    url: "/dashboard/tools",
    icon: Wrench,
    iconColor: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
  },
  {
    title: "Paramètres",
    subtitle: "Configuration générale boutique",
    url: "/dashboard/settings",
    icon: Settings,
    iconColor: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
  },
];

const adminTools: Tool[] = [
  {
    title: "Vue d'ensemble",
    subtitle: "Statistiques globales plateforme",
    url: "/dashboard/admin",
    icon: BarChart3,
    iconColor: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200/70 dark:border-blue-900/50",
  },
  {
    title: "Utilisateurs",
    subtitle: "Gestion de tous les comptes",
    url: "/dashboard/admin-users",
    icon: Users,
    iconColor: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200/70 dark:border-purple-900/50",
  },
  {
    title: "Retraits",
    subtitle: "Approbation des demandes",
    url: "/dashboard/admin-withdrawals",
    icon: Wallet,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/70 dark:border-emerald-900/50",
  },
  {
    title: "Support",
    subtitle: "Tickets et réclamations",
    url: "/dashboard/admin-support",
    icon: MessageCircle,
    iconColor: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200/70 dark:border-sky-900/50",
  },
  {
    title: "Modération",
    subtitle: "Contenus et signalements",
    url: "/dashboard/admin-moderation",
    icon: Package,
    iconColor: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200/70 dark:border-orange-900/50",
  },
  {
    title: "KYC",
    subtitle: "Vérifications d'identité",
    url: "/dashboard/admin-kyc",
    icon: Shield,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/70 dark:border-indigo-900/50",
  },
  {
    title: "Badges",
    subtitle: "Validation des badges vendeurs",
    url: "/dashboard/admin-badges",
    icon: BadgeCheck,
    iconColor: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200/70 dark:border-teal-900/50",
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <NavLink
      to={tool.url}
      className="group relative flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card hover:bg-secondary/40 transition-all duration-200 shadow-2xs hover:border-border/80"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${tool.bg} ${tool.iconColor} group-hover:scale-105 transition-transform`}
        >
          <Icon className="h-5 w-5 stroke-[2]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {tool.title}
          </p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {tool.subtitle}
          </p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
    </NavLink>
  );
}

export default function DashboardMenu() {
  const { user } = useAuth();
  const isAdmin = user?.email === "isidoreagonan@gmail.com";

  return (
    <DashboardLayout>
      <div className="space-y-8 w-full pb-14 font-sans">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Autres outils
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Accédez à toutes vos fonctionnalités, paramètres et outils avancés.
          </p>
        </div>

        {/* Tools Grid */}
        <section className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Outils & Paramètres
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {tools.map((tool) => (
              <ToolCard key={tool.title} tool={tool} />
            ))}
          </div>
        </section>

        {/* Admin section */}
        {isAdmin && (
          <section className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Administration
              </p>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.2 text-[10px] font-bold text-primary uppercase">
                Admin
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {adminTools.map((tool) => (
                <ToolCard key={tool.title} tool={tool} />
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
