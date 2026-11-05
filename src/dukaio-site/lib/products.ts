export type ProductType = "fichiers" | "cours" | "services" | "licences";

export type Feature = { t: string; d: string; rows: { a: string; b: string; tag?: string }[]; title: string };

export type ProductPage = {
  slug: ProductType;
  label: string;
  badge: string;
  title: string;
  lead: string;
  cta: string;
  stats: { n: string; suf: string; l: string }[];
  examples: string[];
  steps: { t: string; d: string }[];
  features: Feature[];
  faqs: [string, string][];
  meta: { title: string; description: string };
};

export const productPages: ProductPage[] = [
  {
    slug: "fichiers",
    label: "Fichiers",
    badge: "Livraison automatique après paiement",
    title: "Vendez vos fichiers, livrés tout seuls.",
    lead: "Ebooks, templates, presets, packs graphiques : mettez votre fichier en ligne, fixez votre prix et laissez Dukaio l’envoyer à chaque acheteur.",
    cta: "Vendre mon premier fichier",
    stats: [
      { n: "0", suf: " clic", l: "De votre part après chaque vente" },
      { n: "10", suf: " %", l: "Seule commission, par vente" },
      { n: "24", suf: "/7", l: "Votre boutique vend même quand vous dormez" },
    ],
    examples: ["Ebooks & guides PDF", "Templates Canva", "Presets photo", "Packs graphiques", "Fichiers Excel", "Musique & sons"],
    steps: [
      { t: "Ajoutez votre fichier", d: "Importez votre PDF, ZIP ou template, ajoutez une couverture et une description." },
      { t: "Partagez votre lien", d: "Envoyez votre page de vente sur WhatsApp, Instagram ou TikTok." },
      { t: "Encaissez", d: "Le client paie en Mobile Money ou par carte et reçoit son fichier aussitôt." },
    ],
    features: [
      { t: "Page de vente", d: "Une page claire pour chaque fichier, avec couverture, description et prix.", title: "Guide : lancer sa marque", rows: [{ a: "Format", b: "PDF · 84 pages" }, { a: "Prix", b: "7 500 F" }, { a: "Statut", b: "En ligne", tag: "ok" }] },
      { t: "Envoi automatique", d: "Après le paiement, l’acheteur reçoit son lien de téléchargement par e-mail.", title: "E-mail envoyé à Awa", rows: [{ a: "Paiement reçu", b: "Orange Money", tag: "ok" }, { a: "Fichier envoyé", b: "guide-marque.pdf", tag: "ok" }, { a: "Téléchargé", b: "il y a 2 min", tag: "ok" }] },
      { t: "Suivi des ventes", d: "Voyez combien chaque fichier vous rapporte, jour après jour.", title: "Ventes du mois", rows: [{ a: "Guide : lancer sa marque", b: "42 ventes" }, { a: "Pack templates Canva", b: "27 ventes" }, { a: "Presets Lightroom", b: "13 ventes" }] },
    ],
    faqs: [
      ["Quels types de fichiers puis-je vendre ?", "Tout produit numérique téléchargeable : PDF, ZIP, images, templates, audio, tableurs…"],
      ["Comment le client reçoit-il le fichier ?", "Automatiquement, juste après son paiement, par e-mail."],
      ["Combien ça coûte ?", "Aucun abonnement. Dukaio prélève 10 % sur chaque vente, rien d’autre."],
    ],
    meta: { title: "Vendre des fichiers numériques — Dukaio", description: "Vendez ebooks, templates et packs en ligne. Livraison automatique, paiement Mobile Money, 10 % par vente sans abonnement." },
  },
  {
    slug: "cours",
    label: "Cours",
    badge: "Vos élèves accèdent au cours dès le paiement",
    title: "Transformez votre savoir en formation.",
    lead: "Organisez vos vidéos en modules, fixez votre prix et vendez votre formation à des élèves partout en Afrique, payée en Mobile Money.",
    cta: "Créer ma formation",
    stats: [
      { n: "1", suf: " lien", l: "Pour vendre toute votre formation" },
      { n: "10", suf: " %", l: "Seule commission, par vente" },
      { n: "0", suf: " F", l: "D’abonnement, même avec 1 000 élèves" },
    ],
    examples: ["Formations vidéo", "Masterclass", "Programmes en modules", "Cours de langue", "Formations business", "Tutoriels"],
    steps: [
      { t: "Créez vos modules", d: "Ajoutez vos leçons vidéo et vos supports, dans l’ordre que vous voulez." },
      { t: "Fixez votre prix", d: "Un prix unique pour la formation complète, en francs CFA." },
      { t: "Accueillez vos élèves", d: "Après paiement, l’élève accède directement à son cours." },
    ],
    features: [
      { t: "Modules & leçons", d: "Structurez votre formation en chapitres clairs.", title: "Formation Excel en 30 jours", rows: [{ a: "Module 1 · Les bases", b: "6 leçons" }, { a: "Module 2 · Formules", b: "8 leçons" }, { a: "Module 3 · Tableaux de bord", b: "5 leçons" }] },
      { t: "Accès élève", d: "Chaque acheteur obtient son accès dès que le paiement est validé.", title: "Nouvel élève inscrit", rows: [{ a: "Moussa K.", b: "Wave", tag: "ok" }, { a: "Accès ouvert", b: "Formation Excel", tag: "ok" }, { a: "Progression", b: "Module 1" }] },
      { t: "Suivi des revenus", d: "Inscriptions et revenus de chaque formation au même endroit.", title: "Ce mois-ci", rows: [{ a: "Nouveaux élèves", b: "58" }, { a: "Revenus", b: "1 450 000 F" }, { a: "Vous recevez", b: "1 305 000 F" }] },
    ],
    faqs: [
      ["Dois-je héberger mes vidéos ailleurs ?", "Non, vous ajoutez vos leçons directement dans votre formation Dukaio."],
      ["Comment mes élèves accèdent-ils au cours ?", "Dès que le paiement est validé, l’élève accède à sa formation."],
      ["Combien ça coûte ?", "Aucun abonnement. Dukaio prélève 10 % sur chaque vente, rien d’autre."],
    ],
    meta: { title: "Vendre une formation en ligne — Dukaio", description: "Créez et vendez vos cours vidéo en modules. Paiement Mobile Money, accès élève immédiat, 10 % par vente sans abonnement." },
  },
  {
    slug: "services",
    label: "Services",
    badge: "Le client paie avant la prestation",
    title: "Faites payer votre expertise, d’avance.",
    lead: "Coaching, consultation, audit ou prestation sur mesure : proposez vos services en ligne et soyez payé avant de commencer, sans relances.",
    cta: "Proposer mon service",
    stats: [
      { n: "100", suf: " %", l: "Payé avant de commencer le travail" },
      { n: "10", suf: " %", l: "Seule commission, par vente" },
      { n: "0", suf: " relance", l: "Fini les clients qui oublient de payer" },
    ],
    examples: ["Coaching individuel", "Consultations", "Audits", "Design sur mesure", "Rédaction", "Accompagnement"],
    steps: [
      { t: "Décrivez votre offre", d: "Ce que vous faites, combien de temps, et ce que le client reçoit." },
      { t: "Partagez votre page", d: "Envoyez votre lien à vos prospects, où qu’ils soient." },
      { t: "Livrez sereinement", d: "Le paiement est confirmé avant même que vous commenciez." },
    ],
    features: [
      { t: "Offre claire", d: "Durée, contenu et prix affichés noir sur blanc.", title: "Coaching business · 1 h", rows: [{ a: "Durée", b: "60 minutes" }, { a: "Format", b: "Appel vidéo" }, { a: "Prix", b: "15 000 F" }] },
      { t: "Paiement d’avance", d: "Le client paie en ligne avant la prestation.", title: "Nouvelle commande", rows: [{ a: "Fatou S.", b: "MTN MoMo", tag: "ok" }, { a: "Coaching business", b: "15 000 F", tag: "ok" }, { a: "Statut", b: "À planifier" }] },
      { t: "Historique clients", d: "Retrouvez toutes vos commandes et vos clients.", title: "Commandes récentes", rows: [{ a: "Fatou S.", b: "Coaching · 1 h" }, { a: "Ibrahim T.", b: "Audit Instagram" }, { a: "Grace A.", b: "Logo sur mesure" }] },
    ],
    faqs: [
      ["Quels services puis-je vendre ?", "Toute prestation que vous réalisez vous-même : coaching, conseil, design, rédaction, accompagnement…"],
      ["Quand suis-je payé ?", "Le client paie au moment de la commande, avant la prestation."],
      ["Combien ça coûte ?", "Aucun abonnement. Dukaio prélève 10 % sur chaque vente, rien d’autre."],
    ],
    meta: { title: "Vendre ses services en ligne — Dukaio", description: "Coaching, consultation, prestation : faites-vous payer d’avance en Mobile Money. 10 % par vente, sans abonnement." },
  },
  {
    slug: "licences",
    label: "Licences",
    badge: "Clé de licence remise à chaque acheteur",
    title: "Vendez vos logiciels, clé en main.",
    lead: "Logiciels, plugins, outils ou accès privés : chaque acheteur reçoit sa licence après paiement, sans que vous ayez à intervenir.",
    cta: "Vendre mon logiciel",
    stats: [
      { n: "1", suf: " clé", l: "Unique pour chaque acheteur" },
      { n: "10", suf: " %", l: "Seule commission, par vente" },
      { n: "0", suf: " F", l: "D’abonnement mensuel" },
    ],
    examples: ["Logiciels", "Plugins WordPress", "Applications", "Outils SaaS", "Bots", "Accès privés"],
    steps: [
      { t: "Ajoutez votre produit", d: "Décrivez votre logiciel et importez vos clés de licence." },
      { t: "Fixez votre prix", d: "Par licence, en francs CFA, pour vos clients d’Afrique et d’ailleurs." },
      { t: "Livraison de la clé", d: "Après paiement, l’acheteur reçoit sa clé de licence." },
    ],
    features: [
      { t: "Stock de licences", d: "Gérez vos clés disponibles et celles déjà attribuées.", title: "Logiciel de caisse Pro", rows: [{ a: "Clés disponibles", b: "148" }, { a: "Clés vendues", b: "52" }, { a: "Prix", b: "40 000 F" }] },
      { t: "Remise automatique", d: "Chaque acheteur reçoit une clé unique par e-mail.", title: "Licence envoyée", rows: [{ a: "Kofi A.", b: "Carte Visa", tag: "ok" }, { a: "Clé", b: "DKO-8F2A-•••• -91QZ", tag: "ok" }, { a: "Statut", b: "Remise" }] },
      { t: "Suivi des ventes", d: "Licences vendues et revenus, produit par produit.", title: "Ce mois-ci", rows: [{ a: "Logiciel de caisse Pro", b: "18 licences" }, { a: "Plugin WhatsApp", b: "31 licences" }, { a: "Revenus", b: "1 185 000 F" }] },
    ],
    faqs: [
      ["Comment fonctionnent les clés de licence ?", "Vous ajoutez vos clés, et Dukaio en remet une différente à chaque acheteur après paiement."],
      ["Puis-je vendre à l’international ?", "Oui, vos clients peuvent aussi payer par carte bancaire ou PayPal."],
      ["Combien ça coûte ?", "Aucun abonnement. Dukaio prélève 10 % sur chaque vente, rien d’autre."],
    ],
    meta: { title: "Vendre des licences logicielles — Dukaio", description: "Vendez logiciels et plugins avec remise automatique de clé de licence. Mobile Money et carte, 10 % par vente, sans abonnement." },
  },
];

export const getProductPage = (s: string) => productPages.find((p) => p.slug === s);
