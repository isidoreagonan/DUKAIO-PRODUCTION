import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import DomainMigrationBanner from "@/components/DomainMigrationBanner";
import { dukaioSiteRoutes } from "@/dukaio-site/SiteRoutes";

import SearchPage from "./pages/SearchPage";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Partners from "./pages/Partners";
import Documentation from "./pages/Documentation";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import RefundPolicy from "./pages/RefundPolicy";

import StorePage from "./pages/StorePage";
import StoreProductDetail from "./pages/StoreProductDetail";
import StoreLegalPage from "./pages/StoreLegalPage";
import BuyerLogin from "./pages/BuyerLogin";
import BuyerDashboard from "./pages/BuyerDashboard";
import BuyerOrderDetail from "./pages/BuyerOrderDetail";
import BuyerOAuthCallback from "./pages/BuyerOAuthCallback";
import BuyerVerifyOtp from "./pages/BuyerVerifyOtp";
import BuyerProtectedRoute from "./components/BuyerProtectedRoute";
import PaymentCallback from "./pages/PaymentCallback";
import CheckoutPage from "./pages/CheckoutPage";

import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardProducts from "./pages/dashboard/DashboardProducts";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import CreateProduct from "./pages/dashboard/CreateProduct";
import EditProduct from "./pages/dashboard/EditProduct";
import DashboardSales from "./pages/dashboard/DashboardSales";
import SaleDetail from "./pages/dashboard/SaleDetail";
import DashboardClients from "./pages/dashboard/DashboardClients";
import DashboardRevenue from "./pages/dashboard/DashboardRevenue";
import DashboardAnalytics from "./pages/dashboard/DashboardAnalytics";
import DashboardMarketing from "./pages/dashboard/DashboardMarketing";
import DashboardAffiliation from "./pages/dashboard/DashboardAffiliation";
import DashboardAutomations from "./pages/dashboard/DashboardAutomations";
import DashboardWebhooks from "./pages/dashboard/DashboardWebhooks";
import DashboardLicenses from "./pages/dashboard/DashboardLicenses";
import DashboardWithdrawals from "./pages/dashboard/DashboardWithdrawals";
import WithdrawNew from "./pages/dashboard/WithdrawNew";
import Wallet from "./pages/dashboard/Wallet";
import WalletAccounts from "./pages/dashboard/WalletAccounts";
import DashboardKYC from "./pages/dashboard/DashboardKYC";
import AdminKYC from "./pages/dashboard/AdminKYC";
import AdminUsers from "./pages/dashboard/AdminUsers";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminWithdrawals from "./pages/dashboard/AdminWithdrawals";
import AdminSupport from "./pages/dashboard/AdminSupport";
import AdminModeration from "./pages/dashboard/AdminModeration";
import DashboardStores from "./pages/dashboard/DashboardStores";

import DashboardBadge from "./pages/dashboard/DashboardBadge";
import AdminBadges from "./pages/dashboard/AdminBadges";

import { Route as Login } from "./dukaio-site/pages/connexion";
import { Route as Signup } from "./dukaio-site/pages/inscription";
import { Route as Reset } from "./dukaio-site/pages/reinitialiser-mot-de-passe";
import {
  isStoreSubdomain,
  isDashboardSubdomain,
  isBuyerSubdomain,
  getDashboardUrl,
  getBuyerPortalUrl,
} from "@/lib/subdomain";

import DashboardSupport from "./pages/dashboard/DashboardSupport";
import DashboardMenu from "./pages/dashboard/DashboardMenu";
import DashboardTools from "./pages/dashboard/DashboardTools";
import Nova from "./pages/dashboard/Nova";
import Onboarding from "./pages/Onboarding";
import VerifyOtp from "./pages/VerifyOtp";
import NotFound from "./pages/NotFound";
import SupportChatbot from "./components/SupportChatbot";

const queryClient = new QueryClient();

const AnalyticsWrapper = () => {
  useAnalytics();
  return null;
};

const ScrollToHashElement = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [hash]);
  return null;
};

// Strict theme isolation: Dark mode ONLY on /dashboard routes, NEVER on public pages
const ThemeRouteSync = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const isDashboard = isDashboardSubdomain() || pathname.startsWith("/dashboard");
    if (!isDashboard) {
      document.documentElement.classList.remove("dark");
    } else {
      const saved = localStorage.getItem("dukaio-theme");
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [pathname]);

  return null;
};

const ConditionalSupportChatbot = () => {
  const { pathname } = useLocation();
  if (isDashboardSubdomain()) return null;
  const isMarketing =
    pathname === "/" ||
    pathname.startsWith("/produits") ||
    pathname.startsWith("/legal") ||
    pathname === "/connexion" ||
    pathname === "/inscription" ||
    pathname === "/reinitialiser-mot-de-passe";
  if (isMarketing) return null;
  return <SupportChatbot />;
};

