import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PricingSectionProps {
  onOpenAuthModal?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenAuthModal }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal();
    } else {
      navigate('/register');
    }
  };

  const features = [
    "Création de boutique et catalogue produits illimités",
    "Tous les modes de paiement Mobile Money (Wave, Orange, MTN, M-Pesa, Airtel) & Cartes",
    "Stockage et hébergement sécurisé de vos fichiers & cours",
    "Protection anti-piratage avec tatouage numérique (watermarking) dynamique",
    "Livraison automatique instantanée 24/7 par e-mail",
    "Tableau de bord financier et suivi analytique en temps réel",
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-slate-50 relative overflow-hidden text-ink border-b border-hair">
      
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-gradient-to-tr from-blue-300/15 via-indigo-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue" />
            <span>TARIFICATION TRANSPARENTE</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-ink leading-tight">
            Payez uniquement quand <span className="font-serif italic text-blue">vous vendez</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-sans leading-relaxed max-w-2xl mx-auto">
            Pas d'abonnement mensuel. Pas de frais fixes. Dukaio prélève simplement une commission fixe de 10% sur chaque transaction réussie.
          </p>
        </div>

        {/* Pricing Card Centered */}
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden group">
          
          {/* Top Tag Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold font-mono uppercase tracking-wider mb-2">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>0 FCFA / MOIS</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-ink">Formule Unique & Sans Engager</h3>
            </div>

            <div className="text-center sm:text-right shrink-0">
              <div className="font-sans font-black text-4xl sm:text-5xl text-blue tracking-tight">
                10%
              </div>
              <div className="text-xs text-slate-500 font-sans font-medium">
                par vente réalisée
              </div>
            </div>
          </div>

          {/* Included Features List */}
          <div className="py-8 space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">
              TOUT CE QUI EST INCLUS SANS FRAIS CACHÉS :
            </h4>

            <ul className="space-y-3.5">
              {features.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-700 font-sans text-sm sm:text-base leading-snug">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-slate-100 text-center space-y-4">
            <button
              onClick={handleAction}
              className="w-full inline-flex items-center justify-center px-8 py-4 rounded-xl bg-blue hover:bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue/25 transition-all duration-300 gap-2.5 hover:scale-[1.02]"
            >
              <span>Créer ma boutique gratuitement</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-xs text-slate-400 font-sans flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Aucune carte bancaire requise. Vous ne payez que si vous réalisez des ventes.</span>
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
