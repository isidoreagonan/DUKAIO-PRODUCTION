import React from 'react';
import { ShoppingBag, Check } from 'lucide-react';
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

  const advantages = [
    "Aucun abonnement, vous ne payez que si vous réalisez des ventes",
    "90% de vos ventes directement dans votre poche",
    "Accès à la première marketplace & aux outils de vente automatisés",
    "Paiements rapides, simples et transparents par Mobile Money & Cartes"
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white text-ink border-b border-hair relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue block">
            TARIFICATION
          </span>

          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-ink leading-tight">
            Une tarification simple et transparente
          </h2>

          <p className="text-base sm:text-lg text-slate-500 font-sans leading-relaxed">
            Avec Dukaio, pas d'abonnement ni de frais cachés. Vous ne payez que 10% sur vos ventes et vous gardez 90% de vos revenus.
          </p>
        </div>

        {/* Vibrant Blue Card (Maketou / Dukaio Style) */}
        <div className="bg-[#3B46F6] rounded-[28px] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Side: Brand & 10% Highlight + CTA */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h3 className="font-serif text-3xl font-bold tracking-tight text-white mb-1">
                  Dukaio
                </h3>
                <p className="text-sm text-white/80 font-sans font-medium">
                  Gagnez plus, gardez vos revenus.
                </p>
              </div>

              <div className="flex items-baseline gap-2 pt-2 pb-4">
                <span className="font-sans font-black text-5xl sm:text-6xl tracking-tight text-white">
                  10%
                </span>
                <span className="text-sm font-medium text-white/90">
                  seulement de commission
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAction}
                  className="w-full bg-white hover:bg-slate-100 text-[#3B46F6] font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 group"
                >
                  <span>Créer ma boutique gratuite</span>
                  <ShoppingBag className="w-4 h-4 text-[#3B46F6]" />
                </button>
              </div>
            </div>

            {/* Right Side: Advantages List */}
            <div className="lg:col-span-6 lg:border-l lg:border-white/20 lg:pl-10 pt-6 lg:pt-0 space-y-6">
              <span className="font-mono text-xs uppercase tracking-widest text-white/80 font-bold block">
                AVANTAGES
              </span>

              <ul className="space-y-4">
                {advantages.map((text, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm sm:text-base font-sans text-white/95 leading-snug">
                    <Check className="w-5 h-5 text-white shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
