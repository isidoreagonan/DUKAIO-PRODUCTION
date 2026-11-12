import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  DollarSign, Wallet, Megaphone, Sparkles, Zap, Webhook,
  Bot, Wrench, Store, MessageCircle, BadgeCheck, Settings,
  Shield, PanelLeft, ChevronsUpDown, Check, Plus, ExternalLink,
  Moon, Sun, LogOut, Bell, HelpCircle, ChevronRight, User as UserIcon
} from "lucide-react";
import logo from "@/assets/logo.png";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  badge?: string | number;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  adminOnly?: boolean;
}

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
  const { theme, isDark, toggleTheme } = useDukaioTheme();

  const isAdmin = user?.email === "isidoreagonan@gmail.com";

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
    "Créateur";

  const navGroups: NavGroup[] = [
    {
      label: "Général",
      items: [
        { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard, end: true },
        { title: "Produits", url: "/dashboard/products", icon: Package },
        { title: "Ventes", url: "/dashboard/sales", icon: ShoppingCart },
        { title: "Clients", url: "/dashboard/clients", icon: Users },
      ],
    },
    {
      label: "Outils",
      items: [
        { title: "Analytiques", url: "/dashboard/analytics", icon: BarChart3 },
        { title: "Revenus", url: "/dashboard/revenue", icon: DollarSign },
        { title: "Wallet", url: "/dashboard/wallet", icon: Wallet },
        { title: "Marketing", url: "/dashboard/marketing", icon: Megaphone },
        { title: "Affiliation", url: "/dashboard/affiliation", icon: Sparkles },
        { title: "Automatisations", url: "/dashboard/automations", icon: Zap },
        { title: "Webhooks", url: "/dashboard/webhooks", icon: Webhook },
        { title: "Nova IA", url: "/dashboard/nova", icon: Bot },
        { title: "Outils", url: "/dashboard/tools", icon: Wrench },
      ],
    },
    {
      label: "Boutique",
      items: [
        { title: "Boutiques", url: "/dashboard/stores", icon: Store },
        { title: "Messages", url: "/dashboard/support", icon: MessageCircle },
        { title: "Badge Verify", url: "/dashboard/badge", icon: BadgeCheck },
        { title: "Paramètres", url: "/dashboard/settings", icon: Settings },
      ],
    },
    {
      label: "Administration",
      adminOnly: true,
      items: [
        { title: "Vue d'ensemble", url: "/dashboard/admin", icon: BarChart3 },
        { title: "Utilisateurs", url: "/dashboard/admin-users", icon: Users },
        { title: "Retraits", url: "/dashboard/admin-withdrawals", icon: Wallet },
        { title: "Support", url: "/dashboard/admin-support", icon: MessageCircle },
        { title: "Modération", url: "/dashboard/admin-moderation", icon: Package },
        { title: "KYC", url: "/dashboard/admin-kyc", icon: Shield },
        { title: "Badges", url: "/dashboard/admin-badges", icon: BadgeCheck },
      ],
    },
  ];

  const isActive = (path: string, end = false) => {
    if (end) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const isCollapsed = collapsed && !isMobile;

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.url, item.end);
    const Icon = item.icon;

    const linkContent = (
      <NavLink
        to={item.url}
        end={item.end}
        onClick={onNavigate}
        className={`group relative flex items-center h-9 rounded-lg text-sm transition-all duration-150 ${
          isCollapsed ? "justify-center w-9 mx-auto px-0" : "px-3 gap-3 w-full"
        } ${
          active
            ? "bg-card border border-border text-foreground font-semibold shadow-xs"
            : "text-muted-foreground hover:bg-[#F3F5F9] dark:hover:bg-[#1A2234] hover:text-foreground"
        }`}
      >
        <Icon
          className={`shrink-0 h-[18px] w-[18px] stroke-[1.75] transition-colors ${
            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          }`}
        />
        {!isCollapsed && (
          <span className="truncate flex-1 text-left tracking-normal font-medium text-[13.5px]">
            {item.title}
          </span>
        )}

        {/* Counter / badge */}
        {item.badge && (
          isCollapsed ? (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          ) : (
            <span className="ml-auto text-[11px] font-semibold px-1.5 py-0.5 rounded-md border border-border bg-secondary text-muted-foreground">
              {item.badge}
            </span>
          )
        )}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.url} delayDuration={100}>
          <TooltipTrigger asChild>
            <div className="flex justify-center my-1">{linkContent}</div>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs font-medium px-2.5 py-1">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <div key={item.url} className="my-0.5">
        {linkContent}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={`flex flex-col h-full bg-card border-r border-border select-none transition-[width] duration-200 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-[264px]"
        }`}
      >
        {/* Top Header: Logo + Collapse Button */}
        <div
          className={`h-15 flex items-center shrink-0 border-b border-border/60 ${
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          <NavLink
            to="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-2.5 min-w-0 group"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 p-1 group-hover:scale-105 transition-transform">
              <img src={logo} alt="Dukaio" className="h-full w-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[17px] font-extrabold tracking-tight text-foreground font-sans">
                  dukaio
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              </div>
            )}
          </NavLink>

          {!isMobile && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Déplier le menu" : "Replier le menu"}
              className={`h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors ${
                isCollapsed ? "hidden" : ""
              }`}
            >
              <PanelLeft className="h-4 w-4 stroke-[1.75]" />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Button when sidebar is collapsed */}
        {isCollapsed && !isMobile && onToggleCollapse && (
          <div className="flex justify-center pt-2 pb-1">
            <button
              onClick={onToggleCollapse}
              aria-label="Déplier le menu"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors"
            >
              <PanelLeft className="h-4 w-4 stroke-[1.75]" />
            </button>
          </div>
        )}

        {/* Store Selector */}
        <div className={`shrink-0 py-3 ${isCollapsed ? "px-2" : "px-3"}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center rounded-xl border border-border bg-secondary/40 hover:bg-secondary/80 transition-colors text-left outline-none ${
                  isCollapsed
                    ? "h-10 w-10 mx-auto justify-center p-0"
                    : "w-full justify-between gap-2.5 px-2.5 py-2"
                }`}
                title={isCollapsed ? (activeStore?.name || "Boutique") : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary border border-border flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                    {activeStore?.logo_url ? (
                      <img src={activeStore.logo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (activeStore?.name?.charAt(0) || "D").toUpperCase()
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate leading-tight">
                        {activeStore?.name || "Ma Boutique"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                        {activeStore?.slug ? `${activeStore.slug}.dukaio.app` : "Boutique active"}
                      </p>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side={isCollapsed ? "right" : "bottom"} className="w-64 rounded-xl p-1.5 shadow-lg border-border">
              <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
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
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer ${
                    store.id === activeStore?.id ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                  }`}
                >
                  <div className="h-6 w-6 rounded-md bg-secondary text-primary border border-border flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (store.name?.charAt(0) || "D").toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{store.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{store.slug}.dukaio.app</p>
                  </div>
                  {store.id === activeStore?.id && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => {
                  navigate("/dashboard/stores");
                  onNavigate?.();
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-foreground cursor-pointer rounded-lg hover:bg-secondary"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Gérer les boutiques</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navGroups.map((group) => {
            if (group.adminOnly && !isAdmin) return null;

            return (
              <div key={group.label} className="space-y-0.5">
                {!isCollapsed && (
                  <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider px-2 py-1">
                    {group.label}
                  </p>
                )}
                {isCollapsed && (
                  <div className="w-6 h-px bg-border mx-auto my-2" />
                )}
                <div>{group.items.map(renderNavItem)}</div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Section: Help, Notifications, Profile */}
        <div className="shrink-0 border-t border-border/80 p-2 space-y-1 bg-card">
          {/* Notifications Quick Link */}
          {isCollapsed ? (
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <NavLink
                  to="/dashboard/menu"
                  onClick={onNavigate}
                  className="flex items-center justify-center h-8 w-8 mx-auto rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Bell className="h-4 w-4 stroke-[1.75]" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Notifications
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground">
              <NavLink
                to="/dashboard/support"
                onClick={onNavigate}
                className="flex items-center gap-2 hover:text-foreground transition-colors py-0.5"
              >
                <HelpCircle className="h-3.5 w-3.5 stroke-[1.75]" />
                <span>Aide & Support</span>
              </NavLink>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 text-[11px] hover:text-foreground transition-colors py-0.5 px-1.5 rounded-md hover:bg-secondary"
                title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
              >
                {isDark ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    <span>Clair</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-slate-500" />
                    <span>Sombre</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Profile Block with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center rounded-xl hover:bg-secondary/80 transition-colors text-left outline-none ${
                  isCollapsed
                    ? "h-10 w-10 mx-auto justify-center p-0"
                    : "w-full justify-between gap-2.5 p-1.5 border border-transparent hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-7 w-7 border border-border shrink-0">
                    <AvatarImage src={userAvatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate leading-tight">
                        {userName}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side={isCollapsed ? "right" : "top"}
              className="w-60 rounded-xl p-1.5 shadow-xl border-border bg-card"
            >
              <DropdownMenuLabel className="font-normal px-2 py-1.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-foreground">{userName}</span>
                  <span className="text-[11px] text-muted-foreground truncate">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => {
                  navigate("/dashboard/profile");
                  onNavigate?.();
                }}
                className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2 py-1.5"
              >
                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Mon profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigate("/dashboard/settings");
                  onNavigate?.();
                }}
                className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2 py-1.5"
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Paramètres</span>
              </DropdownMenuItem>

              {/* Theme toggle switch in dropdown */}
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
      </aside>
    </TooltipProvider>
  );
}
