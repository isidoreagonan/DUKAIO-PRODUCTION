import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Download,
  BookOpen,
  Key,
  FileDown,
  Heart,
  Lock,
  Mail,
  Package,
  Share2,
  ShoppingBag,
  Smartphone,
  Star,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTrackingPixels, trackEvent } from "@/hooks/useTrackingPixels";
import { useCurrency, convertFromXOF, formatMoney } from "@/lib/currency";
import { getStoreSubdomain, getStoreUrl, getBuyerPortalUrl } from "@/lib/subdomain";
import { normalizeShopConfig, shopStyle, type ShopConfig } from "@/lib/shopConfig";
import { processDescriptionWithVideos } from "@/components/RichTextEditor";
import ProductReviewsSection from "@/components/store/ProductReviewsSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

import mtnLogo from "@/assets/payment-logos/providers/mtn.png";
import moovLogo from "@/assets/payment-logos/providers/moov.png";
import orangeLogo from "@/assets/payment-logos/providers/orange.png";
import celtiisLogo from "@/assets/payment-logos/providers/celtiis.png";
import airtelLogo from "@/assets/payment-logos/providers/airtel.png";
import mpesaLogo from "@/assets/payment-logos/providers/mpesa.png";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  store_slug: string | null;
  store_description: string | null;
  store_logo_url: string | null;
  contact: string | null;
  facebook_pixel_id?: string | null;
  tiktok_pixel_id?: string | null;
  google_ads_id?: string | null;
  theme_config?: any;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  type: string;
  thumbnail_url: string | null;
  is_published: boolean;
  download_url: string | null;
  course_content_type: string | null;
  sales_count?: number | null;
  category?: string | null;
  hide_sales_count?: boolean | null;
}

