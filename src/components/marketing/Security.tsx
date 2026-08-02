import React from 'react';
import { securityData } from './data';
import { ShieldCheck, Cpu, Lock, Scale, FileSearch, Database } from 'lucide-react';

export const Security: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-blue" />;
      case 'Cpu': return <Cpu className="w-6 h-6 text-blue" />;
      case 'Lock': return <Lock className="w-6 h-6 text-blue" />;
      case 'Scale': return <Scale className="w-6 h-6 text-blue" />;
      case 'FileSearch': return <FileSearch className="w-6 h-6 text-blue" />;
      case 'Database': return <Database className="w-6 h-6 text-blue" />;
      default: return <ShieldCheck className="w-6 h-6 text-blue" />;
    }
  };

  return (
    <section id="security" className="py-20 md:py-28 bg-ink text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-white/50">
            PROTECTION & CONFIANCE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
            Une infrastructure <span className="font-serif italic text-blue">haute sécurité</span>
          </h2>
          <p className="text-sm text-white/70 max-w-lg mx-auto font-sans">
            Nous combinons conformité réglementaire, protocoles bancaires chiffrés et intelligence artificielle pour protéger chaque franc encaissé.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityData.map((item, idx) => (
            <div
              key={idx}
              className="bg-inkSoft p-8 rounded-md border border-white/10 hover:border-white/20 transition-colors space-y-4"
            >
              <div className="w-12 h-12 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                {getIcon(item.iconName)}
              </div>

              <h3 className="font-serif text-xl font-normal text-white tracking-tight">
                {item.title}
              </h3>

              <p className="text-sm text-white/70 leading-relaxed font-sans">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Banner inside security */}
        <div className="p-6 rounded-md bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-white/80">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Audits de sécurité réguliers effectués · Certifié ISO 27001 conformité</span>
          </div>
          <span className="text-blue">Garantie 100% Transactions Vendeurs</span>
        </div>

      </div>
    </section>
  );
};
