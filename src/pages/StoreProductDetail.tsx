import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
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
import { getStoreSubdomain, getBuyerPortalUrl } from "@/lib/subdomain";
import { normalizeShopConfig, shopStyle, type ShopConfig } from "@/lib/shopConfig";
import { processDescriptionWithVideos } from "@/components/RichTextEditor";
import ProductReviewsSection from "@/components/store/ProductReviewsSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

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
  const [reviewStats, setReviewStats] = useState<{ count: number; averageRating: string } | null>(null);

  const { countryCode, targetCurrency, isLocalDifferent, rates } = useCurrency();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

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

        trackEvent("ViewContent", {
          content_name: prod.title,
          content_ids: [prod.id],
          content_type: "product",
          value: prod.price,
          currency: "XOF",
        });

        const { data: faqData } = await supabase
          .from("product_faqs")
          .select("question, answer")
          .eq("product_id", prod.id)
          .order("position");
        if (faqData) setFaqs(faqData as any);

        if (prod.type === "course") {
          const { data: lessonsData } = await supabase
            .from("course_lessons")
            .select("title, description, duration_minutes, position")
            .eq("product_id", prod.id)
            .order("position");
          if (lessonsData) setLessons(lessonsData as any);
        }

        const { data: revData } = await supabase
          .from("product_reviews")
          .select("sentiment")
          .eq("product_id", prod.id)
          .eq("is_public", true);

        if (revData && revData.length > 0) {
          const positive = revData.filter((r) => r.sentiment === "positive").length;
          const score = Math.max(1, Math.round(((positive / revData.length) * 4 + 1) * 10) / 10);
          setReviewStats({
            count: revData.length,
            averageRating: score.toFixed(1),
          });
        } else {
          setReviewStats(null);
        }

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
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
      </div>
    );
  }

  if (notFound || !product || !themeConfig) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFBF9] px-4 text-center">
        <Package className="h-16 w-16 text-gray-300 mb-4" />
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

  const formatLabel =
    product.type === "course"
      ? "Formation vidéo · PDF"
      : product.type === "file"
      ? "Fichier numérique"
      : product.type === "license"
      ? "Licence & clé"
      : "Ressource digitale";

  return (
    <div
      className="min-h-screen bg-[#FCFBF9] text-[#20201F]"
      style={shopStyle(themeConfig)}
    >
      {/* ─── HEADER (Solid white/clean, exact image 2) ─── */}
      <header className="sticky top-0 z-30 border-b border-[#E7E3DC] bg-[#FCFBF9]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={homePath} className="flex min-w-0 items-center gap-2.5">
            {themeConfig.logo ? (
              <img src={themeConfig.logo} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#18181B] font-bold text-xs text-white uppercase tracking-wider">
                {themeConfig.name.trim().charAt(0) || "D"}
              </span>
            )}
            <span className="truncate text-[15px] font-bold tracking-[0.16em] uppercase text-[#18181B]">
              {themeConfig.name}
            </span>
          </Link>

          {/* Right Header Icons: Wishlist & Bag */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={liked ? "Retirer des envies" : "Garder dans mes envies"}
              onClick={toggleWishlist}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#F4F2EE] transition-colors"
            >
              <Heart
                className={`h-[18px] w-[18px] ${liked ? "fill-[#E86F3D] text-[#E86F3D]" : "text-[#20201F]"}`}
                strokeWidth={1.7}
              />
            </button>

            <a
              href={getBuyerPortalUrl("/mes-achats")}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#F4F2EE] transition-colors"
              title="Mes achats"
            >
              <ShoppingBag className="h-[18px] w-[18px] text-[#20201F]" strokeWidth={1.7} />
            </a>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="mx-auto max-w-[1140px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to={homePath}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#74716B] hover:text-[#20201F] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Tous les produits
        </Link>

        {/* 2-Column Product Grid (Exact Image 2) */}
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Left Column: Product Image in rounded container (Exact Attachment 3) */}
          <div className="relative self-start overflow-hidden rounded-[18px] bg-[#F4F2EE] lg:sticky lg:top-24">
            <img
              src={
                product.thumbnail_url ||
                "/images/demo/p-tiktok.jpg"
              }
              alt={product.title}
              className="aspect-square w-full h-auto max-h-[520px] object-cover rounded-[18px]"
            />
            {discount && (
              <span className="absolute left-3.5 top-3.5 rounded-full bg-[#E86F3D] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                -{discount}%
              </span>
            )}
          </div>

          {/* Right Column: Title, Price, CTA and Badges (Exact Image 2) */}
          <div className="min-w-0">
            {/* Format info */}
            <p className="flex items-center gap-1.5 text-xs text-[#74716B] font-medium">
              <FileDown className="h-3.5 w-3.5 text-[#74716B]" strokeWidth={1.7} />
              <span>{formatLabel} · fichier à télécharger</span>
            </p>

            {/* Title */}
            <h1 className="mt-2.5 text-[26px] sm:text-[32px] font-extrabold text-[#111827] leading-tight tracking-[-0.02em]">
              {product.title}
            </h1>

            {/* Seller & Rating metadata */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#74716B]">
              <span>
                Par <span className="font-semibold text-[#111827] underline underline-offset-2">{sellerName}</span>
              </span>
              {reviewStats && reviewStats.count > 0 && (
                <span className="flex items-center gap-1 font-medium text-[#111827]">
                  <Star className="h-3.5 w-3.5 fill-[#111827] text-[#111827]" /> {reviewStats.averageRating}
                  <span className="text-xs text-[#74716B]">({reviewStats.count})</span>
                </span>
              )}
              {!product.hide_sales_count && Boolean(product.sales_count && product.sales_count > 0) && (
                <span>{product.sales_count} {product.sales_count === 1 ? "vente" : "ventes"}</span>
              )}
            </div>

            {/* Price Row */}
            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-[28px] sm:text-[34px] font-extrabold text-[#111827] tracking-tight">
                {formatMoney(product.price, "XOF")}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm sm:text-base text-[#9CA3AF] line-through font-medium">
                  {formatMoney(product.original_price, "XOF")}
                </span>
              )}
            </div>

            {/* Dual Currency if different */}
            {isLocalDifferent && (
              <p className="mt-1 text-xs text-[#74716B] font-medium">
                Soit environ {formatMoney(convertFromXOF(product.price, targetCurrency, rates), targetCurrency)}
              </p>
            )}

            {/* Primary Action Button « Je le veux » (dynamically styled with shop accent & button style) */}
            <button
              type="button"
              onClick={handleBuy}
              style={{
                borderRadius: "var(--shop-radius, 12px)",
                backgroundColor:
                  themeConfig.appearance.buttons === "solid" ? "var(--shop-accent)" : "transparent",
                color:
                  themeConfig.appearance.buttons === "solid"
                    ? "var(--shop-accent-foreground)"
                    : "var(--shop-text)",
                borderColor:
                  themeConfig.appearance.buttons === "solid" ? "transparent" : "var(--shop-accent)",
              }}
              className="mt-6 h-[52px] w-full text-[15px] font-bold border shadow-xs flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.99]"
            >
              Je le veux
            </button>

            {/* Reassurance text */}
            <p className="mt-3.5 flex gap-2 text-[13px] leading-relaxed text-[#74716B]">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#111827]" />
              <span>Le fichier à télécharger, tout de suite après le paiement, et un e-mail avec ton lien.</span>
            </p>

            {/* 3 Trust Badges Grid (Exact Image 2) */}
            <div className="mt-5 grid grid-cols-3 divide-x divide-[#E7E3DC] rounded-xl border border-[#E7E3DC] bg-[#FCFBF9]">
              {[
                { icon: Smartphone, label: "Mobile Money ou carte" },
                { icon: Mail, label: "Reçu par e-mail" },
                { icon: ShoppingBag, label: "Retrouvé dans Mes achats" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 px-2 py-3.5 text-center text-[11px] sm:text-xs leading-tight font-medium text-[#20201F]"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F4F2EE]">
                    <Icon className="h-3.5 w-3.5 text-[#20201F]" strokeWidth={1.8} />
                  </span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Wishlist & Share Row (Exact Image 2) */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={toggleWishlist}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E7E3DC] bg-[#FCFBF9] text-[13px] font-medium text-[#20201F] hover:border-[#20201F] transition-colors"
              >
                <Heart
                  className={`h-4 w-4 ${liked ? "fill-[#E86F3D] text-[#E86F3D]" : ""}`}
                  strokeWidth={1.6}
                />
                <span>{liked ? "Dans mes envies" : "Garder dans mes envies"}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E7E3DC] bg-[#FCFBF9] text-[13px] font-medium text-[#20201F] hover:border-[#20201F] transition-colors"
              >
                <Share2 className="h-4 w-4" strokeWidth={1.6} />
                <span>{copied ? "Lien copié !" : "Partager"}</span>
              </button>
            </div>

            {/* Payment Trust Box with Crisp Logos (Exact Image 2) */}
            <div className="mt-6 rounded-xl border border-[#E7E3DC] bg-[#FCFBF9]">
              <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#111827]">
                  <Lock className="h-3.5 w-3.5" strokeWidth={1.8} /> Paiement 100 % sécurisé
                </p>
                <p className="text-[11px] text-[#74716B]">Mobile Money ou carte</p>
              </div>

              {/* Logos properly sized, direct on background, EXACT IMAGE 2 */}
              <div className="flex flex-wrap items-center gap-3.5 px-4 pb-4 pt-3">
                <img src="/images/orange-money.png" alt="Orange Money" className="h-7 w-auto object-contain" />
                <img src="/images/mtn-momo.webp" alt="MTN MoMo" className="h-7 w-auto object-contain" />
                <img src="/images/wave.png" alt="Wave" className="h-7 w-auto object-contain" />
                <img src="/images/moov-money.png" alt="Moov Money" className="h-7 w-auto object-contain" />
                {/* Official Visa SVG */}
                <svg className="h-5 w-auto" viewBox="0 0 48 16" fill="none">
                  <path d="M18.88 1.13L12.37 15.22H8.13L4.95 3.73C4.76 3 4.56 2.74 3.97 2.41C3 1.9 1.41 1.41 0 1.13L0.1 0.69H7.13C8.03 0.69 8.84 1.28 9.03 2.32L10.74 11.23L14.94 1.13H18.88ZM35.43 10.63C35.46 6.84 29.98 6.63 30.01 4.9C30.03 4.38 30.55 3.82 31.75 3.66C32.34 3.58 34.02 3.52 35.85 4.33L36.6 1.01C35.57 0.64 34.25 0.33 32.58 0.33C28.62 0.33 25.83 2.37 25.8 5.3C25.77 7.45 27.75 8.65 29.27 9.37C30.83 10.11 31.35 10.58 31.34 11.24C31.33 12.25 30.09 12.7 28.94 12.72C26.92 12.74 25.75 12.2 24.81 11.78L24.03 15.25C25.04 15.7 26.9 16.08 28.81 16.1C32.99 16.1 35.41 14.1 35.43 10.63ZM45.98 15.22H49.46L46.43 1.13H43.25C42.53 1.13 41.92 1.54 41.67 2.15L35.6 15.22H39.77L40.6 12.96H45.69L45.98 15.22ZM41.74 9.87L43.83 4.29L45.03 9.87H41.74ZM24.78 1.13L21.57 15.22H17.65L20.86 1.13H24.78Z" fill="#1434CB"/>
                </svg>
                {/* Official Mastercard SVG */}
                <svg className="h-6 w-auto" viewBox="0 0 38 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#EB001B"/>
                  <circle cx="26" cy="12" r="12" fill="#F79E1B"/>
                  <path d="M19 4.8C21.2 6.7 22.6 9.2 22.6 12C22.6 14.8 21.2 17.3 19 19.2C16.8 17.3 15.4 14.8 15.4 12C15.4 9.2 16.8 6.7 19 4.8Z" fill="#FF5F00"/>
                </svg>
              </div>

              {/* Link to Buyer Portal */}
              <a
                href={getBuyerPortalUrl("/mes-achats")}
                className="group flex items-center justify-between border-t border-[#E7E3DC] px-4 py-3 text-[13px] text-[#74716B] hover:text-[#111827] transition-colors"
              >
                <span>
                  Déjà acheté ? <span className="font-semibold text-[#111827]">Retrouve-le dans Mes achats</span>
                </span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.6} />
              </a>
            </div>
          </div>
        </div>

        {/* ─── DESCRIPTION SECTION (Clean, readable) ─── */}
        {product.description && (
          <section className="mt-14 max-w-[760px] lg:mt-20">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">Description</h2>
            <div
              dangerouslySetInnerHTML={{ __html: processDescriptionWithVideos(product.description) }}
              className="mt-4 prose prose-neutral max-w-none text-[#4B5563] text-[15px] leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:mb-1.5 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_img]:rounded-xl [&_img]:my-4"
            />
          </section>
        )}

        {/* ─── COURSE LESSONS ─── */}
        {product.type === "course" && lessons.length > 0 && (
          <section className="mt-12 max-w-[760px]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">Programme de la formation</h2>
            <p className="mt-1 text-sm text-[#74716B]">{lessons.length} module(s) et leçon(s)</p>
            <div className="mt-4 divide-y divide-[#E7E3DC] rounded-xl border border-[#E7E3DC] bg-[#FCFBF9]">
              {lessons.map((lesson, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4 p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#F4F2EE] text-xs font-semibold text-[#111827]">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#111827]">{lesson.title}</h3>
                      {lesson.description && (
                        <p className="mt-1 text-xs text-[#74716B]">{lesson.description}</p>
                      )}
                    </div>
                  </div>
                  {lesson.duration_minutes && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-[#74716B]">
                      <Clock className="h-3.5 w-3.5" /> {lesson.duration_minutes} min
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── FAQS SECTION ─── */}
        {faqs.length > 0 && (
          <section className="mt-12 max-w-[760px]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">Questions fréquentes</h2>
            <Accordion type="single" collapsible className="mt-4 space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="rounded-xl border border-[#E7E3DC] px-4 bg-[#FCFBF9]"
                >
                  <AccordionTrigger className="text-sm font-semibold text-[#111827] hover:no-underline py-4 text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#74716B] pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* ─── REVIEWS SECTION ─── */}
        <section className="mt-14 max-w-[760px]">
          <ProductReviewsSection productId={product.id} brandColor="#18181B" />
        </section>

        {/* ─── RELATED PRODUCTS ("Vous aimerez aussi", exact Image 2) ─── */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-[#E7E3DC] pt-12 sm:mt-20 sm:pt-14">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">Vous aimerez aussi</h2>
              <Link to={homePath} className="text-[13px] text-[#74716B] underline-offset-2 hover:text-[#111827] hover:underline">
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
                    <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[#F4F2EE]">
                      <img
                        src={
                          p.thumbnail_url ||
                          "/images/demo/p-tiktok.jpg"
                        }
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      {relDiscount && (
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#E86F3D] px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                          -{relDiscount}%
                        </span>
                      )}
                    </div>
                    <p className="mt-2.5 line-clamp-2 text-[13px] font-semibold text-[#111827] leading-snug group-hover:underline">
                      {p.title}
                    </p>
                    <p className="mt-1 text-[13px] font-bold text-[#111827]">{formatMoney(p.price, "XOF")}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* ─── MOBILE STICKY BOTTOM BAR (Solid black button, exact Image 2) ─── */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[#E7E3DC] bg-[#FCFBF9]/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-[#74716B]">{product.title}</p>
          <p className="font-bold text-[15px] text-[#111827]">{formatMoney(product.price, "XOF")}</p>
        </div>
        <button
          type="button"
          onClick={handleBuy}
          style={{
            borderRadius: "var(--shop-radius, 12px)",
            backgroundColor:
              themeConfig.appearance.buttons === "solid" ? "var(--shop-accent)" : "transparent",
            color:
              themeConfig.appearance.buttons === "solid"
                ? "var(--shop-accent-foreground)"
                : "var(--shop-text)",
            borderColor:
              themeConfig.appearance.buttons === "solid" ? "transparent" : "var(--shop-accent)",
          }}
          className="h-11 px-6 text-sm font-bold border shadow-xs transition-all hover:opacity-90 active:scale-95"
        >
          Je le veux
        </button>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#E7E3DC] pb-20 lg:pb-0">
        <div className="mx-auto flex max-w-[1140px] flex-wrap justify-between gap-3 px-4 py-6 text-xs text-[#74716B] sm:px-6 lg:px-8">
          <span>{storeName}</span>
          <a href={getBuyerPortalUrl("/mes-achats")} className="hover:text-[#111827] transition-colors">
            Mes achats · boutique propulsée par DUKAIO
          </a>
        </div>
      </footer>
    </div>
  );
}
