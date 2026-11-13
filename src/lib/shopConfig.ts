import type { CSSProperties } from "react";

export const SHOP_STORAGE_KEY = "dukaio.shop.configuration.v1";

export type SectionId = "hero" | "products" | "newsletter" | "about";
export type FontChoice = "sora" | "manrope" | "dm" | "playfair";
export type BackgroundChoice = "ivory" | "white" | "sand" | "mint" | "rose";
export type AccentChoice = "orange" | "green" | "blue" | "plum" | "indigo" | "black";

export interface ShopSection {
  id: SectionId;
  label: string;
  description: string;
  visible: boolean;
}

export interface ShopConfig {
  name: string;
  slug: string;
  description: string;
  whatsapp: string;
  logo: string | null;
  hero: {
    title: string;
    height: "compact" | "regular";
  };
  products: {
    title: string;
    search: boolean;
    categories: boolean;
    showRatings: boolean;
    showSales: boolean;
  };
  newsletter: {
    title: string;
    description: string;
    buttonLabel: string;
  };
  about: {
    title: string;
    text: string;
  };
  appearance: {
    font: FontChoice;
    background: BackgroundChoice;
    accent: AccentChoice;
    radius: 0 | 8 | 14 | 20;
    buttons: "solid" | "outline";
  };
  sections: ShopSection[];
  seo: {
    title: string;
    description: string;
  };
  socials: {
    instagram: string;
    tiktok: string;
    youtube: string;
  };
}

export const defaultShopConfig: ShopConfig = {
  name: "DUKAIO",
  slug: "dukaio",
  description: "Formations, ebooks et ressources digitales pour faire grandir vos projets.",
  whatsapp: "+225 07 00 00 00 00",
  logo: null,
  hero: { title: "Dukaio", height: "regular" },
  products: {
    title: "Tous les produits",
    search: true,
    categories: true,
    showRatings: true,
    showSales: true,
  },
  newsletter: {
    title: "Suivre la boutique",
    description: "Recevez les nouveaux produits et offres exclusives par e-mail.",
    buttonLabel: "Suivre",
  },
  about: {
    title: "À propos de la boutique",
    text: "Présentez ici votre univers, votre méthode et ce qui rend vos produits utiles à vos clients.",
  },
  appearance: {
    font: "sora",
    background: "ivory",
    accent: "orange",
    radius: 14,
    buttons: "solid",
  },
  sections: [
    { id: "hero", label: "Bandeau d’accueil", description: "Le nom de votre boutique dans un bandeau moderne.", visible: true },
    { id: "products", label: "Produits", description: "Recherche, catégories et liste des produits.", visible: true },
    { id: "newsletter", label: "Suivre la boutique", description: "Inscription aux nouveautés par e-mail.", visible: true },
    { id: "about", label: "À propos", description: "Un titre et quelques lignes pour raconter votre histoire.", visible: false },
  ],
  seo: {
    title: "Boutique officielle — DUKAIO",
    description: "Découvrez notre catalogue complet de ressources digitales, formations et guides.",
  },
  socials: { instagram: "", tiktok: "", youtube: "" },
};

export const fontOptions: Array<{ id: FontChoice; name: string; display: string; body: string }> = [
  { id: "sora", name: "Sora", display: '"Sora", sans-serif', body: '"Manrope", sans-serif' },
  { id: "manrope", name: "Manrope", display: '"Manrope", sans-serif', body: '"Manrope", sans-serif' },
  { id: "dm", name: "DM Sans", display: '"DM Sans", sans-serif', body: '"DM Sans", sans-serif' },
  { id: "playfair", name: "Playfair", display: '"Playfair Display", serif', body: '"Manrope", sans-serif' },
];

export const backgroundOptions: Array<{
  id: BackgroundChoice;
  name: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  line: string;
  hero: string;
}> = [
  { id: "ivory", name: "Ivoire", background: "#fcfbf9", surface: "#f4f2ee", foreground: "#20201f", muted: "#74716b", line: "#e7e3dc", hero: "#20211f" },
  { id: "white", name: "Blanc", background: "#ffffff", surface: "#f5f6f7", foreground: "#1d2126", muted: "#71777f", line: "#e6e8eb", hero: "#1e2328" },
  { id: "sand", name: "Sable", background: "#f6f0e6", surface: "#ece2d3", foreground: "#332b22", muted: "#7b6e5e", line: "#ded2bf", hero: "#342e27" },
  { id: "mint", name: "Vert pâle", background: "#f0f6f1", surface: "#e2ece4", foreground: "#203128", muted: "#64766a", line: "#d4e1d7", hero: "#20372b" },
  { id: "rose", name: "Rose pâle", background: "#fbf2f2", surface: "#f2e4e5", foreground: "#39282b", muted: "#806d70", line: "#ead8da", hero: "#38292d" },
];

