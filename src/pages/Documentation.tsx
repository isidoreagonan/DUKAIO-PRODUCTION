import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { BookOpen, Code, Rocket, Settings, CreditCard, Shield } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const sections = [
  { icon: Rocket, title: "Démarrage rapide", desc: "Créez votre compte et publiez votre premier produit en 5 minutes." },
  { icon: BookOpen, title: "Guide des produits", desc: "Apprenez à créer des fichiers, cours et licences." },
  { icon: CreditCard, title: "Paiements", desc: "Configurez Mobile Money, cartes bancaires et retraits." },
  { icon: Settings, title: "Personnalisation", desc: "Personnalisez votre boutique, domaine et branding." },
  { icon: Code, title: "API & Webhooks", desc: "Intégrez Dukaio à vos outils avec notre API REST." },
  { icon: Shield, title: "Sécurité", desc: "Bonnes pratiques de sécurité et protection de vos données." },
];

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Documentation" description="Documentation complète Dukaio : démarrage rapide, guides produits, paiements, API, webhooks et personnalisation de boutique." canonicalPath="/documentation" />
      <Navbar />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              <span className="text-gradient">Documentation</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour maîtriser Dukaio et développer votre business.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {sections.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-card-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Documentation;
