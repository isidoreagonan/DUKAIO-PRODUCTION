import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  getCategoryByKey,
} from "@/data/marketplaceCategories";
import { X, Loader2 } from "lucide-react";

const SORTS = [
  { key: "relevance", label: "Pertinence" },
  { key: "popular", label: "Populaires" },
  { key: "recent", label: "Récents" },
  { key: "price_asc", label: "Prix croissant" },
  { key: "price_desc", label: "Prix décroissant" },
  { key: "verified", label: "Vendeurs vérifiés ⭐" },
];

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const type = params.get("type") || "";
  const sort = params.get("sort") || "relevance";
  const verified = params.get("verified") || "";

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = new URL(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketplace-search`,
        );
        if (q) url.searchParams.set("q", q);
        if (category) url.searchParams.set("category", category);
        if (type) url.searchParams.set("type", type);
        if (sort) url.searchParams.set("sort", sort);
        if (verified) url.searchParams.set("verified", verified);
        url.searchParams.set("limit", "36");

        const res = await fetch(url.toString(), {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const data = await res.json();
        setProducts(data.products || []);
        setTotal(data.total || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [q, category, type, sort, verified]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const activeCat = getCategoryByKey(category);
  const activeType = PRODUCT_TYPES.find((t) => t.key === type);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        canonicalPath="/search"
        title={q ? `Recherche : ${q} · Dukaio` : "Marketplace · Dukaio"}
        description="Explorez la marketplace Dukaio. Fichiers, formations et licences numériques."
      />
      <Navbar />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        {/* HERO TITLE */}
        <div className="max-w-4xl mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight md:leading-[1.15] tracking-tight">
            Profitez de produits digitaux premium pour propulser votre réussite.
          </h1>
        </div>

        {/* HORIZONTAL FILTERS BAR */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
          {/* Search Input */}
          <div className="flex-1 w-full relative">
            <MarketplaceSearchBar variant="default" defaultValue={q} />
          </div>

          {/* Select Dropdowns */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <select
              value={category}
              onChange={(e) => updateParam("category", e.target.value)}
              className="h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground font-medium outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px] cursor-pointer"
            >
              <option value="">Toutes catégories</option>
              {MARKETPLACE_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>

            <select
              value={type}
              onChange={(e) => updateParam("type", e.target.value)}
              className="h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground font-medium outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px] cursor-pointer"
            >
              <option value="">Tous les types</option>
              {PRODUCT_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.emoji} {t.label}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground font-medium outline-none focus:ring-2 focus:ring-primary/20 min-w-[180px] cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ACTIVE FILTERS CHIPS */}
        {(q || category || type || verified) && (
          <div className="mb-8 flex flex-wrap gap-2">
            {q && <Chip onRemove={() => updateParam("q", null)}>« {q} »</Chip>}
            {activeType && (
              <Chip onRemove={() => updateParam("type", null)}>
                {activeType.emoji} {activeType.label}
              </Chip>
            )}
            {activeCat && (
              <Chip onRemove={() => updateParam("category", null)}>
                {activeCat.emoji} {activeCat.label}
              </Chip>
            )}
            {verified && (
              <Chip onRemove={() => updateParam("verified", null)}>
                ⭐ Vendeurs Vérifiés
              </Chip>
            )}
          </div>
        )}

        {/* RESULTS HEADER */}
        <div className="mb-6 flex flex-col items-start gap-1">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {q
              ? `Résultats pour « ${q} »`
              : activeCat
              ? `${activeCat.emoji} ${activeCat.label}`
              : activeType
              ? `${activeType.emoji} ${activeType.label}`
              : "Tous les produits"}
          </h2>
          <p className="text-sm font-medium text-muted-foreground">
            {loading ? "Recherche en cours…" : `${total} produit${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* PRODUCTS GRID */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-secondary"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center mt-8">
            <p className="text-lg font-bold text-foreground">Aucun produit trouvé</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Essayez d'autres mots-clés ou retirez certains filtres.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <MarketplaceProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

const Chip = ({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) => (
  <button
    onClick={onRemove}
    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
  >
    {children}
    <X className="h-3 w-3" />
  </button>
);

export default SearchPage;
