export interface SaleItem {
  id: string;
  produit: string;
  ville: string;
  moyen: string;
  prix: string;
}

export interface ProductItem {
  id: string;
  titre: string;
  categorie: string;
  prix: string;
  couleur: string;
  image?: string;
  description: string;
  vendeur: string;
}

export interface StatItem {
  value: string;
  label: string;
  description?: string;
}

export interface BenefitItem {
  tag: string;
  title: string;
  description: string;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface FeatureItem {
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  mockData: {
    label: string;
    value: string;
    badge: string;
    time: string;
  }[];
}

export interface SecurityItem {
  title: string;
  description: string;
  iconName: string;
}

export interface TestimonialItem {
  nom: string;
  ville: string;
  role: string;
  texte: string;
  avatarBg: string;
  avatarImg?: string;
}

export interface FAQItem {
  question: string;
  reponse: string;
}
