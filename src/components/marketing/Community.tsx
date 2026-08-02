import React from 'react';
import { MessageCircle, Users, ArrowRight } from 'lucide-react';

export const Community = () => {
  return (
    <section className="py-24 bg-white border-y border-hair relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blueTint/30 rounded-3xl p-8 md:p-16 border border-hair flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 space-y-6">
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-ink tracking-tight">
              Rejoignez plus de <span className="font-serif italic text-blue">1000 créateurs</span> actifs
            </h2>
            <p className="text-slate text-lg font-sans">
              Partagez vos stratégies, posez vos questions et développez votre réseau dans la communauté privée Dukaio.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <button className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-medium text-white bg-[#5865F2] hover:bg-[#4752C4] transition-all shadow-sm">
                <MessageCircle className="mr-2 w-5 h-5" />
                Rejoindre le Discord
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-blue/10 rounded-full animate-ping opacity-75" />
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg border border-hair z-10">
                <Users className="w-16 h-16 text-blue" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
