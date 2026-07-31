import { motion } from "framer-motion";
import { FileText, GraduationCap, Key, Smartphone, Shield, Zap, Globe, BarChart3, CreditCard } from "lucide-react";

const productFeatures = [
  {
    icon: FileText,
    title: "Fichiers digitaux",
    description: "E-books, PDFs, templates, fichiers audio/vidéo. Upload et livraison automatique après achat.",
  },
  {
    icon: GraduationCap,
    title: "Cours en ligne",
    description: "Créez des formations complètes avec modules, vidéos, quiz et certificats de complétion.",
  },
  {
    icon: Key,
    title: "Licences logicielles",
    description: "Vendez des clés de licence avec génération automatique et gestion des activations.",
  },
];

const platformFeatures = [
  {
    icon: Smartphone,
    title: "Mobile Money & Cartes",
    description: "Orange Money, MTN, Wave, Moov et cartes bancaires — tous les paiements en un clic.",
  },
  {
    icon: Shield,
    title: "Paiements sécurisés",
    description: "Transactions sécurisées via Mobile Money et carte bancaire dans plus de 10 pays d'Afrique.",
  },
  {
    icon: Zap,
    title: "Livraison instantanée",
    description: "Vos clients accèdent à leurs achats immédiatement. Zéro attente, zéro friction.",
  },
  {
    icon: Globe,
    title: "Vente mondiale",
    description: "Vendez dans plus de 40 pays. Multi-devises et multi-langues intégrés.",
  },
  {
    icon: BarChart3,
    title: "Analytics avancés",
    description: "Dashboard complet avec ventes, revenus, conversion et comportement client.",
  },
  {
    icon: CreditCard,
    title: "Reversement rapide",
    description: "Recevez vos revenus directement sur votre compte Mobile Money ou bancaire.",
  },
];

const FeaturesSection = () => {
  return (
    <>
      {/* What you can sell */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">Produits</p>
            <h2 className="text-3xl font-extrabold text-foreground md:text-5xl mb-4">
              Vendez vos produits digitaux instantanément
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Uploadez vos contenus, fixez vos prix. Dukaio gère les paiements, la livraison et vos clients.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {productFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform features */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">Fonctionnalités</p>
            <h2 className="text-3xl font-extrabold text-foreground md:text-5xl mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une plateforme complète pour gérer votre business digital de A à Z.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesSection;
