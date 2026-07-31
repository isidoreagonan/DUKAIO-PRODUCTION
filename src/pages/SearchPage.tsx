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
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, X, Loader2, ArrowUpDown, ShieldCheck } from "lucide-react";

const SORTS = [
  { key: "relevance", label: "Pertinence" },
  { key: "popular", label: "Populaires" },
  { key: "recent", label: "Récents" },
  { key: "price_asc", label: "Prix croissant" },
  { key: "price_desc", label: "Prix décroissant" },
  { key: "verified", label: "Vendeurs vérifiés ⭐" },
];

const VERIFIED_OPTIONS = [
  { key: "any", label: "Tous les vendeurs vérifiés" },
  { key: "standard", label: "Verify Standard" },
  { key: "pro", label: "Verify Pro" },
  { key: "premium", label: "Verify Premium" },
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
  const [sheetOpen, setSheetOpen] = useState(false);

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
  const activeVerified = VERIFIED_OPTIONS.find((v) => v.key === verified);
  const activeFilterCount = (category ? 1 : 0) + (type ? 1 : 0) + (verified ? 1 : 0);

  const FiltersBlock = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Type de produit</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam("type", null)}
            className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              !type
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            Tous
          </button>
          {PRODUCT_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => updateParam("type", t.key)}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                type === t.key
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Catégorie</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam("category", null)}
            className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              !category
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            Toutes
          </button>
          {MARKETPLACE_CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => updateParam("category", c.key)}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                category === c.key
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Trier par</h3>
        <div className="space-y-1.5">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => updateParam("sort", s.key)}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                sort === s.key
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Statut Verified
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam("verified", null)}
            className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              !verified
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            Tous (vérifiés ou non)
          </button>
          {VERIFIED_OPTIONS.map((v) => (
            <button
              key={v.key}
              onClick={() => updateParam("verified", v.key)}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                verified === v.key
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        canonicalPath="/search"
        title={q ? `Recherche : ${q} · Dukaio` : "Marketplace · Dukaio"}
        description="Explorez la marketplace Dukaio. Fichiers, formations et licences numériques."
      />
      <Navbar />

      {/* Sticky search bar */}
      <section className="sticky top-[64px] z-30 border-b border-border bg-background/95 py-3 backdrop-blur sm:py-5">
        <div className="container mx-auto px-4">
          <MarketplaceSearchBar variant="hero" defaultValue={q} />
        </div>
      </section>

      <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[260px_1fr] lg:py-8">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-[160px] space-y-6 rounded-2xl border border-border bg-card p-5">
            {FiltersBlock}
          </div>
        </aside>

        {/* Results */}
        <main>
          <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-foreground sm:text-xl md:text-2xl">
                {q
                  ? `« ${q} »`
                  : activeCat
                  ? `${activeCat.emoji} ${activeCat.label}`
                  : activeType
                  ? `${activeType.emoji} ${activeType.label}`
                  : "Tous les produits"}
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {loading
                  ? "Recherche…"
                  : `${total} produit${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Mobile filter / sort */}
            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative gap-1.5 rounded-full">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filtres
                    {activeFilterCount > 0 && (
                      <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-3xl">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtres & tri
                    </SheetTitle>
                  </SheetHeader>
                  {FiltersBlock}
                  <div className="sticky bottom-0 -mx-6 mt-6 border-t border-border bg-background px-6 py-4">
                    <Button className="w-full" onClick={() => setSheetOpen(false)}>
                      Voir {total} résultat{total > 1 ? "s" : ""}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop sort */}
            <div className="hidden items-center gap-2 lg:flex">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {(category || type || q || verified) && (
            <div className="mb-4 flex flex-wrap gap-2">
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
              {activeVerified && (
                <Chip onRemove={() => updateParam("verified", null)}>
                  ⭐ {activeVerified.label}
                </Chip>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-2xl bg-secondary"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center sm:p-12">
              <p className="text-base font-semibold text-foreground sm:text-lg">
                Aucun produit trouvé
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Essayez d'autres mots-clés ou retirez certains filtres.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <MarketplaceProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

const Chip = ({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) => (
  <button
    onClick={onRemove}
    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
  >
    {children}
    <X className="h-3 w-3" />
  </button>
);

export default SearchPage;
