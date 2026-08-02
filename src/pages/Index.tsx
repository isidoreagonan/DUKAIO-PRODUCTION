import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Hero } from '../components/marketing/Hero';
import { HeroFeature } from '../components/marketing/HeroFeature';
import { TrustBar } from '../components/marketing/TrustBar';
import { StatsBar } from '../components/marketing/StatsBar';
import { MarketplaceGrid } from '../components/marketing/MarketplaceGrid';
import { CategoryTicker } from '../components/marketing/CategoryTicker';
import { Benefits } from '../components/marketing/Benefits';
import { HowItWorks } from '../components/marketing/HowItWorks';
import { Features } from '../components/marketing/Features';
import ProductShowcase from "@/components/ProductShowcase";
import { UseCases } from '../components/marketing/UseCases';
import { CreatorJourney } from '../components/marketing/CreatorJourney';
import { PaymentMethodsOverview } from '../components/marketing/PaymentMethodsOverview';
import { GlobalReach } from '../components/marketing/GlobalReach';
import { ROICalculator } from '../components/marketing/ROICalculator';
import { Community } from '../components/marketing/Community';
import { Security } from '../components/marketing/Security';
import { FounderQuote } from '../components/marketing/FounderQuote';
import { Testimonials } from '../components/marketing/Testimonials';
import { TractionStats } from '../components/marketing/TractionStats';
import { FAQ } from '../components/marketing/FAQ';
import { FinalCTA } from '../components/marketing/FinalCTA';

import { heroStats } from '../components/marketing/data';
import { ProductItem } from '../components/marketing/types';
import { ProductCheckoutModal, DemoModal } from '../components/marketing/InteractiveModals';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [dynamicProducts, setDynamicProducts] = useState<ProductItem[] | null>(null);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const base = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketplace-search`;
        const res = await fetch(`${base}?sort=popular&limit=6`, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }
        });
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        const json = await res.json();
        const data = json.products;
        
        if (data && data.length > 0) {
          const stripHtml = (html: string) => html ? html.replace(/<[^>]*>?/gm, '') : "";
          const colors = ["#2557D6", "#152A52", "#E86F3E", "#22C55E", "#8B5CF6", "#F59E0B"];
          const mappedProducts: ProductItem[] = data.map((p: any, i: number) => ({
            id: p.id,
            titre: p.title,
            description: stripHtml(p.description) || "Un produit fantastique sur Dukaio.",
            prix: p.price ? `${p.price} FCFA` : "Gratuit",
            categorie: p.category || p.type || "Digital",
            couleur: colors[i % colors.length],
            image: p.thumbnail_url,
            vendeur: p.store?.display_name || "Créateur"
          }));
          setDynamicProducts(mappedProducts);
        } else {
          setDynamicProducts([]); // Empty array so it doesn't fallback to mock data
        }
      } catch (err) {
        console.error("Failed to fetch popular products:", err);
        setDynamicProducts([]); // Prevent mock fallback
      }
    };
    fetchPopularProducts();
  }, []);

  const handleOpenAuth = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };
  
  const handleOpenDemo = () => setDemoModalOpen(true);
  
  const handleSelectProduct = (product: ProductItem) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-white text-ink font-sans antialiased selection:bg-blue-tint selection:text-blue-deep overflow-x-hidden">
      {/* 1. Header (Vrai Navbar Dukaio) */}
      <Navbar />

      <main className="pt-20">
        <Hero onOpenAuthModal={handleOpenAuth} onOpenDemoModal={handleOpenDemo} />
        <HeroFeature onLearnMore={() => navigate('/about')} />
        <TrustBar />
        <StatsBar stats={heroStats} columns={4} />
        
        {/* L'accroche : pour qui, et que peut-on vendre */}
        <UseCases />
        <ProductShowcase />
        
        {/* Preuve que ça marche : la marketplace */}
        <MarketplaceGrid onSelectProduct={handleSelectProduct} products={dynamicProducts || undefined} />
        <CategoryTicker />

        {/* Pourquoi Dukaio ? L'argument financier et local */}
        <ROICalculator />
        <PaymentMethodsOverview />
        <GlobalReach />

        {/* Le produit technique */}
        <Features />
        <Benefits />
        <Security />

        {/* Comment ça marche & Parcours */}
        <CreatorJourney />
        <HowItWorks />

        {/* Preuve sociale ultime & Mission */}
        <Testimonials />
        <TractionStats />
        <FounderQuote />
        <Community />

        <FAQ />
        <FinalCTA onOpenAuthModal={handleOpenAuth} />
      </main>

      {/* 17. Footer */}
      <Footer />

      {/* Interactive Modals */}
      <ProductCheckoutModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <DemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
}
