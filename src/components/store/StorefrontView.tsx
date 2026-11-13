import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Search, ShoppingBag, Star } from "lucide-react";
import { shopStyle, type ShopConfig, type SectionId } from "@/lib/shopConfig";
import { formatMoney } from "@/lib/currency";
import { getBuyerPortalUrl } from "@/lib/subdomain";

export interface StorefrontProduct {
  id: string;
  title: string;
  price: number;
  original_price?: number | null;
  thumbnail_url?: string | null;
  type?: string;
  sales_count?: number | null;
  category?: string | null;
}

interface StorefrontViewProps {
  config: ShopConfig;
  products: StorefrontProduct[];
  sellerName?: string;
  storeSlug?: string;
  subSlug?: string | null;
  isCustomizerPreview?: boolean;
  onProductClick?: (productId: string) => void;
  onBuyClick?: (product: StorefrontProduct) => void;
}

export function StorefrontView({
  config,
  products,
  sellerName = "DUKAIO",
  storeSlug = "boutique",
  subSlug = null,
  isCustomizerPreview = false,
  onProductClick,
  onBuyClick,
}: StorefrontViewProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tout");
  const [sort, setSort] = useState("recent");
  const [liked, setLiked] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(`dukaio_fav_${storeSlug}`) || "[]");
    } catch {
      return [];
    }
  });

  const toggleLike = (id: string) => {
    setLiked((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      try {
        localStorage.setItem(`dukaio_fav_${storeSlug}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Derive categories from actual products
  const categoryList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
      else if (p.type === "course") set.add("Formation");
      else if (p.type === "file") set.add("Fichier");
      else if (p.type === "license") set.add("Licence");
      else if (p.type === "service") set.add("Service");
    });
    return ["Tout", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    const filtered = products.filter((product) => {
      const prodCategory =
        product.category ||
        (product.type === "course"
          ? "Formation"
          : product.type === "file"
          ? "Fichier"
          : product.type === "license"
          ? "Licence"
          : product.type === "service"
          ? "Service"
          : "Digital");

      const matchesCategory = category === "Tout" || prodCategory === category;
      const matchesQuery =
        !config.products.search ||
        !normalizedQuery ||
        product.title.toLocaleLowerCase("fr").includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });

    if (sort === "asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "desc") return [...filtered].sort((a, b) => b.price - a.price);
    if (sort === "pop") return [...filtered].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    return filtered;
  }, [products, query, category, sort, config.products.search]);

  const style = shopStyle(config);

  const getProductHref = (productId: string) => {
    if (isCustomizerPreview) return "#";
    return subSlug ? `/${productId}` : `/store/${storeSlug}/${productId}`;
  };

  const sections: Record<SectionId, ReactNode> = {
    hero: (
      <section
        aria-label="Bandeau de la boutique"
        className={`relative mt-4 flex items-center overflow-hidden rounded-[var(--shop-radius)] bg-shop-hero px-6 text-white sm:mt-6 sm:px-10 lg:px-14 ${
          config.hero.height === "compact" ? "min-h-28 sm:min-h-32" : "min-h-32 sm:min-h-40 lg:min-h-44"
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(60%_120%_at_85%_50%,color-mix(in_srgb,var(--shop-accent)_32%,transparent),transparent_70%)] pointer-events-none" />
        <h1 className="relative font-shop-display text-3xl sm:text-5xl lg:text-6xl font-black leading-none tracking-tight">
          {config.hero.title.length > 2 ? config.hero.title.slice(0, -2) : config.hero.title}
          {config.hero.title.length > 2 && (
            <span className="text-shop-accent">{config.hero.title.slice(-2)}</span>
          )}
        </h1>
      </section>
    ),
    products: (
      <section aria-label="Produits" className="pt-10 sm:pt-14" id="produits">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="truncate font-shop-display text-2xl font-bold sm:text-3xl">
              {config.products.title || "Tous les produits"}
            </h2>
            <p className="mt-1 text-sm text-shop-muted">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} disponible
              {filteredProducts.length > 1 ? "s" : ""}
            </p>
          </div>
          <select
            aria-label="Trier les produits"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-10 w-full rounded-full border border-shop-line bg-shop-bg px-4 text-sm text-shop-text outline-none focus:border-shop-text sm:w-auto"
          >
            <option value="recent">Les plus récents</option>
            <option value="pop">Les plus vendus</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>

        {config.products.search && (
          <label className="mt-5 flex h-11 items-center gap-2 rounded-full border border-shop-line px-4 text-sm focus-within:border-shop-text lg:hidden">
            <Search className="h-4 w-4 shrink-0 text-shop-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un produit…"
              className="w-full bg-transparent outline-none placeholder:text-shop-muted"
            />
          </label>
        )}

        {config.products.categories && categoryList.length > 1 && (
          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {categoryList.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium transition-colors ${
                  category === item
                    ? "border-shop-text bg-shop-text text-shop-bg"
                    : "border-shop-line text-shop-muted hover:border-shop-text hover:text-shop-text"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-[var(--shop-radius)] border border-dashed border-shop-line py-16 text-center">
            <p className="font-semibold text-base">Aucun produit trouvé</p>
            <p className="mt-1 text-sm text-shop-muted">Essayez une autre recherche ou filtre.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
            {filteredProducts.map((product) => {
              const discount =
                product.original_price && product.original_price > product.price
                  ? Math.round((1 - product.price / product.original_price) * 100)
                  : 0;
              const isLiked = liked.includes(product.id);
              const productUrl = getProductHref(product.id);

              return (
                <article key={product.id} className="group flex min-w-0 flex-col">
                  {/* Image container with strict square aspect ratio */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-[var(--shop-radius)] bg-shop-surface">
                    <Link
                      to={productUrl}
                      onClick={(e) => {
                        if (isCustomizerPreview) {
                          e.preventDefault();
                          onProductClick?.(product.id);
                        }
                      }}
                      aria-label={product.title}
                      className="absolute inset-0 z-10"
                    />
                    <img
                      src={
                        product.thumbnail_url ||
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop"
                      }
                      alt={product.title}
                      loading="lazy"
                      className="pointer-events-none h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />

                    {discount > 0 && (
                      <span className="absolute left-2.5 top-2.5 z-20 rounded-full bg-shop-accent px-2 py-0.5 text-[11px] font-bold text-shop-accent-foreground shadow-xs">
                        -{discount}%
                      </span>
                    )}

                    <button
                      type="button"
                      aria-label={isLiked ? `Retirer des favoris` : `Ajouter aux favoris`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleLike(product.id);
                      }}
                      className="absolute right-2.5 top-2.5 z-20 grid h-8 w-8 place-items-center rounded-full bg-shop-bg/90 backdrop-blur-xs transition-opacity sm:opacity-0 sm:group-hover:opacity-100 data-[on=true]:opacity-100"
                      data-on={isLiked}
                    >
                      <Heart
                        className={`h-4 w-4 ${isLiked ? "fill-shop-accent text-shop-accent" : "text-shop-text"}`}
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>

                  {/* Metadata */}
                  {(config.products.showRatings || config.products.showSales) && (
                    <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-shop-muted">
                      <span className="truncate uppercase tracking-wider font-semibold">
                        {product.category || product.type || "Digital"}
                      </span>
                      <span className="flex shrink-0 items-center gap-1 font-medium">
                        {config.products.showRatings && (
                          <>
                            <Star className="h-3 w-3 fill-shop-text text-shop-text" /> 5.0
                          </>
                        )}
                        {config.products.showSales && (
                          <span className="hidden sm:inline">
                            · {product.sales_count || 12} ventes
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Title & Seller */}
                  <h3 className="mt-1.5 line-clamp-2 min-h-[2.75em] font-shop-body text-sm font-semibold leading-snug sm:text-[15px]">
                    <Link
                      to={productUrl}
                      onClick={(e) => {
                        if (isCustomizerPreview) {
                          e.preventDefault();
                          onProductClick?.(product.id);
                        }
                      }}
                      className="hover:underline"
                    >
                      {product.title}
                    </Link>
                  </h3>
                  <p className="mt-1 truncate text-xs text-shop-muted">
                    par <span className="text-shop-text font-medium">{sellerName}</span>
                  </p>

                  {/* Price */}
                  <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[15px] font-bold sm:text-base">
                      {formatMoney(product.price, "XOF")}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-xs text-shop-muted line-through">
                        {formatMoney(product.original_price, "XOF")}
                      </span>
                    )}
                  </div>

                  {/* Buy Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onBuyClick) {
                        onBuyClick(product);
                      } else if (!isCustomizerPreview) {
                        window.location.href = productUrl;
                      }
                    }}
                    className={`mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-[13px] font-bold transition-all ${
                      config.appearance.buttons === "solid"
                        ? "bg-shop-accent text-shop-accent-foreground hover:opacity-90 shadow-xs"
                        : "border border-shop-text text-shop-text hover:bg-shop-text hover:text-shop-bg"
                    }`}
                  >
                    Obtenir{" "}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    ),
    newsletter: (
      <section
        aria-label="Suivre la boutique"
        className="my-12 grid gap-6 rounded-[var(--shop-radius)] border border-shop-line p-6 sm:my-16 sm:p-10 lg:grid-cols-[1fr_1.3fr] lg:items-center"
      >
        <div>
          <span className="block h-0.5 w-8 bg-shop-accent" />
          <h2 className="mt-4 font-shop-display text-2xl font-bold sm:text-3xl">
            {config.newsletter.title || "Suivre la boutique"}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-shop-muted">
            {config.newsletter.description || "Recevez les nouveaux produits et offres exclusives par e-mail."}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Merci pour votre inscription !");
          }}
          className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]"
        >
          <input
            aria-label="Prénom"
            placeholder="Prénom (facultatif)"
            className="h-11 min-w-0 rounded-full border border-shop-line bg-shop-bg px-4 text-sm outline-none focus:border-shop-text"
          />
          <input
            aria-label="Adresse e-mail"
            type="email"
            required
            placeholder="Votre adresse e-mail"
            className="h-11 min-w-0 rounded-full border border-shop-line bg-shop-bg px-4 text-sm outline-none focus:border-shop-text"
          />
          <button
            type="submit"
            className="h-11 rounded-full bg-shop-accent px-6 text-sm font-bold text-shop-accent-foreground transition-opacity hover:opacity-90 shadow-xs"
          >
            {config.newsletter.buttonLabel || "Suivre"}
          </button>
        </form>
      </section>
    ),
    about: (
      <section
        aria-label="À propos"
        className="my-12 border-y border-shop-line py-10 sm:my-16 sm:py-14"
      >
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-shop-accent">
            Notre univers
          </span>
          <h2 className="mt-3 font-shop-display text-2xl font-bold sm:text-3xl">
            {config.about.title || "À propos de la boutique"}
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-shop-muted">
            {config.about.text || config.description}
          </p>
        </div>
      </section>
    ),
  };

  return (
    <div
      className="min-h-full bg-shop-bg font-shop-body text-shop-text transition-colors duration-200"
      style={style}
    >
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-30 border-b border-shop-line bg-shop-bg/95 backdrop-blur-md">
        <div className="mx-auto grid h-16 max-w-[1280px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr] lg:px-8">
          {/* Logo & Brand Name */}
          <Link
            to={subSlug ? "/" : `/store/${storeSlug}`}
            className="flex min-w-0 items-center gap-2.5"
            aria-label={`Accueil ${config.name}`}
          >
            {config.logo ? (
              <img src={config.logo} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-shop-text font-shop-display text-sm font-bold text-shop-bg">
                {config.name.trim().charAt(0) || "D"}
              </span>
            )}
            <span className="truncate font-shop-display text-[15px] font-bold uppercase tracking-[0.16em]">
              {config.name || "Boutique"}
            </span>
          </Link>

          {/* Navigation link: Boutique (ONLY! "Personnaliser" is completely removed from public view) */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation de la boutique">
            <span className="relative text-sm font-bold after:absolute after:-bottom-[22px] after:left-1/2 after:h-0.5 after:w-6 after:-translate-x-1/2 after:bg-shop-text">
              Boutique
            </span>
          </nav>

          {/* Right Header Actions: Search, Wishlist */}
          <div className="flex items-center justify-end gap-2">
            {config.products.search && (
              <label className="mr-2 hidden h-10 w-64 items-center gap-2 rounded-full border border-shop-line px-4 text-sm transition-colors focus-within:border-shop-text lg:flex">
                <Search className="h-4 w-4 shrink-0 text-shop-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher…"
                  className="w-full min-w-0 bg-transparent outline-none placeholder:text-shop-muted"
                />
              </label>
            )}

            <button
              type="button"
              aria-label="Favoris"
              onClick={() => {
                if (liked.length > 0) {
                  alert(`Vous avez ${liked.length} produit(s) favori(s).`);
                }
              }}
              className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-shop-surface"
            >
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {liked.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-shop-accent" />
              )}
            </button>

            {!isCustomizerPreview && (
              <a
                href={getBuyerPortalUrl("/mes-achats")}
                className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-shop-line text-xs font-semibold text-shop-text hover:bg-shop-surface transition-colors"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-shop-muted" />
                <span>Mes achats</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT SECTIONS ─── */}
      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-16">
        {config.sections
          .filter((section) => section.visible)
          .map((section) => (
            <div key={section.id}>{sections[section.id]}</div>
          ))}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="mt-8 border-t border-shop-line">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-8 text-xs text-shop-muted sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} {config.name} · {config.slug || storeSlug}.dukaio.com
          </span>
          <div className="flex flex-wrap gap-5 font-medium">
            {config.socials.instagram && (
              <a
                href={config.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-shop-text transition-colors"
              >
                Instagram
              </a>
            )}
            {config.socials.tiktok && (
              <a
                href={config.socials.tiktok}
                target="_blank"
                rel="noreferrer"
                className="hover:text-shop-text transition-colors"
              >
                TikTok
              </a>
            )}
            {config.socials.youtube && (
              <a
                href={config.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="hover:text-shop-text transition-colors"
              >
                YouTube
              </a>
            )}
            {config.whatsapp && (
              <a
                href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-shop-text transition-colors"
              >
                WhatsApp
              </a>
            )}
            <a
              href={`mailto:contact@${config.slug || storeSlug}.dukaio.com`}
              className="hover:text-shop-text transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
