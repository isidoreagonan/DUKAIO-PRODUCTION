import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Product, useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/products";
import { Button } from "@/components/ui/button";

const categoryLabels: Record<string, string> = {
  course: "Cours",
  formation: "Formation",
  ebook: "E-book",
  template: "Template",
};

const categoryColors: Record<string, string> = {
  course: "bg-primary/10 text-primary",
  formation: "bg-accent/20 text-accent-foreground",
  ebook: "bg-secondary text-secondary-foreground",
  template: "bg-muted text-muted-foreground",
};

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addToCart, items } = useCart();
  const inCart = items.some((i) => i.product.id === product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="card-hover group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      {/* Image placeholder */}
      <Link to={`/product/${product.id}`} className="relative aspect-[16/10] overflow-hidden bg-muted">
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
          <span className="text-4xl">
            {product.category === "course" && "📚"}
            {product.category === "formation" && "🎓"}
            {product.category === "ebook" && "📄"}
            {product.category === "template" && "📋"}
          </span>
        </div>
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-gold-gradient px-3 py-1 text-xs font-semibold text-accent-foreground">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[product.category]}`}>
            {categoryLabels[product.category]}
          </span>
          <div className="flex items-center gap-1 text-accent">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-medium text-muted-foreground">{product.rating}</span>
          </div>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="mb-2 line-clamp-2 font-semibold text-card-foreground transition-colors group-hover:text-primary">
            {product.title}
          </h3>
        </Link>

        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
          <Button
            size="sm"
            onClick={() => addToCart(product)}
            disabled={inCart}
            className={inCart ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            {inCart ? "Ajouté" : "Ajouter"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
