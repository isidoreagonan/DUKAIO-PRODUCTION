import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-ink border-t border-hair pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Logo & Baseline */}
          <div className="space-y-4">
            <a href="#" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-semibold tracking-tight text-ink">
                Duka<span className="text-blue">io</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate bg-slate-100 px-2 py-0.5 rounded border border-hair">
                Afrique
              </span>
            </a>
            <p className="text-sm text-slate leading-relaxed font-sans max-w-xs">
              La plateforme e-commerce SaaS conçue pour monétiser vos compétences et contenus numériques en Afrique de l’Ouest et Centrale.
            </p>
            <div className="font-mono text-xs text-slate pt-2">
              Dakar · Abidjan · Douala · Paris
            </div>
          </div>

          {/* Col 2: Produits */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-ink font-semibold">
              Produits
            </h4>
            <ul className="space-y-2.5 text-sm text-slate font-sans">
              <li><Link to="/fichiers" className="hover:text-ink transition-colors">Vendre des Fichiers</Link></li>
              <li><Link to="/cours" className="hover:text-ink transition-colors">Vendre des Cours</Link></li>
              <li><Link to="/licences" className="hover:text-ink transition-colors">Vendre des Licences</Link></li>
            </ul>
          </div>

          {/* Col 3: Entreprise */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-ink font-semibold">
              Entreprise
            </h4>
            <ul className="space-y-2.5 text-sm text-slate font-sans">
              <li><Link to="/about" className="hover:text-ink transition-colors">À propos de Dukaio</Link></li>
              <li><Link to="/blog" className="hover:text-ink transition-colors">Blog</Link></li>
              <li><Link to="/pricing" className="hover:text-ink transition-colors">Tarifs</Link></li>
              <li><Link to="/partners" className="hover:text-ink transition-colors">Partenaires & Affiliation</Link></li>
            </ul>
          </div>

          {/* Col 4: Support & Légal */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-ink font-semibold">
              Support & Légal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate font-sans">
              <li><Link to="/documentation" className="hover:text-ink transition-colors">Documentation</Link></li>
              <li><Link to="/faq" className="hover:text-ink transition-colors">Centre d'Aide & FAQ</Link></li>
              <li><a href="mailto:contact@dukaio.com" className="hover:text-ink transition-colors">Support par E-mail</a></li>
              <li><Link to="/terms" className="hover:text-ink transition-colors">Conditions Générales de Vente</Link></li>
              <li><Link to="/privacy" className="hover:text-ink transition-colors">Politique de Confidentialité</Link></li>
              <li><Link to="/legal" className="hover:text-ink transition-colors">Mentions Légales</Link></li>
              <li><Link to="/refund-policy" className="hover:text-ink transition-colors">Politique de Remboursement</Link></li>
            </ul>
          </div>

        </div>

        {/* Copyright & Bottom Bar */}
        <div className="pt-8 border-t border-hair flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate">
          <div>
            © {new Date().getFullYear()} Dukaio Technologies Inc. Tous droits réservés.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Tous les systèmes opérationnels
            </span>
            <a href="#" className="hover:text-ink transition-colors">FR</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
