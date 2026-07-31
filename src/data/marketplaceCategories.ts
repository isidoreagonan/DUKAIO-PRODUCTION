// Marketplace categories shared across the app
export interface MarketplaceCategory {
  key: string;
  label: string;
  emoji: string;
  description: string;
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  { key: "business", label: "Business", emoji: "💼", description: "Stratégie, finance, entrepreneuriat" },
  { key: "design", label: "Design", emoji: "🎨", description: "Graphisme, UI/UX, illustrations" },
  { key: "tech", label: "Tech & Code", emoji: "💻", description: "Développement, logiciels, scripts" },
  { key: "marketing", label: "Marketing", emoji: "📈", description: "Pub, SEO, copywriting, ads" },
  { key: "education", label: "Éducation", emoji: "🎓", description: "Cours, tutoriels, formations" },
  { key: "lifestyle", label: "Lifestyle", emoji: "🌿", description: "Bien-être, productivité, loisirs" },
  { key: "creative", label: "Créatif", emoji: "🎬", description: "Vidéo, musique, photo, contenu" },
  { key: "other", label: "Autres", emoji: "✨", description: "Tout le reste" },
];

export const PRODUCT_TYPES = [
  { key: "file", label: "Fichiers", emoji: "📁" },
  { key: "course", label: "Formations", emoji: "🎥" },
  { key: "license", label: "Licences", emoji: "🔑" },
];

export function getCategoryByKey(key?: string | null) {
  return MARKETPLACE_CATEGORIES.find((c) => c.key === key);
}
