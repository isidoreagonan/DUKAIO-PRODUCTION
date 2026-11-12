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
  color: string;
};

const tools: Tool[] = [
  { title: "Clients", subtitle: "Gérez votre base acheteurs", url: "/dashboard/clients", icon: Users, color: "from-[#818CF8] to-[#4338CA]" },
  { title: "Revenus", subtitle: "Historique & flux des encaissements", url: "/dashboard/revenue", icon: DollarSign, color: "from-[#2DD4BF] to-[#0D9488]" },
  { title: "Wallet", subtitle: "Soldes & demandes de retrait", url: "/dashboard/wallet", icon: Wallet, color: "from-[#4ADE80] to-[#15803D]" },
  { title: "Badge Verify", subtitle: "Certification boutique & confiance", url: "/dashboard/badge", icon: BadgeCheck, color: "from-[#60A5FA] to-[#1D4ED8]" },
  { title: "Marketing", subtitle: "Codes promo & réductions", url: "/dashboard/marketing", icon: Megaphone, color: "from-[#FB923C] to-[#EA580C]" },
  { title: "Affiliation", subtitle: "Recrutez des apporteurs d'affaires", url: "/dashboard/affiliation", icon: Sparkles, color: "from-[#FBBF24] to-[#D97706]" },
  { title: "Automatisations", subtitle: "Workflows & déclencheurs", url: "/dashboard/automations", icon: Zap, color: "from-[#A855F7] to-[#7E22CE]" },
  { title: "Webhooks", subtitle: "Intégrations API en temps réel", url: "/dashboard/webhooks", icon: Webhook, color: "from-[#06B6D4] to-[#0E7490]" },
  { title: "Messages", subtitle: "Support client & résolution", url: "/dashboard/support", icon: MessageCircle, color: "from-[#3B82F6] to-[#1E40AF]" },
  { title: "Boutiques", subtitle: "Gérer vos boutiques en ligne", url: "/dashboard/stores", icon: Store, color: "from-[#10B981] to-[#047857]" },
  { title: "Nova IA", subtitle: "Génération & assistant intelligent", url: "/dashboard/nova", icon: Sparkles, color: "from-[#EC4899] to-[#BE185D]" },
  { title: "Outils", subtitle: "Utilitaires & extensions", url: "/dashboard/tools", icon: Wrench, color: "from-[#64748B] to-[#334155]" },
  { title: "Paramètres", subtitle: "Configuration générale", url: "/dashboard/settings", icon: Settings, color: "from-[#FDBA74] to-[#EA580C]" },
];

const adminTools: Tool[] = [
  { title: "Vue d'ensemble", subtitle: "Statistiques globales plateforme", url: "/dashboard/admin", icon: BarChart3, color: "from-[#3B82F6] to-[#1D4ED8]" },
  { title: "Utilisateurs", subtitle: "Gestion de tous les comptes", url: "/dashboard/admin-users", icon: Users, color: "from-[#8B5CF6] to-[#6D28D9]" },
  { title: "Retraits", subtitle: "Approbation des demandes", url: "/dashboard/admin-withdrawals", icon: Wallet, color: "from-[#10B981] to-[#059669]" },
  { title: "Support", subtitle: "Tickets et réclamations", url: "/dashboard/admin-support", icon: MessageCircle, color: "from-[#0EA5E9] to-[#0284C7]" },
  { title: "Modération", subtitle: "Contenus et signalements", url: "/dashboard/admin-moderation", icon: Package, color: "from-[#F97316] to-[#C2410C]" },
  { title: "KYC", subtitle: "Vérifications d'identité", url: "/dashboard/admin-kyc", icon: Shield, color: "from-[#6366F1] to-[#4338CA]" },
  { title: "Badges", subtitle: "Validation des badges vendeurs", url: "/dashboard/admin-badges", icon: BadgeCheck, color: "from-[#14B8A6] to-[#0F766E]" },
];

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <NavLink
      to={tool.url}
      className="group relative flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-secondary/40 transition-all duration-200 shadow-2xs hover:border-border/80"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`h-10 w-10 rounded-[14px] bg-gradient-to-b ${tool.color} text-white shadow-sm border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
        >
          <Icon className="h-4.5 w-4.5 stroke-[2] drop-shadow-xs" />
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
            Tous les outils
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
