import { motion } from "framer-motion";
import { ShieldCheck, Fingerprint, Lock, Scale, Sparkles, BadgeCheck, AlertTriangle, Eye } from "lucide-react";

const pillars = [
  {
    icon: Fingerprint,
    title: "Vérification d'identité KYC",
    desc: "Chaque vendeur doit valider son identité via Didit.me (passeport ou CNI biométrique) avant tout retrait. Un même document ne peut activer qu'un seul compte Dukaio.",
    badge: "Didit.me",
  },
  {
    icon: ShieldCheck,
    title: "Anti-fraude & modération IA",
    desc: "Toutes les boutiques, produits et demandes KYC sont analysés par notre IA, puis contrôlés manuellement par notre équipe avant publication ou paiement.",
    badge: "IA + Humain",
  },
  {
    icon: Lock,
    title: "Paiements sécurisés",
    desc: "Transactions chiffrées via Moneroo (Mobile Money & Carte). Nous ne stockons aucune donnée bancaire — tout est traité par des prestataires certifiés.",
    badge: "PCI-DSS",
  },
  {
    icon: Eye,
    title: "Délai de maturation 5 jours",
    desc: "Les fonds sont placés en quarantaine pendant 5 jours après chaque vente pour bloquer toute fraude au remboursement et protéger acheteurs comme vendeurs.",
    badge: "5 jours",
  },
  {
    icon: AlertTriangle,
    title: "Détection de doublons",
    desc: "Notre système empêche qu'une même personne ouvre plusieurs comptes vérifiés, garantissant l'authenticité de chaque vendeur sur la plateforme.",
    badge: "1 personne = 1 compte",
  },
  {
    icon: Scale,
    title: "Données protégées (RGPD)",
    desc: "Hébergement chiffré, isolation par Row-Level Security et conformité RGPD. Vous gardez le contrôle total sur vos données.",
    badge: "RLS + RGPD",
  },
];

const TrustSection = () => {
  return (
    <section className="relative overflow-hidden border-y border-border bg-gradient-to-b from-background via-secondary/20 to-background py-24">
      <div className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />

      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Sécurité & Confiance
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
            Une plateforme <span className="text-gradient">vérifiée et protégée</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Nous avons construit Dukaio avec la sécurité au cœur du système. Acheteurs et vendeurs
            évoluent dans un environnement contrôlé, transparent et conforme aux standards internationaux.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                  <p.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {p.badge}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: BadgeCheck, label: "Vendeurs KYC vérifiés" },
            { icon: Lock, label: "Paiements chiffrés" },
            { icon: Sparkles, label: "Modération IA" },
            { icon: Scale, label: "Conforme RGPD" },
          ].map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <b.icon className="h-3.5 w-3.5 text-primary" /> {b.label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
