import React, { useState } from 'react';

export const ROICalculator = () => {
  const [audience, setAudience] = useState(1000);
  const [price, setPrice] = useState(5000);
  const conversionRate = 0.02; // 2%

  const earnings = Math.round(audience * conversionRate * price);

  return (
    <section className="py-24 bg-ink text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-20" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tight mb-6">
              Estimez vos <span className="font-serif italic text-blueTint">revenus potentiels</span>
            </h2>
            <p className="text-slate-300 text-lg font-sans mb-8">
              Même avec une petite audience, vendre un produit numérique peut générer un revenu très confortable.
            </p>
          </div>
          
          <div className="bg-inkSoft p-8 rounded-2xl border border-white/10 shadow-2xl">
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm font-medium mb-2">
                  <span>Taille de votre audience</span>
                  <span className="text-blueTint">{audience.toLocaleString()} abonnés</span>
                </label>
                <input 
                  type="range" 
                  min="100" 
                  max="100000" 
                  step="100"
                  value={audience} 
                  onChange={(e) => setAudience(Number(e.target.value))}
                  className="w-full accent-blue"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium mb-2">
                  <span>Prix de votre produit</span>
                  <span className="text-blueTint">{price.toLocaleString()} FCFA</span>
                </label>
                <input 
                  type="range" 
                  min="1000" 
                  max="50000" 
                  step="500"
                  value={price} 
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full accent-blue"
                />
              </div>

              <div className="pt-6 border-t border-white/10 text-center">
                <p className="text-slate-400 text-sm mb-2">Revenus mensuels estimés (2% de conversion)</p>
                <div className="text-4xl md:text-5xl font-serif font-bold text-white">
                  {earnings.toLocaleString()} FCFA
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
