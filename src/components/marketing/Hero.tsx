import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import heroDashboard from '@/assets/hero-dashboard.png';

interface HeroProps {
  onOpenAuthModal?: () => void;
  onOpenDemoModal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuthModal }) => {
  const navigate = useNavigate();

  const handleCreateStore = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal();
    } else {
      navigate('/register');
    }
  };

  const handleExploreMarketplace = () => {
    navigate('/marketplace');
  };

  return (
    <section className="relative pt-8 pb-16 md:pt-12 md:pb-20 overflow-hidden bg-white flex flex-col items-center justify-center text-center">
      {/* 1. GRID BACKGROUND WITH RADIAL MASK */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 35%, rgba(37, 87, 214, 0.08) 0%, transparent 70%),
                            linear-gradient(to right, rgba(226, 232, 240, 0.5) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(226, 232, 240, 0.5) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 95%)',
        }}
      />

      {/* Ambient Glow Orbs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] bg-gradient-to-tr from-blue/10 via-indigo-500/5 to-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Text & Action Header */}
        <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center text-center">

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-ink tracking-tight leading-[1.08] max-w-4xl text-center"
          >
            Monétisez vos compétences, <br className="hidden sm:block" />
            vendez vos <span className="font-serif italic text-blue">produits digitaux</span>.
          </motion.h1>

          {/* Subtitle with Marketplace & Value Props */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-[#64748B] max-w-3xl lg:max-w-4xl leading-relaxed font-sans text-center"
          >
            La plateforme tout-en-un pour créer votre boutique et propulser vos produits numériques. Avec une{' '}
            <strong className="text-[#1E293B] font-semibold">marketplace intégrée</strong>, l'encaissement par{' '}
            <strong className="text-[#1E293B] font-semibold">Mobile Money & Cartes</strong> et une{' '}
            <strong className="text-[#1E293B] font-semibold">livraison 100% automatisée</strong>, démarrez gratuitement et maximisez vos revenus.
          </motion.p>

          {/* Dual Call to Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            {/* Primary Action Button */}
            <button
              onClick={handleCreateStore}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-semibold text-white bg-blue hover:bg-blueDeep hover:-translate-y-0.5 transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(37,87,214,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(37,87,214,0.5)] gap-2 group"
            >
              <Store className="w-5 h-5 text-white/90 group-hover:scale-110 transition-transform" />
              Créer ma boutique gratuitement
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Action Button */}
            <button
              onClick={handleExploreMarketplace}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-2xl text-base font-semibold text-ink bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 hover:-translate-y-0.5 transition-all duration-300 shadow-sm gap-2"
            >
              <ShoppingBag className="w-5 h-5 text-slate" />
              Explorer la Marketplace
            </button>
          </motion.div>

          {/* Social Proof Creator Avatar Stack */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="pt-2 flex items-center justify-center gap-3 text-xs text-slate"
          >
            <div className="flex -space-x-2">
              <img 
                className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" 
                alt="Créateur Dukaio" 
              />
              <img 
                className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" 
                alt="Créateur Dukaio" 
              />
              <img 
                className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" 
                alt="Créateur Dukaio" 
              />
              <img 
                className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" 
                alt="Créateur Dukaio" 
              />
            </div>
            <div className="flex flex-col items-start text-left">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="font-bold text-ink ml-1">4.9/5</span>
              </div>
              <span className="text-slate font-medium text-[11px]">Rejoint par +1 000 créateurs & vendeurs</span>
            </div>
          </motion.div>

        </div>

        {/* Dashboard Preview - Large & Prominent (1240px Wide) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="pt-12 sm:pt-16 w-full max-w-6xl xl:max-w-[1240px] mx-auto"
        >
          <img 
            src={heroDashboard} 
            alt="Tableau de bord Dukaio" 
            className="w-full h-auto object-contain drop-shadow-2xl rounded-2xl"
          />
        </motion.div>

      </div>
    </section>
  );
};
