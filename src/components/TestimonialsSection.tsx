import { motion } from "framer-motion";
import { Star, Quote, TrendingUp, ShoppingBag, Users, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "Aminata K.",
    role: "Formatrice en marketing digital",
    country: "🇨🇮 Côte d'Ivoire",
    avatar: "AK",
    text: "J'ai vendu plus de 500 formations en 3 mois grâce à Dukaio. Les paiements Mobile Money sont ultra rapides !",
    revenue: "3.2M FCFA",
    rating: 5,
  },
  {
    name: "Moussa D.",
    role: "Développeur & créateur de templates",
    country: "🇸🇳 Sénégal",
    avatar: "MD",
    text: "La plateforme est incroyablement simple. J'ai uploadé mes templates et les ventes ont commencé le même jour.",
    revenue: "1.8M FCFA",
    rating: 5,
  },
  {
    name: "Fatou B.",
    role: "Coach en développement personnel",
    country: "🇲🇱 Mali",
    avatar: "FB",
    text: "Le système de licences m'a permis de protéger mes contenus tout en vendant à l'international. Support au top !",
    revenue: "2.5M FCFA",
    rating: 5,
  },
  {
    name: "Jean-Paul M.",
    role: "Auteur & infographe",
    country: "🇨🇲 Cameroun",
    avatar: "JP",
    text: "Je vends mes e-books et guides PDF sans aucune commission cachée. Le reversement est rapide et fiable.",
    revenue: "980K FCFA",
    rating: 5,
  },
];

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <motion.span
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true }}
    >
      {count.toLocaleString()}{suffix}
    </motion.span>
  );
};

const liveStats = [
  { icon: ShoppingBag, label: "Ventes aujourd'hui", value: 147, suffix: "+", color: "text-primary" },
  { icon: Users, label: "Créateurs actifs", value: 10842, suffix: "", color: "text-primary" },
  { icon: DollarSign, label: "Reversés ce mois", value: 45, suffix: "M FCFA", color: "text-primary" },
  { icon: TrendingUp, label: "Taux de croissance", value: 34, suffix: "%", color: "text-primary" },
];

const TestimonialsSection = () => {
  return (
    <>
      {/* Live Stats Ticker */}
      <section className="py-16 bg-secondary/30 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs font-semibold text-primary">Statistiques en temps réel</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground">
              La confiance de milliers de créateurs
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {liveStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-border bg-card p-5 md:p-6 text-center group hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">Témoignages</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Des créateurs africains qui transforment leurs compétences en revenus grâce à Dukaio.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-xl hover:border-primary/20"
              >
                <Quote className="h-8 w-8 text-primary/15 mb-4" />
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  "{t.text}"
                </p>

                {/* Rating */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Revenue badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 mb-4">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-xs font-semibold text-primary">{t.revenue} générés</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role}</p>
                    <p className="text-[10px] text-muted-foreground">{t.country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges - Payment Partners */}
      <section className="py-12 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-6">
          <p className="text-center text-xs text-muted-foreground mb-6 uppercase tracking-widest font-medium">
            Moyens de paiement acceptés
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {[
              { src: "/images/orange-money.png", alt: "Orange Money" },
              { src: "/images/mtn-momo.webp", alt: "MTN Mobile Money" },
              { src: "/images/wave.png", alt: "Wave" },
              { src: "/images/moov-money.png", alt: "Moov Money" },
            ].map((pm) => (
              <motion.div
                key={pm.alt}
                whileHover={{ scale: 1.1 }}
                className="h-10 md:h-12 opacity-70 hover:opacity-100 transition-opacity"
              >
                <img src={pm.src} alt={pm.alt} className="h-full w-auto object-contain" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default TestimonialsSection;
