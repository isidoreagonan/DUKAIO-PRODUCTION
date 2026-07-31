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
        <item.icon className={`h-5 w-5 shrink-0 ${active ? "text-[#3f48cc]" : "text-white"}`} />
        {!collapsed && <span className="truncate flex-1 text-left">{item.title}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto rounded bg-[#ef4444] px-2 py-0.5 text-[10px] font-bold text-white">
            {item.badge}
          </span>
        )}
      </>
    );
    const classes = `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all ${
      active
        ? "bg-white text-[#3f48cc] shadow-sm"
        : "text-white hover:bg-white/10"
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
        className="relative flex flex-col bg-[#3f48cc] text-white overflow-hidden"
      >
        {/* Profile block — Store switcher simplified */}
        <div className="px-4 py-6 flex flex-col items-start border-b border-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 text-left outline-none">
                <div
                  className={`flex shrink-0 items-center justify-center rounded-lg bg-white/20 overflow-hidden ${
                    collapsed ? "h-10 w-10 mx-auto" : "h-10 w-10"
                  }`}
                >
                  {activeStore?.logo_url ? (
                    <img
                      src={activeStore.logo_url}
                      alt={activeStore.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-5 w-5 text-white" />
                  )}
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-white truncate">
                      {activeStore?.name || "Dukaio"}
                    </p>
                  </div>
                )}
                {!collapsed && (
                  <ChevronsUpDown className="h-4 w-4 text-white/70 shrink-0" />
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
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {mainItems.map(renderItem)}

          <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
            {bottomItems.map(renderItem)}
          </div>
        </nav>

        {/* Footer mini brand + signout */}
        <div className="relative px-4 pb-6 pt-4 border-t border-white/10">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-white hover:bg-white/10 transition-all"
            title="Déconnexion"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate flex-1 text-left">Déconnexion</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

