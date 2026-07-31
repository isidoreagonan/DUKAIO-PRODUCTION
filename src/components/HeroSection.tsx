import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Users, Globe, Zap, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroSeller from "@/assets/hero-seller.png";
import { providerLogos } from "@/data/pawapayProviders";

const paymentLogos: { src: string; label: string }[] = [
  { src: providerLogos.mtn, label: "MTN MoMo" },
  { src: providerLogos.orange, label: "Orange Money" },
  { src: providerLogos.moov, label: "Moov Money" },
  { src: providerLogos.airtel, label: "Airtel Money" },
  { src: providerLogos.mpesa, label: "M-Pesa" },
  { src: providerLogos.vodacom, label: "Vodacom" },
  { src: providerLogos.zamtel, label: "Zamtel" },
];

const HeroSection = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(250,100%,98%)] via-[hsl(220,100%,98%)] to-[hsl(280,100%,97%)]" />
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />

        <div className="container relative mx-auto px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
            {/* LEFT: Copy */}
            <div className="relative">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4 text-2xl md:text-3xl text-accent"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                votre partenaire e-commerce
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-6 text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-foreground"
              >
                Vendez en Ligne <br />
                <span className="text-primary">À Portée de Main</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8 max-w-lg text-base md:text-lg text-muted-foreground leading-relaxed"
              >
                Dukaio est une plateforme africaine qui vous permet de vendre fichiers,
                formations et licences en quelques minutes — paiements Mobile Money & carte.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center gap-5"
              >
                <Link to="/register">
                  <Button
                    size="lg"
                    className="rounded-xl bg-[hsl(225,70%,20%)] hover:bg-[hsl(225,70%,15%)] px-8 py-6 text-base font-semibold text-white shadow-xl shadow-[hsl(225,70%,20%)]/20"
                  >
                    Commencer
                  </Button>
                </Link>

                <button className="group flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg shadow-primary/10 ring-1 ring-border transition-transform group-hover:scale-105">
                    <Play className="h-4 w-4 fill-primary text-primary ml-0.5" />
                  </span>
                  <span className="font-semibold text-foreground">Voir la démo</span>
                </button>
              </motion.div>
            </div>

            {/* RIGHT: Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={heroSeller}
                  alt="Vendeuse Dukaio entourée de notifications de ventes, retraits et avis clients"
                  className="w-full h-auto"
                  loading="eager"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Partner strip card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 md:mt-16 rounded-2xl bg-white shadow-xl shadow-primary/5 ring-1 ring-border/50 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 px-6 md:pl-10 md:pr-6 py-6">
              <p className="shrink-0 text-base md:text-lg font-semibold text-foreground text-center md:text-left max-w-[220px]">
                Plus de 10 moyens de paiement intégrés
              </p>

              {/* Marquee */}
              <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                <div className="flex w-max animate-marquee items-center gap-12 py-2">
                  {[...paymentLogos, ...paymentLogos].map((logo, i) => (
                    <img
                      key={`${logo.label}-${i}`}
                      src={logo.src}
                      alt={logo.label}
                      className="h-9 md:h-10 w-auto object-contain shrink-0 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Preview - Dashboard Mockup */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto max-w-5xl"
          >
            {/* Browser frame */}
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-secondary/50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                  <div className="h-3 w-3 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="rounded-md bg-background border border-border px-4 py-1.5 text-xs text-muted-foreground text-center">
                    dashboard.dukaio.com
                  </div>
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-6 md:p-8 bg-background">
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  {[
                    { label: "Revenus du mois", value: "185 000 FCFA", change: "+18%", icon: TrendingUp },
                    { label: "Ventes", value: "27", change: "+9%", icon: Zap },
                    { label: "Clients", value: "84", change: "+12%", icon: Users },
                    { label: "Pays", value: "5", change: "+2", icon: Globe },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
                      <span className="text-xs font-medium text-primary">{stat.change}</span>
                    </div>
                  ))}
                </div>

                {/* Revenue chart mockup */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-card-foreground">Évolution des revenus</h3>
                    <span className="text-xs text-muted-foreground">12 derniers mois</span>
                  </div>
                  <div className="flex items-end gap-2 h-40">
                    {[30, 45, 35, 55, 50, 65, 60, 75, 70, 85, 80, 95].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className="flex-1 rounded-t-md bg-primary/20 hover:bg-primary/40 transition-colors relative group"
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-foreground font-medium whitespace-nowrap">
                          {Math.round(h * 28000)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"].map((m) => (
                      <span key={m} className="text-[10px] text-muted-foreground flex-1 text-center">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect behind */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/5 blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Speed & Payment section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">Rapidité</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
              Des paiements à la vitesse de l'éclair
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Recevez vos revenus en 24h. Pas de délais, pas de complications.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Client achète", desc: "Paiement sécurisé via Mobile Money ou carte bancaire en quelques secondes.", time: "~10s" },
              { step: "2", title: "Livraison instantanée", desc: "Le client reçoit immédiatement son produit digital par email et dans son espace.", time: "Immédiat" },
              { step: "3", title: "Vous êtes payé", desc: "Vos revenus sont reversés automatiquement sur votre compte.", time: "24h-5j" },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold shadow-lg shadow-primary/25">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{s.time}</span>
                {i < 2 && (
                  <div className="hidden md:block absolute top-7 -right-4 w-8">
                    <ArrowRight className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-4 text-center">
            {[
              { num: "100%", label: "Vendeurs vérifiés (KYC)" },
              { num: "24h-5j", label: "Délai de paiement" },
              { num: "10+", label: "Moyens de paiement" },
              { num: "0 FCFA", label: "Frais d'inscription" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <p className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">{stat.num}</p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
