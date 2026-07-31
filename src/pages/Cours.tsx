import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { GraduationCap, Video, Award, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const features = [
  { icon: GraduationCap, title: "Modules structurés", desc: "Créez des formations avec chapitres, leçons et progression des élèves." },
  { icon: Video, title: "Vidéo HD", desc: "Hébergez vos vidéos directement sur la plateforme avec streaming adaptatif." },
  { icon: Award, title: "Certificats", desc: "Générez automatiquement des certificats de complétion pour vos étudiants." },
  { icon: Users, title: "Communauté", desc: "Espace de discussion intégré pour vos élèves et forums de support." },
];

const Cours = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Vendre des cours en ligne" description="Créez et vendez vos cours en ligne : vidéos HD, modules structurés, certificats. Plateforme e-learning avec paiement Mobile Money." canonicalPath="/cours" keywords="vendre cours en ligne, formation en ligne, e-learning, afrique, mobile money" />
      <Navbar />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              🎓 Cours en ligne
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Créez et vendez vos <span className="text-gradient">cours en ligne</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Formations complètes avec vidéos, quiz, certificats et suivi de progression — tout en un seul endroit.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25">
                Créer mon premier cours <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Cours;
