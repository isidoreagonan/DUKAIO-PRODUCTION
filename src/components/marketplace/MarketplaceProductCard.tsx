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
      className={`group relative flex flex-col overflow-hidden rounded-[14px] bg-white border border-hair shadow-sm transition-colors duration-200 hover:border-blue ${
        fixedWidth ? "w-[220px] shrink-0 sm:w-auto" : "w-full"
      }`}
    >
      <Link to={href} className="flex flex-col flex-1">
        {/* Image */}
        <div className="relative aspect-square w-full bg-secondary overflow-hidden">
          {product.thumbnail_url ? (
            <img
              src={product.thumbnail_url}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Package className="h-10 w-10" />
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <span className="absolute left-3 top-3 rounded-md bg-blue px-2 py-1 text-[10px] font-bold text-white shadow-sm">
              -{discountPct}%
            </span>
          )}

          {/* Heart button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setLiked((s) => !s);
            }}
            aria-label="Favori"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-all hover:scale-110 active:scale-95 hover:text-red-500"
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors ${
                liked ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3.5 sm:p-4">
          <h3 className="line-clamp-2 text-lg font-serif font-medium leading-tight text-ink transition-colors group-hover:text-blue mb-1.5 min-h-[38px]">
            {product.title}
          </h3>
          
          {product.store?.display_name && (
            <p className="flex items-center gap-1.5 truncate text-[11px] text-slate-500 mb-3">
              <span>Par:</span>
              {product.store.store_logo_url || product.store.avatar_url ? (
                <img 
                  src={product.store.store_logo_url || product.store.avatar_url} 
                  alt={product.store.display_name}
                  className="w-4 h-4 rounded-full object-cover bg-slate-100"
                />
              ) : null}
              <span className="font-sans font-medium text-slate-700 truncate">{product.store.display_name}</span>
              {grade && <VerifiedBadge grade={grade} size="xs" />}
            </p>
          )}

          <div className="flex items-end gap-2 mt-auto mb-3.5">
            <span className="font-serif text-[17px] font-medium text-ink">
              {Number(product.price).toLocaleString()} FCFA
            </span>
            {hasDiscount && (
              <span className="text-[11px] font-medium text-slate-400 line-through pb-0.5">
                {Number(product.original_price).toLocaleString()} FCFA
              </span>
            )}
          </div>

          <div className="w-full bg-blue text-white hover:bg-blueDeep py-2 rounded-lg text-sm font-sans font-semibold text-center transition-colors">
            Acheter maintenant
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
