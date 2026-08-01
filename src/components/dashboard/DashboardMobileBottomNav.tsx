import { NavLink, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Receipt, Wallet, LayoutGrid } from "lucide-react";
import { createPortal } from "react-dom";

const tabs = [
  { title: "Accueil", url: "/dashboard", icon: Home, end: true },
  { title: "Produits", url: "/dashboard/products", icon: ShoppingBag },
  { title: "Ventes", url: "/dashboard/sales", icon: Receipt },
  { title: "Wallet", url: "/dashboard/wallet", icon: Wallet },
  { title: "Menu", url: "/dashboard/menu", icon: LayoutGrid },
];

export default function DashboardMobileBottomNav() {
  const location = useLocation();

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const bottomBar = (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[68px] px-1">
        {tabs.map((t) => {
          const active = isActive(t.url, t.end);
          const Icon = t.icon;

          return (
            <NavLink
              key={t.title}
              to={t.url}
              end={t.end}
              aria-label={t.title}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-colors ${
                active ? "text-[#3f48cc]" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold leading-none">{t.title}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );

  if (typeof document === "undefined") return null;
  return createPortal(bottomBar, document.body);
}
