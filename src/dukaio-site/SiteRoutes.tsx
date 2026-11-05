/**
 * Toutes les pages publiques Dukaio, prêtes à être montées dans react-router-dom v6.
 * Usage dans App.tsx :  {dukaioSiteRoutes}  à l'intérieur de <Routes>.
 */
import { useEffect, type ReactNode } from "react";
import { Navigate, Outlet, Route, useLocation } from "react-router-dom";
import "./dukaio-site.css";
import { Header } from "./site/Header";
import { Footer } from "./site/Footer";
import { Toaster } from "./ui/sonner";
import { installImageProtection } from "./lib/image-protection";
import { Link } from "./router";
import { Route as Home } from "./pages/index";
import { Route as Login } from "./pages/connexion";
import { Route as Signup } from "./pages/inscription";
import { Route as Reset } from "./pages/reinitialiser-mot-de-passe";
import { Route as Product } from "./pages/produits.$type";
import { Route as Legal } from "./pages/legal.$slug";

/** Applique le thème Dukaio à toute la page (y compris menus et notifications). */
function useSiteTheme() {
  useEffect(() => {
    document.body.classList.add("dk-site");
    const off = installImageProtection(document);
    if (!document.getElementById("dk-manrope")) {
      const l = document.createElement("link");
      l.id = "dk-manrope"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(l);
    }
    return () => { document.body.classList.remove("dk-site"); off?.(); };
  }, []);
}

function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <p className="mt-4 text-muted-foreground">Cette page n’existe pas ou a été déplacée.</p>
        <Link to="/" className="btn btn-primary mt-8">Retour à l’accueil</Link>
      </div>
    </div>
  );
}

function MarketingLayout() {
  useSiteTheme();
  return (<><ScrollToHash /><Header /><main><Outlet /></main><Footer /><Toaster position="top-center" /></>);
}

function AccountLayout() {
  useSiteTheme();
  return (<><ScrollToHash /><main><Outlet /></main><Toaster position="top-center" /></>);
}

const nf: ReactNode = <NotFound />;

export const dukaioSiteRoutes = (
  <>
    <Route element={<MarketingLayout />}>
      <Route path="/" element={<Home.Page />} />
      <Route path="/produits/:type" element={<Product.Page fallback={nf} />} />
      <Route path="/legal/:slug" element={<Legal.Page fallback={nf} />} />
    </Route>
    <Route element={<AccountLayout />}>
      <Route path="/connexion" element={<Login.Page />} />
      <Route path="/inscription" element={<Signup.Page />} />
      <Route path="/reinitialiser-mot-de-passe" element={<Reset.Page />} />
    </Route>
    {/* Anciennes adresses → nouvelles pages */}
    <Route path="/login" element={<Navigate to="/connexion" replace />} />
    <Route path="/register" element={<Navigate to="/inscription" replace />} />
    <Route path="/forgot-password" element={<Navigate to="/connexion" replace />} />
    <Route path="/reset-password" element={<Navigate to="/reinitialiser-mot-de-passe" replace />} />
    <Route path="/fichiers" element={<Navigate to="/produits/fichiers" replace />} />
    <Route path="/cours" element={<Navigate to="/produits/cours" replace />} />
    <Route path="/licences" element={<Navigate to="/produits/licences" replace />} />
    <Route path="/terms" element={<Navigate to="/legal/conditions-utilisation" replace />} />
    <Route path="/privacy" element={<Navigate to="/legal/confidentialite" replace />} />
    <Route path="/legal" element={<Navigate to="/legal/mentions-legales" replace />} />
  </>
);
