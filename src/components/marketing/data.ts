import {
  SaleItem,
  ProductItem,
  StatItem,
  BenefitItem,
  StepItem,
  FeatureItem,
  SecurityItem,
  TestimonialItem,
  FAQItem
} from './types';

export const salesData: SaleItem[] = [
  { id: '1', produit: 'Ebook Marketing Digital 2026', ville: 'Dakar', moyen: 'Orange Money', prix: '12 500' },
  { id: '2', produit: 'Pack 50 Templates Canva Pro', ville: 'Abidjan', moyen: 'Wave', prix: '7 000' },
  { id: '3', produit: 'Formation Motion Design', ville: 'Douala', moyen: 'MTN MoMo', prix: '45 000' },
  { id: '4', produit: 'Script Automation WhatsApp', ville: 'Lomé', moyen: 'Moov Money', prix: '18 000' },
  { id: '5', produit: 'Guide Investissement Immo', ville: 'Cotonou', moyen: 'Airtel Money', prix: '15 000' },
];

export const categoryList: string[] = [
  'Ebooks',
  'Formations',
  'Templates',
  'Licences logicielles',
  'Guides PDF',
  'Automatisations',
  'Scripts',
  'Musique',
  'Presets',
  'Illustrations',
  'Plugins',
  'Tutoriels',
];

export const paymentMethods: string[] = [
  'Orange Money',
  'MTN Mobile Money',
  'Wave',
  'Moov Money',
  'Airtel Money',
  'Carte Bank / Visa',
  'Mastercard',
];

export const heroStats: StatItem[] = [
  { value: '100%', label: 'Vendeurs vérifiés KYC' },
  { value: '24h-5j', label: 'Délai de paiement' },
  { value: '10+', label: 'Moyens de paiement' },
  { value: '0 FCFA', label: "Frais d'inscription" },
];

export const tractionStatsData: StatItem[] = [
  { value: '9+', label: 'Pays actifs en Afrique de l\'Ouest & Centrale', description: 'Sénégal, Côte d\'Ivoire, Cameroun, Bénin, Togo, Mali, Gabon...' },
  { value: '722+', label: 'Créateurs & créatrices de contenus accompagnés', description: 'Formateurs, designers, développeurs et auteurs indépendants' },
];

export const productsData: ProductItem[] = [
  {
    id: 'p1',
    titre: 'Masterclass Notion Pro pour Entrepreneurs',
    categorie: 'Formations',
    prix: '25 000 FCFA',
    couleur: '#152A52',
    description: 'Système complet d’organisation d’entreprise, de gestion de projets et d’automatisation.',
    vendeur: 'Kofi Mensah',
  },
  {
    id: 'p2',
    titre: 'Pack 100+ Templates Social Media',
    categorie: 'Templates',
    prix: '19 500 FCFA',
    couleur: '#2557D6',
    description: 'Fichiers Figma et Canva prêts à l’emploi pour booster votre engagement visuel.',
    vendeur: 'Awa Diop Design',
  },
  {
    id: 'p3',
    titre: 'Guide Pratique du Freelancing en Afrique',
    categorie: 'Ebooks',
    prix: '8 500 FCFA',
    couleur: '#0F1E3D',
    description: '150 pages de conseils stratégiques pour trouver vos premiers clients internationaux.',
    vendeur: 'Marc-Aurèle N.',
  },
  {
    id: 'p4',
    titre: 'Bot Automation Telegram & WhatsApp',
    categorie: 'Scripts',
    prix: '32 000 FCFA',
    couleur: '#1B3FA0',
    description: 'Code Python prêt à déployer pour automatiser votre service client et vos relances.',
    vendeur: 'DevStudio West',
  },
  {
    id: 'p5',
    titre: 'Presets Lightroom Portrait & Style Afropop',
    categorie: 'Presets',
    prix: '6 000 FCFA',
    couleur: '#2557D6',
    description: '12 filtres professionnels optimisés pour les teints riches et la lumière naturelle.',
    vendeur: 'Sery Photos',
  },
  {
    id: 'p6',
    titre: 'SaaS Starter Kit Fullstack Node & React',
    categorie: 'Licences logicielles',
    prix: '49 000 FCFA',
    couleur: '#152A52',
    description: 'Boilerplate complet avec authentification, paiements Mobile Money et base de données.',
    vendeur: 'TechAfrica Labs',
  },
];

export const benefitsData: BenefitItem[] = [
  {
    tag: 'Paiements instantanés',
    title: 'Encaissez sans la moindre friction',
    description: 'Vos clients règlent directement via Orange Money, Wave ou MTN MoMo en moins de 30 secondes, sans créer de compte complexe.',
  },
  {
    tag: 'Livraison automatique',
    title: 'Fichiers sécurisés & instantanés',
    description: 'Dukaio génère automatiquement un lien de téléchargement temporaire et personnalisé dès la validation du paiement.',
  },
  {
    tag: 'Zéro frais fixes',
    title: 'Ne payez que quand vous vendez',
    description: 'Aucun abonnement mensuel contraint. Créez votre catalogue gratuitement et ne réglez qu’une faible commission sur vos ventes réelles.',
  },
];

