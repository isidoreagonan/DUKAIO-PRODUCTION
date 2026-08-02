import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight, Quote, Sparkles, TrendingUp, Users, ShieldCheck } from 'lucide-react';

import avatarGadou from '@/assets/avatar-gadou.png';
import avatarCreatorJr from '@/assets/avatar-creatorjr.png';

interface DukaioReviewsBentoProps {
  onOpenAuthModal?: () => void;
}

export const DukaioReviewsBento: React.FC<DukaioReviewsBentoProps> = ({ onOpenAuthModal }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal();
    } else {
      navigate('/register');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] },
    },
  };

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-[#F8FAFC] via-[#EEF2FD] to-[#DDE6FF] relative overflow-hidden text-ink">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-tr from-blue-300/20 to-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue" />
            <span>PREUVE SOCIALE & IMPACT</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-ink leading-tight">
            Ce que vous allez <span className="font-serif italic text-blue">adorer chez Dukaio</span>
          </h2>
          
          <p className="text-base sm:text-lg text-[#64748B] font-sans leading-relaxed max-w-2xl mx-auto">
            Découvrez comment notre plateforme simplifie le quotidien des créateurs, formateurs et auteurs.
          </p>
        </motion.div>

        {/* Bento Grid Container */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-6 lg:space-y-8"
        >
          {/* Top Row: 2 Review Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Review 1: Gadou Christ */}
            <motion.div 
              variants={itemVariants}
              className="bg-white border border-slate-100 rounded-2xl p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-blue/30 transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-blue/15 group-hover:text-blue/30 transition-colors" />
                </div>
                <p className="text-slate-700 font-sans text-lg sm:text-xl font-medium leading-relaxed italic">
                  “Je fais partie des tout premiers utilisateurs de Dukaio et honnêtement c'est un outil exceptionnel.”
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-100">
                <img 
                  src={avatarGadou} 
                  alt="Gadou Christ" 
                  className="w-12 h-12 rounded-full object-cover shadow-md border border-slate-200" 
                />
                <div>
                  <h4 className="font-bold text-ink text-base">Gadou Christ</h4>
                  <p className="text-xs text-[#64748B]">Funel Branding</p>
                </div>
              </div>
            </motion.div>

            {/* Review 2: CREATOR JR */}
            <motion.div 
              variants={itemVariants}
              className="bg-white border border-slate-100 rounded-2xl p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-blue/30 transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-blue/15 group-hover:text-blue/30 transition-colors" />
                </div>
                <p className="text-slate-700 font-sans text-lg sm:text-xl font-medium leading-relaxed italic">
                  “Dukaio a transformé la manière dont je vends mes ebooks. En quelques clics, ma boutique était en ligne et je touche mes revenus beaucoup plus vite qu'avant.”
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-100">
                <img 
                  src={avatarCreatorJr} 
                  alt="CREATOR JR" 
                  className="w-12 h-12 rounded-full object-cover shadow-md border border-slate-200" 
                />
                <div>
                  <h4 className="font-bold text-ink text-base">CREATOR JR</h4>
                  <p className="text-xs text-[#64748B]">Coach & Entrepreneur Digital</p>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Bottom Row: 3 Bento Impact Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            
            {/* Stat Card Left (20+) */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-8 text-center flex flex-col justify-center items-center shadow-sm hover:shadow-xl hover:border-blue/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-extrabold text-4xl sm:text-5xl text-ink tracking-tight mb-3">
                20+
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] font-sans leading-relaxed">
                Créateurs qui lancent et développent leur boutique digitale chaque semaine sur Dukaio pour monétiser leurs compétences.
              </p>
            </motion.div>

            {/* Middle Featured Gradient Blue Card (+200k XOF) */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-6 bg-gradient-to-br from-[#1636C7] via-[#2557D6] to-[#4F46E5] rounded-2xl p-8 sm:p-10 text-white text-center flex flex-col justify-between items-center shadow-xl shadow-blue-500/20 relative overflow-hidden group min-h-[280px]"
            >
              {/* Internal Pattern Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_70%)] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 my-auto space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm mx-auto">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                  <span>VOLUME ENCAISSÉ</span>
                </div>
                
                <h3 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white drop-shadow-md">
                  +200k XOF
                </h3>

                <p className="text-sm sm:text-base text-blue-100 font-sans leading-relaxed max-w-md mx-auto font-normal">
                  Notre plateforme a déjà permis aux créateurs d'encaisser plus de 200 000 FCFA grâce à la vente de leurs produits digitaux.
                </p>
              </div>

              <div className="relative z-10 pt-6">
                <button
                  onClick={handleAction}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-black hover:bg-slate-900 text-white text-xs font-bold transition-all duration-300 shadow-xl gap-2"
                >
                  <span>Ouvrir ma boutique digitale</span>
                  <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Stat Card Right (90%) */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-8 text-center flex flex-col justify-center items-center shadow-sm hover:shadow-xl hover:border-blue/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-extrabold text-4xl sm:text-5xl text-ink tracking-tight mb-3">
                90%
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] font-sans leading-relaxed">
                C'est la part que vous gardez sur chaque vente. Seulement 10% pour Dukaio, le taux le plus bas du marché.
              </p>
            </motion.div>

          </div>

        </motion.div>

      </div>
    </section>
  );
};
