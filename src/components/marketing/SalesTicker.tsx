import React from 'react';
import { salesData } from './data';

export const SalesTicker: React.FC = () => {
  // Duplicate array twice to ensure seamless looping
  const duplicatedSales = [...salesData, ...salesData, ...salesData];

  return (
    <div className="bg-blueDeep text-white font-mono text-xs py-3 border-y border-white/10 overflow-hidden select-none ticker-container">
      <div className="flex w-max animate-scroll-32s hover:[animation-play-state:paused]">
        {duplicatedSales.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center gap-2 px-6 border-r border-white/10 whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-pulse flex-shrink-0" />
            <span className="opacity-90">
              Vente confirmée <span className="text-sky-200">·</span>{' '}
              <strong className="font-medium text-white">{item.produit}</strong>{' '}
              <span className="text-sky-200">·</span> {item.ville}{' '}
              <span className="text-sky-200">·</span>{' '}
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[11px] text-sky-100">
                {item.moyen}
              </span>{' '}
              <span className="text-sky-200">·</span>{' '}
              <strong className="text-sky-300 font-semibold">{item.prix} FCFA</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