export const stepsData: StepItem[] = [
  {
    number: '01',
    title: 'Créez votre boutique',
    description: 'Importez vos produits numériques (PDF, formations vidéos, fichiers ZIP, licences) et définissez vos prix en FCFA.',
  },
  {
    number: '02',
    title: 'Partagez votre lien',
    description: 'Intégrez votre lien de checkout sécurisé sur Instagram, WhatsApp Business, TikTok, YouTube ou votre site web.',
  },
  {
    number: '03',
    title: 'Recevez vos gains',
    description: 'Les fonds encaissés sont immédiatement crédités sur votre tableau de bord et transférables vers votre compte Mobile Money.',
  },
];

export const featuresData: FeatureItem[] = [
  {
    title: 'Checkout Mobile-First ultra rapide',
    subtitle: 'Expérience d’achat optimisée pour les réseaux mobiles 3G / 4G',
    description: 'Page de paiement épurée, sans redirections inutiles. Votre client saisit son numéro, valide sur son téléphone, et accède instantanément à son produit.',
    highlights: [
      'Temps de chargement < 800ms',
      'Intégration native des guichets USSD & Mobile Money',
      'Factures électroniques automatiques par e-mail et SMS',
    ],
    mockData: [
      { label: 'Client', value: '+221 77 *** ** 42', badge: 'Orange Money', time: 'À l’instant' },
      { label: 'Montant', value: '12 500 FCFA', badge: 'Validé', time: 'À l’instant' },
      { label: 'Livraison', value: 'Lien PDF sécurisé envoyé', badge: 'Envoyé', time: 'À l’instant' },
    ],
  },
  {
    title: 'Protection anti-piratage & liens temporaires',
    subtitle: 'Conservez le contrôle total sur votre propriété intellectuelle',
    description: 'Chaque fichier téléchargé bénéficie de notre système d’embossage numérique (watermarking) et de liens d’accès à durée limitée pour prévenir le partage illégal.',
    highlights: [
      'Watermarking dynamique avec l’e-mail de l’acheteur',
      'Limitation configurable du nombre de téléchargements',
      'Désactivation instantanée des accès en cas d’abus',
    ],
    mockData: [
      { label: 'Tatouage', value: 'Acheteur: kofi@example.com', badge: 'Protégé', time: 'Automatique' },
      { label: 'Expiration', value: 'Max 3 téléchargements', badge: 'Actif', time: '48h restant' },
      { label: 'Intégrité', value: 'Fichier vérifié SHA-256', badge: 'Conforme', time: 'OK' },
    ],
  },
  {
    title: 'Tableau de bord financier & analytiques',
    subtitle: 'Visualisez vos revenus et comprenez le comportement de votre audience',
    description: 'Suivez vos métriques clés en temps réel : volume des ventes, taux de conversion, provenance géographique de vos acheteurs et moyens de paiement préférés.',
    highlights: [
      'Graphiques de ventes quotidiens et mensuels',
      'Exportation comptable des transactions au format CSV',
      'Suivi précis des campagnes d’affiliation et canaux marketing',
    ],
    mockData: [
      { label: 'Ventes du jour', value: '142 000 FCFA (+18%)', badge: 'En hausse', time: 'Aujourd’hui' },
      { label: 'Taux conversion', value: '4.8%', badge: 'Excellent', time: 'Ce mois' },
      { label: 'Top pays', value: 'Sénégal (42%), Côte d’Ivoire (38%)', badge: 'Afrique', time: 'Global' },
    ],
  },
];

export const securityData: SecurityItem[] = [
  {
    title: 'Vérification KYC Stricte',
    description: 'Tous les vendeurs sont identifiés par pièce d’identité pour garantir un écosystème de confiance et éviter les fraudes.',
    iconName: 'ShieldCheck',
  },
  {
    title: 'Algorithme anti-fraude par IA',
    description: 'Analyse comportementale en temps réel pour détecter et bloquer les transactions suspectes avant tout préjudice.',
    iconName: 'Cpu',
  },
  {
    title: 'Chiffrement bancaire TLS 256-bit',
    description: 'Les données sensibles et les tokens de transactions sont chiffrés selon les normes internationales les plus exigeantes.',
    iconName: 'Lock',
  },
  {
    title: 'Gestion des rétractations',
    description: 'Politique d’arbitrage transparente pour régler les réclamations et protéger à la fois l’acheteur et le créateur.',
    iconName: 'Scale',
  },
  {
    title: 'Détection de doublons',
    description: 'Contrôle automatique de l’originalité des contenus numériques déposés sur la plateforme.',
    iconName: 'FileSearch',
  },
  {
    title: 'Conformité RGPD & Données',
    description: 'Hébergement hautement sécurisé respectant la confidentialité et les droits d’accès de vos données personnelles.',
    iconName: 'Database',
  },
];

