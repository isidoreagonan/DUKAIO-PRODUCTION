import React from 'react';

import ben from '@/assets/payment-logos/flags/ben.svg';
import cmr from '@/assets/payment-logos/flags/cmr.svg';
import civ from '@/assets/payment-logos/flags/civ.svg';
import cod from '@/assets/payment-logos/flags/cod.svg';
import gab from '@/assets/payment-logos/flags/gab.svg';
import ken from '@/assets/payment-logos/flags/ken.svg';
import cog from '@/assets/payment-logos/flags/cog.svg';
import rwa from '@/assets/payment-logos/flags/rwa.svg';
import sen from '@/assets/payment-logos/flags/sen.svg';
import sle from '@/assets/payment-logos/flags/sle.svg';
import uga from '@/assets/payment-logos/flags/uga.svg';
import zmb from '@/assets/payment-logos/flags/zmb.svg';

const countries = [
  { name: "Bénin", currency: "XOF", flag: ben },
  { name: "Cameroun", currency: "XAF", flag: cmr },
  { name: "Côte d'Ivoire", currency: "XOF", flag: civ },
  { name: "RD Congo", currency: "CDF / USD", flag: cod },
  { name: "Gabon", currency: "XAF", flag: gab },
  { name: "Kenya", currency: "KES", flag: ken },
  { name: "Congo Brazzaville", currency: "XAF", flag: cog },
  { name: "Rwanda", currency: "RWF", flag: rwa },
  { name: "Sénégal", currency: "XOF", flag: sen },
  { name: "Sierra Leone", currency: "SLE", flag: sle },
  { name: "Ouganda", currency: "UGX", flag: uga },
  { name: "Zambie", currency: "ZMW", flag: zmb }
];

export const GlobalReach = () => {
  return (
    <section className="py-24 bg-white relative text-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left Text Column */}
          <div className="lg:w-5/12 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue/20 bg-blue-50">
              <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-blue font-bold">
                COUVERTURE AFRIQUE
              </span>
            </div>
            
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-ink tracking-tight leading-tight">
              Touchez des clients dans <span className="font-serif italic text-blue">12+ pays africains</span>
            </h2>
            
            <p className="text-[#64748B] text-base md:text-lg leading-relaxed font-sans">
              Dukaio gère automatiquement la conversion des devises et accepte les moyens de paiement locaux préférés de vos clients (Wave, Orange Money, MTN MoMo, M-Pesa, Vodacom, Airtel Money, Cartes) peu importe d'où ils achètent.
            </p>
          </div>
          
          {/* Right Grid Column: 12 Countries */}
          <div className="lg:w-7/12 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {countries.map((c, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:border-blue/40 hover:bg-white transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={c.flag} alt={c.name} className="w-6 h-4 object-cover rounded-sm shadow-sm shrink-0" />
                    <span className="font-sans text-xs sm:text-sm font-semibold text-ink truncate">{c.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0 ml-1">
                    {c.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
