import React from 'react';
import { ArrowRight, FileText, MonitorPlay, Key, Package, UserSquare2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onOpenAuthModal?: () => void;
  onOpenDemoModal?: () => void;
}

const categories = [
  { icon: FileText, label: "Fichiers", color: "text-blue", bg: "bg-blue/10" },
  { icon: MonitorPlay, label: "Cours", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: Key, label: "Licences", color: "text-purple-500", bg: "bg-purple-500/10" },
];

export const Hero: React.FC<HeroProps> = ({ onOpenAuthModal }) => {
  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-white flex flex-col items-center justify-center text-center">
      {/* Soft Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 flex flex-col items-center">
        
        {/* Top Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-hair bg-white shadow-sm"
        >
          <div className="flex -space-x-1">
            <span className="w-5 h-5 rounded-full bg-blue text-[8px] font-bold text-white flex items-center justify-center border border-white">
              DK
            </span>
            <span className="w-5 h-5 rounded-full bg-slate text-[8px] font-bold text-white flex items-center justify-center border border-white">
              +100
            </span>
          </div>
          <span className="font-sans text-xs font-semibold text-slate tracking-wide">
            Rejoignez +100 créateurs africains
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-ink tracking-tight leading-[1.05]"
        >
          Monétisez votre savoir-faire <span className="font-serif italic text-blue">partout en Afrique</span>.
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl text-slate max-w-2xl leading-relaxed font-sans"
        >
          Créez votre boutique en 5 minutes, encaissez par Mobile Money & Cartes bancaires, et développez vos revenus partout en Afrique.
        </motion.p>

        {/* Call to action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <button
            onClick={onOpenAuthModal}
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold text-white bg-blue hover:bg-blueDeep hover:-translate-y-1 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2 shadow-[0_8px_30px_rgb(37,87,214,0.3)] hover:shadow-[0_8px_40px_rgb(37,87,214,0.4)]"
          >
            Créer ma boutique gratuite
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </motion.div>

        {/* Category Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-12 flex flex-wrap justify-center gap-3 sm:gap-4 max-w-3xl"
        >
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-full border border-hair bg-white shadow-sm hover:border-blue transition-colors cursor-default">
              <div className={`flex items-center justify-center w-6 h-6 rounded-md ${cat.bg} ${cat.color}`}>
                <cat.icon className="w-3.5 h-3.5" />
              </div>
              <span className="font-sans text-sm font-semibold text-ink">{cat.label}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};
