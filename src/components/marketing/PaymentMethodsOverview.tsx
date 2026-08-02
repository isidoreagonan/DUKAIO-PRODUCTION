import React from 'react';

import mpesa from '@/assets/payment-logos/providers/mpesa.png';
import mtn from '@/assets/payment-logos/providers/mtn.png';
import orange from '@/assets/payment-logos/providers/orange.png';
import moov from '@/assets/payment-logos/providers/moov.png';
import airtel from '@/assets/payment-logos/providers/airtel.png';
import vodacom from '@/assets/payment-logos/providers/vodacom.png';

const methods = [
  { name: 'MTN Mobile Money', icon: mtn },
  { name: 'Orange Money', icon: orange },
  { name: 'Moov Africa', icon: moov },
  { name: 'Airtel Money', icon: airtel },
  { name: 'M-Pesa', icon: mpesa },
  { name: 'Vodacom', icon: vodacom },
];

export const PaymentMethodsOverview = () => {
  return (
    <section className="py-24 bg-white border-y border-hair relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-normal text-ink tracking-tight mb-4">
            Encaissez <span className="font-serif italic text-blue">partout</span> en Afrique
          </h2>
          <p className="text-slate text-lg font-sans">
            Dukaio intègre nativement plus de 20 moyens de paiement locaux. 
            Vos clients paient avec ce qu'ils ont dans leur téléphone.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {methods.map((m, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-hair rounded-xl hover:border-blue transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm p-3 mb-3">
                <img src={m.icon} alt={m.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-medium font-sans text-inkSoft">{m.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
