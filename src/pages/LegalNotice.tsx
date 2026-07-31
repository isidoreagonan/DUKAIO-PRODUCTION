import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const LegalNotice = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Mentions légales" description="Mentions légales d'Dukaio, plateforme de vente de produits digitaux opérée par Dolapo ECOM LLC." canonicalPath="/legal" noindex />
      <Navbar />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Mentions <span className="text-gradient">légales</span>
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
                title: "1. Éditeur du site",
                content: "Le site Dukaio (accessible à l'adresse dukaio.com) est édité par Dolapo ECOM LLC, société à responsabilité limitée enregistrée dans l'État du Nouveau-Mexique, États-Unis. Siège social : 1209 Mountain Rd PL NE, Ste R, Albuquerque, NM 87110, USA. Email : contact@dukaio.com."
              },
              {
                title: "2. Directeur de la publication",
                content: "Le directeur de la publication est le gérant de Dolapo ECOM LLC. Contact : contact@dukaio.com."
              },
              {
                title: "3. Hébergement",
                content: "Le site est hébergé sur des serveurs cloud sécurisés. Les données sont stockées et protégées conformément aux standards de sécurité en vigueur."
              },
              {
                title: "4. Activité",
                content: "Dukaio est une plateforme de commerce électronique spécialisée dans la vente de produits digitaux (fichiers numériques, formations en ligne, licences logicielles). La plateforme permet aux créateurs vérifiés (KYC) de vendre leurs produits et aux acheteurs de les acquérir via des moyens de paiement sécurisés (Mobile Money, Carte) traités par Moneroo."
              },
              {
                title: "4 bis. Vérification des vendeurs (KYC)",
                content: "Tout vendeur doit valider son identité via Didit.me (vérification biométrique de document officiel) avant de pouvoir retirer ses fonds. Une même personne ne peut activer qu'un seul compte Dukaio : tout doublon de document est automatiquement rejeté. Les boutiques et produits sont modérés par IA et par notre équipe humaine."
              },
              {
                title: "4 ter. Sécurité et protection des fonds",
                content: "Les transactions sont chiffrées et traitées par Moneroo (certifié PCI-DSS). Dukaio ne stocke aucune donnée bancaire. Les fonds issus des ventes sont placés en délai de maturation pendant 5 jours afin de prévenir toute fraude au remboursement. La plateforme applique le chiffrement TLS et l'isolation Row-Level Security pour protéger l'intégralité des données utilisateurs."
              },
              {
                title: "5. Propriété intellectuelle",
                content: "L'ensemble du contenu du site Dukaio (textes, images, graphismes, logo, icônes, logiciels) est la propriété exclusive de Dolapo ECOM LLC ou de ses partenaires et est protégé par les lois relatives à la propriété intellectuelle. Toute reproduction, représentation, modification ou exploitation non autorisée est interdite."
              },
              {
                title: "6. Données personnelles",
                content: "Les données personnelles collectées sur ce site sont traitées conformément à notre Politique de confidentialité, accessible à l'adresse /privacy. Pour toute question relative à vos données personnelles, contactez-nous à contact@dukaio.com."
              },
              {
                title: "7. Cookies",
                content: "Le site utilise des cookies pour améliorer l'expérience utilisateur, analyser le trafic et personnaliser le contenu. Pour en savoir plus, consultez notre Politique de confidentialité."
              },
              {
                title: "8. Limitation de responsabilité",
                content: "Dolapo ECOM LLC s'efforce d'assurer l'exactitude des informations publiées sur le site, mais ne peut garantir leur exhaustivité ni leur mise à jour permanente. L'utilisation du site et des services proposés se fait sous la responsabilité de l'utilisateur. Dolapo ECOM LLC ne saurait être tenue responsable des dommages directs ou indirects résultant de l'utilisation du site."
              },
              {
                title: "9. Droit applicable",
                content: "Les présentes mentions légales sont soumises au droit applicable dans l'État du Nouveau-Mexique, États-Unis. En cas de litige, les tribunaux compétents du Nouveau-Mexique seront seuls compétents."
              },
              {
                title: "10. Contact",
                content: "Pour toute question ou réclamation, vous pouvez nous contacter par email à contact@dukaio.com ou par courrier à Dolapo ECOM LLC, 1209 Mountain Rd PL NE, Ste R, Albuquerque, NM 87110, USA."
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

export default LegalNotice;
