import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Store,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  Shield,
  Zap,
  CreditCard,
  Fingerprint,
  BadgeCheck,
  Lock,
  Megaphone,
  Mail,
  BarChart3,
  Tag,
  Globe,
  Users,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { MarketplaceSearchBar } from "@/components/marketplace/MarketplaceSearchBar";
import {
  MarketplaceProductCard,
  MarketplaceProduct,
} from "@/components/marketplace/MarketplaceProductCard";
import {
  MARKETPLACE_CATEGORIES,
  PRODUCT_TYPES,
} from "@/data/marketplaceCategories";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/marketplace-hero.jpg";

const Marketplace = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const [topProducts, setTopProducts] = useState<MarketplaceProduct[]>([]);
  const [newProducts, setNewProducts] = useState<MarketplaceProduct[]>([]);
  const [recommended, setRecommended] = useState<MarketplaceProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const base = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketplace-search`;
        const headers = { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY };

        const [popRes, newRes, recoRes] = await Promise.all([
          fetch(`${base}?sort=popular&limit=12`, { headers }).then((r) => r.json()),
          fetch(`${base}?sort=recent&limit=12`, { headers }).then((r) => r.json()),
          fetch(`${base}?sort=relevance&limit=12`, { headers }).then((r) => r.json()),
        ]);

        setTopProducts(popRes?.products || []);
        setNewProducts(newRes?.products || []);
        setRecommended(recoRes?.products || []);
      } catch (e) {
        console.error("Marketplace fetch error", e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        canonicalPath="/marketplace"
        title="Marketplace Dukaio · Produits numériques vérifiés"
        description="La marketplace #1 de produits numériques en Afrique. Vendeurs vérifiés KYC, paiements mobile money sécurisés, fichiers, formations et licences."
      />
      <Navbar />

      {/* HERO MARKETPLACE — IMAGE BANNER */}
      <section className="relative overflow-hidden">
        <div className="relative">
          <img
            src={heroImage}
            alt="Dukaio — marketplace de produits numériques sécurisée"
            width={1920}
            height={1024}
            className="h-[340px] w-full object-cover sm:h-[440px] md:h-[560px]"
          />
          {/* gradient overlays for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/40" />
        </div>

        {/* floating search & ctas */}
        <div className="container relative mx-auto -mt-32 px-4 sm:-mt-40 md:-mt-56">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent backdrop-blur sm:text-xs">
              <Sparkles className="h-3 w-3" /> Marketplace #1 de produits numériques en Afrique
            </span>
            <h1 className="mb-3 text-3xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Achetez en confiance.{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Vendez sans limite.
              </span>
            </h1>
            <p className="mx-auto mb-6 max-w-xl text-sm text-muted-foreground sm:text-base md:text-lg">
              Fichiers, formations, licences. Vendeurs vérifiés par KYC, paiements chiffrés,
              livraison instantanée.
            </p>

            <div className="rounded-2xl border border-border/60 bg-background/80 p-2 shadow-2xl backdrop-blur-xl sm:p-3">
              <MarketplaceSearchBar />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <Link to="/buyer-login">
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 backdrop-blur">
                  <ShoppingBag className="h-4 w-4" /> Mes achats
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="rounded-full gap-1.5 shadow-lg shadow-primary/30">
                  <Store className="h-4 w-4" /> Devenir vendeur
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* TRUST BENEFITS BAR */}
        <div className="container mx-auto px-4 pb-2 pt-10 sm:pt-14">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {[
              { icon: Fingerprint, label: "Vendeurs vérifiés KYC", desc: "Identité confirmée" },
              { icon: BadgeCheck, label: "Badges Verified", desc: "Standard, Pro, Premium" },
              { icon: Lock, label: "Paiements chiffrés", desc: "PCI-DSS · Mobile money" },
              { icon: Shield, label: "Anti-fraude IA", desc: "Modération 24/7" },
            ].map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-card/60 p-3 backdrop-blur sm:gap-3 sm:p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 sm:h-10 sm:w-10">
                  <b.icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-foreground sm:text-sm">
                    {b.label}
                  </div>
                  <div className="truncate text-[10px] text-muted-foreground sm:text-xs">
                    {b.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK PILLS */}
      <section className="border-y border-border bg-card/40 py-4">
        <div className="container mx-auto px-4">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:justify-center sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => navigate("/search")}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background sm:text-sm"
            >
              ✨ Tout
            </button>
            {PRODUCT_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => navigate(`/search?type=${t.key}`)}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary sm:text-sm"
              >
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
            <button
              onClick={() => navigate(`/search?verified=any`)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-accent/50 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent sm:text-sm"
            >
              <BadgeCheck className="h-3.5 w-3.5" /> Vendeurs Verified
            </button>
            {MARKETPLACE_CATEGORIES.slice(0, 4).map((c) => (
              <button
                key={c.key}
                onClick={() => navigate(`/search?category=${c.key}`)}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:text-sm"
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES — compact horizontal */}
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground sm:text-lg md:text-xl">
                Explorez par catégorie
              </h2>
              <p className="line-clamp-1 text-[11px] text-muted-foreground sm:text-xs">
                Trouvez exactement ce dont vous avez besoin
              </p>
            </div>
            <Link
              to="/search"
              className="shrink-0 text-xs font-semibold text-primary hover:underline"
            >
              Voir tout →
            </Link>
          </div>

          <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {MARKETPLACE_CATEGORIES.map((c, i) => (
              <motion.button
                key={c.key}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/search?category=${c.key}`)}
                className="group relative flex w-[120px] shrink-0 snap-start flex-col items-center gap-1.5 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-secondary/40 p-3 text-center transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg hover:shadow-primary/10 active:scale-95 sm:w-[130px] sm:p-3.5"
              >
                <div className="absolute -right-2 -top-2 h-10 w-10 rounded-full bg-primary/5 transition-all group-hover:bg-primary/15" />
                <span className="relative text-2xl">{c.emoji}</span>
                <div className="relative text-[12px] font-semibold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-[13px]">
                  {c.label}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* TOP PRODUCTS */}
      <ProductSection
        title="Top produits"
        subtitle="Les best-sellers du moment"
        icon={<TrendingUp className="h-4 w-4 text-primary sm:h-5 sm:w-5" />}
        products={topProducts}
        loading={loadingProducts}
        ctaLink="/search?sort=popular"
      />

      {/* VERIFIED PROMO STRIP */}
      <section className="container mx-auto px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-5 sm:p-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary text-primary-foreground shadow-lg">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground sm:text-lg">
                  Achetez auprès de vendeurs <span className="text-accent">Verified</span>
                </h3>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Identité confirmée, KYC validé, garantie de remboursement renforcée.
                </p>
              </div>
            </div>
            <Link to="/search?verified=any">
              <Button size="sm" className="rounded-full gap-1.5 shadow-md">
                Voir les vendeurs vérifiés <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* NEW */}
      <ProductSection
        title="Nouveautés"
        subtitle="Les derniers ajouts de nos créateurs"
        icon={<Clock className="h-4 w-4 text-primary sm:h-5 sm:w-5" />}
        products={newProducts}
        loading={loadingProducts}
        ctaLink="/search?sort=recent"
      />

      {/* RECOMMENDED */}
      <ProductSection
        title="Recommandés pour vous"
        subtitle="Une sélection de la marketplace"
        icon={<Sparkles className="h-4 w-4 text-primary sm:h-5 sm:w-5" />}
        products={recommended}
        loading={loadingProducts}
        ctaLink="/search"
      />

      {/* MARKETING TOOLS — VENDOR POWER SECTION */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary sm:text-xs">
              <Megaphone className="h-3 w-3" /> Outils marketing intégrés
            </span>
            <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              Tout pour <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">vendre plus</span>
            </h2>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
              Une suite marketing puissante incluse dans chaque boutique Dukaio.
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {[
              { icon: Mail, title: "Email campagnes", desc: "Envoyez des newsletters ciblées à vos clients via Resend." },
              { icon: Tag, title: "Codes promo & remises", desc: "Créez des coupons illimités pour booster vos ventes." },
              { icon: BarChart3, title: "Analytics avancées", desc: "Suivez chiffre d'affaires, conversions et top produits." },
              { icon: Users, title: "Programme d'affiliation", desc: "Recrutez des affiliés et payez à la commission." },
              { icon: Globe, title: "Domaine personnalisé", desc: "Connectez votre propre domaine en 1 clic (Cloudflare)." },
              { icon: Zap, title: "Pixels & automations", desc: "Meta, TikTok, Google Ads · webhooks Telegram & Zapier." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 text-base font-bold text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground sm:text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST KPIs */}
      <section className="border-y border-border bg-card/40 py-10">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 text-center sm:grid-cols-4">
          {[
            { value: "10%", label: "Commission unique" },
            { value: "5 jours", label: "Délai de maturité" },
            { value: "100%", label: "Vendeurs KYC" },
            { value: "24/7", label: "Modération IA" },
          ].map((k) => (
            <div key={k.label}>
              <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-bold text-transparent sm:text-3xl md:text-4xl">
                {k.value}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{k.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Devenir vendeur */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-6 text-center text-primary-foreground shadow-2xl sm:p-10 md:p-14">
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <Store className="relative mx-auto mb-3 h-9 w-9 sm:h-10 sm:w-10" />
          <h2 className="relative mb-2 text-xl font-bold sm:mb-3 sm:text-2xl md:text-4xl">
            Vendez vos produits numériques sur Dukaio
          </h2>
          <p className="relative mx-auto mb-5 max-w-xl text-xs opacity-90 sm:mb-6 sm:text-sm md:text-base">
            Lancez votre boutique en quelques minutes. Commission unique de 10%, paiements mobile
            money intégrés, suite marketing complète.
          </p>
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="rounded-full gap-2 shadow-lg">
                Ouvrir ma boutique <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20"
              >
                Voir les tarifs
              </Button>
            </Link>
          </div>
          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] opacity-80 sm:text-xs">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Sans abonnement
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Paiements automatiques
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Support FR 24/7
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const ProductSection = ({
  title,
  subtitle,
  icon,
  products,
  loading,
  ctaLink,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  products: MarketplaceProduct[];
  loading: boolean;
  ctaLink: string;
}) => {
  if (!loading && products.length === 0) return null;

  return (
    <section className="py-6 sm:py-10">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex items-end justify-between sm:mb-6">
          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-2 sm:mb-1">
              {icon}
              <h2 className="text-lg font-bold text-foreground sm:text-xl md:text-2xl">
                {title}
              </h2>
            </div>
            <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">
              {subtitle}
            </p>
          </div>
          <Link
            to={ctaLink}
            className="shrink-0 text-xs font-semibold text-primary hover:underline sm:text-sm"
          >
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-secondary"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Mobile: horizontal scroll */}
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:hidden snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {products.slice(0, 12).map((p, i) => (
                <div key={p.id} className="snap-start">
                  <MarketplaceProductCard product={p} index={i} fixedWidth />
                </div>
              ))}
            </div>
            {/* Tablet/desktop: grid */}
            <div className="hidden grid-cols-3 gap-4 sm:grid md:grid-cols-4">
              {products.slice(0, 8).map((p, i) => (
                <MarketplaceProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Marketplace;
