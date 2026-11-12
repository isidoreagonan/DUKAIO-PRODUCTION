import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Package, ShoppingCart, BarChart3, LayoutGrid,
  Plus, Settings, ChevronRight, ChevronsUpDown, Check,
  ExternalLink, Moon, Sun, LogOut, User as UserIcon,
  Store, PanelLeft
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

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

  const initial =
    profile?.display_name?.charAt(0)?.toUpperCase() ||
    user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() ||
    user?.user_metadata?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "D";

  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || "";
  const storeName = activeStore?.name || profile?.store_slug || "DIGITAL STORE";
  const userName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Créateur";

  const isCollapsed = collapsed && !isMobile;

  const isActive = (path: string, end = false) => {
    if (end) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // Exactly 5 clean core menus (No clutter, no heavy gradients)
  const coreMenus = [
    { title: "Accueil", url: "/dashboard", icon: Home, end: true },
    {
      title: "Produits",
      url: "/dashboard/products",
      icon: Package,
      badge: productsCount > 0 ? String(productsCount) : undefined,
    },
    { title: "Ventes", url: "/dashboard/sales", icon: ShoppingCart },
    { title: "Analytiques", url: "/dashboard/analytics", icon: BarChart3 },
    { title: "Autres outils", url: "/dashboard/menu", icon: LayoutGrid },
  ];

  return (
    <TooltipProvider delayDuration={80}>
      <aside
        className={`h-full rounded-[26px] border border-[#E2E8F0] dark:border-[#263043] bg-white dark:bg-[#151C2B] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none p-3 flex flex-col justify-between select-none transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[76px]" : "w-[260px]"
        }`}
      >
        {/* Top: Header / Store selector / Toggle Button */}
        <div>
          {isCollapsed ? (
            /* In collapsed mode: A single clean centered expand toggle button */
            <div className="flex justify-center mb-3">
              <button
                onClick={onToggleCollapse}
                aria-label="Déplier le menu"
                className="h-11 w-11 rounded-2xl bg-secondary/80 border border-border/80 hover:bg-secondary flex items-center justify-center text-foreground transition-colors"
                title="Déplier le menu"
              >
                <PanelLeft className="h-4.5 w-4.5 stroke-[2]" />
              </button>
            </div>
          ) : (
            /* In expanded mode: Store selector on left, collapse button on right */
            <div className="flex items-center gap-2 mb-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex-1 min-w-0 h-11 px-2.5 rounded-2xl bg-[#F4F6F8] dark:bg-[#1E2536] border border-border/60 hover:bg-[#EBEEF2] dark:hover:bg-[#252E42] transition-colors flex items-center justify-between gap-2 text-left outline-none group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-white dark:bg-card border border-border flex items-center justify-center shrink-0 p-1">
                        <img src={logo} alt="Dukaio" className="h-full w-full object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate uppercase tracking-tight">
                          {storeName}
                        </p>
                      </div>
                    </div>
                    <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-2xl p-1.5 shadow-xl border-border bg-card">
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
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl cursor-pointer ${
                        store.id === activeStore?.id ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                      }`}
                    >
                      <div className="h-6 w-6 rounded-md bg-secondary text-primary border border-border flex items-center justify-center font-bold text-[10px] shrink-0">
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
                    className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-foreground cursor-pointer rounded-xl hover:bg-secondary"
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
                  className="h-11 w-11 rounded-2xl bg-[#F5F2EC] dark:bg-[#202738] border border-border/50 hover:bg-[#ECE8DF] dark:hover:bg-[#283147] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Replier le menu"
                >
                  <PanelLeft className="h-4.5 w-4.5 stroke-[2]" />
                </button>
              )}
            </div>
          )}

          {/* 5 Core Menus */}
          <nav className="space-y-1 mt-2">
            {coreMenus.map((item) => {
              const active = isActive(item.url, item.end);
              const Icon = item.icon;

              const linkContent = (
                <NavLink
                  to={item.url}
                  end={item.end}
                  onClick={onNavigate}
                  className={`group relative flex items-center h-11 rounded-2xl transition-all duration-150 ${
                    isCollapsed ? "justify-center w-11 mx-auto px-0" : "px-2.5 gap-3 w-full"
                  } ${
                    active
                      ? "bg-[#F1F3F5] dark:bg-[#1E2536] text-[#0F172A] dark:text-[#F8FAFC] font-bold"
                      : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A2234] hover:text-foreground font-medium"
                  }`}
                >
                  {/* Clean, solid icon badge (NO weird gradients or ugly neon glows) */}
                  <div
                    className={`h-[34px] w-[34px] rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      active
                        ? "bg-primary text-white shadow-xs"
                        : "bg-secondary/70 dark:bg-[#1E2536] border border-border/80 text-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30"
                    }`}
                  >
                    <Icon className="h-4 w-4 stroke-[2]" />
                  </div>

                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left text-[13.5px] tracking-tight">
                      {item.title}
                    </span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span className="ml-auto text-xs font-semibold text-muted-foreground pr-1">
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
                    <TooltipContent side="right" className="text-xs font-bold px-2.5 py-1">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.url}>{linkContent}</div>;
            })}
          </nav>

          {/* "+ Nouveau produit" Button */}
          <div className="mt-4 pt-3 border-t border-border/40">
            {isCollapsed ? (
              <Tooltip delayDuration={80}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      navigate("/dashboard/products/new");
                      onNavigate?.();
                    }}
                    className="flex items-center justify-center h-11 w-11 mx-auto rounded-2xl hover:bg-secondary transition-colors"
                  >
                    <div className="h-[34px] w-[34px] rounded-xl bg-[#0F172A] dark:bg-[#1E293B] text-white flex items-center justify-center shadow-xs">
                      <Plus className="h-4 w-4 stroke-[2.5]" />
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
                className="w-full flex items-center gap-3 h-11 px-2.5 rounded-2xl text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A2234] hover:text-foreground font-medium transition-colors group text-left"
              >
                <div className="h-[34px] w-[34px] rounded-xl bg-[#0F172A] dark:bg-[#1E293B] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                </div>
                <span className="text-[13.5px] font-bold text-foreground">
                  Nouveau produit
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Section: Paramètres & Profile block */}
        <div className="pt-3 border-t border-border/60 space-y-1">
          {/* Paramètres */}
          {isCollapsed ? (
            <Tooltip delayDuration={80}>
              <TooltipTrigger asChild>
                <NavLink
                  to="/dashboard/settings"
                  onClick={onNavigate}
                  className="flex items-center justify-center h-11 w-11 mx-auto rounded-2xl hover:bg-secondary transition-colors"
                >
                  <div
                    className={`h-[34px] w-[34px] rounded-xl flex items-center justify-center ${
                      isActive("/dashboard/settings")
                        ? "bg-primary text-white shadow-xs"
                        : "bg-secondary/70 dark:bg-[#1E2536] border border-border/80 text-foreground"
                    }`}
                  >
                    <Settings className="h-4 w-4 stroke-[2]" />
                  </div>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-bold">
                Paramètres
              </TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              to="/dashboard/settings"
              onClick={onNavigate}
              className={`w-full flex items-center justify-between h-11 px-2.5 rounded-2xl transition-colors ${
                isActive("/dashboard/settings")
                  ? "bg-[#F1F3F5] dark:bg-[#1E2536] text-foreground font-bold"
                  : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A2234] hover:text-foreground font-medium"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-[34px] w-[34px] rounded-xl flex items-center justify-center ${
                    isActive("/dashboard/settings")
                      ? "bg-primary text-white shadow-xs"
                      : "bg-secondary/70 dark:bg-[#1E2536] border border-border/80 text-foreground"
                  }`}
                >
                  <Settings className="h-4 w-4 stroke-[2]" />
                </div>
                <span className="text-[13.5px] font-semibold truncate">
                  Paramètres
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
            </NavLink>
          )}

          {/* Profile Card with Dropdown */}
          <div className="pt-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center rounded-2xl hover:bg-secondary/70 transition-colors text-left outline-none ${
                    isCollapsed
                      ? "h-11 w-11 mx-auto justify-center p-0"
                      : "w-full justify-between gap-2.5 px-2 py-1.5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 p-0.5 shrink-0 flex items-center justify-center">
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
                          {storeName}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {userName}
                        </p>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side={isCollapsed ? "right" : "top"}
                className="w-60 rounded-2xl p-1.5 shadow-2xl border-border bg-card"
              >
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-foreground">{storeName}</span>
                    <span className="text-[11px] text-muted-foreground truncate">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={() => {
                    navigate("/dashboard/profile");
                    onNavigate?.();
                  }}
                  className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-xl px-2 py-1.5"
                >
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Mon profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigate("/dashboard/settings");
                    onNavigate?.();
                  }}
                  className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-xl px-2 py-1.5"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Paramètres</span>
                </DropdownMenuItem>

                {/* Dark mode switch */}
                <div
                  onClick={toggleTheme}
                  className="flex items-center justify-between px-2 py-1.5 text-xs font-medium text-foreground rounded-xl hover:bg-secondary cursor-pointer"
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
                    className="flex items-center justify-between px-2 py-1.5 text-xs font-medium text-foreground rounded-xl hover:bg-secondary"
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
                  className="flex items-center gap-2 text-xs font-medium text-destructive focus:text-destructive cursor-pointer rounded-xl px-2 py-1.5 hover:bg-destructive/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

export default DashboardSidebar;
