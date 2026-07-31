import { NavLink, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Receipt, Wallet, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pointer-events-none"
      style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + 0.75rem)` }}
    >
      <div className="pointer-events-auto relative mx-auto max-w-md">
        <div className="relative h-16 rounded-[28px] bg-foreground shadow-[0_12px_40px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/5 grid grid-cols-5">
          {tabs.map((t) => {
            const active = isActive(t.url, t.end);
            const Icon = t.icon;

            return (
              <NavLink
                key={t.title}
                to={t.url}
                end={t.end}
                aria-label={t.title}
                className="relative h-full active:scale-95 transition-transform"
              >
                <div className="relative h-full w-full flex items-center justify-center">
                  {active && (
                    <motion.div
                      layoutId="bottomnav-active-orb"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      className="absolute -top-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.6),0_0_0_4px_hsl(var(--background))] flex items-center justify-center"
                    >
                      <Icon className="h-[20px] w-[20px] text-white" strokeWidth={2.4} />
                    </motion.div>
                  )}
                  {!active && (
                    <Icon className="h-[20px] w-[20px] text-background/55" strokeWidth={2} />
                  )}
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );

  if (typeof document === "undefined") return null;
  return createPortal(bottomBar, document.body);
}
