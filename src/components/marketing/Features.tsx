import React from 'react';
import { featuresData } from './data';
import { CheckCircle2 } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-white border-b border-hair">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-slate">
            FONCTIONNALITÉS AVANCÉES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink tracking-tight">
            Conçu pour répondre aux défis du <span className="font-serif italic text-blue">marché africain</span>
          </h2>
        </div>

        {/* 3 Alternating Rows */}
        <div className="space-y-20">
          {featuresData.map((feature, idx) => {
            const isEven = idx % 2 === 1;

            return (
              <div
                key={idx}
                className={`flex flex-col md:flex-row items-center gap-12 lg:gap-16 ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Text Content */}
                <div className="flex-1 space-y-6">
                  <div className="inline-block px-3 py-1 rounded-full border border-hair bg-slate-50">
                    <span className="font-mono text-xs text-slate uppercase tracking-wider">
                      Module 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-serif text-3xl font-normal text-ink tracking-tight leading-snug">
                    {feature.title}
                  </h3>

                  <p className="text-sm font-mono text-blue font-medium">
                    {feature.subtitle}
                  </p>

                  <p className="text-sm text-slate leading-relaxed font-sans">
                    {feature.description}
                  </p>

                  <ul className="space-y-3 pt-2">
                    {feature.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-3 text-sm text-ink font-sans">
                        <CheckCircle2 className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mini Activity List Visual */}
                <div className="flex-1 w-full max-w-md lg:max-w-none">
                  <div className="bg-ink rounded-lg p-6 border border-hair shadow-xl text-white space-y-4">
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue" />
                        <span className="font-mono text-xs text-white/70 uppercase">
                          Activité en direct
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-white/40">SÉCURISÉ</span>
                    </div>

                    <div className="space-y-3">
                      {feature.mockData.map((dataRow, dIdx) => (
                        <div
                          key={dIdx}
                          className="bg-inkSoft/80 p-3.5 rounded border border-white/5 flex items-center justify-between gap-3 text-xs font-sans"
                        >
                          <div className="space-y-0.5">
                            <span className="text-white/60 text-[11px] block">{dataRow.label}</span>
                            <span className="font-mono text-white font-medium block">
                              {dataRow.value}
                            </span>
                          </div>

                          <div className="text-right space-y-1">
                            <span className="bg-blueDeep text-white text-xs rounded px-2 py-0.5 font-mono inline-block">
                              {dataRow.badge}
                            </span>
                            <span className="text-white/40 text-[10px] block font-mono">
                              {dataRow.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-white/40">
                      <span>STATUT DU NŒUD : ACTIF</span>
                      <span>LATENCE : 12ms</span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
