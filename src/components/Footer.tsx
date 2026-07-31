import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-10 grid-cols-2 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="Dukaio" className="h-8 w-8 rounded-lg object-contain" />
              <span className="text-lg font-bold text-foreground">Dukaio</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La plateforme #1 pour vendre vos produits digitaux en Afrique et dans le monde.
            </p>
            <div className="flex flex-col gap-2 mt-3">
              <a href="mailto:contact@dukaio.com" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Mail className="h-3.5 w-3.5" /> contact@dukaio.com
              </a>
              <a href="tel:+2290157385885" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Phone className="h-3.5 w-3.5" /> +229 01 57 38 58 85
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Produits</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Fichiers", href: "/fichiers" },
                { label: "Cours", href: "/cours" },
                { label: "Licences", href: "/licences" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Entreprise</h4>
            <ul className="space-y-2.5">
              {[
                { label: "À propos", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Tarifs", href: "/pricing" },
                { label: "Partenaires", href: "/partners" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Support & Légal</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Documentation", href: "/documentation" },
                { label: "Contact", href: "/contact" },
                { label: "FAQ", href: "/faq" },
                { label: "Conditions", href: "/terms" },
                { label: "Confidentialité", href: "/privacy" },
                { label: "Mentions légales", href: "/legal" },
                { label: "Remboursement", href: "/refund-policy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Dukaio. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Confidentialité</Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Conditions</Link>
            <Link to="/legal" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Mentions légales</Link>
            <Link to="/refund-policy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Remboursement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
