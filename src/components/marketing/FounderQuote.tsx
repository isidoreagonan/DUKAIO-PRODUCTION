import React from 'react';
import { founderQuoteData } from './data';

export const FounderQuote: React.FC = () => {
  return (
    <section className="py-20 md:py-24 bg-blueTint border-b border-hair">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-8">
        
        {/* Avatar */}
        <div className="mx-auto w-14 h-14 rounded-full bg-ink text-white flex items-center justify-center font-serif text-xl font-medium shadow-md">
          {founderQuoteData.initials}
        </div>

        {/* Quote */}
        <blockquote className="font-serif italic text-2xl sm:text-3xl text-ink leading-relaxed">
          « Notre mission chez Dukaio est de{' '}
          <span className="text-blue font-semibold">
            libérer le potentiel économique des créateurs africains
          </span>{' '}
          en éliminant définitivement les barrières de paiement et de distribution. »
        </blockquote>

        {/* Author Details */}
        <div className="space-y-1">
          <div className="font-sans font-semibold text-ink text-base">
            {founderQuoteData.author}
          </div>
          <div className="font-mono text-xs uppercase tracking-widest text-slate">
            {founderQuoteData.role}
          </div>
        </div>

      </div>
    </section>
  );
};
