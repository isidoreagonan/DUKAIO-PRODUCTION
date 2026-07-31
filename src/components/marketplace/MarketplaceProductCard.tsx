import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Package, Heart } from "lucide-react";
import { getCategoryByKey } from "@/data/marketplaceCategories";
import { useState } from "react";
import { useUserBadge } from "@/hooks/useUserBadge";
import { VerifiedBadge, type BadgeGrade } from "@/components/VerifiedBadge";

export interface MarketplaceProduct {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  original_price?: number | null;
  thumbnail_url?: string | null;
  type: string;
  category?: string | null;
  sales_count?: number;
  creator_id?: string | null;
  store?: {
    display_name?: string;
    store_slug?: string;
    store_logo_url?: string;
    avatar_url?: string;
  } | null;
}

interface Props {
  product: MarketplaceProduct;
  index?: number;
  /** when true, prevents card from shrinking inside horizontal scrollers */
  fixedWidth?: boolean;
  /** Optional pre-fetched badge (avoids one query per card) */
  sellerBadge?: BadgeGrade | null;
}

export const MarketplaceProductCard = ({ product, index = 0, fixedWidth, sellerBadge }: Props) => {
  const { grade: fetchedGrade } = useUserBadge(sellerBadge === undefined ? product.creator_id : null);
  const grade = sellerBadge !== undefined ? sellerBadge : fetchedGrade;
  const cat = getCategoryByKey(product.category);
  const storeSlug = product.store?.store_slug;
  const href = storeSlug
    ? `/store/${storeSlug}/${product.id}`
    : `/product/${product.id}`;

  const hasDiscount =
    product.original_price && Number(product.original_price) > Number(product.price);
  const discountPct = hasDiscount
    ? Math.round(
        ((Number(product.original_price) - Number(product.price)) /
          Number(product.original_price)) *
          100,
      )
    : 0;

  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -4 }}
      className={`group ${fixedWidth ? "w-[160px] shrink-0 sm:w-[200px]" : ""}`}
    >
      <Link to={href} className="block">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary ring-1 ring-border/50">
          {product.thumbnail_url ? (
            <img
              src={product.thumbnail_url}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Package className="h-10 w-10" />
            </div>
          )}

          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* top-left badge */}
          {hasDiscount && (
            <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase text-destructive-foreground shadow-md">
              -{discountPct}%
            </span>
          )}

          {/* heart */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setLiked((s) => !s);
            }}
            aria-label="Favori"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur transition-all hover:scale-110 active:scale-95"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                liked ? "fill-destructive text-destructive" : ""
              }`}
            />
          </button>

          {/* sales count chip bottom */}
          {(product.sales_count || 0) > 0 && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-md backdrop-blur">
              <Star className="h-2.5 w-2.5 fill-primary text-primary" />
              {product.sales_count} vendus
            </span>
          )}
        </div>

        <div className="mt-2.5 space-y-1">
          {cat && (
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {cat.emoji} {cat.label}
            </span>
          )}
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-sm">
            {product.title}
          </h3>
          {product.store?.display_name && (
            <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
              <span className="truncate">par {product.store.display_name}</span>
              {grade && <VerifiedBadge grade={grade} size="xs" />}
            </p>
          )}
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-sm font-bold text-foreground sm:text-base">
              {Number(product.price).toLocaleString()} FCFA
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-muted-foreground line-through">
                {Number(product.original_price).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
