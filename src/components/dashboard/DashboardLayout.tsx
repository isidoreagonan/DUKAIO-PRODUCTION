import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import NotificationBell from "./NotificationBell";
import DashboardMobileBottomNav from "./DashboardMobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Store, ChevronDown, ExternalLink } from "lucide-react";
import logo from "@/assets/logo.png";
import { useActiveStore } from "@/hooks/useActiveStore";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const { activeStore, activeStores, setActiveStoreId } = useActiveStore();
  const { user, profile, signOut } = useAuth();

  const initial =
    profile?.display_name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <SidebarProvider>
      <div className="dashboard-shell min-h-screen flex w-full">
        {/* Sidebar hidden on mobile (replaced by bottom nav) */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 h-16 flex items-center justify-between border-b border-slate-200/80 px-3 sm:px-6 bg-white">
            {/* Left side */}
            <div className="flex items-center gap-3 min-w-0">
              {isMobile ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
                    {activeStore?.logo_url ? (
                      <img src={activeStore.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                    ) : (
                      <img src={logo} alt="Dukaio" className="h-4 w-4 object-contain" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground truncate">
                    {activeStore?.name || "Dukaio"}
                  </span>
                </div>
              ) : (
                <>
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-lg bg-[hsl(214_100%_97%)] text-[hsl(221_83%_45%)] hover:bg-[hsl(214_100%_94%)] transition-colors text-sm font-semibold"
                  >
                    <Store className="h-4 w-4" />
                    Marketplaces
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </Link>
                </>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Store selector (desktop) */}
              {!isMobile && activeStore && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-700">
                    <Store className="h-4 w-4 text-slate-500" />
                    <span className="max-w-[160px] truncate">{activeStore.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs text-slate-500 font-medium">
                      Mes boutiques
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {activeStores.map((s) => (
                      <DropdownMenuItem
                        key={s.id}
                        onClick={() => setActiveStoreId(s.id)}
                        className="gap-2 cursor-pointer"
                      >
                        <Store className="h-4 w-4 text-slate-500" />
                        <span className="truncate">{s.name}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/dashboard/stores">Gérer mes boutiques</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Visiter la boutique */}
              {activeStore && (
                <a
                  href={`/${activeStore.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(221_83%_53%)] hover:bg-[hsl(221_83%_46%)] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  Visiter la boutique
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              {/* Divider */}
              <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1" />

              {/* Bell */}
              <NotificationBell />

              {/* User */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-2.5 h-10 pl-1 pr-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-slate-900 truncate max-w-[140px]">
                      {profile?.display_name || activeStore?.name || "Utilisateur"}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="hidden md:block h-3.5 w-3.5 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{profile?.display_name || "Utilisateur"}</span>
                      <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/dashboard/profile">Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/dashboard/settings">Paramètres</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600 focus:text-red-600">
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main content */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden pb-24 lg:pb-6 flex flex-col"
          >
            <div className="w-full max-w-[1400px] mx-auto flex-1">
              {children}
            </div>
          </motion.main>
        </div>

        {/* Mobile bottom nav */}
        <DashboardMobileBottomNav />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
