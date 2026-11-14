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
  previewDevice?: "mobile" | "tablet" | "desktop";
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
  previewDevice = "desktop",
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

  const isMobile = previewDevice === "mobile";

  const toggleLike = (id: string) => {
    setLiked((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      try {
        localStorage.setItem(`dukaio_fav_${storeSlug}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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

  const heroTitle = config.hero.title || config.name || "DUKAIO";

  const sections: Record<SectionId, ReactNode> = {
    hero: (
      <section
        aria-label="Bandeau de la boutique"
        style={{ backgroundColor: "var(--shop-hero)" }}
        className={`relative mt-4 flex items-center overflow-hidden rounded-2xl text-white shadow-sm transition-colors duration-200 ${
          isMobile
            ? "min-h-32 px-6 py-6"
            : config.hero.height === "compact"
            ? "min-h-28 px-6 sm:mt-6 sm:min-h-32 sm:px-12"
            : "min-h-36 px-6 sm:mt-6 sm:min-h-44 sm:px-12 lg:min-h-48"
        }`}
      >
        {/* Glow accent dynamically driven by var(--shop-accent) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 120% at 85% 50%, color-mix(in srgb, var(--shop-accent) 40%, transparent), transparent 70%)",
          }}
        />
        <h1
          className={`relative font-extrabold leading-none tracking-tight text-white ${
            isMobile ? "text-3xl" : "text-3xl sm:text-5xl lg:text-6xl"
          }`}
          style={{ fontFamily: "var(--shop-display)" }}
        >
          {heroTitle.length > 2 ? heroTitle.slice(0, -2) : heroTitle}
          {heroTitle.length > 2 && (
            <span style={{ color: "var(--shop-accent)" }}>{heroTitle.slice(-2)}</span>
          )}
        </h1>
      </section>
    ),
    products: (
      <section aria-label="Produits" className="pt-8 sm:pt-12" id="produits">
        {/* Title & Sorting */}
        <div className={`flex flex-col gap-4 ${isMobile ? "" : "sm:flex-row sm:items-end sm:justify-between"}`}>
          <div className="min-w-0">
            <h2
              className="text-2xl font-bold sm:text-3xl"
              style={{ color: "var(--shop-text)", fontFamily: "var(--shop-display)" }}
            >
              {config.products.title || "Tous les produits"}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--shop-muted)" }}>
              {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} disponible
              {filteredProducts.length > 1 ? "s" : ""}
            </p>
          </div>
          <select
            aria-label="Trier les produits"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            style={{
              backgroundColor: "var(--shop-surface)",
              borderColor: "var(--shop-line)",
              color: "var(--shop-text)",
            }}
            className={`h-11 rounded-full border px-4 text-sm outline-none font-medium transition-colors ${
              isMobile ? "w-full mt-2" : "w-full sm:w-auto"
            }`}
          >
            <option value="recent">Les plus récents</option>
            <option value="pop">Les plus vendus</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>

        {/* Search for mobile (Clean rounded pill below sort) */}
        {config.products.search && (
          <label
            style={{
              borderColor: "var(--shop-line)",
              backgroundColor: "var(--shop-surface)",
              color: "var(--shop-text)",
            }}
            className={`mt-4 flex h-11 items-center gap-2.5 rounded-full border px-4 text-sm transition-colors ${
              isMobile ? "flex" : "lg:hidden"
            }`}
          >
            <Search className="h-4 w-4 shrink-0" style={{ color: "var(--shop-muted)" }} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un produit…"
              className="w-full bg-transparent outline-none"
              style={{ color: "var(--shop-text)" }}
            />
          </label>
        )}

        {/* Category Filter Pills (Exact Image 1 & 3) */}
        {config.products.categories && categoryList.length > 1 && (
          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 scrollbar-none">
            {categoryList.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  style={{
                    backgroundColor: active ? "var(--shop-text)" : "var(--shop-surface)",
                    color: active ? "var(--shop-bg)" : "var(--shop-muted)",
                    borderColor: active ? "var(--shop-text)" : "var(--shop-line)",
                  }}
                  className="h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium transition-colors"
                >
                  {item}
                </button>
              );
            })}
          </div>
        )}

        {/* Product Cards Grid: strictly 2 cols on mobile, 4 on desktop */}
        {filteredProducts.length === 0 ? (
          <div
            className="mt-8 rounded-2xl border border-dashed py-16 text-center"
            style={{ borderColor: "var(--shop-line)" }}
          >
            <p className="font-semibold text-base" style={{ color: "var(--shop-text)" }}>
              Aucun produit trouvé
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--shop-muted)" }}>
              Essayez une autre recherche ou filtre.
            </p>
          </div>
        ) : (
          <div
            className={`mt-8 grid ${
              isMobile
                ? "grid-cols-2 gap-3"
                : "grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6"
            }`}
          >
            {filteredProducts.map((product) => {
              const discount =
                product.original_price && product.original_price > product.price
                  ? Math.round((1 - product.price / product.original_price) * 100)
                  : 0;
              const isLiked = liked.includes(product.id);
              const productUrl = getProductHref(product.id);

              return (
                <article key={product.id} className="group flex min-w-0 flex-col">
                  {/* Image container: Edge-to-edge square rounded, NO inner padding, NO glass border (Exact Capture 1) */}
                  <div
                    className="relative aspect-square w-full overflow-hidden rounded-[14px] transition-colors"
                    style={{ backgroundColor: "var(--shop-surface)" }}
                  >
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
                        "/images/demo/p-tiktok.jpg"
                      }
                      alt={product.title}
                      loading="lazy"
                      className="pointer-events-none h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                    />

                    {discount > 0 && (
                      <span
                        className="absolute left-2.5 top-2.5 z-20 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs"
                        style={{
                          backgroundColor: "var(--shop-accent)",
                          color: "var(--shop-accent-foreground)",
                        }}
                      >
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
                      className="absolute right-2.5 top-2.5 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur-xs transition-opacity sm:opacity-0 sm:group-hover:opacity-100 data-[on=true]:opacity-100 shadow-2xs"
                      data-on={isLiked}
                    >
                      <Heart
                        className="h-4 w-4"
                        style={{
                          color: isLiked ? "var(--shop-accent)" : "var(--shop-text)",
                          fill: isLiked ? "var(--shop-accent)" : "none",
                        }}
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>

                  {/* Metadata */}
                  {(config.products.showRatings || config.products.showSales) && (
                    <div className="mt-3 flex items-center justify-between gap-2 text-[11px]" style={{ color: "var(--shop-muted)" }}>
                      <span className="truncate uppercase tracking-wider font-semibold">
                        {product.category || product.type || "Digital"}
                      </span>
                      <span className="flex shrink-0 items-center gap-1 font-medium" style={{ color: "var(--shop-text)" }}>
                        {config.products.showRatings && (
                          <>
                            <Star className="h-3 w-3 fill-current" /> 4.9
                          </>
                        )}
                        {config.products.showSales && (
                          <span className="hidden sm:inline">
                            · {product.sales_count || 1240} ventes
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Title & Seller */}
                  <h3
                    className="mt-1.5 line-clamp-2 min-h-[2.75em] text-sm font-semibold leading-snug sm:text-[15px]"
                    style={{ color: "var(--shop-text)", fontFamily: "var(--shop-body)" }}
                  >
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
                  <p className="mt-1 truncate text-xs" style={{ color: "var(--shop-muted)" }}>
                    par <span className="font-medium" style={{ color: "var(--shop-text)" }}>{sellerName}</span>
                  </p>

                  {/* Price */}
                  <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[15px] font-bold sm:text-base" style={{ color: "var(--shop-text)" }}>
                      {formatMoney(product.price, "XOF")}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-xs line-through" style={{ color: "var(--shop-muted)" }}>
                        {formatMoney(product.original_price, "XOF")}
                      </span>
                    )}
                  </div>

                  {/* Action Button: Obtenir -> Uses radius & button style dynamically */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onBuyClick) {
                        onBuyClick(product);
                      } else if (!isCustomizerPreview) {
                        window.location.href = productUrl;
                      }
                    }}
                    style={{
                      borderRadius: "var(--shop-radius)",
                      backgroundColor:
                        config.appearance.buttons === "solid" ? "var(--shop-accent)" : "transparent",
                      color:
                        config.appearance.buttons === "solid"
                          ? "var(--shop-accent-foreground)"
                          : "var(--shop-text)",
                      borderColor:
                        config.appearance.buttons === "solid" ? "transparent" : "var(--shop-text)",
                    }}
                    className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 border text-[13px] font-semibold transition-all hover:opacity-90 active:scale-[0.99]"
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
        className={`my-8 sm:my-16 grid gap-6 rounded-2xl border p-5 sm:p-10 transition-colors ${
          isMobile ? "grid-cols-1" : "lg:grid-cols-[1fr_1.3fr] lg:items-center"
        }`}
        style={{
          backgroundColor: "var(--shop-surface)",
          borderColor: "var(--shop-line)",
        }}
      >
        <div>
          <span className="block h-0.5 w-8" style={{ backgroundColor: "var(--shop-accent)" }} />
          <h2
            className="mt-4 text-2xl font-bold sm:text-3xl"
            style={{ color: "var(--shop-text)", fontFamily: "var(--shop-display)" }}
          >
            Suivre {config.name || "la boutique"}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--shop-muted)" }}>
            {config.newsletter.description ||
              "Recevez les nouveaux produits et offres exclusives par e-mail. Désinscription en un clic."}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Merci de suivre notre boutique !");
          }}
          className={`grid gap-2.5 ${isMobile ? "grid-cols-1 w-full" : "sm:grid-cols-[1fr_1.4fr_auto]"}`}
        >
          <input
            aria-label="Prénom"
            placeholder="Prénom (facultatif)"
            style={{
              backgroundColor: "var(--shop-bg)",
              borderColor: "var(--shop-line)",
              color: "var(--shop-text)",
            }}
            className="h-11 w-full rounded-full border px-4 text-sm outline-none"
          />
          <input
            aria-label="Adresse e-mail"
            type="email"
            required
            placeholder="Votre adresse e-mail"
            style={{
              backgroundColor: "var(--shop-bg)",
              borderColor: "var(--shop-line)",
              color: "var(--shop-text)",
            }}
            className="h-11 w-full rounded-full border px-4 text-sm outline-none"
          />
          <button
            type="submit"
            style={{
              borderRadius: "var(--shop-radius)",
              backgroundColor: "var(--shop-accent)",
              color: "var(--shop-accent-foreground)",
            }}
            className={`h-11 px-6 text-sm font-bold transition-opacity hover:opacity-90 shadow-xs flex items-center justify-center ${
              isMobile ? "w-full" : "w-full sm:w-auto"
            }`}
          >
            {config.newsletter.buttonLabel || "Suivre"}
          </button>
        </form>
      </section>
    ),
    about: (
      <section
        aria-label="À propos"
        className="my-12 border-y py-10 sm:my-16 sm:py-14 transition-colors"
        style={{ borderColor: "var(--shop-line)" }}
      >
        <div className="max-w-2xl">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--shop-accent)" }}
          >
            Notre univers
          </span>
          <h2
            className="mt-3 text-2xl font-bold sm:text-3xl"
            style={{ color: "var(--shop-text)", fontFamily: "var(--shop-display)" }}
          >
            {config.about.title || "À propos de la boutique"}
          </h2>
          <p
            className="mt-4 whitespace-pre-wrap text-sm leading-7"
            style={{ color: "var(--shop-muted)" }}
          >
            {config.about.text || config.description}
          </p>
        </div>
      </section>
    ),
  };

  return (
    <div
      className="@container min-h-full transition-colors duration-200"
      style={{
        ...style,
        backgroundColor: "var(--shop-bg)",
        color: "var(--shop-text)",
        fontFamily: "var(--shop-body)",
      }}
    >
      {/* ─── HEADER (Exact Capture 3 & 4) ─── */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-sm transition-colors duration-200"
        style={{
          backgroundColor: "color-mix(in srgb, var(--shop-bg) 95%, transparent)",
          borderColor: "var(--shop-line)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand Name */}
          <Link
            to={subSlug ? "/" : `/store/${storeSlug}`}
            className="flex min-w-0 items-center gap-2.5"
            aria-label={`Accueil ${config.name}`}
          >
            {config.logo ? (
              <img src={config.logo} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
            ) : (
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-bold text-xs uppercase tracking-wider"
                style={{
                  backgroundColor: "var(--shop-text)",
                  color: "var(--shop-bg)",
                  fontFamily: "var(--shop-display)",
                }}
              >
                {config.name.trim().charAt(0) || "D"}
              </span>
            )}
            <span
              className="truncate text-[15px] font-bold uppercase tracking-[0.16em]"
              style={{ color: "var(--shop-text)", fontFamily: "var(--shop-display)" }}
            >
              {config.name || "DUKAIO"}
            </span>
          </Link>

          {/* Navigation link: Boutique with underline indicator (Desktop only) */}
          {!isMobile && (
            <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation de la boutique">
              <span
                className="relative text-sm font-bold"
                style={{ color: "var(--shop-text)" }}
              >
                Boutique
                <span
                  className="absolute -bottom-[22px] left-1/2 h-0.5 w-6 -translate-x-1/2"
                  style={{ backgroundColor: "var(--shop-text)" }}
                />
              </span>
            </nav>
          )}

          {/* Right Header Actions: Search (desktop only), Wishlist, Bag */}
          <div className="flex items-center justify-end gap-2">
            {!isMobile && config.products.search && (
              <label
                style={{
                  borderColor: "var(--shop-line)",
                  backgroundColor: "var(--shop-surface)",
                  color: "var(--shop-text)",
                }}
                className="mr-2 hidden h-10 w-64 items-center gap-2 rounded-full border px-4 text-sm transition-colors lg:flex"
              >
                <Search className="h-4 w-4 shrink-0" style={{ color: "var(--shop-muted)" }} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher…"
                  className="w-full min-w-0 bg-transparent outline-none"
                  style={{ color: "var(--shop-text)" }}
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
              className="relative grid h-10 w-10 place-items-center rounded-full transition-colors"
              style={{ color: "var(--shop-text)" }}
            >
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {liked.length > 0 && (
                <span
                  className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
                  style={{ backgroundColor: "var(--shop-accent)" }}
                />
              )}
            </button>

            <a
              href={getBuyerPortalUrl("/mes-achats")}
              className="grid h-10 w-10 place-items-center rounded-full transition-colors"
              style={{ color: "var(--shop-text)" }}
              title="Mes achats"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </a>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT SECTIONS (Order and visibility driven strictly by config.sections) ─── */}
      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-16">
        {config.sections
          .filter((section) => section.visible)
          .map((section) => (
            <div key={section.id}>{sections[section.id]}</div>
          ))}
      </main>

      {/* ─── FOOTER ─── */}
      <footer
        className="mt-8 border-t transition-colors"
        style={{ borderColor: "var(--shop-line)" }}
      >
        <div
          className={`mx-auto flex max-w-[1280px] gap-3 px-4 py-8 text-xs ${
            isMobile
              ? "flex-col items-center text-center"
              : "flex-col sm:flex-row sm:justify-between sm:px-6 lg:px-8"
          }`}
          style={{ color: "var(--shop-muted)" }}
        >
          <span>
            © 2026 {config.name} · {config.slug || storeSlug}.dukaio.com
          </span>
          <div className="flex flex-wrap gap-5 font-medium">
            {config.socials.instagram && (
              <a
                href={config.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:underline transition-colors"
                style={{ color: "var(--shop-text)" }}
              >
                Instagram
              </a>
            )}
            {config.socials.tiktok && (
              <a
                href={config.socials.tiktok}
                target="_blank"
                rel="noreferrer"
                className="hover:underline transition-colors"
                style={{ color: "var(--shop-text)" }}
              >
                TikTok
              </a>
            )}
            {config.socials.youtube && (
              <a
                href={config.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="hover:underline transition-colors"
                style={{ color: "var(--shop-text)" }}
              >
                YouTube
              </a>
            )}
            <a
              href={`mailto:contact@${config.slug || storeSlug}.dukaio.com`}
              className="hover:underline transition-colors"
              style={{ color: "var(--shop-text)" }}
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
