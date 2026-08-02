import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface FinalCTAProps {
  onOpenAuthModal?: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenAuthModal }) => {
  return (
    <section className="py-24 md:py-32 bg-ink text-white border-b border-white/10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8 relative z-10">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
          <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-white/70">
            LANCEMENT IMMÉDIAT
          </span>
        </div>

        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Prêt à transformer vos contenus en <span className="font-serif italic text-blue">revenus récurrents</span> ?
        </h2>

        <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto font-sans leading-relaxed">
          Rejoignez plus de 700 créateurs africains qui vendent déjà leurs ebooks, formations et logiciels en toute sérénité.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-md text-base font-semibold text-white bg-blue hover:bg-blueDeep hover:-translate-y-px transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2 shadow-lg"
          >
            Créer ma boutique maintenant
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>

        <div className="pt-6 flex flex-wrap justify-center items-center gap-6 font-mono text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue" />
            0 FCFA d’inscription
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue" />
            Mobile Money prêt à l’emploi
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue" />
            Sans engagement
          </span>
        </div>

      </div>

      {/* Decorative background circle grid */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue/10 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};