const NavigateToDashboard = ({ path = "" }: { path?: string }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    const target = path || pathname;
    window.location.replace(getDashboardUrl(target));
  }, [path, pathname]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
};

const NavigateToBuyer = ({ path = "" }: { path?: string }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    const target = path || pathname;
    window.location.replace(getBuyerPortalUrl(target));
  }, [path, pathname]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
};

const BuyerOrderDetailRedirect = () => {
  const { orderId } = useParams();
  useEffect(() => {
    window.location.replace(getBuyerPortalUrl(orderId ? `/${orderId}` : "/mes-achats"));
  }, [orderId]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
};

const App = () => {
  const isDashboard = isDashboardSubdomain();
  const isBuyer = isBuyerSubdomain();
  const isStore = isStoreSubdomain();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DomainMigrationBanner />
          <ThemeRouteSync />
          <AnalyticsWrapper />
          <ScrollToTop />
          <ScrollToHashElement />
          <AuthProvider>
            {isDashboard ? (
              <Routes>
                {/* ─── CREATOR & ADMIN DASHBOARD SUBDOMAIN (dashboard.dukaio.com) ─── */}
                <Route path="/" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />

                {/* Products */}
                <Route path="/products" element={<ProtectedRoute><DashboardProducts /></ProtectedRoute>} />
                <Route path="/dashboard/products" element={<ProtectedRoute><DashboardProducts /></ProtectedRoute>} />
                <Route path="/products/new" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
                <Route path="/dashboard/products/new" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
                <Route path="/products/:id/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
                <Route path="/dashboard/products/:id/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />

                {/* Sales & Orders */}
                <Route path="/sales" element={<ProtectedRoute><DashboardSales /></ProtectedRoute>} />
                <Route path="/dashboard/sales" element={<ProtectedRoute><DashboardSales /></ProtectedRoute>} />
                <Route path="/sales/:orderId" element={<ProtectedRoute><SaleDetail /></ProtectedRoute>} />
                <Route path="/dashboard/sales/:orderId" element={<ProtectedRoute><SaleDetail /></ProtectedRoute>} />

                {/* Clients & Licenses */}
                <Route path="/clients" element={<ProtectedRoute><DashboardClients /></ProtectedRoute>} />
                <Route path="/dashboard/clients" element={<ProtectedRoute><DashboardClients /></ProtectedRoute>} />
                <Route path="/licenses" element={<ProtectedRoute><DashboardLicenses /></ProtectedRoute>} />
                <Route path="/dashboard/licenses" element={<ProtectedRoute><DashboardLicenses /></ProtectedRoute>} />

                {/* Revenue, Wallet & Withdrawals */}
                <Route path="/revenue" element={<ProtectedRoute><DashboardRevenue /></ProtectedRoute>} />
                <Route path="/dashboard/revenue" element={<ProtectedRoute><DashboardRevenue /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/dashboard/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/wallet/accounts" element={<ProtectedRoute><WalletAccounts /></ProtectedRoute>} />
                <Route path="/dashboard/wallet/accounts" element={<ProtectedRoute><WalletAccounts /></ProtectedRoute>} />
                <Route path="/withdrawals" element={<ProtectedRoute><DashboardWithdrawals /></ProtectedRoute>} />
                <Route path="/dashboard/withdrawals" element={<ProtectedRoute><DashboardWithdrawals /></ProtectedRoute>} />
                <Route path="/withdrawals/new" element={<ProtectedRoute><WithdrawNew /></ProtectedRoute>} />
                <Route path="/dashboard/withdrawals/new" element={<ProtectedRoute><WithdrawNew /></ProtectedRoute>} />

                {/* Settings, Profile, Appearance & Stores */}
                <Route path="/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
                <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
                <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
                <Route path="/appearance" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
                <Route path="/dashboard/appearance" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
                <Route path="/stores" element={<ProtectedRoute><DashboardStores /></ProtectedRoute>} />
                <Route path="/dashboard/stores" element={<ProtectedRoute><DashboardStores /></ProtectedRoute>} />

                {/* Growth, Analytics, Marketing & Tools */}
                <Route path="/analytics" element={<ProtectedRoute><DashboardAnalytics /></ProtectedRoute>} />
                <Route path="/dashboard/analytics" element={<ProtectedRoute><DashboardAnalytics /></ProtectedRoute>} />
                <Route path="/marketing" element={<ProtectedRoute><DashboardMarketing /></ProtectedRoute>} />
                <Route path="/dashboard/marketing" element={<ProtectedRoute><DashboardMarketing /></ProtectedRoute>} />
                <Route path="/affiliation" element={<ProtectedRoute><DashboardAffiliation /></ProtectedRoute>} />
                <Route path="/dashboard/affiliation" element={<ProtectedRoute><DashboardAffiliation /></ProtectedRoute>} />
                <Route path="/automations" element={<ProtectedRoute><DashboardAutomations /></ProtectedRoute>} />
                <Route path="/dashboard/automations" element={<ProtectedRoute><DashboardAutomations /></ProtectedRoute>} />
                <Route path="/webhooks" element={<ProtectedRoute><DashboardWebhooks /></ProtectedRoute>} />
                <Route path="/dashboard/webhooks" element={<ProtectedRoute><DashboardWebhooks /></ProtectedRoute>} />
                <Route path="/badge" element={<ProtectedRoute><DashboardBadge /></ProtectedRoute>} />
                <Route path="/dashboard/badge" element={<ProtectedRoute><DashboardBadge /></ProtectedRoute>} />
                <Route path="/kyc" element={<ProtectedRoute><DashboardKYC /></ProtectedRoute>} />
                <Route path="/dashboard/kyc" element={<ProtectedRoute><DashboardKYC /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><DashboardSupport /></ProtectedRoute>} />
                <Route path="/dashboard/support" element={<ProtectedRoute><DashboardSupport /></ProtectedRoute>} />
                <Route path="/menu" element={<ProtectedRoute><DashboardMenu /></ProtectedRoute>} />
                <Route path="/dashboard/menu" element={<ProtectedRoute><DashboardMenu /></ProtectedRoute>} />
                <Route path="/tools" element={<ProtectedRoute><DashboardTools /></ProtectedRoute>} />
                <Route path="/dashboard/tools" element={<ProtectedRoute><DashboardTools /></ProtectedRoute>} />
                <Route path="/nova" element={<ProtectedRoute><Nova /></ProtectedRoute>} />
                <Route path="/dashboard/nova" element={<ProtectedRoute><Nova /></ProtectedRoute>} />

                {/* Onboarding & Security */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/verify-otp" element={<ProtectedRoute><VerifyOtp /></ProtectedRoute>} />

                {/* Administration */}
                <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="/dashboard/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="/admin-kyc" element={<AdminProtectedRoute><AdminKYC /></AdminProtectedRoute>} />
                <Route path="/dashboard/admin-kyc" element={<AdminProtectedRoute><AdminKYC /></AdminProtectedRoute>} />
                <Route path="/admin-users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
                <Route path="/dashboard/admin-users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
                <Route path="/admin-withdrawals" element={<AdminProtectedRoute><AdminWithdrawals /></AdminProtectedRoute>} />
                <Route path="/dashboard/admin-withdrawals" element={<AdminProtectedRoute><AdminWithdrawals /></AdminProtectedRoute>} />
                <Route path="/admin-support" element={<AdminProtectedRoute><AdminSupport /></AdminProtectedRoute>} />
                <Route path="/dashboard/admin-support" element={<AdminProtectedRoute><AdminSupport /></AdminProtectedRoute>} />
                <Route path="/admin-moderation" element={<AdminProtectedRoute><AdminModeration /></AdminProtectedRoute>} />
                <Route path="/dashboard/admin-moderation" element={<AdminProtectedRoute><AdminModeration /></AdminProtectedRoute>} />
                <Route path="/admin-badges" element={<AdminProtectedRoute><AdminBadges /></AdminProtectedRoute>} />
                <Route path="/dashboard/admin-badges" element={<AdminProtectedRoute><AdminBadges /></AdminProtectedRoute>} />

                {/* Auth directly on dashboard domain */}
                <Route path="/connexion" element={<Login.Page />} />
                <Route path="/login" element={<Login.Page />} />
                <Route path="/inscription" element={<Signup.Page />} />
                <Route path="/signup" element={<Signup.Page />} />
                <Route path="/reinitialiser-mot-de-passe" element={<Reset.Page />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            ) : isBuyer ? (
              <Routes>
                {/* ─── BUYER PORTAL (achat.dukaio.com) ─── */}
                <Route path="/" element={<BuyerProtectedRoute><BuyerDashboard /></BuyerProtectedRoute>} />
                <Route path="/mes-achats" element={<BuyerProtectedRoute><BuyerDashboard /></BuyerProtectedRoute>} />
                <Route path="/orders" element={<BuyerProtectedRoute><BuyerDashboard /></BuyerProtectedRoute>} />
                <Route path="/buyer" element={<BuyerProtectedRoute><BuyerDashboard /></BuyerProtectedRoute>} />
                <Route path="/buyer/orders" element={<BuyerProtectedRoute><BuyerDashboard /></BuyerProtectedRoute>} />
                <Route path="/mes-achats/:orderId" element={<BuyerProtectedRoute><BuyerOrderDetail /></BuyerProtectedRoute>} />
                <Route path="/orders/:orderId" element={<BuyerProtectedRoute><BuyerOrderDetail /></BuyerProtectedRoute>} />
                <Route path="/:orderId" element={<BuyerProtectedRoute><BuyerOrderDetail /></BuyerProtectedRoute>} />

                {/* Buyer Login & OTP */}
                <Route path="/login" element={<BuyerLogin />} />
                <Route path="/connexion" element={<BuyerLogin />} />
                <Route path="/buyer-login" element={<BuyerLogin />} />
                <Route path="/buyer/login" element={<BuyerLogin />} />
                <Route path="/buyer-oauth-callback" element={<BuyerOAuthCallback />} />
                <Route path="/buyer-verify-otp" element={<BuyerVerifyOtp />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            ) : isStore ? (
              <Routes>
                {/* ─── CREATOR STOREFRONT (*.dukaio.com) ─── */}
                <Route path="/" element={<StorePage />} />
                <Route path="/legal" element={<StoreLegalPage kind="legal" />} />
                <Route path="/terms" element={<StoreLegalPage kind="terms" />} />
                <Route path="/privacy" element={<StoreLegalPage kind="privacy" />} />
                <Route path="/produit/:productId" element={<StoreProductDetail />} />
                <Route path="/product/:productId" element={<StoreProductDetail />} />
                <Route path="/checkout/:productId" element={<CheckoutPage />} />
                <Route path="/payment-callback" element={<PaymentCallback />} />

                {/* Redirect buyer portal from store */}
                <Route path="/buyer-login" element={<NavigateToBuyer path="/buyer-login" />} />
                <Route path="/buyer" element={<NavigateToBuyer path="/mes-achats" />} />
                <Route path="/mes-achats" element={<NavigateToBuyer path="/mes-achats" />} />

                {/* Legacy store paths */}
                <Route path="/store/:slug" element={<StorePage />} />
                <Route path="/store/:slug/legal" element={<StoreLegalPage kind="legal" />} />
                <Route path="/store/:slug/terms" element={<StoreLegalPage kind="terms" />} />
                <Route path="/store/:slug/privacy" element={<StoreLegalPage kind="privacy" />} />
                <Route path="/store/:slug/:productId" element={<StoreProductDetail />} />
                <Route path="/:productId" element={<StoreProductDetail />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            ) : (
              <Routes>
                {/* ─── MAIN SITE & MARKETPLACE (dukaio.com) ─── */}
                {dukaioSiteRoutes}

                {/* Redirections douces des anciens liens marketing */}
                <Route path="/pricing" element={<Navigate to="/#tarif" replace />} />

                {/* Pages publiques additionnelles */}
                <Route path="/products" element={<Products />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/marketplace" element={<SearchPage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<Navigate to="/#faq" replace />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />

                {/* Boutiques Vendeurs Publiques & Détail Produits */}
                <Route path="/store/:slug" element={<StorePage />} />
                <Route path="/store/:slug/legal" element={<StoreLegalPage kind="legal" />} />
                <Route path="/store/:slug/terms" element={<StoreLegalPage kind="terms" />} />
                <Route path="/store/:slug/privacy" element={<StoreLegalPage kind="privacy" />} />
                <Route path="/store/:slug/:productId" element={<StoreProductDetail />} />

                {/* Espace Acheteur redirection vers achat.dukaio.com */}
                <Route path="/buyer-login" element={<NavigateToBuyer path="/buyer-login" />} />
                <Route path="/buyer/login" element={<NavigateToBuyer path="/buyer-login" />} />
                <Route path="/buyer" element={<NavigateToBuyer path="/mes-achats" />} />
                <Route path="/buyer/orders" element={<NavigateToBuyer path="/mes-achats" />} />
                <Route path="/mes-achats" element={<NavigateToBuyer path="/mes-achats" />} />
                <Route path="/mes-achats/:orderId" element={<BuyerOrderDetailRedirect />} />
                <Route path="/buyer-oauth-callback" element={<BuyerOAuthCallback />} />
                <Route path="/buyer-verify-otp" element={<BuyerVerifyOtp />} />
                <Route path="/payment-callback" element={<PaymentCallback />} />
                <Route path="/checkout/:productId" element={<CheckoutPage />} />

                {/* Espace Vendeur redirection vers dashboard.dukaio.com */}
                <Route path="/dashboard" element={<NavigateToDashboard path="/dashboard" />} />
                <Route path="/dashboard/*" element={<NavigateToDashboard />} />
                <Route path="/onboarding" element={<NavigateToDashboard path="/onboarding" />} />
                <Route path="/verify-otp" element={<NavigateToDashboard path="/verify-otp" />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            )}
            <ConditionalSupportChatbot />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
