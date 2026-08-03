import { NavLink } from "react-router-dom";
import {
  Users, Key, DollarSign, Wallet, BadgeCheck, Megaphone,
  Zap, Webhook, MessageCircle, Settings, Shield, BarChart3,
  Package, Store, Sparkles, Wrench,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

type Tool = {
  title: string;
  subtitle: string;
  url: string;
  icon: typeof Users;
};

const tools: Tool[] = [
  { title: "Clients", subtitle: "Gérez vos clients", url: "/dashboard/clients", icon: Users },
  { title: "Revenus", subtitle: "Historique des paiements", url: "/dashboard/revenue", icon: DollarSign },
  { title: "Wallet", subtitle: "Votre portefeuille", url: "/dashboard/wallet", icon: Wallet },
  { title: "Badge Verify", subtitle: "Obtenir votre badge", url: "/dashboard/badge", icon: BadgeCheck },
  { title: "Marketing", subtitle: "Codes promo & campagnes", url: "/dashboard/marketing", icon: Megaphone },
  { title: "Affiliation", subtitle: "Programme partenaire", url: "/dashboard/affiliation", icon: Sparkles },
  { title: "Automatisations", subtitle: "Workflows & API", url: "/dashboard/automations", icon: Zap },
  { title: "Webhooks", subtitle: "Écouteurs d'événements", url: "/dashboard/webhooks", icon: Webhook },
  { title: "Messages", subtitle: "Support client & litiges", url: "/dashboard/support", icon: MessageCircle },
  { title: "Boutiques", subtitle: "Gérer vos boutiques", url: "/dashboard/stores", icon: Store },
  { title: "Nova IA", subtitle: "Assistant intelligent", url: "/dashboard/nova", icon: Sparkles },
  { title: "Outils", subtitle: "Utilitaires avancés", url: "/dashboard/tools", icon: Wrench },
  { title: "Paramètres", subtitle: "Configuration boutique", url: "/dashboard/settings", icon: Settings },
];

const adminTools: Tool[] = [
  { title: "Vue d'ensemble", subtitle: "Stats plateforme", url: "/dashboard/admin", icon: BarChart3 },
  { title: "Utilisateurs", subtitle: "Gérer les comptes", url: "/dashboard/admin-users", icon: Users },
  { title: "Retraits", subtitle: "Approuver paiements", url: "/dashboard/admin-withdrawals", icon: Wallet },
  { title: "Support", subtitle: "Tickets ouverts", url: "/dashboard/admin-support", icon: MessageCircle },
  { title: "Modération", subtitle: "Produits signalés", url: "/dashboard/admin-moderation", icon: Package },
  { title: "KYC", subtitle: "Vérifications identité", url: "/dashboard/admin-kyc", icon: Shield },
  { title: "Badges", subtitle: "Approuver badges", url: "/dashboard/admin-badges", icon: BadgeCheck },
];

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <NavLink
      to={tool.url}
      className="group relative flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_30px_-12px_hsl(var(--primary)/0.35)]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="space-y-1">
        <p className="text-[15px] font-bold text-foreground">{tool.title}</p>
        <p className="text-xs text-muted-foreground">{tool.subtitle}</p>
      </div>
    </NavLink>
  );
}

export default function DashboardMenu() {
  const { user } = useAuth();
  const isAdmin = user?.email === "isidoreagonan@gmail.com";

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Autres</h1>
          <p className="text-sm text-muted-foreground">
            Accédez à tous vos outils secondaires, paramètres et fonctionnalités avancées.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </section>

        {isAdmin && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">Administration</h2>
              <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                Admin
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
