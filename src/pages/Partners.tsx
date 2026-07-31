import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Handshake, TrendingUp, Gift, HeadphonesIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const benefits = [
  { icon: TrendingUp, title: "Commissions attractives", desc: "Gagnez jusqu'à 30% de commissions récurrentes sur chaque client référé." },
  { icon: Gift, title: "Ressources marketing", desc: "Accédez à des bannières, templates et contenus prêts à l'emploi." },
  { icon: Handshake, title: "Support dédié", desc: "Un manager partenaire dédié pour vous accompagner dans votre croissance." },
  { icon: HeadphonesIcon, title: "Dashboard partenaire", desc: "Suivez vos performances, commissions et paiements en temps réel." },
];

const Partners = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Devenir partenaire" description="Rejoignez le programme partenaire Dukaio. Gagnez jusqu'à 30% de commissions récurrentes en référant des créateurs." canonicalPath="/partners" />
      <Navbar />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Devenez <span className="text-gradient">partenaire</span> Dukaio
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Rejoignez notre programme partenaire et gagnez des commissions en recommandant la plateforme.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25">
                Devenir partenaire <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 text-center">
                <div className="mb-4 mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-card-foreground">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Partners;
