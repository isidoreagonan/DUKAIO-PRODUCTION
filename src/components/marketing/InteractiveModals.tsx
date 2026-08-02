import React, { useState } from 'react';
import { ProductItem } from './types';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Lock, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'Sénégal',
    productType: 'Ebook',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-md border border-hair shadow-2xl max-w-md w-full p-6 space-y-6 relative text-ink">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate hover:text-ink transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-blue font-semibold">
                OUVERTURE GRATUITE EN 2 MIN
              </span>
              <h3 className="font-serif text-2xl font-medium text-ink">
                Créez votre boutique <span className="font-serif italic text-blue">Dukaio</span>
              </h3>
              <p className="text-xs text-slate">
                Aucune carte bancaire requise. 0 FCFA de frais d’inscription.
              </p>
            </div>

            <div className="space-y-3 pt-2 font-sans text-xs">
              <div>
                <label className="block font-mono text-[11px] text-slate uppercase mb-1">
                  Nom complet ou marque
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex. Mariam Traoré / DesignStudio"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-hair rounded focus:outline-none focus:border-blue font-sans text-sm"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-slate uppercase mb-1">
                  Adresse E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="votre.email@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-hair rounded focus:outline-none focus:border-blue font-sans text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] text-slate uppercase mb-1">
                    Pays de résidence
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-hair rounded focus:outline-none focus:border-blue font-sans text-xs bg-white"
                  >
                    <option value="Sénégal">Sénégal</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="Bénin">Bénin</option>
                    <option value="Togo">Togo</option>
                    <option value="Mali">Mali</option>
                    <option value="Autre">Autre pays</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-slate uppercase mb-1">
                    Numéro Mobile Money
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+221 77..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-hair rounded focus:outline-none focus:border-blue font-sans text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue hover:bg-blueDeep text-white font-medium text-sm rounded transition-colors flex items-center justify-center gap-2"
              >
                Lancer ma boutique maintenant
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-center font-mono text-slate flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-blue" />
              <span>Données chiffrées · Conformité KYC & RGPD</span>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-ink">
              Félicitations, {formData.name} !
            </h3>
            <p className="text-sm text-slate">
              Votre espace vendeur <strong className="text-ink">Dukaio</strong> a été pré-configuré pour le numéro <strong className="text-ink">{formData.phone}</strong>.
            </p>
            <div className="p-3 bg-blueTint/60 rounded border border-hair font-mono text-xs text-blueDeep">
              Un e-mail de confirmation avec votre lien d'accès vous a été envoyé à {formData.email}.
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="w-full py-2.5 bg-ink text-white rounded text-sm font-medium hover:bg-inkSoft transition-colors"
            >
              Accéder au tableau de bord
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface ProductCheckoutModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export const ProductCheckoutModal: React.FC<ProductCheckoutModalProps> = ({ product, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState('Wave');
  const [paid, setPaid] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!product) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setPaid(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-md border border-hair shadow-2xl max-w-md w-full p-6 space-y-6 relative text-ink">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate hover:text-ink transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!paid ? (
          <form onSubmit={handlePay} className="space-y-5">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider bg-blueTint text-blueDeep px-2 py-0.5 rounded font-medium">
                {product.categorie} · Checkout Dukaio
              </span>
              <h3 className="font-serif text-xl font-medium text-ink pt-1">
                {product.titre}
              </h3>
              <p className="text-xs text-slate">
                Vendu par <strong className="text-ink">{product.vendeur}</strong>
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-hair rounded flex items-center justify-between font-mono">
              <span className="text-xs text-slate">Montant total</span>
              <span className="font-serif text-xl font-medium text-blue">{product.prix}</span>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <label className="block font-mono text-[11px] text-slate uppercase">
                Choix du moyen de paiement
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money', 'Carte Visa'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedMethod(method)}
                    className={`py-2 px-2 rounded border font-mono text-xs text-center transition-all ${
                      selectedMethod === method
                        ? 'border-blue bg-blueTint/60 text-blue font-semibold'
                        : 'border-hair bg-white text-slate hover:border-slate-300'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <div>
                <label className="block font-mono text-[11px] text-slate uppercase mb-1">
                  Votre numéro de téléphone Mobile Money
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+221 77 123 45 67"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-hair rounded focus:outline-none focus:border-blue font-sans text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue hover:bg-blueDeep text-white font-medium text-sm rounded transition-colors flex items-center justify-center gap-2"
            >
              Payer {product.prix} via {selectedMethod}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-center font-mono text-slate flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue" />
              <span>Livraison automatique par lien sécurisé post-paiement</span>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-ink">
              Paiement confirmé !
            </h3>
            <p className="text-sm text-slate">
              Votre achat de <strong className="text-ink">{product.titre}</strong> a été validé avec succès via {selectedMethod}.
            </p>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs font-mono text-emerald-800 space-y-2">
              <div>Lien de téléchargement généré avec succès.</div>
              <div className="font-semibold text-emerald-900 underline cursor-pointer">
                Télécharger le fichier (ZIP / PDF)
              </div>
            </div>
            <button
              onClick={() => {
                setPaid(false);
                onClose();
              }}
              className="w-full py-2.5 bg-ink text-white rounded text-sm font-medium hover:bg-inkSoft transition-colors"
            >
              Fermer la fenêtre
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-md border border-hair shadow-2xl max-w-2xl w-full p-6 space-y-6 relative text-ink">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate hover:text-ink transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="font-mono text-xs uppercase tracking-widest text-blue font-semibold">
            DÉMONSTRATION EN DIRECT
          </span>
          <h3 className="font-serif text-2xl font-medium text-ink">
            Aperçu de l'expérience d'achat sur <span className="font-serif italic text-blue">Dukaio</span>
          </h3>
        </div>

        {/* Video placeholder display */}
        <div className="aspect-video bg-ink rounded border border-hair relative overflow-hidden flex flex-col items-center justify-center text-white p-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue flex items-center justify-center shadow-lg">
            <span className="font-serif italic text-2xl text-white pl-1">►</span>
          </div>
          <div className="text-center space-y-1">
            <div className="font-serif text-lg">Parcours d'achat en 15 secondes</div>
            <div className="font-mono text-xs text-white/60">
              Checkout Mobile Money → Confirmation USSD → Livraison automatique du PDF
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue hover:bg-blueDeep text-white rounded font-medium text-sm transition-colors"
          >
            Fermer la démo
          </button>
        </div>
      </div>
    </div>
  );
};
