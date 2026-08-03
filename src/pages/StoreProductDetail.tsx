import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  BookOpen,
  Key,
  Package,
  ShoppingBag,
  Share2,
  MessageCircle,
  Flag,
  ShieldCheck,
  Zap,
  HeadphonesIcon,
  Star,
  CheckCircle2,
  Users,
  Clock,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

import ProductReportDialog from "@/components/store/ProductReportDialog";
import { processDescriptionWithVideos } from "@/components/RichTextEditor";
import { trackEvent } from "@/hooks/useTrackingPixels";
import { toast } from "sonner";
import { useUserBadge } from "@/hooks/useUserBadge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import ProductReviewsSection from "@/components/store/ProductReviewsSection";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  store_slug: string | null;
  store_description: string | null;
  store_logo_url: string | null;
  contact: string | null;
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
  file_password?: string | null;
  watermark_enabled?: boolean | null;
  sales_limit?: number | null;
  hide_from_store?: boolean | null;
  collect_shipping_address?: boolean | null;
  hide_sales_count?: boolean | null;
}

interface StoreInfo {
  brand_color: string | null;
  logo_url: string | null;
  name: string | null;
  footer_disclaimer?: string | null;
}

const typeIcons: Record<string, React.ReactNode> = {
  file: <Download className="h-4 w-4" />,
  course: <BookOpen className="h-4 w-4" />,
  license: <Key className="h-4 w-4" />,
  bundle: <Package className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  file: "Téléchargeable",
  course: "Formation",
  license: "Licence",
  bundle: "Bundle",
};

