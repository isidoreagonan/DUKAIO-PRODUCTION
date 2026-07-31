import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Politique de confidentialité" description="Politique de confidentialité d'Dukaio. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles." canonicalPath="/privacy" noindex />
      <Navbar />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Politique de <span className="text-gradient">confidentialité</span>
            </h1>
            <p className="text-lg text-muted-foreground">Dernière mise à jour : 1er Mars 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-3xl prose prose-neutral">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
            {[
              {
                title: "1. Responsable du traitement",
                content: "Le responsable du traitement des données personnelles est Dolapo ECOM LLC, société enregistrée au Nouveau-Mexique, États-Unis, dont le siège social est situé au 1209 Mountain Rd PL NE, Ste R, Albuquerque, NM 87110, USA. Contact : contact@dukaio.com."
              },
              {
                title: "2. Données collectées",
                content: "Nous collectons les données suivantes : informations d'identification (nom, prénom, adresse email, numéro de téléphone), données de paiement (traitées par nos partenaires de paiement sécurisés), données de navigation (adresse IP, type de navigateur, pages visitées), et données relatives aux transactions (historique d'achats, produits consultés)."
              },
              {
                title: "3. Finalités du traitement",
                content: "Vos données sont utilisées pour : la création et la gestion de votre compte, le traitement de vos commandes et paiements, l'amélioration de nos services et de l'expérience utilisateur, l'envoi de communications marketing (avec votre consentement), la prévention de la fraude et la sécurité de la plateforme, et le respect de nos obligations légales."
              },
              {
                title: "4. Base légale du traitement",
                content: "Le traitement de vos données repose sur : l'exécution du contrat (pour la gestion de votre compte et vos commandes), votre consentement (pour les communications marketing), nos intérêts légitimes (pour l'amélioration de nos services et la sécurité), et nos obligations légales (conservation des données de facturation)."
              },
              {
                title: "5. Partage des données",
                content: "Vos données peuvent être partagées avec : nos prestataires de paiement (pour le traitement des transactions), nos partenaires techniques (hébergement, analyse), et les autorités compétentes (en cas d'obligation légale). Nous ne vendons jamais vos données personnelles à des tiers."
              },
              {
                title: "6. Durée de conservation",
                content: "Vos données personnelles sont conservées pendant la durée de votre compte actif, puis archivées pendant une durée maximale de 5 ans après la dernière activité, conformément aux obligations légales de conservation des données comptables et fiscales."
              },
              {
                title: "7. Vos droits",
                content: "Conformément à la réglementation applicable, vous disposez des droits suivants : droit d'accès, de rectification, de suppression, de portabilité de vos données, droit d'opposition et de limitation du traitement. Pour exercer ces droits, contactez-nous à contact@dukaio.com."
              },
              {
                title: "8. Cookies",
                content: "Notre plateforme utilise des cookies essentiels au fonctionnement du site, des cookies de performance pour analyser l'utilisation du site, et des cookies de marketing (avec votre consentement) pour personnaliser votre expérience. Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur."
              },
              {
                title: "9. Sécurité de la plateforme",
                content: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles : chiffrement TLS de bout en bout, isolation des données par Row-Level Security (RLS) au niveau base de données, hébergement chiffré et infrastructure surveillée 24/7. Les transactions de paiement sont chiffrées et traitées par Moneroo (PCI-DSS) — Dukaio ne stocke aucune donnée bancaire."
              },
              {
                title: "10. Vérification d'identité (KYC)",
                content: "Tout vendeur souhaitant retirer des fonds doit valider son identité via notre partenaire Didit.me (vérification biométrique de pièce d'identité officielle). Les données KYC (numéro de document, nom, pays, type de pièce) sont conservées de manière sécurisée à des fins légales (LCB-FT, KYC, anti-fraude). Un même document d'identité ne peut servir à valider qu'un seul compte Dukaio. Vous pouvez demander la suppression de vos données KYC à l'expiration de vos obligations légales."
              },
              {
                title: "11. Anti-fraude et modération",
                content: "Pour protéger acheteurs et vendeurs, nous utilisons une combinaison d'intelligence artificielle et de contrôles humains pour analyser les boutiques, produits et demandes de retrait. Tous les fonds sont placés en quarantaine pendant 5 jours après chaque vente afin de bloquer les tentatives de fraude au remboursement."
              },
              {
                title: "12. Contact",
                content: "Pour toute question relative à cette politique de confidentialité ou au traitement de vos données personnelles, contactez-nous à contact@dukaio.com ou par courrier à Dolapo ECOM LLC, 1209 Mountain Rd PL NE, Ste R, Albuquerque, NM 87110, USA."
              },
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

export default Privacy;
