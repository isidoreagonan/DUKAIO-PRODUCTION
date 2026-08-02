import React from 'react';

import civ from '@/assets/payment-logos/flags/civ.svg';
import sen from '@/assets/payment-logos/flags/sen.svg';
import cmr from '@/assets/payment-logos/flags/cmr.svg';
import ben from '@/assets/payment-logos/flags/ben.svg';
import cog from '@/assets/payment-logos/flags/cog.svg';
import gab from '@/assets/payment-logos/flags/gab.svg';
import cod from '@/assets/payment-logos/flags/cod.svg';

const countries = [
  { name: "Côte d'Ivoire", flag: civ },
  { name: "Sénégal", flag: sen },
  { name: "Cameroun", flag: cmr },
  { name: "Bénin", flag: ben },
  { name: "Congo", flag: cog },
  { name: "Gabon", flag: gab },
  { name: "RDC", flag: cod }
];

export const GlobalReach = () => {
  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hair bg-blueTint/50">
              <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-blueDeep font-medium">
                Expansion
              </span>
            </div>
            
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-ink tracking-tight">
              Touchez des clients dans plus de <span className="font-serif italic text-blue">15 pays</span>
            </h2>
            
            <p className="text-slate text-lg leading-relaxed font-sans">
              Dukaio gère automatiquement la conversion des devises et propose les moyens de paiement locaux préférés de vos clients, peu importe d'où ils achètent.
            </p>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {countries.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 border border-hair rounded-lg hover:border-blue transition-colors duration-200">
                  <img src={c.flag} alt={c.name} className="w-6 h-4 object-cover rounded-sm shadow-sm" />
                  <span className="font-sans text-sm font-medium text-ink">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
