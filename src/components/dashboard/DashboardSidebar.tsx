import {
  LayoutDashboard, Package, Settings, LogOut, Store, ShoppingCart,
  BarChart3, ChevronsUpDown, Plus, Check, LayoutGrid, HelpCircle,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { Sidebar, SidebarContent, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
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
  { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard, end: true },
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
        <item.icon className={`shrink-0 ${collapsed ? "h-6 w-6" : "h-5 w-5"} ${active ? "text-[#3f48cc]" : "text-white"}`} />
        {!collapsed && <span className="truncate flex-1 text-left">{item.title}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto rounded bg-[#ef4444] px-2 py-0.5 text-[10px] font-bold text-white">
            {item.badge}
          </span>
        )}
      </>
    );
    const classes = `group relative flex items-center rounded-2xl text-[15px] font-medium transition-all ${
      collapsed ? "justify-center w-[48px] h-[48px] mx-auto p-0" : "gap-3 px-4 py-3"
    } ${
      active
        ? "bg-white text-[#3f48cc] shadow-sm"
        : "text-white hover:bg-white/10"
    }`;
    if (item.external) {
      return (
        <a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer" className={classes} title={collapsed ? item.title : undefined}>
          {inner}
        </a>
      );
    }
    return (
      <NavLink key={item.title} to={item.url} end={item.end} className={classes} title={collapsed ? item.title : undefined}>
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
        className="relative flex flex-col bg-[#3f48cc] text-white overflow-hidden"
      >
        {/* Profile block — Store switcher simplified */}
        <div className={`pt-8 pb-4 flex ${collapsed ? "flex-col items-center gap-6" : "px-4 items-center justify-between"} border-b border-transparent`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-3 text-left outline-none ${collapsed ? "justify-center w-full" : "flex-1 min-w-0"}`}>
                <div
                  className={`flex shrink-0 items-center justify-center overflow-hidden ${
                    collapsed ? "h-10 w-10 mx-auto" : "h-10 w-10 ml-1 rounded-lg bg-white/20"
                  }`}
                >
                  {activeStore?.logo_url ? (
                    <img
                      src={activeStore.logo_url}
                      alt={activeStore.name}
                      className={`h-full w-full object-cover ${collapsed ? "rounded-xl" : "rounded-lg"}`}
                    />
                  ) : (
                    <Store className={`${collapsed ? "h-8 w-8" : "h-5 w-5"} text-white`} />
                  )}
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-lg font-bold text-white truncate">
                      {activeStore?.name || "Dukaio"}
                    </p>
                  </div>
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

          {/* Trigger next to logo when expanded, below logo when collapsed */}
          <SidebarTrigger className={`shrink-0 text-white hover:text-[#3f48cc] hover:bg-white rounded-xl [&>svg]:w-6 [&>svg]:h-6 transition-colors ${collapsed ? "w-[48px] h-[48px]" : "w-10 h-10 mr-1"}`} />
        </div>

        {/* Navigation */}
        <nav className={`relative flex-1 py-4 space-y-3 overflow-y-auto ${collapsed ? "px-2" : "px-4"}`}>
          {mainItems.map(renderItem)}

          <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
            {bottomItems.map(renderItem)}
          </div>
        </nav>

        {/* Footer mini brand + signout */}
        <div className={`relative pb-6 pt-4 border-t border-transparent ${collapsed ? "px-2" : "px-4"}`}>
          <button
            onClick={signOut}
            className={`flex items-center rounded-2xl text-[15px] font-medium text-white hover:bg-white/10 transition-all ${
              collapsed ? "justify-center w-[48px] h-[48px] mx-auto p-0" : "w-full gap-3 px-4 py-3"
            }`}
            title="Déconnexion"
          >
            <LogOut className={`shrink-0 ${collapsed ? "h-6 w-6" : "h-5 w-5"}`} />
            {!collapsed && <span className="truncate flex-1 text-left">Déconnexion</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

