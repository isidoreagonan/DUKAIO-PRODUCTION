import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import heroDashboard from '@/assets/hero-dashboard.png';

interface HeroFeatureProps {
  onLearnMore?: () => void;
}

export const HeroFeature: React.FC<HeroFeatureProps> = ({ onLearnMore }) => {
  return (
    <section className="relative pb-20 md:pb-28 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-slate-50 rounded-[2rem] p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 border border-hair overflow-hidden"
        >
          {/* Text Content */}
          <div className="flex-1 space-y-6 max-w-xl text-center lg:text-left z-10">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-ink leading-[1.1] tracking-tight">
              Pilotez vos ventes <br className="hidden sm:inline" />
              <span className="italic text-blue">en temps réel</span>
            </h2>
            <p className="text-base sm:text-lg text-slate leading-relaxed font-sans">
              Analysez vos performances, suivez votre taux de conversion et gérez vos revenus avec précision grâce à un tableau de bord complet pensé pour les créateurs.
            </p>
            <div className="pt-2">
              <button 
                onClick={onLearnMore}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue hover:bg-blueDeep transition-colors group"
              >
                En savoir plus
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Image/Mockup Wrapper */}
          <div className="flex-1 w-full lg:w-auto relative flex justify-center items-center p-4 sm:p-6 lg:p-10">
            {/* The blue pastel background box */}
            <div className="absolute inset-0 bg-blue/10 rounded-3xl -z-0"></div>
            
            <div className="relative z-10 w-full rounded-xl overflow-hidden border border-hair bg-white shadow-2xl p-2">
              <img 
                src={heroDashboard} 
                alt="Tableau de bord Dukaio aperçu" 
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
