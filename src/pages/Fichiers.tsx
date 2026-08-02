import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CloudUpload, Link as LinkIcon, Download, ShieldCheck, Zap, Globe, BarChart3, HeadphonesIcon, FolderKey, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FAQ } from "@/components/marketing/FAQ";
import SEOHead from "@/components/SEOHead";
import fichiersDashboard from "@/assets/fichiers-dashboard.png";
import fichiersUpload from "@/assets/fichiers-upload.png";
import fichiersLivraison from "@/assets/fichiers-livraison.png";
import fichiersProtection from "@/assets/fichiers-protection.png";
import fichiersStep1 from "@/assets/fichiers-step-1.png";
import fichiersStep2 from "@/assets/fichiers-step-2.png";
import fichiersStep3 from "@/assets/fichiers-step-3.png";

export default function Fichiers() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-white text-ink font-sans selection:bg-blueTint selection:text-blueDeep overflow-x-hidden">
      <SEOHead 
        title="Vendre des Fichiers Digitaux" 
        description="Vendez vos e-books, PDF, templates et fichiers numériques instantanément. Dukaio s'occupe de la livraison et des paiements en Afrique." 
        canonicalPath="/fichiers" 
      />
      <Navbar />

      <main className="pt-24 md:pt-32">
        {/* 1. HERO SECTION */}
        <section className="text-center mb-20">
          <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue/10 text-blue mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase">Dukaio Fichiers</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-ink tracking-tight leading-[1.05] mb-6"
            >
              Vendez vos <span className="font-serif italic text-blue">Fichiers Numériques</span> Instantanément.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate max-w-2xl mx-auto leading-relaxed font-sans mb-10"
            >
              Uploadez vos e-books, PDF, musiques et templates en quelques secondes. Dukaio gère la livraison sécurisée, les paiements Mobile Money et vos clients.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold text-white bg-blue hover:bg-blueDeep transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Créer une boutique gratuite
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          {/* Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-20 w-full max-w-[1400px] mx-auto flex items-center justify-center relative px-4 sm:px-6 lg:px-8"
          >
            <img 
              src={fichiersDashboard} 
              alt="Tableau de bord Fichiers" 
              className="w-full h-auto object-cover"
            />
          </motion.div>
        </section>

        {/* 2. STATS BAR */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-32">
          <div className="bg-white border border-hair rounded-2xl shadow-sm p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-hair/0 md:divide-hair">
            {[
              { value: "+5 000", label: "Fichiers vendus" },
              { value: "0%", label: "Frais fixes" },
              { value: "Instant", label: "Livraison" },
              { value: "256-bit", label: "Sécurité SSL" }
            ].map((stat, i) => (
              <div key={i} className="text-center px-4">
                <p className="font-serif text-3xl text-ink mb-1">{stat.value}</p>
                <p className="font-sans text-xs font-medium text-slate uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. ZIG-ZAG SECTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-32">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl sm:text-5xl font-normal text-ink tracking-tight mb-4">
              Tout ce dont vous avez besoin <br className="hidden sm:inline" />
              pour vendre vos fichiers
            </h2>
          </div>

          <div className="space-y-24 md:space-y-32">
            {/* Block 1: Text Left, Image Right */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6">
                <h3 className="font-serif text-3xl font-medium text-ink">Acceptez des paiements du monde entier</h3>
                <p className="text-slate text-lg leading-relaxed">
                  Laissez vos clients payer avec leur méthode préférée. Que ce soit par Mobile Money en Afrique ou par carte bancaire à l'international, encaissez vos ventes sans aucune frontière.
                </p>
                <ul className="space-y-3 pt-2">
                  {["Mobile Money & Cartes bancaires", "Ventes à l'international", "Paiements sécurisés"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-ink font-medium">
                      <div className="w-5 h-5 rounded-full bg-blue/10 flex items-center justify-center">
                        <Globe className="w-3 h-3 text-blue" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-blue/5 rounded-3xl transform lg:translate-x-6 lg:translate-y-6 -z-10"></div>
                <img 
                  src={fichiersUpload} 
                  alt="Interface d'upload de fichiers" 
                  className="w-full h-auto object-cover relative z-10"
                />
              </div>
            </div>

            {/* Block 2: Image Left, Text Right */}
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-blue/5 rounded-3xl transform lg:-translate-x-6 lg:translate-y-6 -z-10"></div>
                <img 
                  src={fichiersLivraison} 
                  alt="Livraison 100% automatisée" 
                  className="w-full h-auto object-cover relative z-10"
                />
              </div>
              <div className="flex-1 space-y-6">
                <h3 className="font-serif text-3xl font-medium text-ink">Livraison 100% automatisée</h3>
                <p className="text-slate text-lg leading-relaxed">
                  Une fois le paiement Mobile Money ou Carte bancaire validé, votre client reçoit instantanément un lien de téléchargement sécurisé et unique. Vous dormez, Dukaio livre.
                </p>
                <Link to="/register" className="inline-flex items-center text-blue font-semibold hover:text-blueDeep">
                  En savoir plus <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Block 3: Text Left, Image Right */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6">
                <h3 className="font-serif text-3xl font-medium text-ink">Protection anti-piratage</h3>
                <p className="text-slate text-lg leading-relaxed">
                  Gardez le contrôle sur vos œuvres. Limitez le nombre de téléchargements par client, mettez en place des expirations de liens, ou appliquez des filigranes sur vos PDF automatiquement.
                </p>
                <Link to="/register" className="inline-flex items-center text-blue font-semibold hover:text-blueDeep">
                  En savoir plus <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
              <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-amber-500/5 rounded-3xl transform lg:translate-x-6 lg:translate-y-6 -z-10"></div>
                <img 
                  src={fichiersProtection} 
                  alt="Protection anti-piratage" 
                  className="w-full h-auto object-cover relative z-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. FEATURES GRID */}
        <section className="bg-slate-50 py-24 md:py-32 border-y border-hair mb-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ink">Tout pour réussir</h2>
              <p className="text-slate mt-4 text-lg">Des outils pensés pour les créateurs exigeants.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Globe, color: "text-blue", bg: "bg-blue/10", title: "Paiements mondiaux & locaux", desc: "Acceptez Mobile Money (Wave, Orange, MTN) et les cartes Visa/Mastercard mondiales." },
                { icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-500/10", title: "Analytics poussés", desc: "Suivez vos vues, conversions et sources de trafic en temps réel depuis le dashboard." },
                { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", title: "Paiements rapides", desc: "Retirez vos gains directement sur votre compte Mobile Money ou bancaire rapidement." },
                { icon: LinkIcon, color: "text-purple-500", bg: "bg-purple-500/10", title: "Liens de vente directs", desc: "Partagez le lien de votre fichier sur Instagram, TikTok ou WhatsApp pour vendre." },
                { icon: Download, color: "text-sky-500", bg: "bg-sky-500/10", title: "Limites de téléchargement", desc: "Définissez un nombre maximum de téléchargements par fichier pour plus de sécurité." },
                { icon: HeadphonesIcon, color: "text-rose-500", bg: "bg-rose-500/10", title: "Support client intégré", desc: "Gérez les questions et les remboursements de vos clients au même endroit." },
              ].map((feat, i) => (
                <div key={i} className="bg-white border border-hair rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feat.bg} ${feat.color}`}>
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-sans font-bold text-ink text-lg mb-2">{feat.title}</h4>
                  <p className="text-slate leading-relaxed text-sm">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-10">
              <h2 className="font-serif text-4xl sm:text-5xl font-medium text-ink">Comment ça marche ?</h2>
              
              <div className="space-y-8">
                {[
                  { step: "1", title: "Créez votre boutique", desc: "Inscrivez-vous gratuitement et personnalisez votre boutique Dukaio en 2 minutes." },
                  { step: "2", title: "Ajoutez vos fichiers", desc: "Uploadez vos PDF, ZIP, ou vidéos, définissez un prix et ajoutez une description engageante." },
                  { step: "3", title: "Partagez et encaissez", desc: "Partagez le lien à votre audience. Les clients paient, ils reçoivent le fichier, vous touchez l'argent." },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveStep(i)}
                    className={`flex gap-4 cursor-pointer transition-all duration-300 p-4 rounded-xl hover:bg-slate-50 ${activeStep === i ? 'bg-slate-50 border border-blue/10 shadow-sm' : 'opacity-60'}`}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors ${activeStep === i ? 'bg-blue text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {item.step}
                    </div>
                    <div>
                      <h4 className={`font-sans font-bold text-xl mb-2 transition-colors ${activeStep === i ? 'text-blue' : 'text-ink'}`}>{item.title}</h4>
                      <p className="text-slate leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full">
              {/* Interactive Mockup based on active step */}
              {activeStep === 0 && (
                <div className="w-full max-w-lg mx-auto relative">
                  <img 
                    src={fichiersStep1} 
                    alt="Création de boutique" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              {activeStep === 1 && (
                <div className="w-full max-w-lg mx-auto relative">
                  <img 
                    src={fichiersStep2} 
                    alt="Ajoutez vos fichiers" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              {activeStep === 2 && (
                <div className="w-full max-w-lg mx-auto relative">
                  <img 
                    src={fichiersStep3} 
                    alt="Partagez et encaissez" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <div className="bg-slate-50 py-1 border-t border-hair">
          <FAQ />
        </div>

        {/* 7. FINAL CTA */}
        <section className="bg-ink py-24 px-4 sm:px-6 lg:px-8 text-center border-b border-white/10">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="font-serif text-4xl sm:text-5xl font-normal text-white">
              Prêt à vendre vos <span className="italic text-blueTint">produits digitaux ?</span>
            </h2>
            <p className="text-slate-300 text-lg">
              Rejoignez les créateurs qui monétisent leur savoir-faire chaque jour sur Dukaio. Pas de frais cachés, pas d'engagement.
            </p>
            <div className="pt-4">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold text-ink bg-white hover:bg-slate-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Créer une boutique gratuite
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
