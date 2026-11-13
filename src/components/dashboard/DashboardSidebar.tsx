import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Package, ShoppingCart, BarChart3, LayoutGrid,
  Plus, Settings, ChevronRight, ChevronsUpDown, Check,
  ExternalLink, Moon, Sun, LogOut, User as UserIcon,
  Store, PanelLeft, Folder, ArrowUpRight, X,
  Users, DollarSign, Wallet, Shield, Sparkles
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { useDukaioTheme } from "@/hooks/useDukaioTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { getStoreUrl } from "@/lib/subdomain";

interface DashboardSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  isMobile?: boolean;
}

export function DashboardSidebar({
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  isMobile = false,
}: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { activeStore, activeStores, setActiveStoreId } = useActiveStore();
  const { isDark, toggleTheme } = useDukaioTheme();

  const [productsCount, setProductsCount] = useState<number>(0);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profileBlockRef = useRef<HTMLDivElement | null>(null);

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

  // Click outside to close profile popover on desktop
  useEffect(() => {
    if (isMobile || !profilePopoverOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileBlockRef.current &&
        !profileBlockRef.current.contains(event.target as Node)
      ) {
        setProfilePopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profilePopoverOpen, isMobile]);

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

  const isCollapsed = collapsed && !isMobile;

  const isActive = (path: string, end = false) => {
    if (end) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // Sleek, compact core menus (PC vycut proportions)
  const coreMenus = [
    { title: "Accueil", url: "/dashboard", icon: Home, end: true },
    {
      title: "Produits",
      url: "/dashboard/products",
      icon: Package,
      badge: productsCount > 0 ? String(productsCount) : undefined,
    },
    { title: "Boutique", url: "/dashboard/boutique", icon: Store },
    { title: "Ventes", url: "/dashboard/sales", icon: ShoppingCart },
    { title: "Clients", url: "/dashboard/clients", icon: Users },
    { title: "Revenus", url: "/dashboard/revenue", icon: DollarSign },
    { title: "Analytiques", url: "/dashboard/analytics", icon: BarChart3 },
    { title: "Autres outils", url: "/dashboard/menu", icon: LayoutGrid },
  ];

  // Mouse hover handlers for PC profile popover (disabled on mobile)
  const handleMouseEnter = () => {
    if (isMobile) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setProfilePopoverOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    closeTimeoutRef.current = setTimeout(() => {
      setProfilePopoverOpen(false);
    }, 180);
  };

  return (
    <TooltipProvider delayDuration={80}>
      <aside
        className={`h-full rounded-[22px] border border-[#E2E8F0] dark:border-[#263043] bg-white dark:bg-[#151C2B] shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-none p-2.5 flex flex-col justify-between select-none transition-all duration-300 ease-in-out relative ${
          isCollapsed ? "w-[60px]" : isMobile ? "w-[240px]" : "w-[220px]"
        }`}
      >
        {/* Top: Header / Store selector / Toggle Button */}
        <div>
          {isCollapsed ? (
            /* In collapsed mode: A single clean centered toggle button */
            <div className="flex justify-center mb-2.5">
              <button
                onClick={onToggleCollapse}
                aria-label="Déplier le menu"
                className="h-9 w-9 rounded-xl bg-secondary/80 border border-border/70 hover:bg-secondary flex items-center justify-center text-foreground transition-colors"
                title="Déplier le menu"
              >
                <PanelLeft className="h-4 w-4 stroke-[2]" />
              </button>
            </div>
          ) : (
            /* In expanded mode: Store selector on left, collapse button on right */
            <div className="flex items-center gap-1.5 mb-2.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex-1 min-w-0 h-9 px-2 rounded-xl bg-[#F4F6F8] dark:bg-[#1E2536] border border-border/60 hover:bg-[#EBEEF2] dark:hover:bg-[#252E42] transition-colors flex items-center justify-between gap-1.5 text-left outline-none group">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-6 w-6 rounded-md bg-white dark:bg-card border border-border flex items-center justify-center shrink-0 p-0.5">
                        <img src={logo} alt="Dukaio" className="h-full w-full object-contain" />
                      </div>
                      <p className="text-[12px] font-bold text-foreground truncate uppercase tracking-tight">
                        {storeName}
                      </p>
                    </div>
                    <ChevronsUpDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 rounded-xl p-1.5 shadow-xl border-border bg-card">
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Vos boutiques
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  {activeStores.slice(0, 3).map((store) => (
                    <DropdownMenuItem
                      key={store.id}
                      onClick={() => {
                        setActiveStoreId(store.id);
                        onNavigate?.();
                      }}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer ${
                        store.id === activeStore?.id ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                      }`}
                    >
                      <div className="h-5 w-5 rounded bg-secondary text-primary border border-border flex items-center justify-center font-bold text-[10px] shrink-0">
                        {(store.name?.charAt(0) || "D").toUpperCase()}
                      </div>
                      <span className="text-xs font-medium truncate flex-1">{store.name}</span>
                      {store.id === activeStore?.id && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/dashboard/stores");
                      onNavigate?.();
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-foreground cursor-pointer rounded-lg hover:bg-secondary"
                  >
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Gérer les boutiques</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {!isMobile && onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  aria-label="Replier le menu"
                  className="h-9 w-9 rounded-xl bg-[#F5F2EC] dark:bg-[#202738] border border-border/50 hover:bg-[#ECE8DF] dark:hover:bg-[#283147] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Replier le menu"
                >
                  <PanelLeft className="h-4 w-4 stroke-[2]" />
                </button>
              )}
            </div>
          )}

          {/* 5 Core Menus (h-9 slim buttons) */}
          <nav className="space-y-0.5 mt-1.5">
            {coreMenus.map((item) => {
              const active = isActive(item.url, item.end);
              const Icon = item.icon;

              const linkContent = (
                <NavLink
                  to={item.url}
                  end={item.end}
                  onClick={onNavigate}
                  className={`group relative flex items-center h-9 rounded-xl transition-all duration-150 ${
                    isCollapsed ? "justify-center w-9 mx-auto px-0" : "px-2 gap-2.5 w-full"
                  } ${
                    active
                      ? "bg-[#F1F3F5] dark:bg-[#1E2536] text-[#0F172A] dark:text-[#F8FAFC] font-semibold"
                      : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A2234] hover:text-foreground font-medium"
                  }`}
                >
                  {/* Clean slim icon badge */}
                  <div
                    className={`h-7 w-7 rounded-[9px] flex items-center justify-center shrink-0 transition-colors ${
                      active
                        ? "bg-primary text-white shadow-2xs"
                        : "bg-secondary/70 dark:bg-[#1E2536] border border-border/70 text-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 stroke-[2]" />
                  </div>

                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left text-[13px] tracking-tight">
                      {item.title}
                    </span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span className="ml-auto text-[11px] font-semibold text-muted-foreground pr-0.5">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.url} delayDuration={80}>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center">{linkContent}</div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-bold px-2 py-1">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.url}>{linkContent}</div>;
            })}
          </nav>

          {/* "+ Nouveau produit" Button */}
          <div className="mt-3 pt-2.5 border-t border-border/40">
            {isCollapsed ? (
              <Tooltip delayDuration={80}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      navigate("/dashboard/products/new");
                      onNavigate?.();
                    }}
                    className="flex items-center justify-center h-9 w-9 mx-auto rounded-xl hover:bg-secondary transition-colors"
                  >
                    <div className="h-7 w-7 rounded-[9px] bg-[#0F172A] dark:bg-[#1E293B] text-white flex items-center justify-center shadow-2xs">
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-bold">
                  Nouveau produit
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={() => {
                  navigate("/dashboard/products/new");
                  onNavigate?.();
                }}
                className="w-full flex items-center gap-2.5 h-9 px-2 rounded-xl text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A2234] hover:text-foreground font-medium transition-colors group text-left"
              >
                <div className="h-7 w-7 rounded-[9px] bg-[#0F172A] dark:bg-[#1E293B] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
                <span className="text-[13px] font-bold text-foreground">
                  Nouveau produit
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Section: Profile block with automatic hover popup on PC */}
        <div
          ref={profileBlockRef}
          className="pt-2.5 border-t border-border/60 relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Profile Trigger Button */}
          <button
            onClick={() => setProfilePopoverOpen((prev) => !prev)}
            className={`flex items-center rounded-xl hover:bg-secondary/70 transition-colors text-left outline-none ${
              isCollapsed
                ? "h-9 w-9 mx-auto justify-center p-0"
                : "w-full justify-between gap-2 p-1.5"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-blue-500 p-0.5 shrink-0 flex items-center justify-center">
                <div className="h-full w-full rounded-full bg-card flex items-center justify-center text-xs font-black text-primary overflow-hidden">
                  {userAvatar ? (
                    <img src={userAvatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initial
                  )}
                </div>
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate uppercase tracking-tight">
                    {userName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate leading-tight">
                    Mon profil personnel
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
            )}
          </button>

          {/* Desktop vycut Profile Popover (PC hover or click flyout to right) */}
          {profilePopoverOpen && !isMobile && (
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={`absolute z-50 bottom-0 ${
                isCollapsed ? "left-[68px]" : "left-[228px]"
              } w-[280px] rounded-[24px] border border-[#E2E8F0] dark:border-[#263043] bg-white dark:bg-[#151C2B] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-3.5 space-y-3 animate-in fade-in-0 zoom-in-95 duration-150`}
            >
              {/* Header: User avatar + name */}
              <div
                onClick={() => {
                  navigate("/dashboard/profile");
                  setProfilePopoverOpen(false);
                  onNavigate?.();
                }}
                className="flex items-center justify-between gap-2 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-blue-500 p-0.5 shrink-0 flex items-center justify-center">
                    <div className="h-full w-full rounded-full bg-card flex items-center justify-center text-xs font-black text-primary overflow-hidden">
                      {userAvatar ? (
                        <img src={userAvatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initial
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-foreground truncate uppercase tracking-tight group-hover:text-primary transition-colors">
                      {userName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Mon profil personnel
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
              </div>

              {/* Space & Projects Block (Exact vycut Image 1) */}
              <div className="rounded-2xl bg-[#F6F4EE] dark:bg-[#1A2234] border border-[#EBE7DD] dark:border-[#263043] p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground text-[12px]">Mon espace</span>
                  <span className="text-muted-foreground text-[11px] font-medium">
                    {productsCount} produit{productsCount > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Progress / Status colored dots */}
                <div className="flex items-center gap-1 py-0.5">
                  {[...Array(14)].map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        i < 6 ? "bg-[#3B82F6]" : "bg-[#F97316]"
                      }`}
                    />
                  ))}
                </div>

                {/* Action Link: Tous les outils */}
                <NavLink
                  to="/dashboard/menu"
                  onClick={() => {
                    setProfilePopoverOpen(false);
                    onNavigate?.();
                  }}
                  className="flex items-center justify-between text-xs font-semibold text-foreground hover:text-primary transition-colors pt-1 border-t border-[#E8E4DA] dark:border-[#222C3E]"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Tous les outils</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </NavLink>
              </div>

              {/* Action List items */}
              <div className="space-y-0.5 text-xs font-medium">
                {/* Mon profil */}
                <button
                  onClick={() => {
                    navigate("/dashboard/profile");
                    setProfilePopoverOpen(false);
                    onNavigate?.();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-foreground hover:bg-secondary/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Mon profil</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                </button>

                {/* Vérification KYC */}
                <button
                  onClick={() => {
                    navigate("/dashboard/kyc");
                    setProfilePopoverOpen(false);
                    onNavigate?.();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-foreground hover:bg-secondary/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span>Vérification KYC</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                </button>

                {/* Boutique */}
                <button
                  onClick={() => {
                    navigate("/dashboard/boutique");
                    setProfilePopoverOpen(false);
                    onNavigate?.();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-foreground hover:bg-secondary/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span>Boutique</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                </button>

                {/* Paramètres du compte */}
                <button
                  onClick={() => {
                    navigate("/dashboard/settings");
                    setProfilePopoverOpen(false);
                    onNavigate?.();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-foreground hover:bg-secondary/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>Paramètres du compte</span>
                  </div>
                </button>

                {/* Voir ma boutique */}
                {activeStore?.slug && (
                  <a
                    href={getStoreUrl(activeStore.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setProfilePopoverOpen(false)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-foreground hover:bg-secondary/70 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span>Voir ma boutique</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </a>
                )}

                {/* Mode sombre switch */}
                <div
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-foreground hover:bg-secondary/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {isDark ? (
                      <Sun className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Moon className="h-4 w-4 text-slate-500" />
                    )}
                    <span>Mode sombre</span>
                  </div>
                  <div
                    className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isDark ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isDark ? "translate-x-3" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Separator + Se déconnecter */}
              <div className="pt-1 border-t border-border/60">
                <button
                  onClick={() => {
                    setProfilePopoverOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Profile Bottom Sheet (Portaled to document.body: 100% full-width, zero horizontal clipping) */}
      {typeof document !== "undefined" && isMobile &&
        createPortal(
          <AnimatePresence>
            {profilePopoverOpen && (
              <div className="fixed inset-0 z-[70] flex flex-col justify-end">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setProfilePopoverOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                />

                {/* Slide-up Bottom Sheet */}
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
                      onClick={() => setProfilePopoverOpen(false)}
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
                      setProfilePopoverOpen(false);
                      onNavigate?.();
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
                      onClick={() => {
                        setProfilePopoverOpen(false);
                        onNavigate?.();
                      }}
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
                        setProfilePopoverOpen(false);
                        onNavigate?.();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-foreground hover:bg-secondary/70 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-4.5 w-4.5 text-muted-foreground" />
                        <span>Mon profil</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    </button>

                    {/* Vérification KYC */}
                    <button
                      onClick={() => {
                        navigate("/dashboard/kyc");
                        setProfilePopoverOpen(false);
                        onNavigate?.();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-foreground hover:bg-secondary/70 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="h-4.5 w-4.5 text-emerald-600" />
                        <span>Vérification KYC</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    </button>

                    {/* Boutique */}
                <button
                  onClick={() => {
                    navigate("/dashboard/boutique");
                    setProfilePopoverOpen(false);
                    onNavigate?.();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-foreground hover:bg-secondary/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span>Boutique</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                </button>

                {/* Paramètres du compte */}
                    <button
                      onClick={() => {
                        navigate("/dashboard/settings");
                        setProfilePopoverOpen(false);
                        onNavigate?.();
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
                        onClick={() => {
                          setProfilePopoverOpen(false);
                          onNavigate?.();
                        }}
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
                        setProfilePopoverOpen(false);
                        onNavigate?.();
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
    </TooltipProvider>
  );
}

export default DashboardSidebar;
