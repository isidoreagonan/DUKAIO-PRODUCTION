import React from 'react';

import mpesa from '@/assets/payment-logos/providers/mpesa.png';
import mtn from '@/assets/payment-logos/providers/mtn.png';
import orange from '@/assets/payment-logos/providers/orange.png';
import moov from '@/assets/payment-logos/providers/moov.png';
import airtel from '@/assets/payment-logos/providers/airtel.png';
import vodacom from '@/assets/payment-logos/providers/vodacom.png';
import zamtel from '@/assets/payment-logos/providers/zamtel.png';

const paymentLogos = [
  { name: "Orange Money", url: orange },
  { name: "MTN MoMo", url: mtn },
  { name: "Moov", url: moov },
  { name: "Airtel Money", url: airtel },
  { name: "M-Pesa", url: mpesa },
  { name: "Vodacom", url: vodacom },
  { name: "Zamtel", url: zamtel },
];

export const TrustBar: React.FC = () => {
  // Duplicate logos multiple times to ensure the marquee fills the screen and loops seamlessly
  const duplicatedLogos = [...paymentLogos, ...paymentLogos, ...paymentLogos, ...paymentLogos];

  return (
    <div className="bg-white border-b border-hair py-5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-6">
        
        {/* Scrolling Marquee of Logos */}
        <div className="flex-1 overflow-hidden relative flex items-center w-full mask-edges">
          {/* Gradients to fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          <div className="flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused]">
            {duplicatedLogos.map((logo, idx) => (
              <div key={idx} className="flex items-center gap-3 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <img 
                  src={logo.url} 
                  alt={logo.name} 
                  className="h-7 w-auto object-contain rounded-sm"
                />
                <span className="font-sans text-sm font-semibold text-slate whitespace-nowrap hidden sm:block">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