export const founderQuoteData = {
  initials: 'AI',
  author: 'Amadou I. Diallo',
  role: 'Fondateur & CEO chez Dukaio',
  quote: 'Notre mission chez Dukaio est de libérer le potentiel économique des créateurs africains en éliminant définitivement les barrières de paiement et de distribution.',
};

export const testimonialsData: TestimonialItem[] = [
  {
    nom: 'Mariam Traoré',
    ville: 'Abidjan',
    role: 'Auteure & Formatrice',
    texte: '« Avant Dukaio, je perdais la moitié de mes clients ivoiriens faute de moyen de paiement adapté. Aujourd\'hui, ils paient par Wave en 10 secondes et reçoivent mon ebook directement. Mon chiffre d\'affaires a triplé ! »',
    avatarBg: '#E86F3E',
    avatarImg: 'https://i.pravatar.cc/150?u=mariam'
  },
  {
    nom: 'Cheikh Ndiaye',
    ville: 'Dakar',
    role: 'Développeur & Créateur Notion',
    texte: '« Le checkout est d\'une fluidité incroyable. Pas de création de compte obligatoire pour mes acheteurs. La réception de mes virements Orange Money est rapide et fiable. »',
    avatarBg: '#22C55E',
    avatarImg: 'https://i.pravatar.cc/150?u=cheikh'
  },
  {
    nom: 'Samuel Ebott',
    ville: 'Douala',
    role: 'Consultant E-commerce',
    texte: '« L\'interface est incroyablement propre et professionnelle. Le fait que Dukaio gère la facturation automatique de mes clients locaux et internationaux m\'enlève une charge énorme. »',
    avatarBg: '#2557D6',
    avatarImg: 'https://i.pravatar.cc/150?u=samuel'
  },
  {
    nom: 'David Owono',
    ville: 'Yaoundé',
    role: 'Musicien & Beatmaker',
    texte: '« La protection des fichiers et l\'envoi automatique m\'ont permis de lancer mon pack de samples sans craindre le piratage massif. L\'expérience d\'achat est très fluide. »',
    avatarBg: '#F59E0B',
    avatarImg: 'https://i.pravatar.cc/150?u=david'
  }
];

export const faqData: FAQItem[] = [
  {
    question: 'Qu’est-ce que Dukaio et à qui s’adresse cette plateforme ?',
    reponse: 'Dukaio est la solution SaaS tout-en-un conçue pour les créateurs, formateurs, développeurs, auteurs et indépendants en Afrique qui souhaitent vendre leurs produits numériques (ebooks, cours, templates, logiciels, audio, etc.) avec paiement direct par Mobile Money et Carte bancaire.',
  },
  {
    question: 'Quels sont les moyens de paiement acceptés pour mes clients ?',
    reponse: 'Dukaio prend en charge l’ensemble des principaux opérateurs Mobile Money (Orange Money, Wave, MTN Mobile Money, Moov Money, Airtel Money) ainsi que les cartes bancaires internationales (Visa, Mastercard).',
  },
  {
    question: 'Comment mes clients reçoivent-ils leurs produits après achat ?',
    reponse: 'Dès la validation de la transaction Mobile Money ou CB, votre client est automatiquement dirigé vers une page de téléchargement sécurisée et reçoit simultanément un lien temporaire unique par e-mail et SMS.',
  },
  {
    question: 'Comment et sous quel délai suis-je payé(e) ?',
    reponse: 'Vos revenus cumulés sont visibles en temps réel sur votre tableau de bord Dukaio. Vous pouvez demander un virement vers votre compte Mobile Money ou bancaire à tout moment. Les demandes sont traitées sous 24h à 5 jours ouvrés selon le canal choisi.',
  },
  {
    question: 'Y a-t-il un abonnement mensuel ou des frais cachés ?',
    reponse: 'Non ! L’inscription et la création de votre catalogue sont 100% gratuites (0 FCFA). Dukaio prélève uniquement une commission transparente et compétitive sur chaque vente effective réalisée.',
  },
  {
    question: 'Comment mes fichiers numériques sont-ils protégés contre le piratage ?',
    reponse: 'Dukaio intègre plusieurs niveaux de sécurité : liens de téléchargement à durée limitée, restriction du nombre d’accès par acheteur et marquage numérique (watermarking) pour décourager la diffusion non autorisée.',
  },
];
