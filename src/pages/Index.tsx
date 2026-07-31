import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Sparkles, Store, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import HeroSection from "@/components/HeroSection";
import MarqueeCategories from "@/components/MarqueeCategories";
import ProductShowcase from "@/components/ProductShowcase";
import FeaturesSection from "@/components/FeaturesSection";
import TrustSection from "@/components/TrustSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FounderQuote from "@/components/FounderQuote";
import CTASection from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import {
  MarketplaceProductCard,
  MarketplaceProduct,
} from "@/components/marketplace/MarketplaceProductCard";

const Index = () => {
  const { user, loading } = useAuth();
  const [topProducts, setTopProducts] = useState<MarketplaceProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const base = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketplace-search`;
        const headers = { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY };
        const res = await fetch(`${base}?sort=popular&limit=8`, { headers }).then((r) => r.json());
        setTopProducts(res?.products || []);
      } catch (e) {
        console.error("Top products fetch error", e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchTop();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        canonicalPath="/"
        title="Dukaio · Vendez vos produits numériques en Afrique"
        description="La plateforme #1 pour vendre fichiers, formations et licences en ligne. Mobile Money intégré, paiements rapides, marketplace puissante."
      />
      <Navbar />

      {/* HERO + Platform preview + steps + stats */}
      <HeroSection />

      {/* MARKETPLACE TEASER */}
      <section className="relative overflow-hidden border-y border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
        <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
          >
            <div>
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Marketplace
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
                Découvrez la marketplace <span className="text-gradient">Dukaio</span>
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
                Des milliers de produits numériques de créateurs africains. Recherche par texte ou par image.
              </p>
            </div>
            <Link to="/marketplace">
              <Button size="lg" className="rounded-full gap-2 shadow-lg shadow-primary/25">
                Explorer la marketplace <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          ) : topProducts.length > 0 ? (
            <>
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:hidden snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
                {topProducts.slice(0, 8).map((p, i) => (
                  <div key={p.id} className="snap-start">
                    <MarketplaceProductCard product={p} index={i} fixedWidth />
                  </div>
                ))}
              </div>
              <div className="hidden grid-cols-3 gap-4 sm:grid md:grid-cols-4">
                {topProducts.slice(0, 8).map((p, i) => (
                  <MarketplaceProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/marketplace">
              <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                <TrendingUp className="h-4 w-4" /> Top produits
              </Button>
            </Link>
            <Link to="/buyer-login">
              <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                <ShoppingBag className="h-4 w-4" /> Mes achats
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                <Store className="h-4 w-4" /> Devenir vendeur
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MarqueeCategories />
      <ProductShowcase />
      <FeaturesSection />
      <TrustSection />
      <TestimonialsSection />
      <FounderQuote />
      <CTASection />

      <Footer />
    </div>
  );
};

export default Index;
