import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Package, ShoppingCart, BarChart3, LayoutGrid,
  Search, Moon, Sun, User as UserIcon, Settings, Store,
  LogOut, ExternalLink, ChevronRight, Folder, ArrowUpRight, X,
  ArrowLeft, Copy, Plus, Headphones, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { useDukaioTheme } from "@/hooks/useDukaioTheme";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "./DashboardSidebar";
import { QuickSearchDialog } from "./QuickSearchDialog";
import { getStoreUrl } from "@/lib/subdomain";
import UserAvatar from "@/components/UserAvatar";
import NotificationBell from "./NotificationBell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement | null>(null);
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

  // Close profile sheet & scroll to top on route change
  useEffect(() => {
    setProfileSheetOpen(false);
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" });
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

  // Dynamic page title for PC top header
  const currentPage = useMemo(() => {
    const p = location.pathname;
    if (p === "/dashboard") return { title: "Aperçu", isRoot: true };
    if (p.startsWith("/dashboard/products/new")) return { title: "Nouveau produit", isRoot: false };
    if (p.startsWith("/dashboard/products")) return { title: "Produits", isRoot: false };
    if (p.startsWith("/dashboard/sales")) return { title: "Ventes", isRoot: false };
    if (p.startsWith("/dashboard/analytics")) return { title: "Analytiques", isRoot: false };
    if (p.startsWith("/dashboard/clients")) return { title: "Clients", isRoot: false };
    if (p.startsWith("/dashboard/wallet")) return { title: "Wallet & Solde", isRoot: false };
    if (p.startsWith("/dashboard/menu")) return { title: "Tous les outils", isRoot: false };
    if (p.startsWith("/dashboard/settings")) return { title: "Paramètres", isRoot: false };
    if (p.startsWith("/dashboard/profile")) return { title: "Mon profil", isRoot: false };
    if (p.startsWith("/dashboard/nova")) return { title: "Nova IA", isRoot: false };
    if (p.startsWith("/dashboard/support")) return { title: "Support client", isRoot: false };
    if (p.startsWith("/dashboard/marketing")) return { title: "Marketing", isRoot: false };
    if (p.startsWith("/dashboard/affiliation")) return { title: "Affiliation", isRoot: false };
    if (p.startsWith("/dashboard/automations")) return { title: "Automatisations", isRoot: false };
    if (p.startsWith("/dashboard/webhooks")) return { title: "Webhooks", isRoot: false };
    if (p.startsWith("/dashboard/stores")) return { title: "Mes boutiques", isRoot: false };
    if (p.startsWith("/dashboard/badge")) return { title: "Badge Verify", isRoot: false };
    if (p.startsWith("/dashboard/tools")) return { title: "Outils", isRoot: false };
    if (p.startsWith("/dashboard/revenue")) return { title: "Revenus", isRoot: false };
    return { title: "Tableau de bord", isRoot: false };
  }, [location.pathname]);

  // Copy store link
  const handleCopyStoreLink = () => {
    const slug = activeStore?.slug || profile?.store_slug;
    const url = getStoreUrl(slug);

    navigator.clipboard.writeText(url);
    toast.success("Lien de votre boutique copié !");
  };

  // Visit store
  const handleVisitStore = () => {
    const slug = activeStore?.slug || profile?.store_slug;
    if (slug) {
      window.open(getStoreUrl(slug), "_blank");
    } else {
      navigate("/dashboard/stores");
    }
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
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#0B101B] bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] dark:bg-[radial-gradient(#1E2638_1px,transparent_1px)] [background-size:16px_16px] text-foreground font-sans antialiased selection:bg-primary/20 relative">
      {/* ======================================================== */}
      {/* DESKTOP LAYOUT (>= 1024px)                                */}
      {/* Two Harmonious Vycut Cards: Sidebar Card + Main Panel Card */}
      {/* ======================================================== */}
      <div className="hidden lg:block">
        {/* 1. Left Card: Navigation Sidebar (vycut squircle card) */}
        <div className="fixed top-3 left-3 bottom-3 z-40 pointer-events-none">
          <div className="pointer-events-auto h-full">
            <DashboardSidebar
              collapsed={collapsed}
              onToggleCollapse={toggleCollapsed}
            />
          </div>
        </div>

        {/* 2. Right Card: Main Dashboard Panel (Exact Vycut Contour) */}
        <div
          className={`fixed top-3 right-3 bottom-3 rounded-[22px] border border-[#E2E8F0] dark:border-[#263043] bg-white dark:bg-[#151C2B] shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden flex flex-col transition-[left] duration-300 ease-in-out z-30 ${
            collapsed ? "left-[84px]" : "left-[244px]"
          }`}
        >
          {/* Top Header inside the Main Card (Curves harmoniously with rounded-tl-[22px]) */}
          <header className="h-14 2xl:h-16 bg-white/95 dark:bg-[#151C2B]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#263043] px-6 2xl:px-8 flex items-center justify-between shrink-0 select-none">
            {/* Left: Dynamic page title + back button */}
            <div className="flex items-center gap-2.5 min-w-0">
              {!currentPage.isRoot && (
                <button
                  onClick={() => navigate(-1)}
                  aria-label="Retour"
                  className="h-8 w-8 2xl:h-9 2xl:w-9 rounded-xl bg-secondary/60 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Page précédente"
                >
                  <ArrowLeft className="h-4 w-4 2xl:h-4.5 2xl:w-4.5" />
                </button>
              )}
              <h1 className="text-[14px] 2xl:text-[16px] font-bold text-foreground tracking-tight truncate">
                {currentPage.title}
              </h1>
            </div>

            {/* Center: Search input pill ("Trouvez n'importe quoi : Appuyez sur ⌘K sur votre clavier") */}
            <div
              onClick={() => setSearchOpen(true)}
              className="w-[320px] xl:w-[420px] 2xl:w-[520px] h-9 2xl:h-10 px-3.5 2xl:px-4 rounded-full bg-[#F4F6F8] dark:bg-[#1E2536] border border-border/50 hover:border-border hover:bg-[#ECEEF2] dark:hover:bg-[#252E42] text-xs 2xl:text-sm text-muted-foreground flex items-center justify-between cursor-pointer transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                <span className="truncate">
                  Trouvez n'importe quoi : Appuyez sur
                </span>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white dark:bg-card border border-border/80 text-foreground shadow-2xs shrink-0">
                  ⌘K
                </kbd>
                <span className="hidden xl:inline truncate">
                  sur votre clavier
                </span>
              </div>
            </div>

            {/* Right: Actions row (Visiter boutique + Copier + Nova IA + [+] + Theme + Grid + Avatar) */}
            <div className="flex items-center gap-2">
              {/* Visiter ma boutique + Copier combo pill */}
              <div className="flex items-center rounded-xl bg-[#F4F6F8] dark:bg-[#1E2536] border border-border/60 p-0.5">
                <button
                  onClick={handleVisitStore}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground hover:bg-white dark:hover:bg-card hover:shadow-2xs transition-all"
                  title="Ouvrir ma boutique publique"
                >
                  <Store className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">Visiter ma boutique</span>
                </button>
                <div className="w-px h-4 bg-border/60 my-auto" />
                <button
                  onClick={handleCopyStoreLink}
                  aria-label="Copier le lien"
                  className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-2xs transition-all"
                  title="Copier le lien de ma boutique"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 1. Nova IA Button (Flower / AI style) */}
              <button
                onClick={() => navigate("/dashboard/nova")}
                aria-label="Nova IA"
                className="h-8 w-8 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 hover:scale-105 transition-transform"
                title="Nova IA - Assistant digital"
              >
                <Sparkles className="h-4 w-4 stroke-[2]" />
              </button>

              {/* 2. Quick Add Product button [+] */}
              <button
                onClick={() => navigate("/dashboard/products/new")}
                aria-label="Nouveau produit"
                className="h-8 w-8 rounded-full bg-[#F4F6F8] dark:bg-[#1E2536] border border-border/50 hover:bg-secondary flex items-center justify-center text-foreground hover:scale-105 transition-all"
                title="Créer un nouveau produit"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
              </button>

              {/* 3. Notification Bell (with realtime badge and expandable dropdown) */}
              <NotificationBell />

              {/* 4. Profile Avatar */}
              <button
                onClick={() => navigate("/dashboard/profile")}
                aria-label="Mon profil"
                className="hover:scale-105 transition-transform ml-0.5 cursor-pointer"
                title="Mon profil"
              >
                <UserAvatar
                  src={userAvatar}
                  name={userName}
                  sizeClassName="h-8 w-8"
                  textClassName="text-[11px]"
                />
              </button>
            </div>
          </header>

          {/* Scrollable Content inside the Main Card */}
          <div ref={mainRef} className="flex-1 overflow-y-auto px-6 py-6 2xl:px-10 2xl:py-8 font-sans">
            <div className="max-w-[1440px] 2xl:max-w-[1760px] w-full mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE LAYOUT (< 1024px)                                 */}
      {/* Floating Header Card + Floating Bottom Dock Dock         */}
      {/* ======================================================== */}
      <div className="lg:hidden flex flex-col min-h-screen">
        {/* 1. Mobile Floating Top Header Card (with smooth rounded arcs on all 4 corners) */}
        <header className="sticky top-2.5 z-30 mx-3 my-2 h-14 rounded-[20px] border border-[#E2E8F0] dark:border-[#263043] bg-white/95 dark:bg-[#151C2B]/95 backdrop-blur-md shadow-2xs px-3.5 flex items-center justify-between select-none">
          {/* Left: Brand logo & Store Name */}
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 cursor-pointer min-w-0"
          >
            <div className="h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center p-1 shrink-0">
              <img src={logo} alt="Dukaio" className="h-full w-full object-contain" />
            </div>
            <span className="text-xs font-bold uppercase tracking-tight text-foreground truncate max-w-[130px]">
              {storeName}
            </span>
          </div>

          {/* Right: Round icon buttons row (Exact Chariow Mobile Image 2) */}
          <div className="flex items-center gap-1.5">
            {/* 1. Search (grey circle) */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Recherche rapide"
              className="h-8 w-8 rounded-full bg-[#F4F6F8] dark:bg-[#1E2536] flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
              title="Rechercher"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* 2. Notifications en temps réel */}
            <NotificationBell />

            {/* 3. Nova IA (purple flower circle) */}
            <button
              onClick={() => navigate("/dashboard/nova")}
              aria-label="Nova IA"
              className="h-8 w-8 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400 active:scale-95 transition-transform"
              title="Nova IA"
            >
              <Sparkles className="h-4 w-4 stroke-[2]" />
            </button>

            {/* 4. Support (yellow circle with headset icon) */}
            <button
              onClick={() => navigate("/dashboard/support")}
              aria-label="Support client"
              className="h-8 w-8 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 flex items-center justify-center shadow-xs active:scale-95 transition-transform"
              title="Support & Aide"
            >
              <Headphones className="h-4 w-4 stroke-[2]" />
            </button>

            {/* 5. Avatar (opens Mobile Profile Sheet) */}
            <button
              onClick={() => setProfileSheetOpen(true)}
              aria-label="Profil utilisateur"
              className="ml-0.5 active:scale-95 transition-transform cursor-pointer"
              title="Mon profil"
            >
              <UserAvatar
                src={userAvatar}
                name={userName}
                sizeClassName="h-8 w-8"
                textClassName="text-[11px]"
              />
            </button>
          </div>
        </header>

        {/* Main Page Content for Mobile */}
        <main className="flex-1 pt-1 pb-24 px-3 sm:px-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>

        {/* 2. Mobile Floating Bottom Navigation Dock (Rounded on all 4 corners) */}
        <nav className="fixed bottom-2.5 inset-x-3 z-40 rounded-[22px] border border-[#E2E8F0] dark:border-[#263043] bg-white/95 dark:bg-[#151C2B]/95 backdrop-blur-md px-1 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-around select-none">
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
      </div>

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
                      <UserAvatar
                        src={userAvatar}
                        name={userName}
                        sizeClassName="h-11 w-11"
                        textClassName="text-sm"
                      />
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
                        href={getStoreUrl(activeStore.slug)}
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
