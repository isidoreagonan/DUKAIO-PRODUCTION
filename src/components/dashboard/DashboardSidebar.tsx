import {
  LayoutDashboard, Package, Settings, LogOut, Store, ShoppingCart,
  BarChart3, ChevronsUpDown, Plus, Check, LayoutGrid, HelpCircle,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  badge?: string;
  external?: boolean;
};

const mainItems: NavItem[] = [
  { title: "Accueil", url: "/dashboard", icon: LayoutDashboard, end: true },
  { title: "Produits", url: "/dashboard/products", icon: Package },
  { title: "Ventes", url: "/dashboard/sales", icon: ShoppingCart },
  { title: "Analytiques", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Autres", url: "/dashboard/menu", icon: LayoutGrid, badge: "New" },
];

const bottomItems: NavItem[] = [
  { title: "Paramètres", url: "/dashboard/settings", icon: Settings },
  { title: "Centre d'aide", url: "/faq", icon: HelpCircle, external: true },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { stores, activeStore, activeStores, setActiveStoreId } = useActiveStore();

  const isActive = (path: string, end = false) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  const renderItem = (item: NavItem) => {
    const active = !item.external && isActive(item.url, item.end);
    const inner = (
      <>
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.7)]" />
        )}
        <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-accent" : ""}`} />
        {!collapsed && <span className="truncate flex-1 text-left">{item.title}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto rounded-md bg-accent px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[hsl(224_65%_9%)] shadow-[0_0_10px_hsl(var(--accent)/0.6)]">
            {item.badge}
          </span>
        )}
      </>
    );
    const classes = `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition-all ${
      active
        ? "bg-[hsl(0_0%_98%/0.95)] text-[hsl(221_83%_35%)] shadow-[0_4px_14px_-4px_rgba(0,0,0,0.45)]"
        : "text-white/70 hover:text-white hover:bg-white/5"
    }`;
    if (item.external) {
      return (
        <a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer" className={classes}>
          {inner}
        </a>
      );
    }
    return (
      <NavLink key={item.title} to={item.url} end={item.end} className={classes}>
        {inner}
      </NavLink>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className="dashboard-shell-scope border-r-0"
    >
      <SidebarContent
        className="relative flex flex-col bg-[linear-gradient(180deg,hsl(224_60%_14%)_0%,hsl(224_65%_9%)_100%)] text-white overflow-hidden"
      >
        {/* Decorative gold orb */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />

        {/* Profile block — store logo as primary, user avatar as small badge */}
        <div className="relative px-4 pt-6 pb-5 flex flex-col items-center text-center border-b border-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group relative">
                {/* Gold halo */}
                <span className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-accent via-accent/60 to-primary blur-[8px] opacity-70 group-hover:opacity-100 transition-opacity" />
                {/* Store logo (primary visual) */}
                <div
                  className={`relative overflow-hidden rounded-2xl ring-2 ring-accent shadow-[0_8px_24px_-6px_hsl(var(--accent)/0.5)] bg-gradient-to-br from-primary to-accent flex items-center justify-center ${
                    collapsed ? "h-10 w-10" : "h-20 w-20"
                  }`}
                >
                  {activeStore?.logo_url ? (
                    <img
                      src={activeStore.logo_url}
                      alt={activeStore.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className={`font-extrabold text-white ${collapsed ? "text-base" : "text-2xl"}`}>
                      {activeStore?.name?.charAt(0)?.toUpperCase() || "D"}
                    </span>
                  )}
                </div>
                {/* User avatar as small badge bottom-right */}
                {!collapsed && (
                  <Avatar className="absolute -bottom-1 -right-1 h-7 w-7 ring-2 ring-[hsl(224_65%_9%)] shadow-md">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-[10px] font-bold">
                      {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
                {/* Switcher chevron */}
                {!collapsed && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent flex items-center justify-center ring-2 ring-[hsl(224_65%_9%)] shadow-md">
                    <ChevronsUpDown className="h-2.5 w-2.5 text-[hsl(224_65%_9%)]" />
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="w-64">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Vos boutiques
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {activeStores.map((store) => (
                <DropdownMenuItem
                  key={store.id}
                  onClick={() => setActiveStoreId(store.id)}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 overflow-hidden">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt="" className="h-7 w-7 object-cover" />
                    ) : (
                      <Store className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{store.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{store.slug}.dukaio.app</p>
                  </div>
                  {store.id === activeStore?.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                </DropdownMenuItem>
              ))}
              {activeStores.length < 3 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard/stores")}
                    className="flex items-center gap-2.5 cursor-pointer text-primary"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-primary/40">
                      <Plus className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-semibold">Nouvelle boutique</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {!collapsed && (
            <div className="mt-4 space-y-1 max-w-full w-full">
              <p className="text-[13px] font-extrabold tracking-[0.08em] uppercase text-white truncate">
                {activeStore?.name || "Dukaio"}
              </p>
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent))]" />
                <p className="text-[10px] text-white/60 truncate font-medium">
                  {profile?.display_name || user?.email?.split("@")[0]}
                </p>
              </div>
            </div>
          )}
        </div>


        {/* Navigation */}
        <nav className="relative flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {mainItems.map(renderItem)}

          <div className="pt-3 mt-3 border-t border-white/10 space-y-1">
            {bottomItems.map(renderItem)}
          </div>

        </nav>

        {/* Footer mini brand + signout */}
        <div className="relative px-3 pb-4 pt-2 border-t border-white/10">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white/60 hover:text-white hover:bg-white/5 transition-all"
            title="Déconnexion"
          >
            <LogOut className="h-3.5 w-3.5" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
          {!collapsed && (
            <div className="mt-2 flex items-center justify-center gap-1.5 opacity-50">
              <img src={logo} alt="" className="h-3 w-3" />
              <span className="text-[10px] text-white/60 tracking-wider">DUKAIO</span>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
