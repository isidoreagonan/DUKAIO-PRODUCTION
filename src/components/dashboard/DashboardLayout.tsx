import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardSidebar } from "./DashboardSidebar";
import { QuickSearchDialog } from "./QuickSearchDialog";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Collapsed state stored in localStorage
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("dukaio-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FBFBFC] dark:bg-[#0F1522] text-foreground font-sans antialiased selection:bg-primary/20 relative">
      {/* Floating Desktop Sidebar (vycut style: surrounded by margins and rounded corners) */}
      <div className="hidden lg:block fixed top-0 left-0 bottom-0 p-3 sm:p-4 z-40 pointer-events-none">
        <div className="pointer-events-auto h-full">
          <DashboardSidebar
            collapsed={collapsed}
            onToggleCollapse={toggleCollapsed}
          />
        </div>
      </div>

      {/* Mobile Floating Menu Button (Top-left, only when drawer is closed) */}
      {!mobileDrawerOpen && (
        <button
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Ouvrir le menu"
          className="lg:hidden fixed top-3.5 left-3.5 z-40 h-10 w-10 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-[0_4px_14px_rgba(0,0,0,0.06)] flex items-center justify-center text-foreground hover:bg-secondary transition-transform active:scale-95"
        >
          <Menu className="h-5 w-5 stroke-[2]" />
        </button>
      )}

      {/* Mobile Slide-Over Drawer (<1024px) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-over floating drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 260 }}
              className="relative p-3 max-w-[85vw] h-full z-10 flex flex-col pointer-events-auto"
            >
              <DashboardSidebar
                collapsed={false}
                isMobile={true}
                onNavigate={() => setMobileDrawerOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content: NO horizontal top bar, pure breathing room and clean spacing */}
      <div
        className={`min-h-screen flex flex-col transition-[padding-left] duration-300 ease-in-out ${
          collapsed ? "lg:pl-[104px]" : "lg:pl-[292px]"
        }`}
      >
        <main className="flex-1 pt-14 lg:pt-6 pb-12 px-4 sm:px-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Quick Search Dialog (⌘K) */}
      <QuickSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
