import React from 'react';
import { BookOpen, Code, Image, Music, Video, Sparkles } from 'lucide-react';

const cases = [
  {
    icon: <BookOpen className="w-6 h-6 text-blue" />,
    title: "Auteurs & Formateurs",
    description: "Vendez vos e-books PDF et vos formations vidéos avec accès sécurisé."
  },
  {
    icon: <Code className="w-6 h-6 text-blue" />,
    title: "Développeurs",
    description: "Distribuez vos templates, thèmes, et scripts avec des licences automatiques."
  },
  {
    icon: <Image className="w-6 h-6 text-blue" />,
    title: "Designers",
    description: "Monétisez vos kits UI, illustrations, et presets Lightroom en un clic."
  },
  {
    icon: <Music className="w-6 h-6 text-blue" />,
    title: "Producteurs Audio",
    description: "Vendez vos beats, samples et podcasts avec téléchargement instantané."
  },
  {
    icon: <Video className="w-6 h-6 text-blue" />,
    title: "Créateurs de Contenu",
    description: "Proposez des masterclasses vidéos ou des fichiers exclusifs à votre audience."
  },
  {
    icon: <Sparkles className="w-6 h-6 text-blue" />,
    title: "Agences & Consultants",
    description: "Vendez vos guides stratégiques et des audits packagés facilement."
  }
];

export const UseCases = () => {
  return (
    <section className="py-24 bg-slate-50 border-y border-hair">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-normal text-ink tracking-tight mb-4">
            Pour <span className="font-serif italic text-blue">qui</span> est Dukaio ?
          </h2>
          <p className="text-slate text-lg font-sans">
            Que vous soyez expert ou débutant, Dukaio est conçu pour transformer votre savoir en source de revenus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-hair hover:border-blue hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-blueTint rounded-xl flex items-center justify-center mb-6">
                {c.icon}
              </div>
              <h3 className="text-xl font-serif font-medium text-ink mb-3">{c.title}</h3>
              <p className="text-slate font-sans leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
