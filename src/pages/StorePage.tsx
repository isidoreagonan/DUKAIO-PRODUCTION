import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTrackingPixels, trackEvent } from "@/hooks/useTrackingPixels";
import { useCurrency } from "@/lib/currency";
import { getStoreSubdomain, getStoreUrl } from "@/lib/subdomain";
import { normalizeShopConfig, type ShopConfig } from "@/lib/shopConfig";
import { StorefrontView, type StorefrontProduct } from "@/components/store/StorefrontView";

interface OwnerProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  facebook_pixel_id?: string | null;
  tiktok_pixel_id?: string | null;
  google_ads_id?: string | null;
}

export default function StorePage() {
  const { slug: paramSlug } = useParams();
  const subSlug = getStoreSubdomain();
  const rawSlug = (subSlug || paramSlug || "").trim();
  const cleanSlug = rawSlug.toLowerCase().replace(/\s+/g, "-");

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [storeData, setStoreData] = useState<any | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [themeConfig, setThemeConfig] = useState<ShopConfig | null>(null);

  const { countryCode } = useCurrency();

  // Always force clean light mode on public store pages
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        if (!rawSlug) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // In production, redirect /store/:slug on main domain to subdomain boutique.dukaio.com
        if (!subSlug && paramSlug && typeof window !== "undefined" && window.location.hostname.endsWith("dukaio.com")) {
          window.location.replace(getStoreUrl(cleanSlug));
          return;
        }

        // 1. Fetch store record
        let { data: store } = await supabase
          .from("stores")
          .select("*")
          .or(`slug.eq."${cleanSlug}",slug.eq."${rawSlug}"`)
          .eq("is_archived", false)
          .maybeSingle();

        if (!store && rawSlug) {
          const { data: storeByName } = await supabase
            .from("stores")
            .select("*")
            .ilike("name", rawSlug.replace(/-/g, " "))
            .eq("is_archived", false)
            .maybeSingle();
          if (storeByName) store = storeByName;
        }

        let ownerId = store?.owner_id;

        // Fallback to profiles if no store record exists
        if (!store) {
          let { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .or(`store_slug.eq."${cleanSlug}",store_slug.eq."${rawSlug}"`)
            .maybeSingle();

          if (!prof && rawSlug) {
            const { data: profByName } = await supabase
              .from("profiles")
              .select("*")
              .ilike("display_name", rawSlug.replace(/-/g, " "))
              .maybeSingle();
            if (profByName) prof = profByName;
          }

          if (!prof) {
            setNotFound(true);
            setLoading(false);
            return;
          }

          ownerId = prof.id;
          store = {
            id: prof.id,
            owner_id: prof.id,
            name: prof.display_name || "Boutique",
            slug: prof.store_slug || cleanSlug,
            description: prof.store_description,
            logo_url: prof.store_logo_url,
            banner_url: prof.store_banner_url,
            brand_color: prof.store_brand_color,
            theme_config: (prof as any).theme_config || null,
          };
          setOwnerProfile(prof as OwnerProfile);
        } else {
          // Fetch profile for pixels & branding
          const { data: prof } = await supabase
            .from("profiles")
            .select("id, display_name, bio, avatar_url, facebook_pixel_id, tiktok_pixel_id, google_ads_id, theme_config")
            .eq("id", store.owner_id)
            .maybeSingle();
          if (prof) {
            setOwnerProfile(prof as OwnerProfile);
            if (!store.theme_config && (prof as any).theme_config) {
              store.theme_config = (prof as any).theme_config;
            }
          }
        }

        setStoreData(store);

        // 2. Compute theme config
        const resolvedName = store.name || ownerProfile?.display_name || "Boutique";
        const resolvedLogo = store.logo_url || ownerProfile?.avatar_url || null;
        const resolvedConfig = normalizeShopConfig(store.theme_config, {
          name: resolvedName,
          slug: store.slug || cleanSlug,
          logo: resolvedLogo,
          description: store.description || "",
          hero: {
            title: resolvedName,
            height: "regular",
          },
        });
        setThemeConfig(resolvedConfig);

        // 3. Log visit asynchronously
        (async () => {
          let userCountry = null;
          try {
            const res = await fetch("https://api.country.is/");
            if (res.ok) {
              const data = await res.json();
              userCountry = data.country;
            }
          } catch {}

          supabase.from("store_visits").insert({
            store_owner_id: ownerId,
            page_path: subSlug ? "/" : `/store/${cleanSlug}`,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent || null,
            device_type: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
            country: userCountry,
          } as any).then();
        })();

        // 4. Fetch published products
        const { data: prods } = await supabase
          .from("products")
          .select("id, title, price, original_price, type, thumbnail_url, sales_count, category")
          .eq("creator_id", ownerId)
          .eq("is_published", true)
          .or("hide_from_store.is.null,hide_from_store.eq.false")
          .order("created_at", { ascending: false });

        setProducts((prods as StorefrontProduct[]) || []);
      } catch (err) {
        console.error("Error loading store:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [rawSlug, cleanSlug, subSlug, paramSlug]);

  // Activate tracking pixels
  useTrackingPixels({
    facebookPixelId: ownerProfile?.facebook_pixel_id,
    tiktokPixelId: ownerProfile?.tiktok_pixel_id,
    googleAdsId: ownerProfile?.google_ads_id,
  });

  // Apply dynamic SEO title and meta description to document head
  useEffect(() => {
    if (!themeConfig) return;
    const pageTitle = themeConfig.seo?.title || `${themeConfig.name} — Boutique officielle`;
    const pageDesc = themeConfig.seo?.description || themeConfig.description || "";
    document.title = pageTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    if (pageDesc) metaDesc.setAttribute("content", pageDesc);
  }, [themeConfig]);

  const handleBuyClick = (product: StorefrontProduct) => {
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

  if (notFound || !storeData || !themeConfig) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
        <Package className="h-16 w-16 text-gray-200 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Boutique introuvable</h1>
        <p className="text-gray-500 mb-6 max-w-sm">
          Cette boutique n'existe pas ou son adresse a été modifiée.
        </p>
        <Link to="/">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    );
  }

  return (
    <StorefrontView
      config={themeConfig}
      products={products}
      sellerName={storeData.name || ownerProfile?.display_name || "DUKAIO"}
      storeSlug={cleanSlug}
      subSlug={subSlug}
      onBuyClick={handleBuyClick}
    />
  );
}
