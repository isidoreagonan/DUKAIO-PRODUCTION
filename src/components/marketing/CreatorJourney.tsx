import React from 'react';
import { ArrowRight, LogIn, Upload, CreditCard, Banknote } from 'lucide-react';

const steps = [
  { icon: <LogIn />, title: "Inscrivez-vous", desc: "Créez votre compte en 2 minutes chrono." },
  { icon: <Upload />, title: "Uploadez", desc: "Ajoutez votre fichier, formation ou lien." },
  { icon: <CreditCard />, title: "Partagez", desc: "Envoyez le lien à votre audience." },
  { icon: <Banknote />, title: "Encaissez", desc: "Recevez votre argent directement." },
];

export const CreatorJourney = () => {
  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-normal text-ink tracking-tight mb-4">
            De 0 à votre <span className="font-serif italic text-blue">première vente</span>
          </h2>
          <p className="text-slate text-lg font-sans">
            Un processus pensé pour être le plus simple possible. Pas de technique requise.
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-hair -translate-y-1/2 hidden md:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center bg-white z-10 p-4">
                <div className="w-16 h-16 bg-blueTint text-blue rounded-full flex items-center justify-center mb-6 shadow-sm border border-white outline outline-4 outline-white">
                  {s.icon}
                </div>
                <h3 className="text-xl font-serif font-medium text-ink mb-2">{s.title}</h3>
                <p className="text-slate font-sans text-sm">{s.desc}</p>
                {i !== steps.length - 1 && (
                  <ArrowRight className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 text-slate/30 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
