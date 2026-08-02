import React from 'react';
import { benefitsData } from './data';

export const Benefits: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-white border-b border-hair">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-slate">
            AVANTAGES CLÉS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink tracking-tight">
            Pourquoi les créateurs choisissent <span className="font-serif italic text-blue">Dukaio</span>
          </h2>
        </div>

        {/* 3 Columns divided by fine hair lines */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-hair border border-hair rounded-md overflow-hidden bg-white">
          {benefitsData.map((item, idx) => (
            <div key={idx} className="p-8 lg:p-10 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="font-serif italic text-sm text-blue font-medium block">
                  {item.tag}
                </span>
                <h3 className="font-serif text-2xl font-normal text-ink tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-slate leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-2 font-mono text-xs text-blue font-medium">
                <span>En savoir plus</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
