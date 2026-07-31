import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Conditions d'utilisation" description="Conditions générales d'utilisation de la plateforme Dukaio. Politique de confidentialité et mentions légales." canonicalPath="/terms" noindex />
      <Navbar />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Conditions <span className="text-gradient">d'utilisation</span>
            </h1>
            <p className="text-lg text-muted-foreground">Dernière mise à jour : 1er Mars 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-3xl prose prose-neutral">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
            {[
              { title: "1. Acceptation des conditions", content: "En utilisant Dukaio, vous acceptez les présentes conditions d'utilisation. Si vous n'êtes pas d'accord, veuillez ne pas utiliser notre plateforme." },
              { title: "2. Description du service", content: "Dukaio est une plateforme permettant aux créateurs de vendre des produits digitaux (fichiers, formations et licences) à travers le monde." },
              { title: "3. Inscription et vérification d'identité (KYC)", content: "Pour utiliser les services de vente, vous devez créer un compte avec des informations exactes. Avant tout retrait de fonds, vous devez compléter une vérification d'identité (KYC) via notre partenaire Didit.me (passeport, CNI ou permis biométrique). Une même personne ne peut valider qu'un seul compte Dukaio : tout document d'identité déjà utilisé pour approuver un compte sera automatiquement rejeté pour tout autre compte." },
              { title: "4. Produits autorisés et modération", content: "Seuls les produits digitaux légaux sont autorisés (fichiers, formations, licences). Les contenus illicites, contrefaits, frauduleux ou violant les droits d'auteur sont strictement interdits. Toutes les boutiques et produits sont analysés par une combinaison d'intelligence artificielle et de modérateurs humains avant et après publication." },
              { title: "5. Paiements, commission et délai 5 jours", content: "Les paiements sont traités de manière sécurisée par Moneroo (Mobile Money & Carte). Dukaio applique une commission de 10% par transaction. Les fonds issus des ventes sont placés en quarantaine pendant 5 jours (délai de maturation) pour prévenir la fraude au remboursement, puis disponibles pour retrait après validation KYC." },
              { title: "6. Propriété intellectuelle", content: "Vous conservez la propriété de vos contenus. En publiant sur Dukaio, vous nous accordez une licence limitée pour afficher et distribuer vos produits." },
              { title: "7. Sécurité et anti-fraude", content: "Dukaio met en œuvre une protection multi-couches : chiffrement TLS, Row-Level Security au niveau base de données, modération IA, vérification KYC obligatoire, détection automatique de doublons d'identité et suivi anti-fraude des transactions. Toute tentative de fraude entraîne la suspension immédiate du compte et la conservation des fonds aux fins d'enquête." },
              { title: "8. Résiliation", content: "Vous pouvez fermer votre compte à tout moment. Dukaio se réserve le droit de suspendre les comptes violant ces conditions, présentant un risque de fraude, ou n'ayant pas validé leur KYC dans les délais requis." },
              { title: "9. Contact", content: "Pour toute question relative à ces conditions, contactez-nous à contact@dukaio.com ou par courrier à Dolapo ECOM LLC, 1209 Mountain Rd PL NE, Ste R, Albuquerque, NM 87110, USA." },
            ].map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-bold text-foreground mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Terms;
