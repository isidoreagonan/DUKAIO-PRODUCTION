import React, { useState } from 'react';
import { faqData } from './data';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-white border-b border-hair">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-slate">
            QUESTIONS FRÉQUENTES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink tracking-tight">
            Tout ce que vous devez savoir sur <span className="font-serif italic text-blue">Dukaio</span>
          </h2>
        </div>

        {/* Accordion List */}
        <div className="border border-hair rounded-md divide-y divide-hair bg-white">
          {faqData.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div key={idx} className="transition-colors">
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
                >
                  <span className="font-serif text-lg font-normal text-ink pr-4">
                    {item.question}
                  </span>
                  <span className="font-serif text-2xl text-blue font-semibold flex-shrink-0 select-none">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate leading-relaxed font-sans border-t border-hair/40 pt-4">
                    {item.reponse}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support contact note */}
        <div className="text-center font-sans text-xs text-slate">
          Une question spécifique non abordée ?{' '}
          <a href="mailto:support@dukaio.com" className="text-blue font-medium underline hover:text-blueDeep">
            Contactez notre équipe support
          </a>
        </div>

      </div>
    </section>
  );
};
