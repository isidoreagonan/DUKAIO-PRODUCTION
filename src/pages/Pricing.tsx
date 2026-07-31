import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Check, ArrowRight, Percent, ShieldCheck, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const benefits = [
  { icon: ShieldCheck, title: "Aucun abonnement", desc: "Pas de frais mensuels, pas de frais cachés. Vous ne payez que quand vous vendez." },
  { icon: Zap, title: "Paiement instantané", desc: "Recevez 90% du montant de chaque vente directement sur votre compte." },
  { icon: Globe, title: "Tout inclus", desc: "Boutique en ligne, analytics, gestion clients, paiements Mobile Money & carte bancaire." },
];

const included = [
  "Boutique en ligne personnalisée",
  "Produits illimités",
  "Paiements Mobile Money & carte bancaire",
  "Espace acheteur intégré",
  "Dashboard & analytics",
  "Gestion des clients",

// ... rest unchanged, just need to add SEOHead after <div>

  "Support par email",
  "Livraison instantanée des produits",
  "Lien de boutique personnalisé",
  "Pas de frais d'inscription",
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Tarifs" description="Tarifs Dukaio : 0% de frais d'inscription, commission de seulement 5%. Vendez vos produits digitaux sans abonnement. Paiement Mobile Money." canonicalPath="/pricing" keywords="tarifs vente produits digitaux, commission, prix, mobile money, afrique" />
      <Navbar />

      {/* Hero */}
      <section className="py-24 md:py-32 bg-mesh relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
              <Percent className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Modèle simple à la commission</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              <span className="text-gradient">0 FCFA</span> pour commencer.
              <br />
              <span className="text-foreground">10% par vente.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Pas d'abonnement, pas de frais cachés. Créez votre boutique gratuitement et ne payez qu'une commission de 10% uniquement quand vous réalisez une vente.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25">
                Créer ma boutique gratuite
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Comment ça marche ?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Un modèle transparent aligné sur votre succès</p>
          </motion.div>

          {/* Commission visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto mb-20"
          >
            <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">Exemple : Vous vendez un produit à</p>
                <p className="text-4xl font-extrabold text-foreground">10 000 FCFA</p>
              </div>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="rounded-xl bg-primary/10 border border-primary/20 px-6 py-4 text-center">
                  <p className="text-2xl font-bold text-primary">9 000 FCFA</p>
                  <p className="text-xs text-muted-foreground mt-1">Vous recevez (90%)</p>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">+</div>
                <div className="rounded-xl bg-secondary border border-border px-6 py-4 text-center">
                  <p className="text-2xl font-bold text-foreground">1 000 FCFA</p>
                  <p className="text-xs text-muted-foreground mt-1">Commission Dukaio (10%)</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits */}
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto mb-20">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Everything included */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="rounded-2xl border border-primary/20 bg-card p-8 shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">Tout est inclus, sans frais supplémentaires</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {included.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Prêt à vendre ?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              Rejoignez des milliers de créateurs qui vendent déjà leurs produits digitaux sur Dukaio.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25">
                Créer ma boutique maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
