import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Politique de remboursement" description="Politique de remboursement d'Dukaio pour les produits digitaux. Conditions et procédures de remboursement." canonicalPath="/refund-policy" noindex />
      <Navbar />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Politique de <span className="text-gradient">remboursement</span>
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
                title: "1. Principe général",
                content: "En raison de la nature dématérialisée des produits vendus sur Dukaio (fichiers numériques, formations en ligne, licences logicielles), tout achat effectué est en principe définitif et non remboursable une fois le produit téléchargé ou l'accès accordé."
              },
              {
                title: "2. Exceptions au non-remboursement",
                content: "Un remboursement peut être accordé dans les cas suivants : le produit livré ne correspond pas à la description publiée par le vendeur, le fichier est corrompu ou inaccessible et le vendeur ne peut pas fournir de remplacement, un problème technique empêche l'accès au produit acheté malgré les tentatives de résolution, ou un double paiement a été effectué par erreur."
              },
              {
                title: "3. Délai de demande",
                content: "Toute demande de remboursement doit être soumise dans un délai de 14 jours suivant la date d'achat. Passé ce délai, aucune demande ne sera prise en compte, sauf circonstances exceptionnelles."
              },
              {
                title: "4. Procédure de demande",
                content: "Pour demander un remboursement, envoyez un email à contact@dukaio.com en précisant : votre adresse email associée à l'achat, le numéro de commande ou la référence de la transaction, le produit concerné, et le motif détaillé de votre demande. Notre équipe examinera votre demande sous 5 jours ouvrables."
              },
              {
                title: "5. Traitement du remboursement",
                content: "Si le remboursement est approuvé, il sera effectué via le même moyen de paiement utilisé lors de l'achat (Mobile Money, carte bancaire, etc.). Le délai de traitement est de 7 à 14 jours ouvrables selon l'opérateur de paiement."
              },
              {
                title: "6. Responsabilité des vendeurs",
                content: "Les vendeurs (créateurs de contenu) sur Dukaio sont responsables de la qualité et de la conformité de leurs produits. En cas de litige, Dukaio peut intervenir en tant que médiateur entre l'acheteur et le vendeur pour trouver une solution équitable."
              },
              {
                title: "7. Produits non éligibles au remboursement",
                content: "Les produits suivants ne sont pas éligibles au remboursement : les produits déjà téléchargés intégralement et utilisés, les licences logicielles déjà activées et les formations dont plus de 30% du contenu a été consulté."
              },
              {
                title: "8. Annulation par le vendeur",
                content: "Si un vendeur retire un produit de la vente après votre achat et que vous n'avez pas encore reçu le produit, un remboursement intégral sera automatiquement effectué."
              },
              {
                title: "9. Contact",
                content: "Pour toute question relative à cette politique de remboursement, contactez-nous à contact@dukaio.com. Notre équipe support est disponible du lundi au vendredi, de 9h à 18h (GMT+1)."
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

export default RefundPolicy;
