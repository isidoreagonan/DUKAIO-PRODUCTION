import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/products";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const { items, removeFromCart, total, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Votre panier</h1>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">Panier vide</h2>
            <p className="mb-6 text-muted-foreground">Explorez notre catalogue pour trouver des produits</p>
            <Link to="/products">
              <Button className="bg-primary text-primary-foreground">
                Voir le catalogue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
                    {item.product.category === "course" && "📚"}
                    {item.product.category === "formation" && "🎓"}
                    {item.product.category === "ebook" && "📄"}
                    {item.product.category === "template" && "📋"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground truncate">{item.product.title}</h3>
                    <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-card-foreground">Résumé</h2>
                <div className="mb-4 space-y-2">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">{item.product.title}</span>
                      <span className="text-foreground flex-shrink-0">{formatPrice(item.product.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="mb-6 border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatPrice(total)}</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-gold-gradient text-accent-foreground py-6 text-base font-semibold hover:opacity-90"
                >
                  Payer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Paiement sécurisé • Mobile Money & Cartes
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
