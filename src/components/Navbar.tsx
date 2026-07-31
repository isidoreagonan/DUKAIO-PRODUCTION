import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X, ChevronDown, LayoutDashboard, ShoppingBag, Store, FileText, GraduationCap, KeyRound, ShoppingCart, Tag, Info, BookOpen, Users, FileQuestion, Mail, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const productLinks = [
  { label: "Fichiers", href: "/fichiers", icon: FileText },
  { label: "Cours", href: "/cours", icon: GraduationCap },
  { label: "Licences", href: "/licences", icon: KeyRound },
];

const mainLinks = [
  { label: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  { label: "Tarifs", href: "/pricing", icon: Tag },
];

const moreLinks = [
  { label: "À propos", href: "/about", icon: Info },
  { label: "Blog", href: "/blog", icon: BookOpen },
  { label: "Partenaires", href: "/partners", icon: Users },
  { label: "Documentation", href: "/documentation", icon: FileText },
  { label: "FAQ", href: "/faq", icon: FileQuestion },
  { label: "Contact", href: "/contact", icon: Mail },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Dukaio" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-lg font-bold text-foreground tracking-tight">Dukaio</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 lg:flex">
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Produits <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="absolute top-full left-0 mt-2 w-44 rounded-xl border border-border bg-card p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {productLinks.map((l) => (
                <Link key={l.label} to={l.href} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <Link to="/marketplace" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Marketplace</Link>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Tarifs</Link>
          <Link to="/blog" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Blog</Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">À propos</Link>
          <Link to="/documentation" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Docs</Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-sm font-medium gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
              <Link to="/dashboard/profile">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <>
              <Link to="/buyer-login">
                <Button variant="ghost" size="sm" className="text-sm font-medium gap-2 text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" /> Mes achats
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground">Connexion vendeur</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="text-sm font-semibold gap-2">
                  <Store className="h-4 w-4" /> Devenir vendeur
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
          className="lg:hidden text-foreground p-2 -mr-2 relative z-[60]"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer — rendered via portal to escape backdrop-filter stacking context */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-drawer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-x-0 top-[68px] bottom-0 z-[55] bg-background border-t border-border flex flex-col overflow-hidden"
            >
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                {!user && (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/buyer-login" onClick={() => setMobileOpen(false)}>
                      <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-center hover:border-primary/40 transition-all">
                        <ShoppingBag className="h-5 w-5 text-primary mx-auto mb-2" />
                        <p className="text-xs font-bold text-foreground">Mes achats</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Acheteur</p>
                      </div>
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-4 text-center shadow-lg shadow-primary/25">
                        <Store className="h-5 w-5 text-white mx-auto mb-2" />
                        <p className="text-xs font-bold text-white">Devenir vendeur</p>
                        <p className="text-[10px] text-white/80 mt-0.5">Gratuit</p>
                      </div>
                    </Link>
                  </div>
                )}

                {user && (
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-primary to-accent p-4 shadow-lg shadow-primary/25">
                      <Avatar className="h-10 w-10 border-2 border-white/30">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-white/20 text-white font-bold">
                          {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-xs text-white/80">Bienvenue</p>
                        <p className="text-sm font-bold text-white truncate">{profile?.display_name || "Vendeur"}</p>
                      </div>
                      <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                  </Link>
                )}

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3 px-1">Produits</p>
                  <div className="grid grid-cols-3 gap-2">
                    {productLinks.map((l) => (
                      <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)}>
                        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-all">
                          <l.icon className="h-5 w-5 text-primary" />
                          <span className="text-xs font-medium text-foreground">{l.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3 px-1">Découvrir</p>
                  <div className="space-y-1">
                    {mainLinks.map((l) => (
                      <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)}>
                        <div className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-secondary/60 transition-colors">
                          <l.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">{l.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3 px-1">Ressources</p>
                  <div className="space-y-1">
                    {moreLinks.map((l) => (
                      <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)}>
                        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-secondary/60 transition-colors">
                          <l.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{l.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {user && (
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                )}
              </div>

              {!user && (
                <div className="border-t border-border bg-background/95 backdrop-blur px-5 py-3">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">
                      Connexion vendeur
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.nav>
  );
};

export default Navbar;
