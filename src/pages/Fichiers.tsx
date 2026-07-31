import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { FileText, Download, Shield, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const features = [
  { icon: FileText, title: "Tous les formats", desc: "PDFs, e-books, templates, presets, fichiers audio, vidéo, ZIP et plus encore." },
  { icon: Download, title: "Livraison instantanée", desc: "Vos clients reçoivent leur fichier immédiatement après le paiement." },
  { icon: Shield, title: "Protection DRM", desc: "Protégez vos fichiers contre le piratage avec nos systèmes de sécurité." },
  { icon: Zap, title: "Upload rapide", desc: "Uploadez des fichiers jusqu'à 5 Go en quelques secondes." },
];

const Fichiers = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Vendre des fichiers digitaux" description="Vendez vos fichiers digitaux : PDFs, e-books, templates, presets. Livraison instantanée, protection DRM et paiement Mobile Money." canonicalPath="/fichiers" keywords="vendre fichiers digitaux, ebook, template, preset, PDF, afrique" />
      <Navbar />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              📁 Fichiers digitaux
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Vendez vos <span className="text-gradient">fichiers digitaux</span> sans limites
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              E-books, templates, presets, musiques — uploadez et vendez n'importe quel type de fichier digital à travers le monde.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25">
                Commencer à vendre <ArrowRight className="ml-2 h-4 w-4" />
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

export default Fichiers;