export const accentOptions: Array<{ id: AccentChoice; name: string; color: string; foreground: string }> = [
  { id: "orange", name: "Orange", color: "#f97316", foreground: "#ffffff" },
  { id: "green", name: "Vert", color: "#16a34a", foreground: "#ffffff" },
  { id: "blue", name: "Bleu", color: "#2563eb", foreground: "#ffffff" },
  { id: "plum", name: "Framboise", color: "#be185d", foreground: "#ffffff" },
  { id: "indigo", name: "Indigo", color: "#4f46e5", foreground: "#ffffff" },
  { id: "black", name: "Noir", color: "#0f172a", foreground: "#ffffff" },
];

export function getShopTheme(config: ShopConfig) {
  const background = backgroundOptions.find((item) => item.id === config.appearance.background) ?? backgroundOptions[0]!;
  const accent = accentOptions.find((item) => item.id === config.appearance.accent) ?? accentOptions[0]!;
  const font = fontOptions.find((item) => item.id === config.appearance.font) ?? fontOptions[0]!;
  return { background, accent, font };
}

export function shopStyle(config: ShopConfig): CSSProperties {
  const theme = getShopTheme(config);
  return {
    "--shop-bg": theme.background.background,
    "--shop-surface": theme.background.surface,
    "--shop-text": theme.background.foreground,
    "--shop-muted": theme.background.muted,
    "--shop-line": theme.background.line,
    "--shop-hero": theme.background.hero,
    "--shop-accent": theme.accent.color,
    "--shop-accent-foreground": theme.accent.foreground,
    "--shop-display": theme.font.display,
    "--shop-body": theme.font.body,
    "--shop-radius": `${config.appearance.radius}px`,
  } as CSSProperties;
}

export function moveSection(config: ShopConfig, id: SectionId, offset: -1 | 1): ShopConfig {
  const from = config.sections.findIndex((section) => section.id === id);
  const to = from + offset;
  if (from < 0 || to < 0 || to >= config.sections.length) return config;
  const sections = [...config.sections];
  const [moved] = sections.splice(from, 1);
  sections.splice(to, 0, moved!);
  return { ...config, sections };
}

export function reorderSections(config: ShopConfig, source: SectionId, target: SectionId): ShopConfig {
  if (source === target) return config;
  const sections = [...config.sections];
  const from = sections.findIndex((section) => section.id === source);
  const to = sections.findIndex((section) => section.id === target);
  if (from < 0 || to < 0) return config;
  const [moved] = sections.splice(from, 1);
  sections.splice(to, 0, moved!);
  return { ...config, sections };
}

export function normalizeShopConfig(input: unknown, defaults: Partial<ShopConfig> = {}): ShopConfig {
  const base = { ...defaultShopConfig, ...defaults };
  if (!input || typeof input !== "object") return base;
  const value = input as Partial<ShopConfig>;
  const sections = Array.isArray(value.sections)
    ? value.sections.filter((section): section is ShopSection => {
        return Boolean(section && defaultShopConfig.sections.some((item) => item.id === section.id));
      })
    : [];
  const uniqueSections = sections.filter((section, index) => sections.findIndex((item) => item.id === section.id) === index);
  const mergedSections = uniqueSections.map((section) => {
    const fallback = defaultShopConfig.sections.find((item) => item.id === section.id)!;
    return { ...fallback, ...section, label: fallback.label, description: fallback.description };
  });
  defaultShopConfig.sections.forEach((section) => {
    if (!mergedSections.some((item) => item.id === section.id)) mergedSections.push(section);
  });

  return {
    ...base,
    ...value,
    hero: { ...base.hero, ...value.hero },
    products: { ...base.products, ...value.products },
    newsletter: { ...base.newsletter, ...value.newsletter },
    about: { ...base.about, ...value.about },
    appearance: { ...base.appearance, ...value.appearance },
    sections: mergedSections.length > 0 ? mergedSections : base.sections,
    seo: { ...base.seo, ...value.seo },
    socials: { ...base.socials, ...value.socials },
  };
}

export interface EditorHistory {
  past: ShopConfig[];
  present: ShopConfig;
  future: ShopConfig[];
}

export type EditorAction =
  | { type: "edit"; config: ShopConfig }
  | { type: "replace"; config: ShopConfig }
  | { type: "undo" }
  | { type: "redo" };

export function createEditorHistory(config: ShopConfig = defaultShopConfig): EditorHistory {
  return { past: [], present: config, future: [] };
}

export function editorReducer(state: EditorHistory, action: EditorAction): EditorHistory {
  switch (action.type) {
    case "edit":
      if (action.config === state.present) return state;
      return { past: [...state.past.slice(-39), state.present], present: action.config, future: [] };
    case "replace":
      return createEditorHistory(normalizeShopConfig(action.config));
    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return { past: [...state.past, state.present], present: next, future: state.future.slice(1) };
    }
  }
}
