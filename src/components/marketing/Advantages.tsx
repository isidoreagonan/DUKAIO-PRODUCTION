import React from 'react';
import { motion } from 'framer-motion';
import advantageCard1 from '@/assets/advantage-card1.png';

interface AdvantagesProps {
  card1Image?: string;
  card2Image?: string;
  card3Image?: string;
}

export const Advantages: React.FC<AdvantagesProps> = ({
  card1Image = advantageCard1,
  card2Image,
  card3Image
}) => {
  return (
    <section className="py-20 md:py-28 bg-white border-b border-hair">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="font-sans text-xs sm:text-sm font-bold uppercase tracking-widest text-blue">
            AVANTAGES DUKAIO
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-ink tracking-tight leading-[1.15]">
            L'écosystème conçu pour propulser <br className="hidden sm:block" />
            vos <span className="font-serif italic text-blue">produits numériques</span>
          </h2>
          <p className="text-base sm:text-lg text-[#64748B] font-sans leading-relaxed max-w-2xl mx-auto">
            Dukaio combine marketplace intégrée, encaissement instantané et automatisation fluide pour faire grandir vos revenus sans aucune barrière technique.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* ==================== CARD 1: REVENUS NETS & COMMISSION ==================== */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Card 1 Image / Visual */}
              <div className="w-full rounded-2xl bg-slate-50/50 border border-slate-200/80 overflow-hidden mb-6 flex items-center justify-center p-2 min-h-[260px] sm:min-h-[300px]">
                {card1Image ? (
                  <img 
                    src={card1Image} 
                    alt="Gardez l'essentiel de vos ventes" 
                    className="w-full h-auto max-h-[320px] object-contain rounded-xl" 
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue bg-white px-3 py-1 rounded-full border shadow-sm">
                        Vos Revenus Nets
                      </span>
                    </div>
                    <div className="text-3xl font-extrabold text-ink">95 000 FCFA</div>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-2.5">
                <h3 className="font-sans font-bold text-xl text-ink tracking-tight">
                  Gardez l'essentiel de vos ventes
                </h3>
                <p className="text-sm text-[#64748B] font-sans leading-relaxed">
                  Avec une commission minimale et transparente, vous conservez l'essentiel de vos revenus et maximisez vos gains à chaque transaction.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ==================== CARD 2: MARKETPLACE INTEGRÉE ==================== */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Card 2 Visual */}
              <div className="w-full rounded-2xl bg-slate-50/50 border border-slate-200/80 overflow-hidden mb-6 flex items-center justify-center p-2 min-h-[260px] sm:min-h-[300px]">
                {card2Image ? (
                  <img 
                    src={card2Image} 
                    alt="Accédez à la marketplace intégrée" 
                    className="w-full h-auto max-h-[320px] object-contain rounded-xl" 
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-purple-50/80 via-blue-50/30 to-slate-50 border border-slate-200/80 p-5 flex flex-col justify-between rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-purple-600 bg-white/95 px-3 py-1 rounded-full border shadow-sm">
                        Marketplace Dukaio
                      </span>
                      <span className="text-[11px] font-semibold text-blue bg-blue/10 px-2.5 py-0.5 rounded-full">
                        +50k Acheteurs
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-3 border shadow-sm space-y-2 text-left">
                      <h4 className="font-bold text-ink text-xs">Pack 100K Ressources Digitaux</h4>
                      <p className="text-xs text-blue font-bold">15 000 FCFA</p>
                    </div>
                    <div className="bg-white/95 rounded-xl p-2 border shadow-sm text-left text-xs font-bold text-ink">
                      🌐 Visibilité Internationale
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-2.5">
                <h3 className="font-sans font-bold text-xl text-ink tracking-tight">
                  Accédez à la marketplace intégrée
                </h3>
                <p className="text-sm text-[#64748B] font-sans leading-relaxed">
                  Mettez en avant vos produits numériques auprès de milliers d'acheteurs actifs partout en Afrique et à l'international.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ==================== CARD 3: SIMPLICITÉ & PAIEMENT ==================== */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Card 3 Visual */}
              <div className="w-full rounded-2xl bg-slate-50/50 border border-slate-200/80 overflow-hidden mb-6 flex items-center justify-center p-2 min-h-[260px] sm:min-h-[300px]">
                {card3Image ? (
                  <img 
                    src={card3Image} 
                    alt="Une simplicité inégalée" 
                    className="w-full h-auto max-h-[320px] object-contain rounded-xl" 
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-emerald-50/80 via-blue-50/30 to-slate-50 border border-slate-200/80 p-5 flex flex-col justify-between rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-emerald-700 bg-white/95 px-3 py-1 rounded-full border shadow-sm">
                        Checkout & Livraison
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border">
                        100% Automatisé
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-3 border shadow-sm text-left">
                      <p className="text-xs font-semibold text-ink">Paiements sécurisés</p>
                      <div className="flex gap-1.5 pt-1 text-[10px] font-bold">
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded">Wave</span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded">MTN</span>
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded">Orange</span>
                      </div>
                    </div>
                    <div className="bg-white/95 rounded-xl p-2 border shadow-sm text-left text-xs font-bold text-ink">
                      📩 Livraison Instantanée en 3s
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-2.5">
                <h3 className="font-sans font-bold text-xl text-ink tracking-tight">
                  Une simplicité inégalée
                </h3>
                <p className="text-sm text-[#64748B] font-sans leading-relaxed">
                  Interface intuitive, paiements Mobile Money & Cartes bancaires sécurisés et tableau de bord clair : tout est pensé pour vous simplifier la vie.
                </p>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
