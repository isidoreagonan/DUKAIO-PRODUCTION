export type LegalSection = { h: string; p: string[]; list?: string[] };
export type LegalPage = { slug: string; short: string; title: string; intro: string; sections: LegalSection[] };

const company = "Dolapo ECOM LLC";
const contact = "legal@ecom-revolt.com";

export const legalPages: LegalPage[] = [
  {
    slug: "mentions-legales",
    short: "Mentions légales",
    title: "Mentions légales",
    intro: `Le site ecom-revolt.com et le service Dukaio sont édités et exploités par ${company}.`,
    sections: [
      { h: "Éditeur", p: [`${company}, société à responsabilité limitée (Limited Liability Company).`, `Contact : ${contact}`, "Directeur de la publication : le représentant légal de la société."] },
      { h: "Hébergement", p: ["Le service est hébergé sur une infrastructure cloud répartie, fournie par des prestataires reconnus garantissant disponibilité et sécurité des données."] },
      { h: "Propriété intellectuelle", p: ["La marque Dukaio, le logo, les textes, interfaces et éléments graphiques du site sont la propriété exclusive de " + company + ". Toute reproduction sans autorisation écrite est interdite.", "Les produits publiés par les vendeurs restent la propriété de leurs auteurs respectifs."] },
      { h: "Signalement", p: [`Pour signaler un contenu illicite ou une atteinte à vos droits, écrivez à ${contact} en précisant l’URL concernée.`] },
    ],
  },
  {
    slug: "conditions-utilisation",
    short: "Conditions d’utilisation",
    title: "Conditions générales d’utilisation",
    intro: "Ces conditions encadrent l’accès et l’utilisation de Dukaio par tout visiteur, acheteur ou vendeur.",
    sections: [
      { h: "1. Objet", p: ["Dukaio fournit aux créateurs des outils pour créer une boutique en ligne, publier des produits numériques et encaisser des paiements. Dukaio agit en qualité d’intermédiaire technique."] },
      { h: "2. Compte", p: ["La création d’un compte nécessite des informations exactes. Vous êtes responsable de la confidentialité de vos identifiants et de toute activité réalisée depuis votre compte."] },
      { h: "3. Usages interdits", p: ["Il est interdit de publier ou vendre :"], list: ["des contenus contrefaits ou dont vous ne détenez pas les droits ;", "des contenus illégaux, haineux, violents ou à caractère pornographique ;", "des schémas financiers frauduleux ou trompeurs ;", "des logiciels malveillants ou outils de piratage."] },
      { h: "4. Suspension", p: [`${company} peut suspendre ou fermer un compte qui enfreint ces conditions, sans préavis en cas de risque pour les acheteurs ou la plateforme.`] },
      { h: "5. Responsabilité", p: ["Le vendeur est seul responsable du contenu, de la description et de la conformité de ses produits. Dukaio ne garantit pas les résultats promis par un vendeur."] },
      { h: "6. Modifications", p: ["Ces conditions peuvent évoluer. Les utilisateurs sont informés de toute modification substantielle par e-mail ou dans le tableau de bord."] },
    ],
  },
  {
    slug: "conditions-vente",
    short: "Conditions de vente",
    title: "Conditions générales de vente",
    intro: "Ces conditions s’appliquent à l’utilisation de Dukaio par les vendeurs et aux achats réalisés via les boutiques.",
    sections: [
      { h: "Aucun abonnement", p: ["L’ouverture d’une boutique Dukaio est gratuite. Aucun abonnement, aucun frais d’inscription et aucun frais mensuel ne sont facturés au vendeur."] },
      { h: "Commission de 10 %", p: ["Dukaio prélève une commission de 10 % sur le montant de chaque vente réalisée. Elle est déduite automatiquement du montant reversé au vendeur. Aucune commission n’est due tant que le vendeur ne vend pas."] },
      { h: "Achats acheteurs", p: ["Le contrat de vente d’un produit est conclu entre l’acheteur et le vendeur. Dukaio traite le paiement et assure la livraison numérique sécurisée."] },
      { h: "Reversements", p: ["Les fonds sont reversés au vendeur sur le moyen de retrait choisi (Mobile Money ou virement), selon les délais indiqués dans le tableau de bord."] },
    ],
  },
  {
    slug: "confidentialite",
    short: "Confidentialité",
    title: "Politique de confidentialité",
    intro: `${company} accorde une importance particulière à la protection de vos données personnelles.`,
    sections: [
      { h: "Données collectées", p: ["Nous collectons uniquement les données nécessaires au service :"], list: ["identité et coordonnées (nom, e-mail, téléphone) ;", "données de transaction (montant, moyen de paiement, statut) ;", "données techniques (adresse IP, appareil, journaux de connexion)."] },
      { h: "Finalités", p: ["Fournir le service, traiter les paiements, prévenir la fraude, assurer le support et, avec votre accord, vous envoyer des communications."] },
      { h: "Partage", p: ["Vos données ne sont jamais vendues. Elles peuvent être partagées avec nos prestataires de paiement et d’hébergement, strictement pour l’exécution du service."] },
      { h: "Conservation", p: ["Les données sont conservées pendant la durée de la relation commerciale, puis archivées selon les obligations légales applicables."] },
      { h: "Vos droits", p: [`Vous pouvez accéder, rectifier, exporter ou supprimer vos données en écrivant à ${contact}.`] },
    ],
  },
  {
    slug: "cookies",
    short: "Cookies",
    title: "Politique de cookies",
    intro: "Dukaio utilise un nombre limité de cookies pour faire fonctionner le service et le mesurer.",
    sections: [
      { h: "Cookies essentiels", p: ["Indispensables à la connexion, au panier et à la sécurité. Ils ne peuvent pas être désactivés."] },
      { h: "Mesure d’audience", p: ["Nous aident à comprendre l’utilisation du site pour l’améliorer. Ils sont déposés uniquement avec votre consentement."] },
      { h: "Gérer vos choix", p: ["Vous pouvez modifier vos préférences à tout moment depuis les réglages de votre navigateur."] },
    ],
  },
  {
    slug: "remboursement",
    short: "Remboursements",
    title: "Politique de remboursement",
    intro: "Les produits numériques étant livrés immédiatement, les remboursements obéissent à des règles précises.",
    sections: [
      { h: "Principe", p: ["Chaque vendeur définit sa propre politique de remboursement, affichée sur la page produit. À défaut, les règles ci-dessous s’appliquent."] },
      { h: "Cas éligibles", p: ["Un remboursement peut être demandé sous 7 jours si :"], list: ["le fichier est corrompu ou inaccessible ;", "le produit ne correspond manifestement pas à sa description ;", "un double paiement a été effectué."] },
      { h: "Procédure", p: [`Contactez d’abord le vendeur depuis votre reçu. Sans réponse sous 72 h, écrivez à ${contact} avec votre numéro de commande.`] },
    ],
  },
];

export const getLegal = (slug: string) => legalPages.find((l) => l.slug === slug);
