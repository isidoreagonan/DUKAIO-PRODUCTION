import { motion } from "framer-motion";
import { Store, Globe, Zap, Brain, Users, BarChart3, ArrowRight, Bell, Mail, ShoppingCart, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  {
    tag: "Boutique",
    title: "Lancez votre boutique en ligne en 2 minutes",
    description: "Personnalisez votre boutique avec votre logo, couleurs et style. Offrez une expérience unique à vos clients, sans compétences techniques.",
    cta: { label: "Créer une boutique gratuite", href: "/register" },
    align: "left" as const,
    mockup: (
      <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 bg-secondary/50">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-accent/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
          </div>
          <div className="flex-1 mx-3">
            <div className="rounded-md bg-background border border-border px-3 py-1 text-[10px] text-muted-foreground text-center">
              maboutique.dukaio.com
            </div>
          </div>
        </div>
        <div className="p-5 bg-background">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Ma Boutique Pro</p>
              <p className="text-[10px] text-muted-foreground">8 produits • 27 ventes</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Formation SEO", "Templates Canva", "E-book Growth", "Pack Design"].map((p, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-2.5">
                <div className="h-14 rounded-md bg-gradient-to-br from-primary/5 to-accent/5 mb-2" />
                <p className="text-[10px] font-semibold text-card-foreground truncate">{p}</p>
                <p className="text-[9px] text-primary font-bold">15 000 F</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: "Paiements",
    title: "Vendez sans frontières, acceptez tous les paiements",
    description: "Vos clients paient via Mobile Money, Orange Money, Wave, MTN, cartes bancaires. Dukaio gère les devises et les conversions automatiquement.",
    cta: { label: "Commencer à vendre", href: "/register" },
    align: "right" as const,
    mockup: (
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-foreground">Paiements internationaux</span>
          </div>
          <div className="space-y-2">
            {[
              { flag: "🇨🇮", country: "Côte d'Ivoire", method: "Orange Money", amount: "45 000 FCFA" },
              { flag: "🇸🇳", country: "Sénégal", method: "Wave", amount: "32 000 FCFA" },
              { flag: "🇨🇲", country: "Cameroun", method: "MTN MoMo", amount: "28 000 FCFA" },
              { flag: "🇫🇷", country: "France", method: "Carte Visa", amount: "€42.00" },
            ].map((tx, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-2.5"
              >
                <span className="text-lg">{tx.flag}</span>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-foreground">{tx.country}</p>
                  <p className="text-[9px] text-muted-foreground">{tx.method}</p>
                </div>
                <span className="text-[11px] font-bold text-primary">{tx.amount}</span>
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: "Automatisations",
    title: "Automatisez votre business. Gagnez du temps.",
    description: "Livraison auto après achat, emails de remerciement, relance de paniers abandonnés. Votre boutique tourne 24/7 sans effort.",
    cta: { label: "Découvrir les automations", href: "/register" },
    align: "left" as const,
    mockup: (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">Workflows actifs</span>
        </div>
        <div className="space-y-3">
          {[
            { trigger: "Nouvel achat", action: "Envoyer email + livrer fichier", icon: Mail, active: true },
            { trigger: "Panier abandonné", action: "Relance email après 1h", icon: ShoppingCart, active: true },
            { trigger: "Nouvelle inscription", action: "Email de bienvenue", icon: Bell, active: true },
            { trigger: "Vente > 50 000 F", action: "Notification admin", icon: TrendingUp, active: false },
          ].map((wf, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${wf.active ? 'bg-primary/10' : 'bg-muted'}`}>
                <wf.icon className={`h-4 w-4 ${wf.active ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground">{wf.trigger}</p>
                <p className="text-[9px] text-muted-foreground">{wf.action}</p>
              </div>
              <div className={`mt-1 h-4 w-8 rounded-full ${wf.active ? 'bg-primary' : 'bg-muted'} relative`}>
                <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-card shadow ${wf.active ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: "IA intégrée",
    title: "L'intelligence artificielle au service de vos ventes",
    description: "Rédigez vos descriptions produits, corrigez vos textes et générez des titres accrocheurs en un clic. L'IA vous assiste à chaque étape.",
    cta: { label: "Essayer l'IA", href: "/register" },
    align: "right" as const,
    mockup: (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">Assistant IA</span>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg bg-secondary/50 border border-border p-3">
            <p className="text-[10px] text-muted-foreground mb-1">Prompt</p>
            <p className="text-xs text-foreground">"Réécris cette description de produit pour maximiser les conversions"</p>
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
            <p className="text-[10px] text-primary mb-1 font-semibold">✨ Résultat IA</p>
            <p className="text-xs text-foreground leading-relaxed">
              "Transformez votre expertise en revenus passifs avec cette formation complète. 
              Plus de 5 000 créateurs l'ont adoptée — rejoignez-les dès maintenant."
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 rounded-lg bg-primary px-3 py-2 text-[10px] font-semibold text-primary-foreground">
              Appliquer
            </button>
            <button className="flex-1 rounded-lg bg-secondary border border-border px-3 py-2 text-[10px] font-medium text-foreground">
              Régénérer
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: "Affiliation",
    title: "Boostez vos ventes avec notre réseau d'affiliés",
    description: "Listez vos produits sur notre réseau d'affiliation. Définissez vos commissions. Des milliers de partenaires promeuvent vos créations.",
    cta: { label: "Rejoindre le réseau", href: "/register" },
    align: "left" as const,
    mockup: (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">Programme d'affiliation</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Affiliés", value: "47" },
            { label: "Clics", value: "2 340" },
            { label: "Revenus", value: "890K" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-background border border-border p-2.5 text-center">
              <p className="text-sm font-extrabold text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {["Aminata K.", "Moussa D.", "Fatou B."].map((name, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-foreground">{name}</p>
                <p className="text-[8px] text-muted-foreground">12 ventes ce mois</p>
              </div>
              <span className="text-[10px] font-bold text-primary">30%</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: "Analytics",
    title: "Prenez les bonnes décisions avec des statistiques claires",
    description: "Suivez vos revenus en temps réel. Identifiez vos meilleurs produits. Analysez vos taux de conversion avec des dashboards intuitifs.",
    cta: { label: "Voir mon dashboard", href: "/register" },
    align: "right" as const,
    mockup: (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">Vue d'ensemble</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: "Revenus", value: "185K", change: "+18%" },
            { label: "Ventes", value: "27", change: "+9%" },
            { label: "Taux conv.", value: "3.8%", change: "+0.6%" },
            { label: "Visiteurs", value: "712", change: "+22%" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-background border border-border p-2.5">
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
              <p className="text-sm font-extrabold text-foreground">{s.value}</p>
              <span className="text-[9px] font-semibold text-primary">{s.change}</span>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-1 h-20">
          {[30, 45, 35, 55, 50, 65, 60, 75, 70, 85, 80, 95].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="flex-1 rounded-t bg-primary/20 hover:bg-primary/40 transition-colors"
            />
          ))}
        </div>
      </div>
    ),
  },
];

const FeatureMockups = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">Fonctionnalités</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
            Tout ce dont vous avez besoin pour réussir
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Une plateforme complète pour monétiser votre expertise, de A à Z.
          </p>
        </motion.div>

        <div className="space-y-28">
          {features.map((feature, i) => (
            <motion.div
              key={feature.tag}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`grid md:grid-cols-2 gap-12 items-center ${
                feature.align === "right" ? "md:[direction:rtl]" : ""
              }`}
            >
              {/* Text */}
              <div className="md:[direction:ltr]">
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                  {feature.tag}
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {feature.description}
                </p>
                <Link to={feature.cta.href}>
                  <Button variant="outline" className="font-semibold">
                    {feature.cta.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Mockup */}
              <div className="md:[direction:ltr]">
                {feature.mockup}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureMockups;
