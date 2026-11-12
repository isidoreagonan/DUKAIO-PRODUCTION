import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, Search, Plus, ExternalLink, Moon, Sun,
  Settings, LogOut, User as UserIcon, Store, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardSidebar } from "./DashboardSidebar";
import NotificationBell from "./NotificationBell";
import { QuickSearchDialog } from "./QuickSearchDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { useDukaioTheme } from "@/hooks/useDukaioTheme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const routeTitles: Record<string, { title: string; section?: string }> = {
  "/dashboard": { title: "Tableau de bord", section: "Général" },
  "/dashboard/products": { title: "Produits", section: "Général" },
  "/dashboard/products/new": { title: "Nouveau produit", section: "Produits" },
  "/dashboard/sales": { title: "Ventes", section: "Général" },
  "/dashboard/clients": { title: "Clients", section: "Général" },
  "/dashboard/analytics": { title: "Analytiques", section: "Outils" },
  "/dashboard/revenue": { title: "Revenus", section: "Outils" },
  "/dashboard/wallet": { title: "Wallet", section: "Outils" },
  "/dashboard/marketing": { title: "Marketing", section: "Outils" },
  "/dashboard/affiliation": { title: "Affiliation", section: "Outils" },
  "/dashboard/automations": { title: "Automatisations", section: "Outils" },
  "/dashboard/webhooks": { title: "Webhooks", section: "Outils" },
  "/dashboard/nova": { title: "Nova IA", section: "Outils" },
  "/dashboard/tools": { title: "Outils", section: "Outils" },
  "/dashboard/stores": { title: "Boutiques", section: "Boutique" },
  "/dashboard/support": { title: "Messages & Support", section: "Boutique" },
  "/dashboard/badge": { title: "Badge Verify", section: "Boutique" },
  "/dashboard/settings": { title: "Paramètres", section: "Boutique" },
  "/dashboard/profile": { title: "Mon profil", section: "Compte" },
  "/dashboard/menu": { title: "Autres outils", section: "Navigation" },
  "/dashboard/admin": { title: "Vue d'ensemble admin", section: "Administration" },
  "/dashboard/admin-users": { title: "Gestion utilisateurs", section: "Administration" },
  "/dashboard/admin-withdrawals": { title: "Retraits admin", section: "Administration" },
  "/dashboard/admin-support": { title: "Support admin", section: "Administration" },
  "/dashboard/admin-moderation": { title: "Modération", section: "Administration" },
  "/dashboard/admin-kyc": { title: "Vérifications KYC", section: "Administration" },
  "/dashboard/admin-badges": { title: "Validation des badges", section: "Administration" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { activeStore } = useActiveStore();
  const { isDark, toggleTheme } = useDukaioTheme();

  // Collapsed state stored in localStorage
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("dukaio-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Mobile drawer open state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Command palette search dialog state
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dukaio-sidebar-collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const initial =
    profile?.display_name?.charAt(0)?.toUpperCase() ||
    user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() ||
    user?.user_metadata?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || "";
  const userName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Utilisateur";

  // Breadcrumb / title resolution
  const matchedRoute =
    routeTitles[location.pathname] ||
    Object.entries(routeTitles).find(([route]) => location.pathname.startsWith(route))?.[1] || {
      title: "Tableau de bord",
      section: "Dashboard",
    };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20">
      {/* Desktop Sidebar (Fixed Left) */}
      <div
        className={`hidden lg:block fixed top-0 left-0 bottom-0 z-30 transition-[width] duration-200 ease-in-out ${
          collapsed ? "w-[72px]" : "w-[264px]"
        }`}
      >
        <DashboardSidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      {/* Mobile / Tablet Sliding Drawer (<1024px) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-over Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 260 }}
              className="relative w-[280px] max-w-[85vw] h-full bg-card shadow-2xl z-10 flex flex-col"
            >
              <DashboardSidebar
                collapsed={false}
                isMobile={true}
                onNavigate={() => setMobileDrawerOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[padding-left] duration-200 ease-in-out ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-[264px]"
        }`}
      >
        {/* Top Bar: Exactly 60px height, 1px bottom border, flat clean surface, sticky */}
        <header className="sticky top-0 z-20 h-[60px] bg-card/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6">
          {/* Left: Mobile hamburger + Breadcrumb / dynamic title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Ouvrir le menu"
              className="lg:hidden h-9 w-9 rounded-lg border border-border bg-secondary/50 flex items-center justify-center text-foreground hover:bg-secondary transition-colors shrink-0"
            >
              <Menu className="h-5 w-5 stroke-[1.75]" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-1.5 min-w-0">
              {matchedRoute.section && (
                <>
                  <span className="hidden sm:inline text-xs font-medium text-muted-foreground truncate">
                    {matchedRoute.section}
                  </span>
                  <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                </>
              )}
              <h1 className="text-sm sm:text-base font-bold text-foreground truncate tracking-tight">
                {matchedRoute.title}
              </h1>
            </div>
          </div>

          {/* Right: Search, Store link, Bell, + Nouveau produit, Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Trigger (⌘K) */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Recherche rapide (⌘K)"
              className="flex items-center gap-2 h-8 px-2.5 rounded-lg border border-border bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
            >
              <Search className="h-3.5 w-3.5 stroke-[1.75]" />
              <span className="hidden md:inline text-xs">Rechercher...</span>
              <kbd className="hidden md:inline-flex h-4 items-center rounded border border-border/80 bg-card px-1 font-mono text-[9px] font-semibold text-muted-foreground shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Discreet "Voir ma boutique" link */}
            {activeStore?.slug && (
              <a
                href={`/store/${activeStore.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border hover:border-border/80 bg-secondary/30 hover:bg-secondary/70 text-xs font-semibold text-foreground transition-colors group"
                title="Ouvrir votre boutique publique"
              >
                <span>Voir ma boutique</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
            )}

            {/* Notification Bell */}
            <div className="flex items-center justify-center h-8 w-8">
              <NotificationBell />
            </div>

            {/* Dark Primary Button: + Nouveau produit */}
            <button
              onClick={() => navigate("/dashboard/products/new")}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity shrink-0 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.25]" />
              <span className="hidden sm:inline">Nouveau produit</span>
              <span className="sm:hidden">Nouveau</span>
            </button>

            {/* User Profile Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Menu profil utilisateur"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-border hover:ring-2 hover:ring-primary/20 transition-all outline-none"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={userAvatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-xl border-border bg-card">
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-foreground">{userName}</span>
                    <span className="text-[11px] text-muted-foreground truncate">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/profile")}
                  className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2 py-1.5"
                >
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Mon profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/settings")}
                  className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2 py-1.5"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Paramètres</span>
                </DropdownMenuItem>

                {/* Theme toggle switch in top bar dropdown */}
                <div
                  onClick={toggleTheme}
                  className="flex items-center justify-between px-2 py-1.5 text-xs font-medium text-foreground rounded-lg hover:bg-secondary cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {isDark ? (
                      <Sun className="h-3.5 w-3.5 text-amber-500" />
                    ) : (
                      <Moon className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span>Mode sombre</span>
                  </div>
                  <div
                    className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isDark ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isDark ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>

                {activeStore?.slug && (
                  <a
                    href={`/store/${activeStore.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-2 py-1.5 text-xs font-medium text-foreground rounded-lg hover:bg-secondary"
                  >
                    <div className="flex items-center gap-2">
                      <Store className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Voir ma boutique</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                )}

                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-xs font-medium text-destructive focus:text-destructive cursor-pointer rounded-lg px-2 py-1.5 hover:bg-destructive/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Quick Search Dialog (⌘K) */}
      <QuickSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
