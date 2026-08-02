import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, Share2, Wallet, ArrowRight, Check, Copy, Sparkles } from 'lucide-react';
import howItWorksStep1 from '@/assets/howitworks-step1.png';
import howItWorksStep2 from '@/assets/howitworks-step2.png';
import howItWorksStep3 from '@/assets/howitworks-step3.png';

interface HowItWorksTabsProps {
  onOpenAuthModal?: () => void;
}

export const HowItWorksTabs: React.FC<HowItWorksTabsProps> = ({ onOpenAuthModal }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleAction = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal();
    } else {
      navigate('/register');
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    {
      id: 0,
      label: "Créer",
      icon: Rocket,
      badge: "Étape 1 sur 3",
      title: "Créez votre boutique numérique en 2 minutes",
      description: "Inscrivez-vous gratuitement et configurez votre espace vendeur à votre image. Ajoutez facilement vos ebooks, formations, fichiers ou logiciels en quelques clics.",
      ctaText: "Créer ma boutique gratuitement",
    },
    {
      id: 1,
      label: "Partager",
      icon: Share2,
      badge: "Étape 2 sur 3",
      title: "Multipliez votre visibilité instantanément",
      description: "Obtenez un lien de vente direct et sécurisé pour chaque produit. Partagez-le sur WhatsApp et vos réseaux sociaux, et profitez du référencement automatique sur la Marketplace Dukaio.",
      ctaText: "Explorer la Marketplace",
    },
    {
      id: 2,
      label: "Encaisser",
      icon: Wallet,
      badge: "Étape 3 sur 3",
      title: "Encaissez par Mobile Money & automatisez tout",
      description: "Vos clients règlent en toute confiance par Wave, Orange Money, MTN ou Carte bancaire. Dukaio délivre instantanément le produit et verse vos gains en temps réel.",
      ctaText: "Démarrer mes ventes",
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-[#090D1B] text-white relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-gradient-to-b from-blue/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue/15 border border-blue/30 text-blue-300 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>COMMENT ÇA MARCHE</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.1]">
            De l'idée au revenu en <span className="font-serif italic text-blue-400">3 étapes</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto">
            Avec Dukaio, créer votre boutique, partager vos liens et encaisser vos ventes devient un jeu d'enfant.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-[#131B35] p-1.5 rounded-2xl border border-slate-800/80 flex items-center gap-1 sm:gap-2 shadow-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue text-white shadow-lg shadow-blue/30 scale-105' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Outer Card Container (MakeTou Style: Overflow Hidden, Dark Card) */}
        <div className="bg-[#10172E] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 items-center"
            >
              {/* Left Column: Text & CTA */}
              <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 space-y-6 text-left">
                <span className="inline-block px-3 py-1 rounded-md bg-blue/20 text-blue-300 font-mono text-xs font-semibold border border-blue/30">
                  {tabs[activeTab].badge}
                </span>

                <h3 className="font-sans font-bold text-3xl sm:text-4xl text-white tracking-tight leading-snug">
                  {tabs[activeTab].title}
                </h3>

                <p className="text-base text-slate-300 font-sans leading-relaxed">
                  {tabs[activeTab].description}
                </p>

                <div className="pt-4">
                  <button
                    onClick={activeTab === 1 ? () => navigate('/marketplace') : handleAction}
                    className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-blue hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-blue/25 gap-2 group"
                  >
                    <span>{tabs[activeTab].ctaText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Right Column: Image / Window Mockup (Bleeding to edges like MakeTou) */}
              <div className="lg:col-span-7 w-full h-full flex items-end justify-end pt-6 lg:pt-12 pl-6 lg:pl-0 pr-0 pb-0 overflow-hidden">
                {activeTab === 0 ? (
                  /* Step 1 Canva Image */
                  <div className="w-full h-auto rounded-tl-2xl overflow-hidden shadow-2xl border-t border-l border-slate-700/60 self-end">
                    <img 
                      src={howItWorksStep1} 
                      alt="Créez votre boutique numérique en 2 minutes" 
                      className="w-full h-auto object-cover object-top block"
                    />
                  </div>
                ) : activeTab === 1 ? (
                  /* Step 2 Canva Image */
                  <div className="w-full h-auto rounded-tl-2xl overflow-hidden shadow-2xl border-t border-l border-slate-700/60 self-end">
                    <img 
                      src={howItWorksStep2} 
                      alt="Multipliez votre visibilité instantanément" 
                      className="w-full h-auto object-cover object-top block"
                    />
                  </div>
                ) : (
                  /* Step 3 Canva Image */
                  <div className="w-full h-auto rounded-tl-2xl overflow-hidden shadow-2xl border-t border-l border-slate-700/60 self-end">
                    <img 
                      src={howItWorksStep3} 
                      alt="Encaissez par Mobile Money & automatisez tout" 
                      className="w-full h-auto object-cover object-top block"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
