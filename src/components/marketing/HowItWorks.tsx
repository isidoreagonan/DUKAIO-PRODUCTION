import React from 'react';
import { stepsData } from './data';

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-slate-50/50 border-b border-hair">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-slate">
              PROCESSUS SIMPLIFIÉ
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink tracking-tight">
              Comment ça fonctionne en <span className="font-serif italic text-blue">3 étapes</span>
            </h2>
          </div>
          <p className="text-sm text-slate max-w-sm font-sans">
            Aucune compétence en programmation requise. Lancez votre première vente numérique aujourd’hui.
          </p>
        </div>

        {/* 3 Steps Container with horizontal borders */}
        <div className="border border-hair rounded-md bg-white divide-y md:divide-y-0 md:divide-x divide-hair grid grid-cols-1 md:grid-cols-3">
          {stepsData.map((step, idx) => (
            <div key={idx} className="p-8 lg:p-10 space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="font-serif italic text-3xl lg:text-4xl text-blue font-medium">
                  {step.number}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate bg-slate-100 px-2 py-1 rounded">
                  Étape {idx + 1}
                </span>
              </div>

              <h3 className="font-serif text-xl font-normal text-ink tracking-tight pt-2">
                {step.title}
              </h3>

              <p className="text-sm text-slate leading-relaxed font-sans">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
