import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Fichiers from "./pages/Fichiers";
import Cours from "./pages/Cours";
import LicencesPage from "./pages/LicencesPage";

import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Pricing from "./pages/Pricing";
import Partners from "./pages/Partners";
import Documentation from "./pages/Documentation";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import LegalNotice from "./pages/LegalNotice";
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
import AdminKYC from "./pages/dashboard/AdminKYC";
import AdminUsers from "./pages/dashboard/AdminUsers";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminWithdrawals from "./pages/dashboard/AdminWithdrawals";
import AdminSupport from "./pages/dashboard/AdminSupport";
import AdminModeration from "./pages/dashboard/AdminModeration";
import DashboardStores from "./pages/dashboard/DashboardStores";

import DashboardBadge from "./pages/dashboard/DashboardBadge";
import AdminBadges from "./pages/dashboard/AdminBadges";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnalyticsWrapper />
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/marketplace" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/fichiers" element={<Fichiers />} />
            <Route path="/cours" element={<Cours />} />
            <Route path="/licences" element={<LicencesPage />} />
            
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/legal" element={<LegalNotice />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/store/:slug" element={<StorePage />} />
            <Route path="/store/:slug/legal" element={<StoreLegalPage kind="legal" />} />
            <Route path="/store/:slug/terms" element={<StoreLegalPage kind="terms" />} />
            <Route path="/store/:slug/privacy" element={<StoreLegalPage kind="privacy" />} />
            <Route path="/store/:slug/:productId" element={<StoreProductDetail />} />
            <Route path="/buyer-login" element={<BuyerLogin />} />
            <Route path="/buyer/login" element={<BuyerLogin />} />
            <Route path="/buyer-oauth-callback" element={<BuyerOAuthCallback />} />
            <Route path="/buyer-verify-otp" element={<BuyerVerifyOtp />} />
            <Route path="/mes-achats" element={<BuyerProtectedRoute><BuyerDashboard /></BuyerProtectedRoute>} />
            <Route path="/mes-achats/:orderId" element={<BuyerProtectedRoute><BuyerOrderDetail /></BuyerProtectedRoute>} />
            <Route path="/payment-callback" element={<PaymentCallback />} />
            <Route path="/checkout/:productId" element={<CheckoutPage />} />
            
            <Route path="/verify-otp" element={<ProtectedRoute><VerifyOtp /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
            <Route path="/dashboard/products" element={<ProtectedRoute><DashboardProducts /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
            <Route path="/dashboard/products/new" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
            <Route path="/dashboard/products/:id/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
            <Route path="/dashboard/sales" element={<ProtectedRoute><DashboardSales /></ProtectedRoute>} />
            <Route path="/dashboard/sales/:orderId" element={<ProtectedRoute><SaleDetail /></ProtectedRoute>} />
            <Route path="/dashboard/clients" element={<ProtectedRoute><DashboardClients /></ProtectedRoute>} />
            <Route path="/dashboard/licenses" element={<ProtectedRoute><DashboardLicenses /></ProtectedRoute>} />
            <Route path="/dashboard/revenue" element={<ProtectedRoute><DashboardRevenue /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute><DashboardAnalytics /></ProtectedRoute>} />
            <Route path="/dashboard/marketing" element={<ProtectedRoute><DashboardMarketing /></ProtectedRoute>} />
            <Route path="/dashboard/affiliation" element={<ProtectedRoute><DashboardAffiliation /></ProtectedRoute>} />
            <Route path="/dashboard/automations" element={<ProtectedRoute><DashboardAutomations /></ProtectedRoute>} />
            <Route path="/dashboard/withdrawals" element={<ProtectedRoute><DashboardWithdrawals /></ProtectedRoute>} />
            <Route path="/dashboard/withdrawals/new" element={<ProtectedRoute><WithdrawNew /></ProtectedRoute>} />
            <Route path="/dashboard/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/dashboard/webhooks" element={<ProtectedRoute><DashboardWebhooks /></ProtectedRoute>} />
            <Route path="/dashboard/appearance" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
            <Route path="/dashboard/admin-kyc" element={<ProtectedRoute><AdminKYC /></ProtectedRoute>} />
            <Route path="/dashboard/admin-users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin-withdrawals" element={<ProtectedRoute><AdminWithdrawals /></ProtectedRoute>} />
            <Route path="/dashboard/admin-support" element={<ProtectedRoute><AdminSupport /></ProtectedRoute>} />
            <Route path="/dashboard/admin-moderation" element={<ProtectedRoute><AdminModeration /></ProtectedRoute>} />
            <Route path="/dashboard/stores" element={<ProtectedRoute><DashboardStores /></ProtectedRoute>} />
            
            <Route path="/dashboard/badge" element={<ProtectedRoute><DashboardBadge /></ProtectedRoute>} />
            <Route path="/dashboard/admin-badges" element={<ProtectedRoute><AdminBadges /></ProtectedRoute>} />
            
            <Route path="/dashboard/support" element={<ProtectedRoute><DashboardSupport /></ProtectedRoute>} />
            <Route path="/dashboard/menu" element={<ProtectedRoute><DashboardMenu /></ProtectedRoute>} />
            <Route path="/dashboard/tools" element={<ProtectedRoute><DashboardTools /></ProtectedRoute>} />
            <Route path="/dashboard/nova" element={<ProtectedRoute><Nova /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SupportChatbot />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
