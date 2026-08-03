import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, ShieldCheck, Sparkles, Twitter, Instagram, Facebook, Linkedin } from 'lucide-react';
import logo from "@/assets/logo.png";

interface FooterProps {
  onOpenAuthModal?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenAuthModal }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal();
    } else {
      navigate('/register');
    }
  };

  return (
    <footer className="bg-white pt-2 pb-6 px-2 sm:px-4 lg:px-6 text-white relative">
      
      {/* Main Dark Container - Full Width Panoramic Card (Chariow Style) */}
      <div className="w-full bg-[#18181C] border border-slate-800/80 rounded-[28px] sm:rounded-[40px] px-6 sm:px-12 lg:px-16 py-12 sm:py-16 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-b from-blue/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* 1. TOP CTA SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10 pt-4 pb-4">
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.15]">
            Prêt à lancer votre <span className="font-serif italic text-blue-400">boutique ?</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-400 font-sans leading-relaxed max-w-xl mx-auto">
            Démarrez gratuitement dès aujourd'hui. Aucune carte bancaire requise, sans engagement.
          </p>

          <div className="pt-2">
            <button
              onClick={handleAction}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-blue hover:bg-blue-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue/30 transition-all duration-300 gap-2.5 hover:scale-105"
            >
              <span>Créer ma boutique gratuitement</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* MIDDLE DIVIDER LINE */}
        <div className="border-t border-slate-800/80 my-12 sm:my-16" />

        {/* 2. FOOTER NAVIGATION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 text-left relative z-10">
          
          {/* Col 1: Brand, Description & Socials */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img src={logo} alt="Dukaio" className="h-9 w-9 rounded-xl object-contain shadow-md" />
              <span className="font-serif text-2xl font-semibold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Dukaio
              </span>
            </Link>
            
            <p className="text-sm text-slate-400 leading-relaxed font-sans max-w-sm">
              La plateforme tout-en-un pour vendre vos produits numériques et encaisser vos revenus par Mobile Money & Cartes en Afrique.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1 text-slate-400">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>

            {/* Language Selector Pill */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-medium text-slate-300">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Français (Afrique) · FCFA</span>
              </div>
            </div>
          </div>

          {/* Col 2: Produits */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              Produits
            </h4>
            <ul className="space-y-3 text-sm text-slate-400 font-sans">
              <li><Link to="/fichiers" className="hover:text-white transition-colors">Fichiers & Ebooks</Link></li>
              <li><Link to="/cours" className="hover:text-white transition-colors">Formations Vidéo</Link></li>
              <li><Link to="/licences" className="hover:text-white transition-colors">Licences & Software</Link></li>
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
            </ul>
          </div>

          {/* Col 3: Ressources */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              Ressources
            </h4>
            <ul className="space-y-3 text-sm text-slate-400 font-sans">
              <li><Link to="/faq" className="hover:text-white transition-colors">Centre d'aide</Link></li>
              <li><Link to="/#pricing" className="hover:text-white transition-colors text-left">Tarifs & Frais</Link></li>
              <li><Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
              <li className="pt-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Systèmes opérationnels
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Légal */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              Légal
            </h4>
            <ul className="space-y-3 text-sm text-slate-400 font-sans">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Conditions Générales</Link></li>
              <li><Link to="/security" className="hover:text-white transition-colors">Sécurité & KYC</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Remboursements</Link></li>
            </ul>
          </div>

          {/* Col 5: Entreprise */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              Entreprise
            </h4>
            <ul className="space-y-3 text-sm text-slate-400 font-sans">
              <li><Link to="/about" className="hover:text-white transition-colors">À propos</Link></li>
              <li><Link to="/partners" className="hover:text-white transition-colors">Affiliation</Link></li>
              <li><a href="mailto:contact@dukaio.com" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>

        {/* 3. BOTTOM DISCLAIMER & COPYRIGHT */}
        <div className="pt-12 mt-12 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400 font-sans relative z-10">
          <p className="text-center md:text-left leading-relaxed max-w-2xl text-slate-500">
            Dukaio est une plateforme technologique SaaS d'encaissement et de distribution automatisée pour les créateurs de contenus digitaux.
          </p>

          <div className="text-center md:text-right shrink-0 font-mono text-[11px] text-slate-400">
            Copyright © {new Date().getFullYear()} Dukaio Technologies Inc. Tous droits réservés.
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
