import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Globe2, Flame, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import TrustSection from "@/components/TrustSection";

const manifestoWords = ["L'Afrique", "ne", "vendra", "plus", "jamais", "comme", "avant."];

const acts = [
  {
    chapter: "ACTE I",
    title: "Le constat",
    text: "Pendant des décennies, le talent africain a financé la croissance des plateformes étrangères. Des créateurs brillants, des produits puissants — coincés derrière des frais absurdes, des paiements impossibles, des outils pensés ailleurs.",
    icon: Flame,
  },
  {
    chapter: "ACTE II",
    title: "La rupture",
    text: "Dukaio n'est pas une énième boutique en ligne. C'est une réponse. Mobile Money natif. Commission unique de 10%. Wallet sécurisé. KYC souverain. Zéro intermédiaire qui ne comprend pas le terrain.",
    icon: Sparkles,
  },
  {
    chapter: "ACTE III",
    title: "La promesse",
    text: "Construire l'infrastructure de vente du continent. Donner à chaque créateur — du Bénin au Kenya, du Sénégal à la RDC — les armes pour transformer son savoir en souveraineté économique.",
    icon: Crown,
  },
];

const pillars = [
  { value: "10%", label: "Commission unique. Aucun frais caché." },
  { value: "12+", label: "Pays africains couverts en Mobile Money." },
  { value: "5 jours", label: "Maturation des fonds, retraits sécurisés." },
  { value: "∞", label: "Ambition. Cette plateforme appartient au continent." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Manifeste — Dukaio"
        description="L'Afrique ne vendra plus jamais comme avant. Dukaio est l'infrastructure de vente digitale pensée par et pour le continent. 10% de commission, Mobile Money natif, souveraineté économique."
        canonicalPath="/about"
      />
      <Navbar />

      {/* HERO — Manifeste typographique XXL */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-background">
        {/* Background ambiance */}
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-40 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[140px]"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 -right-40 h-[500px] w-[500px] rounded-full bg-accent/30 blur-[140px]"
        />

        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div className="container relative mx-auto px-6 py-20">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-10"
          >
            <span className="h-px w-12 bg-accent" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-accent">Le Manifeste</span>
          </motion.div>

          {/* Manifesto words — animated one by one */}
          <h1 className="font-extrabold leading-[0.95] tracking-tight text-foreground text-[clamp(3rem,11vw,10rem)] mb-12">
            {manifestoWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.25em]"
              >
                {word === "jamais" ? (
                  <span className="text-gradient italic">{word}</span>
                ) : (
                  word
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed"
          >
            Dukaio est le système d'exploitation commercial des créateurs africains.
            Pas une copie. Pas une adaptation. Une réponse construite depuis le terrain,
            pour ceux qui ont décidé de ne plus attendre la permission.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
          >
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Lire la suite</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="h-10 w-px bg-gradient-to-b from-accent to-transparent"
            />
          </motion.div>
        </div>
      </section>

      {/* PILLARS strip */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {pillars.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center md:text-left"
              >
                <p className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">{p.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground leading-snug">{p.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE ACTS — Storytelling éditorial */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-accent">Pourquoi Dukaio existe</span>
            <h2 className="mt-4 text-4xl md:text-6xl font-extrabold text-foreground leading-tight">
              Trois actes.<br />
              <span className="text-gradient italic">Une seule conviction.</span>
            </h2>
          </motion.div>

          <div className="space-y-24">
            {acts.map((act, i) => (
              <motion.article
                key={act.chapter}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="grid md:grid-cols-[180px_1fr] gap-8 md:gap-16 items-start"
              >
                <div className="flex md:flex-col items-center md:items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl">
                    <act.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-bold tracking-[0.3em] uppercase text-accent">{act.chapter}</span>
                </div>

                <div>
                  <h3 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
                    {act.title}
                  </h3>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    {act.text}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* PULL QUOTE — sans auteur, déclaration brute */}
      <section className="relative py-32 overflow-hidden bg-secondary/30">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full border border-accent/20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full border border-primary/20"
        />

        <div className="container relative mx-auto px-6">
          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Globe2 className="h-12 w-12 text-accent mx-auto mb-8" />
            <p className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
              « Le prochain milliard de dollars d'économie créative africaine{" "}
              <span className="text-gradient italic">ne passera pas par l'étranger.</span> »
            </p>
            <div className="mt-10 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-accent" />
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
                Le manifeste Dukaio
              </span>
              <span className="h-px w-10 bg-accent" />
            </div>
          </motion.blockquote>
        </div>
      </section>

      {/* TRUST */}
      <TrustSection />

      {/* FINAL CTA */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container relative mx-auto px-6 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight">
              Vous n'avez pas besoin d'attendre.<br />
              <span className="text-gradient italic">Le moment, c'est maintenant.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Ouvrez votre boutique en moins de 3 minutes. Encaissez en Mobile Money dès la première vente.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-10 py-7 text-base font-bold shadow-2xl hover:shadow-accent/30 transition-shadow">
                Rejoindre le mouvement
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

export default About;
