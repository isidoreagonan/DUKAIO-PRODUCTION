import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, LayoutDashboard, Package, ShoppingCart, Users,
  BarChart3, DollarSign, Wallet, Megaphone, Sparkles, Zap,
  Webhook, Bot, Wrench, Store, MessageCircle, BadgeCheck,
  Settings, User, Plus, ExternalLink, Moon, Sun, ArrowRight
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { useDukaioTheme } from "@/hooks/useDukaioTheme";

interface QuickSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSearchDialog({ open, onOpenChange }: QuickSearchDialogProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const { isDark, toggleTheme } = useDukaioTheme();
  const isAdmin = user?.email === "isidoreagonan@gmail.com";

  const allPages = [
    { title: "Tableau de bord", group: "Général", url: "/dashboard", icon: LayoutDashboard },
    { title: "Produits", group: "Général", url: "/dashboard/products", icon: Package },
    { title: "Nouveau produit", group: "Actions", url: "/dashboard/products/new", icon: Plus },
    { title: "Ventes", group: "Général", url: "/dashboard/sales", icon: ShoppingCart },
    { title: "Clients", group: "Général", url: "/dashboard/clients", icon: Users },
    { title: "Analytiques", group: "Outils", url: "/dashboard/analytics", icon: BarChart3 },
    { title: "Revenus", group: "Outils", url: "/dashboard/revenue", icon: DollarSign },
    { title: "Wallet & Retraits", group: "Outils", url: "/dashboard/wallet", icon: Wallet },
    { title: "Marketing (Codes promo)", group: "Outils", url: "/dashboard/marketing", icon: Megaphone },
    { title: "Programme d'affiliation", group: "Outils", url: "/dashboard/affiliation", icon: Sparkles },
    { title: "Automatisations", group: "Outils", url: "/dashboard/automations", icon: Zap },
    { title: "Webhooks", group: "Outils", url: "/dashboard/webhooks", icon: Webhook },
    { title: "Nova IA", group: "Outils", url: "/dashboard/nova", icon: Bot },
    { title: "Outils numériques", group: "Outils", url: "/dashboard/tools", icon: Wrench },
    { title: "Mes Boutiques", group: "Boutique", url: "/dashboard/stores", icon: Store },
    { title: "Messages & Support", group: "Boutique", url: "/dashboard/support", icon: MessageCircle },
    { title: "Badge Verify", group: "Boutique", url: "/dashboard/badge", icon: BadgeCheck },
    { title: "Paramètres de la boutique", group: "Boutique", url: "/dashboard/settings", icon: Settings },
    { title: "Mon profil", group: "Compte", url: "/dashboard/profile", icon: User },
    ...(isAdmin
      ? [
          { title: "Admin - Vue d'ensemble", group: "Administration", url: "/dashboard/admin", icon: BarChart3 },
          { title: "Admin - Utilisateurs", group: "Administration", url: "/dashboard/admin-users", icon: Users },
          { title: "Admin - Retraits", group: "Administration", url: "/dashboard/admin-withdrawals", icon: Wallet },
          { title: "Admin - Support", group: "Administration", url: "/dashboard/admin-support", icon: MessageCircle },
          { title: "Admin - Modération", group: "Administration", url: "/dashboard/admin-moderation", icon: Package },
          { title: "Admin - KYC", group: "Administration", url: "/dashboard/admin-kyc", icon: ShieldCheck },
          { title: "Admin - Badges", group: "Administration", url: "/dashboard/admin-badges", icon: BadgeCheck },
        ]
      : []),
  ];

  function ShieldCheck(props: any) {
    return <BadgeCheck {...props} />;
  }

  const filtered = query.trim()
    ? allPages.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.group.toLowerCase().includes(query.toLowerCase())
      )
    : allPages.slice(0, 8);

  const handleSelect = (url: string) => {
    onOpenChange(false);
    setQuery("");
    navigate(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border border-border bg-card shadow-2xl rounded-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-secondary/20">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une page, un outil ou un paramètre..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-medium"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.url}
                  onClick={() => handleSelect(item.url)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/70 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                      <Icon className="h-4 w-4 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.group}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground text-xs">
              Aucun résultat pour « {query} »
            </div>
          )}
        </div>

        {/* Quick Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/40 border-t border-border text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Navigation rapide</span>
            {activeStore?.slug && (
              <a
                href={`/store/${activeStore.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground inline-flex items-center gap-1"
              >
                <span>Boutique publique</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
          <button
            onClick={() => {
              toggleTheme();
              onOpenChange(false);
            }}
            className="hover:text-foreground inline-flex items-center gap-1.5"
          >
            {isDark ? <Sun className="h-3 w-3 text-amber-500" /> : <Moon className="h-3 w-3 text-slate-500" />}
            <span>Mode {isDark ? "clair" : "sombre"}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

