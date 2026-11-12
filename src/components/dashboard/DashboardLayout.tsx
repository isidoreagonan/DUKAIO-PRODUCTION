import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Package, ShoppingCart, BarChart3, LayoutGrid,
  Search, Moon, Sun, User as UserIcon, Settings, Store,
  LogOut, ExternalLink, ChevronRight, Folder, ArrowUpRight, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { useDukaioTheme } from "@/hooks/useDukaioTheme";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "./DashboardSidebar";
import { QuickSearchDialog } from "./QuickSearchDialog";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { activeStore } = useActiveStore();
  const { isDark, toggleTheme } = useDukaioTheme();

  // Collapsed state for desktop sidebar
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("dukaio-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [productsCount, setProductsCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("creator_id", user.id);
      if (typeof count === "number") setProductsCount(count);
    };
    fetchCount();
  }, [user]);

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

  // Close profile sheet on route change
  useEffect(() => {
    setProfileSheetOpen(false);
  }, [location.pathname]);

  const initial =
    profile?.display_name?.charAt(0)?.toUpperCase() ||
    user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() ||
    user?.user_metadata?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "A";

  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || "";
  const storeName = activeStore?.name || profile?.store_slug || "DIGITAL STORE";
  const userName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "AGONAN ISIDORE";

  const isActive = (path: string, end = false) => {
    if (end) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // 5 mobile bottom navigation items (Exact Chariow pattern)
  const mobileNavItems = [
    { title: "Accueil", url: "/dashboard", icon: Home, end: true },
    {
      title: "Produits",
      url: "/dashboard/products",
      icon: Package,
      badge: productsCount > 0 ? String(productsCount) : undefined,
    },
    { title: "Ventes", url: "/dashboard/sales", icon: ShoppingCart },
    { title: "Analyse", url: "/dashboard/analytics", icon: BarChart3 },
    { title: "Menu", url: "/dashboard/menu", icon: LayoutGrid },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFC] dark:bg-[#0F1522] text-foreground font-sans antialiased selection:bg-primary/20 relative flex flex-col">
      {/* Floating Desktop Sidebar (>= 1024px: vycut squircle card) */}
      <div className="hidden lg:block fixed top-3 left-3 bottom-3 z-40 pointer-events-none">
        <div className="pointer-events-auto h-full">
          <DashboardSidebar
            collapsed={collapsed}
            onToggleCollapse={toggleCollapsed}
          />
        </div>
      </div>

      {/* Mobile Sticky Top Header (< 1024px: clean logo, search, theme switch, avatar) */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-white/95 dark:bg-[#151C2B]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#263043] px-3.5 flex items-center justify-between shadow-2xs">
        {/* Left: Brand logo & Store Name */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 cursor-pointer min-w-0"
        >
          <div className="h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center p-1 shrink-0">
            <img src={logo} alt="Dukaio" className="h-full w-full object-contain" />
          </div>
          <span className="text-xs font-bold uppercase tracking-tight text-foreground truncate max-w-[150px]">
            {storeName}
          </span>
        </div>

        {/* Right: Quick Search, Theme toggle & Profile Avatar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Recherche rapide"
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <Search className="h-4 w-4 stroke-[2]" />
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Changer de thème"
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-500" />
            )}
          </button>

          <button
            onClick={() => setProfileSheetOpen(true)}
            aria-label="Profil utilisateur"
            className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-blue-500 p-0.5 shrink-0 flex items-center justify-center ml-0.5 active:scale-95 transition-transform"
          >
            <div className="h-full w-full rounded-full bg-card flex items-center justify-center text-[11px] font-black text-primary overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-[padding-left] duration-300 ease-in-out ${
          collapsed ? "lg:pl-[76px]" : "lg:pl-[236px]"
        }`}
      >
        <main className="flex-1 pt-3 pb-24 lg:pb-12 px-3 sm:px-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (< 1024px: Exact Chariow Pattern) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#151C2B]/95 backdrop-blur-md border-t border-[#E2E8F0] dark:border-[#263043] px-1 py-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none">
        {mobileNavItems.map((item) => {
          const active = isActive(item.url, item.end);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.end}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-95 min-w-[58px] ${
                active
                  ? "text-primary font-bold"
                  : "text-[#64748B] dark:text-[#94A3B8] font-medium hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    active ? "stroke-[2.2] scale-105" : "stroke-[1.8]"
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 h-3.5 min-w-3.5 px-1 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {item.title}
              </span>
              {active && (
                <span className="absolute bottom-0 w-4 h-0.5 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Mobile Profile Bottom Sheet (< 1024px: Portaled to document.body) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {profileSheetOpen && (
              <div className="fixed inset-0 z-[70] flex flex-col justify-end">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setProfileSheetOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                />

                {/* Slide-up Sheet */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                  className="relative z-10 w-full max-w-md mx-auto rounded-t-[26px] border-t border-[#E2E8F0] dark:border-[#263043] bg-white dark:bg-[#151C2B] shadow-[0_-12px_40px_rgba(0,0,0,0.2)] p-4 pb-8 space-y-3.5 max-h-[85vh] overflow-y-auto select-none"
                >
                  {/* Top Bar: Center drag pill & Close button */}
                  <div className="flex items-center justify-between pb-0.5">
                    <div className="w-7" />
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                    <button
                      onClick={() => setProfileSheetOpen(false)}
                      className="h-7 w-7 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Fermer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Header: User Avatar + Name */}
                  <div
                    onClick={() => {
                      navigate("/dashboard/profile");
                      setProfileSheetOpen(false);
                    }}
                    className="flex items-center justify-between gap-3 p-1 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-blue-500 p-0.5 shrink-0 flex items-center justify-center">
                        <div className="h-full w-full rounded-full bg-card flex items-center justify-center text-sm font-black text-primary overflow-hidden">
                          {userAvatar ? (
                            <img src={userAvatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            initial
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate uppercase tracking-tight">
                          {userName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Mon profil personnel
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>

                  {/* Space & Projects Block (Mon espace) */}
                  <div className="rounded-2xl bg-[#F6F4EE] dark:bg-[#1A2234] border border-[#EBE7DD] dark:border-[#263043] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground text-[13px]">Mon espace</span>
                      <span className="text-muted-foreground text-xs font-medium">
                        {productsCount} produit{productsCount > 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Progress / Status colored dots */}
                    <div className="flex items-center gap-1.5 py-0.5">
                      {[...Array(14)].map((_, i) => (
                        <span
                          key={i}
                          className={`h-2 w-2 rounded-full ${
                            i < 6 ? "bg-[#3B82F6]" : "bg-[#F97316]"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Action link: Tous les outils */}
                    <NavLink
                      to="/dashboard/menu"
                      onClick={() => setProfileSheetOpen(false)}
                      className="flex items-center justify-between text-xs font-semibold text-foreground hover:text-primary transition-colors pt-2 border-t border-[#E8E4DA] dark:border-[#222C3E]"
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <span>Tous les outils</span>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </NavLink>
                  </div>

                  {/* Action items list */}
                  <div className="space-y-1 text-sm font-medium">
                    {/* Mon profil */}
                    <button
                      onClick={() => {
                        navigate("/dashboard/profile");
                        setProfileSheetOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-foreground hover:bg-secondary/70 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-4.5 w-4.5 text-muted-foreground" />
                        <span>Mon profil</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    </button>

                    {/* Paramètres du compte */}
                    <button
                      onClick={() => {
                        navigate("/dashboard/settings");
                        setProfileSheetOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-foreground hover:bg-secondary/70 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="h-4.5 w-4.5 text-muted-foreground" />
                        <span>Paramètres du compte</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    </button>

                    {/* Voir ma boutique */}
                    {activeStore?.slug && (
                      <a
                        href={`/store/${activeStore.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setProfileSheetOpen(false)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-foreground hover:bg-secondary/70 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Store className="h-4.5 w-4.5 text-muted-foreground" />
                          <span>Voir ma boutique</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground/60" />
                      </a>
                    )}

                    {/* Mode sombre switch */}
                    <div
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-foreground hover:bg-secondary/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {isDark ? (
                          <Sun className="h-4.5 w-4.5 text-amber-500" />
                        ) : (
                          <Moon className="h-4.5 w-4.5 text-slate-500" />
                        )}
                        <span>Mode sombre</span>
                      </div>
                      <div
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          isDark ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isDark ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Separator + Se déconnecter */}
                  <div className="pt-2 border-t border-border/60">
                    <button
                      onClick={() => {
                        setProfileSheetOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Quick Search Dialog (⌘K) */}
      <QuickSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
