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
    user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() ||
    user?.user_metadata?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || "";
  const userName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "Utilisateur";

  return (
    <SidebarProvider>
      <div className="dashboard-shell min-h-screen flex w-full">
        {/* Sidebar hidden on mobile (replaced by bottom nav) */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="sticky top-0 lg:top-4 z-30 px-0 lg:px-6 lg:pt-4 pb-2 transition-all duration-300">
            <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white lg:bg-white/85 lg:backdrop-blur-xl border-b border-slate-200/80 lg:border lg:border-white/50 lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:rounded-2xl w-full">
              {/* Left side */}
              <div className="flex items-center gap-3 sm:gap-5 min-w-0">
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
                      className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-semibold"
                      title="Aller aux marketplaces"
                    >
                      <div className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <Store className="h-4.5 w-4.5" />
                      </div>
                    </Link>
                    
                    {activeStore && (
                      <>
                        <div className="h-5 w-px bg-slate-200" />
                        
                        {/* Store selector (desktop) */}
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center gap-2.5 h-9 px-3 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-800 border border-transparent hover:border-slate-200 outline-none focus:ring-0">
                            {activeStore.logo_url ? (
                              <img src={activeStore.logo_url} alt="" className="h-5 w-5 rounded-md object-cover" />
                            ) : (
                              <div className="h-5 w-5 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                                {activeStore.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="max-w-[160px] truncate">{activeStore.name}</span>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-64 rounded-xl shadow-xl border-slate-100 p-2">
                            <DropdownMenuLabel className="text-xs text-slate-400 font-semibold uppercase tracking-wider px-2 pt-1 pb-2">
                              Mes boutiques
                            </DropdownMenuLabel>
                            {activeStores.map((s) => (
                              <DropdownMenuItem
                                key={s.id}
                                onClick={() => setActiveStoreId(s.id)}
                                className={`gap-3 cursor-pointer rounded-lg p-2 mb-1 ${s.id === activeStore.id ? 'bg-primary/5 text-primary font-medium' : 'text-slate-600'}`}
                              >
                                {s.logo_url ? (
                                  <img src={s.logo_url} alt="" className="h-6 w-6 rounded-md object-cover" />
                                ) : (
                                  <div className={`h-6 w-6 rounded-md flex items-center justify-center text-xs ${s.id === activeStore.id ? 'bg-primary/20' : 'bg-slate-100'}`}>
                                    {s.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className="truncate">{s.name}</span>
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-2 text-slate-600">
                              <Link to="/dashboard/stores" className="w-full flex items-center gap-2">
                                <Store className="h-4 w-4" />
                                Gérer mes boutiques
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Visiter la boutique */}
                {activeStore && (
                  <a
                    href={`/store/${activeStore.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden md:inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all hover:shadow-sm group"
                  >
                    <span>Voir ma boutique</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </a>
                )}

                {/* Divider */}
                <div className="hidden sm:block h-5 w-px bg-slate-200" />

                {/* Bell */}
                <div className="flex items-center justify-center h-9 w-9">
                  <NotificationBell />
                </div>

                {/* User */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center gap-2 h-9 pl-1 pr-1.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 outline-none focus:ring-0 ml-1">
                    <Avatar className="h-7 w-7 border border-white shadow-sm ring-1 ring-slate-100">
                      <AvatarImage src={userAvatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-[10px] font-bold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400 mr-1" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 rounded-xl shadow-xl border-slate-100 p-2">
                    <DropdownMenuLabel className="font-normal p-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-800">{userName}</span>
                        <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-2 text-slate-600 font-medium">
                      <Link to="/dashboard/profile">Mon profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-2 text-slate-600 font-medium">
                      <Link to="/dashboard/settings">Paramètres</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer rounded-lg p-2 text-red-600 font-medium focus:bg-red-50 focus:text-red-700">
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
          </div>

          {/* Main content */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1 p-3 sm:p-4 lg:px-6 lg:pt-8 lg:pb-6 overflow-x-hidden pb-24 flex flex-col"
          >
            <div className="w-full flex-1">
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
