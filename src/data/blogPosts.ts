import launchImg from "@/assets/blog/launch-digital-product.jpg";
import salesImg from "@/assets/blog/sales-strategies.jpg";
import mobileImg from "@/assets/blog/mobile-money.jpg";
import courseImg from "@/assets/blog/online-course.jpg";
import kycImg from "@/assets/blog/kyc-trust.jpg";
import fileImg from "@/assets/blog/file-protection.jpg";

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  cover: string;
  author: { name: string; role: string };
  content: string; // HTML
}

export const blogPosts: BlogPost[] = [
  {
    slug: "lancer-premier-produit-digital-2026",
    title: "Comment lancer votre premier produit digital en 2026",
    category: "Guide",
    date: "28 Fév 2026",
    readTime: "8 min",
    excerpt:
      "Découvrez les étapes clés pour créer, packager et vendre votre premier e-book, cours ou template avec succès — sans être un expert technique.",
    cover: launchImg,
    author: { name: "AGONAN ISIDORE", role: "Fondateur Dukaio" },
    content: `
      <p class="lead">Lancer un produit digital n'a jamais été aussi accessible. Mais pour réussir, il ne suffit pas d'avoir une bonne idée — il faut une <strong>méthode claire</strong>. Voici la feuille de route complète que nous recommandons à tous les nouveaux vendeurs Dukaio.</p>

      <h2>1. Choisissez le bon format de produit</h2>
      <p>Sur Dukaio, vous avez trois grandes catégories de produits digitaux que vous pouvez vendre :</p>
      <ul>
        <li><strong>Fichiers</strong> — e-books PDF, templates Notion, packs Canva, ressources Lightroom, beats audio…</li>
        <li><strong>Formations</strong> — cours vidéo structurés en chapitres et leçons, avec vidéos hébergées et progression de l'élève</li>
        <li><strong>Licences</strong> — clés d'activation pour des logiciels, plugins, extensions Chrome, scripts, accès API…</li>
      </ul>
      <p>Demandez-vous : <em>« Quelle compétence ou ressource ai-je que d'autres seraient prêts à acheter immédiatement ? »</em>. C'est souvent une compétence évidente pour vous, mais rare pour les autres.</p>

      <h2>2. Validez votre idée avant de tout produire</h2>
      <p>Erreur classique : passer 2 mois à créer un cours sans savoir si quelqu'un l'achètera. Faites l'inverse :</p>
      <ol>
        <li>Créez une <strong>landing simple</strong> avec votre boutique Dukaio (gratuit en 5 min)</li>
        <li>Annoncez le produit en pré-vente avec une remise de lancement</li>
        <li>Si vous obtenez 5 à 10 ventes, c'est validé. Sinon, ajustez l'angle ou le prix.</li>
      </ol>

      <h2>3. Soignez la présentation</h2>
      <p>Un bon produit mal présenté ne se vend pas. Les fiches produits qui convertissent le mieux ont :</p>
      <ul>
        <li>Un <strong>titre clair</strong> qui promet un résultat (« Maîtrisez Excel en 7 jours », pas « Cours Excel »)</li>
        <li>Une cover image en 16:9 contrastée et lisible sur mobile</li>
        <li>Une description structurée : problème → solution → contenu → bénéfices → garantie</li>
        <li>Au moins <strong>3 témoignages</strong> ou captures d'écran de résultats</li>
      </ul>

      <h2>4. Choisissez un prix qui inspire confiance</h2>
      <p>Le piège du « trop bas » : un produit à 1 000 FCFA est perçu comme amateur. Pour un premier produit digital de qualité, visez entre <strong>5 000 et 25 000 FCFA</strong>. Vous pouvez toujours offrir une réduction de lancement (-30%) sur les 7 premiers jours pour créer l'urgence.</p>

      <h2>5. Activez vos premiers canaux</h2>
      <p>Une boutique sans trafic ne vend rien. Voici les canaux gratuits les plus efficaces pour démarrer :</p>
      <ul>
        <li><strong>WhatsApp Status</strong> — votre audience la plus chaude</li>
        <li><strong>TikTok / Reels</strong> — démonstrations courtes et résultats clients</li>
        <li><strong>Communautés Facebook</strong> — apportez de la valeur, puis partagez votre lien</li>
        <li><strong>Email / SMS</strong> — envoyez à votre liste de contacts existante</li>
      </ul>

      <h2>6. Suivez et optimisez</h2>
      <p>Le tableau de bord Dukaio vous montre exactement combien de visiteurs vous avez, combien achètent, et d'où viennent vos meilleures ventes. Doublez ce qui marche, supprimez ce qui ne marche pas. Itérez chaque semaine.</p>

      <h2>En résumé</h2>
      <p>Lancer un produit digital en 2026 ne demande pas un budget énorme — juste une <strong>méthode et de la régularité</strong>. Créez votre boutique gratuite, lancez en pré-vente, soignez la fiche, fixez un prix premium et activez vos canaux. Vous tenez là un système reproductible.</p>
    `,
  },
  {
    slug: "5-strategies-augmenter-ventes-300",
    title: "5 stratégies pour augmenter vos ventes de 300%",
    category: "Marketing",
    date: "25 Fév 2026",
    readTime: "7 min",
    excerpt:
      "Les techniques marketing utilisées par nos créateurs les plus performants — appliquez-en au moins 2 et vos ventes décolleront.",
    cover: salesImg,
    author: { name: "Équipe Dukaio", role: "Growth" },
    content: `
      <p class="lead">Nos top vendeurs partagent un point commun : ils n'attendent pas que les ventes arrivent, ils <strong>les déclenchent activement</strong>. Voici 5 stratégies que vous pouvez appliquer dès cette semaine.</p>

      <h2>1. Le bundle d'urgence (sans créer de bundle)</h2>
      <p>Sur Dukaio, les bundles ne sont pas autorisés — mais vous pouvez créer la même perception en proposant un <strong>bonus à durée limitée</strong> sur votre fiche : « Achetez avant dimanche et recevez le pack de templates en cadeau ». L'urgence multiplie le taux de conversion par 2 à 3.</p>

      <h2>2. La preuve sociale visible</h2>
      <p>83% des acheteurs digitaux lisent les avis avant d'acheter. Activez la collecte d'avis automatique (l'acheteur reçoit un email 48h après l'achat) et affichez vos meilleures notes en haut de votre boutique. Bonus : les avis de comptes <strong>KYC vérifiés</strong> portent un badge de confiance qui augmente la conversion.</p>

      <h2>3. L'upsell post-achat</h2>
      <p>Le meilleur moment pour vendre quelque chose à un client, c'est <strong>juste après son premier achat</strong>. Configurez une automatisation Dukaio : dès qu'un client achète votre produit principal, il reçoit une offre de produit complémentaire à -40%. Taux d'acceptation moyen : 18-25%.</p>

      <h2>4. Le lead magnet ciblé</h2>
      <p>Offrez un mini produit gratuit (ex : checklist PDF) en échange de l'email. Vous construisez ainsi votre liste, et 4 à 7 jours plus tard, vous présentez votre produit payant. Cette séquence convertit en moyenne <strong>5 à 8% de la liste</strong>.</p>

      <h2>5. Le retargeting WhatsApp</h2>
      <p>Sur le checkout Dukaio, le numéro de téléphone est obligatoire. Si l'acheteur abandonne, contactez-le sur WhatsApp dans l'heure : « Bonjour, vous étiez à 1 clic d'obtenir [produit] — souhaitez-vous que je vous aide à finaliser ? ». Taux de récupération : 30 à 45%.</p>

      <h2>Bonus : combinez-les</h2>
      <p>Un seul de ces leviers peut augmenter vos ventes de 30 à 50%. <strong>Combinez-en 3</strong> et vous pouvez réellement atteindre +300% en 60 jours. Les chiffres ne mentent pas — il suffit d'agir.</p>
    `,
  },
  {
    slug: "mobile-money-futur-paiement-afrique",
    title: "Mobile Money : le futur du paiement en Afrique",
    category: "Paiements",
    date: "20 Fév 2026",
    readTime: "6 min",
    excerpt:
      "Pourquoi intégrer Mobile Money est devenu indispensable pour vendre en ligne sur le continent africain en 2026.",
    cover: mobileImg,
    author: { name: "Équipe Dukaio", role: "Produit" },
    content: `
      <p class="lead">En 2026, plus de <strong>700 millions d'Africains</strong> utilisent un compte Mobile Money. Si votre boutique en ligne ne l'accepte pas, vous fermez la porte à 80% de votre marché potentiel.</p>

      <h2>Pourquoi le Mobile Money domine</h2>
      <ul>
        <li><strong>Accessibilité</strong> — pas besoin de compte bancaire, juste un numéro de téléphone</li>
        <li><strong>Rapidité</strong> — paiement et réception en moins de 30 secondes</li>
        <li><strong>Confiance</strong> — opérateurs régulés (Orange Money, MTN MoMo, Wave, Moov, Free Money…)</li>
        <li><strong>Couverture</strong> — disponible jusque dans les zones rurales sans agence bancaire</li>
      </ul>

      <h2>Les opérateurs supportés sur Dukaio</h2>
      <p>Grâce à notre partenaire Moneroo, vos clients peuvent payer avec <strong>tous les principaux Mobile Money d'Afrique de l'Ouest et Centrale</strong> :</p>
      <ul>
        <li>Orange Money (CI, SN, ML, BF, CM, GN…)</li>
        <li>MTN Mobile Money (CI, BJ, GN, CM, RW…)</li>
        <li>Wave (SN, CI, ML, UG)</li>
        <li>Moov Money (CI, BJ, TG, BF…)</li>
        <li>Free Money (SN), Airtel Money, Carte bancaire (Visa/Mastercard)</li>
      </ul>

      <h2>Sécurité : ce que Dukaio protège</h2>
      <p>Tous les paiements transitent en <strong>chiffrement TLS</strong> et sont traités par Moneroo (PCI-DSS). Dukaio ne stocke aucune donnée bancaire. De plus, chaque transaction passe par un <strong>délai de maturation de 5 jours</strong> avant que les fonds soient disponibles pour retrait — un mécanisme qui bloque les tentatives de fraude au remboursement.</p>

      <h2>Conseils pratiques pour vendeurs</h2>
      <ol>
        <li>Affichez clairement les logos Mobile Money sur votre boutique pour rassurer</li>
        <li>Testez vous-même le checkout avec un petit montant pour valider l'expérience</li>
        <li>Proposez une assistance WhatsApp en cas de paiement bloqué (conversion +20%)</li>
      </ol>

      <p>Mobile Money n'est plus une option — c'est <strong>l'infrastructure de paiement par défaut en Afrique</strong>. Embrassez-la, et vos ventes suivront.</p>
    `,
  },
  {
    slug: "creer-cours-en-ligne-qui-se-vend",
    title: "Créer un cours en ligne qui se vend tout seul",
    category: "Formations",
    date: "15 Fév 2026",
    readTime: "9 min",
    excerpt:
      "Les secrets d'un cours structuré qui génère des ventes passives mois après mois — du sujet à la livraison.",
    cover: courseImg,
    author: { name: "Équipe Dukaio", role: "E-learning" },
    content: `
      <p class="lead">Un bon cours en ligne, c'est un actif qui travaille pour vous 24/7. Mais entre l'idée et le revenu passif, il y a une méthode. Voici comment construire un cours qui se vend tout seul sur Dukaio.</p>

      <h2>1. Choisissez un sujet à fort ROI perçu</h2>
      <p>Les meilleurs cours résolvent un problème <strong>douloureux, urgent et reconnu</strong>. Exemples : « Apprendre à créer un site Shopify en 7 jours », « Devenir community manager freelance », « Maîtriser ChatGPT pour gagner 10h/semaine ». Plus la promesse est concrète, plus le cours se vend.</p>

      <h2>2. Structurez en chapitres et leçons courtes</h2>
      <p>Sur Dukaio, vous créez un cours composé de <strong>chapitres</strong> (modules) eux-mêmes contenant des <strong>leçons vidéo</strong>. Règle d'or : chaque leçon ≤ 8 minutes. Cela maintient l'attention et donne un sentiment de progression rapide à l'élève.</p>
      <ul>
        <li>5 à 7 chapitres maximum</li>
        <li>4 à 8 leçons par chapitre</li>
        <li>Une leçon = un objectif clair</li>
      </ul>

      <h2>3. Tournez avec ce que vous avez</h2>
      <p>N'attendez pas le matériel parfait. Un smartphone récent + un micro-cravate à 10 000 FCFA + une bonne lumière naturelle = qualité largement suffisante pour vos premiers cours. <strong>Le contenu compte 10x plus que la production.</strong></p>

      <h2>4. Ajoutez des ressources téléchargeables</h2>
      <p>Les cours qui convertissent le mieux ne sont pas que de la vidéo. Ajoutez à vos leçons : PDF récapitulatifs, templates, checklists, fichiers de travail. Cela augmente la valeur perçue et justifie un prix plus élevé.</p>

      <h2>5. Donnez accès à vie</h2>
      <p>Sur Dukaio, l'élève qui achète votre cours y a accès à vie depuis son espace « Mes Achats ». Ce sentiment de propriété est puissant — il transforme un achat en investissement.</p>

      <h2>6. Activez les avis et la communauté</h2>
      <p>Après chaque achat, vos élèves reçoivent automatiquement une demande d'avis. Affichez les meilleurs en page d'accueil de votre boutique. La <strong>preuve sociale</strong> est le moteur principal des ventes passives.</p>

      <h2>7. Faites vivre votre cours</h2>
      <p>Mettez à jour 1 à 2 leçons tous les 3 mois. Annoncez-le à vos élèves existants via la fonctionnalité d'envoi d'email. Cela génère du bouche-à-oreille — et de nouvelles ventes sans publicité.</p>

      <p><strong>Un bon cours en ligne ne se vend pas tout seul par magie</strong> — il se vend tout seul parce que vous avez bien fait le travail au début. Faites-le bien une fois, profitez-en pendant des années.</p>
    `,
  },
  {
    slug: "kyc-confiance-en-ligne-dukaio",
    title: "KYC et confiance en ligne : pourquoi c'est devenu indispensable",
    category: "Sécurité",
    date: "10 Fév 2026",
    readTime: "5 min",
    excerpt:
      "Comment la vérification d'identité protège acheteurs et vendeurs — et pourquoi Dukaio l'a rendue obligatoire avant tout retrait.",
    cover: kycImg,
    author: { name: "Équipe Dukaio", role: "Sécurité & Conformité" },
    content: `
      <p class="lead">La vente digitale en Afrique explose — et avec elle, malheureusement, les tentatives de fraude. C'est pourquoi Dukaio a fait un choix fort : <strong>aucun retrait de fonds n'est possible sans vérification KYC</strong>.</p>

      <h2>Qu'est-ce que le KYC ?</h2>
      <p>KYC signifie <em>« Know Your Customer »</em> — connaître son client. Concrètement, avant de pouvoir retirer vos gains, vous devez prouver votre identité via une <strong>pièce officielle</strong> (passeport, CNI ou permis de conduire) et une vérification biométrique en temps réel.</p>

      <h2>Comment Dukaio le fait</h2>
      <p>Nous travaillons avec <strong>Didit.me</strong>, l'un des leaders mondiaux de la vérification d'identité numérique. Le processus prend 2 à 3 minutes :</p>
      <ol>
        <li>Vous photographiez votre pièce d'identité officielle</li>
        <li>Vous prenez un selfie pour vérification biométrique</li>
        <li>L'IA analyse l'authenticité du document et la correspondance faciale</li>
        <li>Notre équipe valide manuellement chaque dossier</li>
      </ol>

      <h2>Une personne = un seul compte</h2>
      <p>Notre système intègre une <strong>détection automatique de doublons</strong> : un même document d'identité ne peut activer qu'un seul compte Dukaio. Toute tentative de créer plusieurs comptes vérifiés avec la même pièce est rejetée immédiatement.</p>

      <h2>Pourquoi c'est bon pour TOUT le monde</h2>
      <ul>
        <li><strong>Pour les acheteurs</strong> — ils savent qu'ils achètent à un vendeur réel et identifié, pas à un compte fantôme</li>
        <li><strong>Pour les vendeurs</strong> — votre badge KYC vous distingue et augmente la confiance (et donc les conversions)</li>
        <li><strong>Pour la plateforme</strong> — la fraude est endiguée à la racine, ce qui maintient des frais bas pour tous</li>
      </ul>

      <h2>Et la confidentialité ?</h2>
      <p>Vos données KYC sont chiffrées, isolées par <strong>Row-Level Security</strong> au niveau base de données, et ne sont accessibles qu'à notre équipe de conformité. Elles ne sont jamais partagées à des fins commerciales.</p>

      <p>La confiance, ça se construit avec des actes. Le KYC n'est pas une contrainte — c'est <strong>la fondation d'une marketplace saine</strong> où les vrais créateurs gagnent de l'argent en toute sérénité.</p>
    `,
  },
  {
    slug: "proteger-fichiers-piratage-licences",
    title: "Protéger vos fichiers et licences contre le piratage",
    category: "Sécurité",
    date: "5 Fév 2026",
    readTime: "6 min",
    excerpt:
      "Guide complet sur les bonnes pratiques pour sécuriser vos produits digitaux et vos clés de licence sur Dukaio.",
    cover: fileImg,
    author: { name: "Équipe Dukaio", role: "Sécurité" },
    content: `
      <p class="lead">Vous avez investi du temps à créer votre produit digital — la dernière chose que vous voulez, c'est qu'il circule gratuitement sur Telegram. Voici comment Dukaio vous aide à protéger votre travail.</p>

      <h2>1. Livraison via lien personnel et sécurisé</h2>
      <p>Sur Dukaio, vos fichiers ne sont jamais accessibles publiquement. Chaque acheteur reçoit un <strong>lien de téléchargement personnel</strong> attaché à sa commande, accessible depuis son espace « Mes Achats » et son email — jamais via une URL publique partageable.</p>

      <h2>2. Licences à activation contrôlée</h2>
      <p>Pour les produits de type Licence (logiciels, plugins, scripts), Dukaio génère automatiquement des clés au format <code>XXXX-XXXX-XXXX-XXXX</code>. Chaque clé est :</p>
      <ul>
        <li>Unique et liée à un seul acheteur</li>
        <li>Activable un nombre limité de fois (vous le choisissez : 1, 3, 5…)</li>
        <li>Validable par votre logiciel via notre API <code>/validate-license</code></li>
        <li>Révocable à tout moment depuis votre dashboard si une clé est partagée</li>
      </ul>

      <h2>3. Watermark personnalisé sur vos PDF</h2>
      <p>Pour vos fichiers PDF sensibles (e-books, formations), ajoutez systématiquement un <strong>filigrane visible</strong> avec « Licencié à : Nom — Email » avant la livraison. Cela suffit dans 90% des cas à dissuader le partage.</p>

      <h2>4. Surveillez et agissez</h2>
      <p>Faites une recherche Google périodique de votre titre + « gratuit » ou « download free ». Si vous trouvez votre produit en ligne, envoyez un <strong>DMCA takedown</strong> à l'hébergeur du site (la plupart répondent en 48h).</p>

      <h2>5. Le piratage n'est pas votre principal ennemi</h2>
      <p>Les études le montrent : 95% des personnes qui téléchargent une copie pirate <strong>n'auraient jamais acheté</strong>. Concentrez votre énergie sur ceux qui <em>peuvent</em> payer — et offrez-leur tellement de valeur (mises à jour, support, communauté) que la version « légitime » reste largement supérieure à la version piratée.</p>

      <h2>Sécurité de la plateforme</h2>
      <p>De son côté, Dukaio assure : chiffrement TLS, isolation Row-Level Security au niveau base de données, sauvegardes chiffrées quotidiennes, modération IA des produits, et vérification KYC obligatoire des vendeurs. <strong>Vous gardez le contrôle, nous gardons l'infrastructure.</strong></p>
    `,
  },
];

export const getPostBySlug = (slug: string) => blogPosts.find((p) => p.slug === slug);
