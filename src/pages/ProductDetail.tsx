import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Users, ShoppingCart, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products, formatPrice } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

const categoryLabels: Record<string, string> = {
  course: "Cours",
  formation: "Formation",
  ebook: "E-book",
  template: "Template",
};

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart, items } = useCart();
  const inCart = product ? items.some((i) => i.product.id === product.id) : false;

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Produit introuvable</h1>
          <Link to="/products" className="mt-4 inline-block text-primary underline">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au catalogue
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/10"
          >
            <div className="flex h-full items-center justify-center">
              <span className="text-8xl">
                {product.category === "course" && "📚"}
                {product.category === "formation" && "🎓"}
                {product.category === "ebook" && "📄"}
                {product.category === "template" && "📋"}
              </span>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {categoryLabels[product.category]}
              </span>
              {product.badge && (
                <span className="rounded-full bg-gold-gradient px-3 py-1 text-sm font-semibold text-accent-foreground">
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="mb-4 text-3xl font-bold text-foreground">{product.title}</h1>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-1 text-accent">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-medium text-foreground">{product.rating}</span>
              </div>
              {product.students && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{product.students} étudiants</span>
                </div>
              )}
            </div>

            <p className="mb-8 text-lg text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="mb-8 rounded-xl border border-border bg-card p-6">
              <div className="mb-4 text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </div>
              <Button
                size="lg"
                className={`w-full py-6 text-base font-semibold ${
                  inCart
                    ? "bg-muted text-muted-foreground"
                    : "bg-gold-gradient text-accent-foreground hover:opacity-90"
                }`}
                onClick={() => addToCart(product)}
                disabled={inCart}
              >
                {inCart ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Déjà dans le panier
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Ajouter au panier
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              {["Accès à vie", "Téléchargement immédiat", "Paiement sécurisé"].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {feat}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
