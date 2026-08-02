import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuthModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Marketplace', href: '#marketplace' },
    { label: 'Produit', href: '#features' },
    { label: 'Sécurité', href: '#security' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-hair transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <span className="font-serif text-2xl font-semibold tracking-tight text-ink">
            Duka<span className="text-blue">io</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate bg-slate-100 px-2 py-0.5 rounded border border-hair">
            SaaS
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate hover:text-ink transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action CTA */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onOpenAuthModal}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md text-sm font-medium text-white bg-blue hover:bg-blueDeep hover:-translate-y-px transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2"
          >
            Créer ma boutique
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-slate hover:text-ink hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-hair bg-white px-4 pt-2 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate hover:text-ink py-1 border-b border-hair/50"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAuthModal) onOpenAuthModal();
              }}
              className="w-full flex items-center justify-center px-5 py-3 rounded-md text-sm font-medium text-white bg-blue hover:bg-blueDeep transition-colors"
            >
              Créer ma boutique
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