const StoreProductDetail = () => {
  const { slug, productId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [lessons, setLessons] = useState<{ title: string; description: string | null; duration_minutes: number | null; position: number }[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { grade: ownerBadge, expiresAt: ownerBadgeExpires } = useUserBadge(profile?.id);

  useEffect(() => {
    const fetchData = async () => {
      const { data: storeData } = await supabase
        .from("stores")
        .select("owner_id, brand_color, logo_url, name, footer_disclaimer")
        .eq("slug", slug)
        .eq("is_archived", false)
        .maybeSingle();

      let ownerId: string | null = null;

      if (storeData) {
        ownerId = storeData.owner_id;
        setStoreInfo(storeData as StoreInfo);
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, store_slug, store_description, store_logo_url, contact")
        .eq(storeData ? "id" : "store_slug", storeData ? storeData.owner_id : slug)
        .single();

      if (!prof) { setNotFound(true); setLoading(false); return; }
      setProfile(prof as Profile);
      ownerId = prof.id;

      const { data: prod } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("creator_id", ownerId)
        .eq("is_published", true)
        .single();

      if (!prod) { setNotFound(true); setLoading(false); return; }
      setProduct(prod as Product);

      trackEvent("ViewContent", {
        content_name: (prod as Product).title,
        content_ids: [productId],
        content_type: "product",
        value: (prod as Product).price,
        currency: "XOF",
      });

      const { data: faqData } = await supabase
        .from("product_faqs")
        .select("question, answer")
        .eq("product_id", productId)
        .order("position");
      if (faqData) setFaqs(faqData as any);

      if ((prod as Product).type === "course") {
        const { data: lessonsData } = await supabase
          .from("course_lessons")
          .select("title, description, duration_minutes, position")
          .eq("product_id", productId)
          .order("position");
        if (lessonsData) setLessons(lessonsData as any);
      }

      const { data: related } = await supabase
        .from("products")
        .select("*")
        .eq("creator_id", ownerId)
        .eq("is_published", true)
        .neq("id", productId)
        .limit(4);
      if (related) setRelatedProducts(related as Product[]);

      setLoading(false);
    };
    fetchData();
  }, [slug, productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !product || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <Package className="h-16 w-16 text-gray-200 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
        <p className="text-gray-500 mb-6">Ce produit n'existe pas ou n'est plus disponible.</p>
        <Link to={`/store/${slug}`}><Button>Retour à la boutique</Button></Link>
      </div>
    );
  }

  const brandColor = storeInfo?.brand_color || "#2563EB";
  const storeName = storeInfo?.name || profile.display_name || "Boutique";
  const logoUrl = storeInfo?.logo_url || profile.store_logo_url || profile.avatar_url || "";
  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;
  const salesCount = product.sales_count || 0;
  const hideSales = !!product.hide_sales_count;
  const isBestseller = !hideSales && salesCount >= 10;
  const salesLimit = product.sales_limit || 0;
  const isSoldOut = salesLimit > 0 && salesCount >= salesLimit;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié !");
    }
  };

  const handleBuy = () => {
    if (isSoldOut) {
      toast.error("Ce produit n'est plus disponible (limite de ventes atteinte).");
      return;
    }
    trackEvent("AddToCart", {
      content_name: product.title, content_ids: [product.id],
      content_type: "product", value: product.price, currency: "XOF",
    });
    const storeRef = profile?.store_slug || slug;
    const url = `/checkout/${product.id}${storeRef ? `?store=${encodeURIComponent(storeRef)}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#FAFAFA]">
      <div 
        className="absolute top-0 left-0 w-full h-[600px] opacity-[0.15] pointer-events-none" 
        style={{ background: `radial-gradient(circle at 50% -20%, ${brandColor} 0%, transparent 70%)` }}
      />
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 border-b border-gray-200/50 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link to={`/store/${slug}`} className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-8 w-8 rounded-lg object-cover shadow-sm border border-gray-100" />
            ) : (
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: brandColor }}>
                {storeName.charAt(0)?.toUpperCase()}
              </div>
            )}
            <span className="text-sm font-bold text-gray-900 truncate">{storeName}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to={`/store/${slug}`} className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-xs text-gray-600">Boutique</Button>
            </Link>
            <Link to="/buyer-login">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-gray-200">
                <ShoppingBag className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mes Achats</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Breadcrumb */}
          <Link
            to={`/store/${slug}`}
            className="mb-4 sm:mb-6 inline-flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-2 relative z-10">
            {/* ─── LEFT: Image + content ─── */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-8">
              {/* Hero image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative rounded-[32px] overflow-hidden p-2 sm:p-3 bg-white/50 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
              >
                <div 
                  className="absolute inset-0 opacity-20 blur-[80px] pointer-events-none" 
                  style={{ backgroundColor: brandColor }}
                />
                <div className="relative rounded-[24px] overflow-hidden bg-white shadow-sm border border-gray-100/50 group">
                  {product.thumbnail_url ? (
                    <img
                      src={product.thumbnail_url}
                      alt={product.title}
                      className="w-full h-auto object-cover md:object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] flex items-center justify-center bg-gray-50">
                      <Package className="h-24 w-24 text-gray-200" />
                    </div>
                  )}

                  {/* Floating badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {isBestseller && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-amber-500/30 backdrop-blur-md">
                        🔥 Bestseller
                      </span>
                    )}
                    {discount && (
                      <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md" style={{ backgroundColor: brandColor, boxShadow: `0 4px 14px 0 ${brandColor}60` }}>
                        -{discount}%
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Title block (mobile shows here) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="lg:hidden"
              >
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                    {typeIcons[product.type]} {typeLabels[product.type] || product.type}
                  </span>
                  {!hideSales && salesCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {salesCount} ventes
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
                  {product.title}
                </h1>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold" style={{ color: brandColor }}>
                    {product.price.toLocaleString()} FCFA
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {product.original_price.toLocaleString()} FCFA
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Trust strip */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { icon: Zap, label: "Livraison instantanée", sub: "Accès immédiat" },
                  { icon: ShieldCheck, label: "Paiement sécurisé", sub: "100% protégé" },
                  { icon: HeadphonesIcon, label: "Support inclus", sub: "Réponse rapide" },
                ].map((t) => (
                  <div key={t.label} className="rounded-xl border border-gray-100 bg-white p-2.5 sm:p-3 text-center">
                    <t.icon className="mx-auto h-4 w-4 sm:h-5 sm:w-5 mb-1" style={{ color: brandColor }} />
                    <div className="text-[10px] sm:text-xs font-semibold text-gray-900 leading-tight">{t.label}</div>
                    <div className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 hidden sm:block">{t.sub}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {product.description && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-[24px] border border-gray-100 bg-white p-6 sm:p-8 shadow-sm"
                >
                  <h2 className="mb-6 text-xl font-extrabold text-gray-900 tracking-tight">À propos de ce produit</h2>
                  <div
                    dangerouslySetInnerHTML={{ __html: processDescriptionWithVideos(product.description) }}
                    className="prose prose-sm sm:prose-base max-w-none leading-loose text-gray-600 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:text-gray-900 [&_h1]:tracking-tight [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-5 [&_h2]:text-gray-900 [&_h2]:tracking-tight [&_p]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-6 [&_ol]:space-y-2 [&_li]:text-gray-600 [&_a]:font-medium [&_img]:rounded-2xl [&_img]:shadow-sm [&_img]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-6 [&_.video-embed]:my-8 [&_iframe]:rounded-2xl [&_iframe]:border [&_iframe]:border-gray-100 [&_iframe]:shadow-sm"
                    style={{ '--tw-prose-links': brandColor } as any}
                  />
                </motion.div>
              )}

              {/* What's included (Bento Grid) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="rounded-[24px] border border-gray-100 bg-white p-6 sm:p-8 shadow-sm"
              >
                <h2 className="mb-6 text-xl font-extrabold text-gray-900 tracking-tight">Ce qui est inclus</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { 
                      title: product.type === "course" ? "Accès à vie" : product.type === "license" ? "Clé de licence unique" : "Téléchargement immédiat", 
                      desc: product.type === "course" ? "Aux modules de la formation" : product.type === "license" ? "Livrée par email" : "Dès validation du paiement",
                      icon: Download
                    },
                    { title: "Mises à jour gratuites", desc: "Profitez des nouveautés à vie", icon: Zap },
                    { title: "Support direct", desc: "Assistance par le créateur", icon: HeadphonesIcon },
                    { title: "Espace client", desc: "Accès depuis « Mes achats »", icon: Lock },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100/80 transition-colors">
                      <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white shadow-sm shrink-0">
                        <item.icon className="h-5 w-5" style={{ color: brandColor }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Course content */}
              {product.type === "course" && lessons.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.13 }}
                  className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Contenu de la formation</h2>
                    <span className="text-xs font-semibold text-gray-500">
                      {lessons.length} leçon{lessons.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <Accordion type="single" collapsible className="space-y-2">
                    {lessons.map((l, i) => (
                      <AccordionItem key={i} value={`lesson-${i}`} className="rounded-xl border border-gray-100 bg-gray-50/60 px-4">
                        <AccordionTrigger className="hover:no-underline py-4 text-left">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-7 w-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                              style={{ backgroundColor: brandColor }}>
                              {String(i + 1).padStart(2, "0")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">{l.title}</div>
                              {l.duration_minutes && (
                                <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {l.duration_minutes} min
                                </div>
                              )}
                            </div>
                            <Lock className="h-4 w-4 text-gray-300 shrink-0" />
                          </div>
                        </AccordionTrigger>
                        {l.description && (
                          <AccordionContent className="text-sm text-gray-600 pb-4 leading-relaxed pl-10">
                            {l.description}
                          </AccordionContent>
                        )}
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              )}

              {/* FAQ */}
              {faqs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7"
                >
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Questions fréquentes</h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`} className="rounded-xl border border-gray-100 bg-gray-50/60 px-4">
                        <AccordionTrigger className="text-sm font-medium text-gray-900 hover:no-underline py-4 text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-600 pb-4 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              )}

              {/* Customer reviews */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
              >
                <ProductReviewsSection productId={product.id} brandColor={brandColor} />
              </motion.div>

              {/* Seller card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6"
              >
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Vendu par</h2>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <img src={logoUrl} alt={storeName} className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: brandColor }}>
                      {storeName.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="text-base font-bold text-gray-900 truncate">{storeName}</div>
                    </div>
                    {profile.store_description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {profile.store_description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
                      </p>
                    )}
                  </div>
                  <Link to={`/store/${slug}`}>
                    <Button variant="outline" size="sm" className="text-xs">Voir</Button>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* ─── RIGHT: Purchase card ─── */}
            {/* ─── RIGHT: Purchase card ─── */}
            <div className="lg:col-span-5 xl:col-span-5">
              {/* Desktop title */}
              <div className="hidden lg:block mb-6">
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-100 px-3 py-1 font-semibold text-gray-700 shadow-sm">
                    {typeIcons[product.type]} {typeLabels[product.type] || product.type}
                  </span>
                  {!hideSales && salesCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-100 px-3 py-1 font-semibold text-gray-700 shadow-sm">
                      <Users className="h-3.5 w-3.5" /> {salesCount} ventes
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                  {product.title}
                </h1>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="lg:sticky lg:top-24 rounded-[32px] border border-gray-100 bg-white p-6 sm:p-8 space-y-6 shadow-[0_8px_40px_rgb(0,0,0,0.06)]"
              >
                {/* Price */}
                <div>
                  <div className="flex items-end gap-3 flex-wrap">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: brandColor }}>
                      {product.price.toLocaleString()} <span className="text-2xl sm:text-3xl">FCFA</span>
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-lg text-gray-400 line-through font-medium mb-1">
                        {product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    {discount && (
                      <span className="rounded-full bg-emerald-100/80 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        Économisez {discount}%
                      </span>
                    )}
                    <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                      <Lock className="h-3.5 w-3.5" /> Paiement unique • À vie
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="relative group">
                  {!isSoldOut && (
                    <div 
                      className="absolute -inset-1 rounded-[20px] blur-lg opacity-40 group-hover:opacity-70 transition duration-500" 
                      style={{ backgroundColor: brandColor }}
                    ></div>
                  )}
                  <button
                    className="relative w-full text-lg font-bold py-4 rounded-[16px] text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                    style={{ backgroundColor: isSoldOut ? "#9CA3AF" : brandColor }}
                    onClick={handleBuy}
                    disabled={isSoldOut}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                    {isSoldOut ? "Épuisé" : "Acheter maintenant"}
                  </button>
                </div>

                {/* Quick benefits */}
                <ul className="space-y-3 text-sm text-gray-700 font-medium bg-gray-50/50 p-4 rounded-[16px] border border-gray-100/50">
                  <li className="flex items-center gap-3">
                    <Zap className="h-4 w-4" style={{ color: brandColor }} />
                    Livré instantanément par email
                  </li>
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4" style={{ color: brandColor }} />
                    Paiement 100% sécurisé et chiffré
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="h-4 w-4" style={{ color: brandColor }} />
                    Accès à vie depuis votre espace client
                  </li>
                </ul>

                <Separator className="bg-gray-100" />

                {/* Payment methods */}
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold text-center">Paiement sécurisé via</p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <div className="h-8 w-12 rounded-lg bg-[#1A1F71] flex items-center justify-center shadow-sm">
                      <span className="text-[9px] font-bold text-white">VISA</span>
                    </div>
                    <div className="h-8 w-12 rounded-lg bg-[#EB001B] flex items-center justify-center shadow-sm">
                      <span className="text-[9px] font-bold text-white">MC</span>
                    </div>
                    <img src="/images/mtn-momo.webp" alt="MTN" className="h-8 w-8 rounded-full object-cover shadow-sm" />
                    <img src="/images/orange-money.png" alt="Orange" className="h-8 w-8 rounded-full object-cover shadow-sm" />
                    <img src="/images/moov-money.png" alt="Moov" className="h-8 w-8 rounded-full object-cover shadow-sm" />
                    <img src="/images/wave.png" alt="Wave" className="h-8 w-8 rounded-full object-cover shadow-sm" />
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                <div className="flex items-center justify-center gap-6 text-xs text-gray-500 font-medium">
                  <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                    <Share2 className="h-4 w-4" />
                    Partager
                  </button>
                  {profile.contact && (
                    <a href={`mailto:${profile.contact}`} className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      Contact
                    </a>
                  )}
                  <button className="flex items-center gap-1.5 hover:text-gray-900 transition-colors" onClick={() => setReportOpen(true)}>
                    <Flag className="h-4 w-4" />
                    Signaler
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-14"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Autres produits de {storeName}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {relatedProducts.map((rp) => {
                  const rDisc = rp.original_price && rp.original_price > rp.price
                    ? Math.round(((rp.original_price - rp.price) / rp.original_price) * 100) : null;
                  return (
                    <Link key={rp.id} to={`/store/${slug}/${rp.id}`}
                      className="group border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        {rp.thumbnail_url ? (
                          <img src={rp.thumbnail_url} alt={rp.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-200" />
                          </div>
                        )}
                        {rDisc && (
                          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: brandColor }}>
                            -{rDisc}%
                          </span>
                        )}
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">{rp.title}</h3>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-bold" style={{ color: brandColor }}>{rp.price.toLocaleString()} FCFA</span>
                          {rp.original_price && rp.original_price > rp.price && (
                            <span className="text-[10px] line-through text-gray-300">{rp.original_price.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-12 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-7 w-7 rounded-md object-cover" />
              ) : (
                <div className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor: brandColor }}>
                  {storeName.charAt(0)?.toUpperCase()}
                </div>
              )}
              <span className="text-base font-bold text-gray-900">{storeName}</span>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Liens</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/mes-achats" className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:opacity-70">
                    <ShoppingBag className="h-4 w-4" /> Voir mes commandes
                  </Link>
                </li>
                <li>
                  <Link to={`/store/${slug}`} className="text-sm text-gray-600 hover:text-gray-900">
                    Boutique
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Légal</h3>
              <ul className="space-y-2.5">
                <li><Link to={`/store/${slug}/legal`} className="text-sm text-gray-600 hover:text-gray-900">Mentions légales</Link></li>
                <li><Link to={`/store/${slug}/terms`} className="text-sm text-gray-600 hover:text-gray-900">Conditions générales</Link></li>
                <li><Link to={`/store/${slug}/privacy`} className="text-sm text-gray-600 hover:text-gray-900">Politique de confidentialité</Link></li>
              </ul>
            </div>
          </div>

          {storeInfo?.footer_disclaimer && (
            <p className="mt-10 text-xs leading-relaxed text-gray-400 max-w-4xl">
              {storeInfo.footer_disclaimer}
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">{storeName} © {new Date().getFullYear()}  Tous droits réservés.</p>
            <p className="text-xs text-gray-300">
              Propulsé par{" "}
              <Link to="/" className="hover:underline font-medium" style={{ color: brandColor }}>Dukaio</Link>
            </p>
          </div>
        </div>
      </footer>


      {/* ─── MOBILE STICKY CTA ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 z-50 shadow-[0_-10px_40px_rgb(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Paiement unique</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-gray-900 leading-none">{product.price.toLocaleString()}</span>
              <span className="text-sm font-bold text-gray-900">FCFA</span>
            </div>
          </div>
          <button
            className="flex-1 text-sm font-bold py-3.5 rounded-xl text-white transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: isSoldOut ? "#9CA3AF" : brandColor }}
            onClick={handleBuy}
            disabled={isSoldOut}
          >
            {isSoldOut ? "Épuisé" : "Acheter maintenant"}
          </button>
        </div>
      </div>

      <ProductReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        productId={product.id}
        productTitle={product.title}
      />
    </div>
  );
};

export default StoreProductDetail;