export default function StoreProductDetail() {
  const { slug: paramSlug, productId } = useParams();
  const subSlug = getStoreSubdomain();
  const slug = (subSlug || paramSlug || "").trim();
  const cleanSlug = slug.toLowerCase().replace(/\s+/g, "-");
  const cleanProductId = (productId || "").trim().replace(/\s+/g, "-");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [storeData, setStoreData] = useState<any | null>(null);
  const [themeConfig, setThemeConfig] = useState<ShopConfig | null>(null);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [lessons, setLessons] = useState<{ title: string; description: string | null; duration_minutes: number | null; position: number }[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const { countryCode, targetCurrency, isLocalDifferent, rates, formatDual } = useCurrency();

  // Always force light mode on public store pages
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  // Check wishlist state
  useEffect(() => {
    if (!product) return;
    try {
      const favs = JSON.parse(localStorage.getItem(`dukaio_fav_${cleanSlug}`) || "[]");
      setLiked(favs.includes(product.id));
    } catch {}
  }, [product, cleanSlug]);

  const toggleWishlist = () => {
    if (!product) return;
    try {
      const favs: string[] = JSON.parse(localStorage.getItem(`dukaio_fav_${cleanSlug}`) || "[]");
      const next = favs.includes(product.id) ? favs.filter((id) => id !== product.id) : [...favs, product.id];
      localStorage.setItem(`dukaio_fav_${cleanSlug}`, JSON.stringify(next));
      setLiked(next.includes(product.id));
      if (!favs.includes(product.id)) {
        toast.success("Produit ajouté à vos envies");
      } else {
        toast.info("Produit retiré de vos envies");
      }
    } catch {}
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Lien copié dans le presse-papier !");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!cleanProductId) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // 1. Fetch store
        let { data: store } = await supabase
          .from("stores")
          .select("*")
          .or(`slug.eq."${cleanSlug}",slug.eq."${slug}"`)
          .eq("is_archived", false)
          .maybeSingle();

        if (!store && slug) {
          const { data: storeByName } = await supabase
            .from("stores")
            .select("*")
            .ilike("name", slug.replace(/-/g, " "))
            .eq("is_archived", false)
            .maybeSingle();
          if (storeByName) store = storeByName;
        }

        let ownerId = store?.owner_id;

        // 2. Fetch product by cleanProductId
        let { data: prod } = await supabase
          .from("products")
          .select("*")
          .eq("id", cleanProductId)
          .eq("is_published", true)
          .maybeSingle();

        if (!prod && ownerId) {
          const { data: altProd } = await supabase
            .from("products")
            .select("*")
            .eq("creator_id", ownerId)
            .eq("is_published", true)
            .maybeSingle();
          prod = altProd;
        }

        if (!prod) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        if (!ownerId) {
          ownerId = prod.creator_id;
        }

        // 3. Fetch profile
        let { data: prof } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, store_slug, store_description, store_logo_url, contact, facebook_pixel_id, tiktok_pixel_id, google_ads_id, theme_config")
          .eq("id", ownerId)
          .maybeSingle();

        if (store) {
          setStoreData(store);
          if (!store.theme_config && prof?.theme_config) {
            store.theme_config = prof.theme_config;
          }
        } else if (prof) {
          store = {
            id: prof.id,
            owner_id: prof.id,
            name: prof.display_name || "Boutique",
            slug: prof.store_slug || cleanSlug,
            description: prof.store_description,
            logo_url: prof.store_logo_url,
            theme_config: prof.theme_config || null,
          };
          setStoreData(store);
        }

        setProfile(prof as Profile);
        setProduct(prod as Product);

        // Compute Theme Config
        const storeName = store?.name || prof?.display_name || "DUKAIO";
        const storeLogo = store?.logo_url || prof?.avatar_url || null;
        const config = normalizeShopConfig(store?.theme_config || prof?.theme_config, {
          name: storeName,
          slug: store?.slug || cleanSlug,
          logo: storeLogo,
          description: store?.description || prof?.store_description || "",
          hero: {
            title: storeName,
            height: "regular",
          },
        });
        setThemeConfig(config);

        // Track ViewContent
        trackEvent("ViewContent", {
          content_name: prod.title,
          content_ids: [prod.id],
          content_type: "product",
          value: prod.price,
          currency: "XOF",
        });

        // 4. Fetch FAQs
        const { data: faqData } = await supabase
          .from("product_faqs")
          .select("question, answer")
          .eq("product_id", prod.id)
          .order("position");
        if (faqData) setFaqs(faqData as any);

        // 5. Fetch lessons if course
        if (prod.type === "course") {
          const { data: lessonsData } = await supabase
            .from("course_lessons")
            .select("title, description, duration_minutes, position")
            .eq("product_id", prod.id)
            .order("position");
          if (lessonsData) setLessons(lessonsData as any);
        }

        // 6. Fetch related products
        const { data: related } = await supabase
          .from("products")
          .select("id, title, price, original_price, type, thumbnail_url, sales_count, category")
          .eq("creator_id", ownerId)
          .eq("is_published", true)
          .neq("id", prod.id)
          .order("created_at", { ascending: false })
          .limit(4);
        if (related) setRelatedProducts(related as any);
      } catch (err) {
        console.error("Error loading product detail:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cleanSlug, cleanProductId, slug]);

  useTrackingPixels({
    facebookPixelId: profile?.facebook_pixel_id,
    tiktokPixelId: profile?.tiktok_pixel_id,
    googleAdsId: profile?.google_ads_id,
  });

  const handleBuy = () => {
    if (!product) return;
    trackEvent("AddToCart", {
      content_name: product.title,
      content_ids: [product.id],
      content_type: "product",
      value: product.price,
      currency: "XOF",
    });
    const url = `/checkout/${product.id}?store=${encodeURIComponent(cleanSlug)}&country=${countryCode}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
      </div>
    );
  }

  if (notFound || !product || !themeConfig) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
        <Package className="h-16 w-16 text-gray-200 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
        <p className="text-gray-500 mb-6 max-w-sm">
          Ce produit n'est plus disponible ou a été déplacé.
        </p>
        <Link to={subSlug ? "/" : `/store/${cleanSlug}`}>
          <button className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:opacity-90">
            Retour à la boutique
          </button>
        </Link>
      </div>
    );
  }

  const storeName = storeData?.name || profile?.display_name || themeConfig.name;
  const sellerName = profile?.display_name || storeName;
  const homePath = subSlug ? "/" : `/store/${cleanSlug}`;
  const getProductHref = (id: string) => (subSlug ? `/${id}` : `/store/${cleanSlug}/${id}`);

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  const salesCount = product.sales_count || 14;
  const formatLabel =
    product.type === "course"
      ? "Formation vidéo"
      : product.type === "file"
      ? "Fichier numérique"
      : product.type === "license"
      ? "Licence & clé"
      : "Ressource digitale";

  const reassuranceText =
    product.type === "course"
      ? "Accès immédiat à la formation et à votre espace membre tout de suite après paiement."
      : product.type === "license"
      ? "Votre clé de licence envoyée par e-mail et accessible immédiatement après paiement."
      : "Le fichier à télécharger, tout de suite après le paiement, et un e-mail avec ton lien.";

  const paymentBadges = [
    { name: "Orange Money", img: orangeLogo },
    { name: "MTN Mobile Money", img: mtnLogo },
    { name: "Moov Money", img: moovLogo },
    { name: "Celtiis Cash", img: celtiisLogo },
    { name: "Airtel Money", img: airtelLogo },
    { name: "M-Pesa", img: mpesaLogo },
  ];

  return (
    <div
      className="min-h-screen bg-shop-bg font-shop-body text-shop-text transition-colors duration-200"
      style={shopStyle(themeConfig)}
    >
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-30 border-b border-shop-line bg-shop-bg/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to={homePath} className="flex min-w-0 items-center gap-2.5">
            {themeConfig.logo ? (
              <img src={themeConfig.logo} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-shop-text font-shop-display text-sm font-bold text-shop-bg">
                {themeConfig.name.trim().charAt(0) || "D"}
              </span>
            )}
            <span className="truncate font-shop-display text-[15px] font-bold uppercase tracking-[0.16em]">
              {themeConfig.name}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={liked ? "Retirer des envies" : "Garder dans mes envies"}
              onClick={toggleWishlist}
              className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-shop-surface"
            >
              <Heart
                className={`h-[18px] w-[18px] ${liked ? "fill-shop-accent text-shop-accent" : "text-shop-text"}`}
                strokeWidth={1.8}
              />
            </button>

            <a
              href={getBuyerPortalUrl("/mes-achats")}
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-shop-line text-xs font-semibold text-shop-text hover:bg-shop-surface transition-colors"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-shop-muted" />
              <span>Mes achats</span>
            </a>
          </div>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="mx-auto max-w-[1140px] px-4 pb-20 pt-5 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to={homePath}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-shop-muted hover:text-shop-text transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Tous les produits
        </Link>

        {/* 2-Column Product Grid */}
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Left Column: Sticky Square Product Image */}
          <div className="relative self-start overflow-hidden rounded-[var(--shop-radius)] bg-shop-surface lg:sticky lg:top-24">
            <img
              src={
                product.thumbnail_url ||
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&auto=format&fit=crop"
              }
              alt={product.title}
              className="aspect-square h-full w-full object-cover"
            />
            {discount && (
              <span className="absolute left-3.5 top-3.5 rounded-full bg-shop-accent px-3 py-1 text-xs font-bold text-shop-accent-foreground shadow-sm">
                -{discount}%
              </span>
            )}
            {salesCount > 15 && (
              <span className="absolute right-3.5 top-3.5 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                🔥 Populaire
              </span>
            )}
          </div>

          {/* Right Column: Details & Purchase Card */}
          <div className="min-w-0">
            {/* Format info */}
            <p className="flex items-center gap-1.5 text-xs text-shop-muted font-medium">
              <FileDown className="h-3.5 w-3.5" strokeWidth={1.8} />
              <span>{formatLabel}</span>
              <span>·</span>
              <span>Accès immédiat</span>
            </p>

            {/* Title */}
            <h1 className="mt-2.5 font-shop-display text-[26px] font-bold leading-tight tracking-tight sm:text-[32px] lg:text-[34px]">
              {product.title}
            </h1>

            {/* Seller & Rating metadata */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-shop-muted">
              <span>
                Par <span className="font-semibold text-shop-text underline underline-offset-2">{sellerName}</span>
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Star className="h-3.5 w-3.5 fill-shop-text text-shop-text" /> 5.0
              </span>
              {!product.hide_sales_count && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {salesCount} ventes
                </span>
              )}
            </div>

            {/* Price Row */}
            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="font-shop-display text-[30px] sm:text-[34px] font-bold tracking-tight">
                {formatMoney(product.price, "XOF")}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm text-shop-muted line-through">
                  {formatMoney(product.original_price, "XOF")}
                </span>
              )}
            </div>

            {/* Dual Currency if different */}
            {isLocalDifferent && (
              <p className="mt-1 text-xs text-shop-muted font-medium">
                Soit environ {formatMoney(convertFromXOF(product.price, targetCurrency, rates), targetCurrency)}
              </p>
            )}

            {/* Primary Action Button « Je le veux » */}
            <button
              type="button"
              onClick={handleBuy}
              className={`mt-6 h-[52px] w-full rounded-[min(var(--shop-radius),14px)] text-[15px] font-bold transition-all hover:opacity-90 active:scale-[0.99] shadow-sm ${
                themeConfig.appearance.buttons === "solid"
                  ? "bg-shop-accent text-shop-accent-foreground"
                  : "border border-shop-text bg-shop-text text-shop-bg"
              }`}
            >
              Je le veux
            </button>

            {/* Reassurance text */}
            <p className="mt-3.5 flex gap-2 text-[13px] leading-relaxed text-shop-muted">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-shop-text" />
              <span>{reassuranceText}</span>
            </p>

            {/* 3 Trust Badges Grid */}
            <div className="mt-5 grid grid-cols-3 divide-x divide-shop-line rounded-[min(var(--shop-radius),12px)] border border-shop-line bg-shop-surface/30">
              {[
                { icon: Smartphone, label: "Mobile Money ou carte" },
                { icon: Mail, label: "Reçu par e-mail" },
                { icon: ShoppingBag, label: "Retrouvé dans Mes achats" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 px-2 py-3.5 text-center text-[11px] sm:text-xs leading-tight font-medium"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-shop-surface">
                    <Icon className="h-3.5 w-3.5 text-shop-text" strokeWidth={1.8} />
                  </span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Wishlist & Share Row */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={toggleWishlist}
                className="flex h-11 items-center justify-center gap-2 rounded-[min(var(--shop-radius),12px)] border border-shop-line text-[13px] font-medium hover:border-shop-text transition-colors"
              >
                <Heart
                  className={`h-4 w-4 ${liked ? "fill-shop-accent text-shop-accent" : ""}`}
                  strokeWidth={1.6}
                />
                <span>{liked ? "Dans mes envies" : "Garder dans mes envies"}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex h-11 items-center justify-center gap-2 rounded-[min(var(--shop-radius),12px)] border border-shop-line text-[13px] font-medium hover:border-shop-text transition-colors"
              >
                <Share2 className="h-4 w-4" strokeWidth={1.6} />
                <span>{copied ? "Lien copié !" : "Partager"}</span>
              </button>
            </div>

            {/* Payment Trust Box */}
            <div className="mt-6 rounded-[min(var(--shop-radius),12px)] border border-shop-line bg-shop-surface/20">
              <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <Lock className="h-3.5 w-3.5" strokeWidth={1.8} /> Paiement 100 % sécurisé
                </p>
                <p className="text-[11px] text-shop-muted">Mobile Money ou carte</p>
              </div>

              {/* Payment operator logos */}
              <div className="flex flex-wrap items-center gap-2 px-4 pb-4 pt-3">
                {paymentBadges.map((p) => (
                  <span
                    key={p.name}
                    title={p.name}
                    className="grid h-9 w-[54px] place-items-center rounded-md border border-shop-line bg-white px-1 shadow-2xs"
                  >
                    <img src={p.img} alt={p.name} loading="lazy" className="max-h-5 max-w-full object-contain" />
                  </span>
                ))}
                {/* Visa & Mastercard badges */}
                <span className="grid h-9 w-[54px] place-items-center rounded-md border border-shop-line bg-[#1A1F71] px-1 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-white tracking-wider">VISA</span>
                </span>
                <span className="grid h-9 w-[54px] place-items-center rounded-md border border-shop-line bg-[#EB001B] px-1 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-white tracking-wider">MC</span>
                </span>
              </div>

              {/* Link to Buyer Portal */}
              <a
                href={getBuyerPortalUrl("/mes-achats")}
                className="group flex items-center justify-between border-t border-shop-line px-4 py-3 text-[13px] text-shop-muted hover:text-shop-text transition-colors"
              >
                <span>
                  Déjà acheté ? <span className="font-semibold text-shop-text">Retrouve-le dans Mes achats</span>
                </span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.6} />
              </a>
            </div>
          </div>
        </div>

        {/* ─── DESCRIPTION SECTION ─── */}
        {product.description && (
          <section className="mt-14 max-w-[760px] lg:mt-20">
            <h2 className="font-shop-display text-xl font-bold sm:text-2xl">Description</h2>
            <div
              dangerouslySetInnerHTML={{ __html: processDescriptionWithVideos(product.description) }}
              className="mt-4 prose prose-neutral max-w-none text-shop-text/80 text-[15px] leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:mb-1 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_img]:rounded-xl [&_img]:my-4"
            />
          </section>
        )}

        {/* ─── COURSE LESSONS (if applicable) ─── */}
        {product.type === "course" && lessons.length > 0 && (
          <section className="mt-12 max-w-[760px]">
            <h2 className="font-shop-display text-xl font-bold sm:text-2xl">Programme de la formation</h2>
            <p className="mt-1 text-sm text-shop-muted">{lessons.length} module(s) et leçon(s)</p>
            <div className="mt-4 divide-y divide-shop-line rounded-[var(--shop-radius)] border border-shop-line">
              {lessons.map((lesson, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4 p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-shop-surface text-xs font-semibold">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{lesson.title}</h3>
                      {lesson.description && (
                        <p className="mt-1 text-xs text-shop-muted">{lesson.description}</p>
                      )}
                    </div>
                  </div>
                  {lesson.duration_minutes && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-shop-muted">
                      <Clock className="h-3.5 w-3.5" /> {lesson.duration_minutes} min
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── FAQS SECTION (if applicable) ─── */}
        {faqs.length > 0 && (
          <section className="mt-12 max-w-[760px]">
            <h2 className="font-shop-display text-xl font-bold sm:text-2xl">Questions fréquentes</h2>
            <Accordion type="single" collapsible className="mt-4 space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="rounded-[var(--shop-radius)] border border-shop-line px-4"
                >
                  <AccordionTrigger className="text-sm font-semibold text-shop-text hover:no-underline py-4 text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-shop-muted pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* ─── REVIEWS SECTION ─── */}
        <section className="mt-14 max-w-[760px]">
          <ProductReviewsSection productId={product.id} brandColor="var(--shop-accent)" />
        </section>

        {/* ─── RELATED PRODUCTS ("Vous aimerez aussi") ─── */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-shop-line pt-12 sm:mt-20 sm:pt-14">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-shop-display text-xl font-bold sm:text-2xl">Vous aimerez aussi</h2>
              <Link to={homePath} className="text-[13px] text-shop-muted underline-offset-2 hover:text-shop-text hover:underline">
                Voir tout
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4 lg:gap-x-6">
              {relatedProducts.map((p) => {
                const relDiscount =
                  p.original_price && p.original_price > p.price
                    ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
                    : null;
                return (
                  <Link key={p.id} to={getProductHref(p.id)} className="group min-w-0">
                    <div className="relative aspect-square overflow-hidden rounded-[var(--shop-radius)] bg-shop-surface">
                      <img
                        src={
                          p.thumbnail_url ||
                          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop"
                        }
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      {relDiscount && (
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-shop-accent px-2 py-0.5 text-[11px] font-bold text-shop-accent-foreground shadow-xs">
                          -{relDiscount}%
                        </span>
                      )}
                    </div>
                    <p className="mt-2.5 line-clamp-2 text-[13px] font-semibold leading-snug group-hover:underline">
                      {p.title}
                    </p>
                    <p className="mt-1 text-[13px] font-bold">{formatMoney(p.price, "XOF")}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* ─── MOBILE STICKY BOTTOM BAR ─── */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-shop-line bg-shop-bg/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-shop-muted">{product.title}</p>
          <p className="font-bold text-[15px]">{formatMoney(product.price, "XOF")}</p>
        </div>
        <button
          type="button"
          onClick={handleBuy}
          className="h-11 rounded-[min(var(--shop-radius),12px)] bg-shop-accent px-6 text-sm font-bold text-shop-accent-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          Je le veux
        </button>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-shop-line pb-20 lg:pb-0">
        <div className="mx-auto flex max-w-[1140px] flex-wrap justify-between gap-3 px-4 py-6 text-xs text-shop-muted sm:px-6 lg:px-8">
          <span>{storeName}</span>
          <a href={getBuyerPortalUrl("/mes-achats")} className="hover:text-shop-text transition-colors">
            Mes achats · boutique propulsée par DUKAIO
          </a>
        </div>
      </footer>
    </div>
  );
}
