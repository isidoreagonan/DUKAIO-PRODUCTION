import React from 'react';
import { testimonialsData } from './data';
import { Star } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-white border-b border-hair">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-slate">
            TÉMOIGNAGES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink tracking-tight">
            Ce que disent les créateurs qui <span className="font-serif italic text-blue">vendent avec nous</span>
          </h2>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonialsData.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-md border border-hair hover:border-blue transition-colors duration-200 space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Blue Stars */}
                <div className="flex items-center gap-1 text-blue">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-blue text-blue" />
                  ))}
                </div>

                {/* Quote in font-serif italic */}
                <p className="font-serif italic text-lg text-ink leading-relaxed">
                  {item.texte}
                </p>
              </div>

              {/* Author info */}
              <div className="pt-4 border-t border-hair flex items-center gap-3">
                <div
                  style={!item.avatarImg ? { backgroundColor: item.avatarBg } : undefined}
                  className="w-10 h-10 rounded-full text-white font-serif flex items-center justify-center font-medium text-sm overflow-hidden"
                >
                  {item.avatarImg ? (
                    <img src={item.avatarImg} alt={item.nom} className="w-full h-full object-cover" />
                  ) : (
                    item.nom.charAt(0)
                  )}
                </div>
                <div>
                  <div className="font-sans font-medium text-ink text-sm">
                    {item.nom}
                  </div>
                  <div className="font-mono text-xs text-slate">
                    {item.role} · {item.ville}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
