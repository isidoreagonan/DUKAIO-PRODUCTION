import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";

const faqs = [
  { q: "Comment créer un compte sur Dukaio ?", a: "Cliquez sur 'Créer un compte', remplissez vos informations ou connectez-vous avec Google. Votre boutique sera prête en moins de 5 minutes." },
  { q: "Quels types de produits puis-je vendre ?", a: "Vous pouvez vendre des fichiers digitaux (e-books, templates, presets), des cours en ligne et des licences logicielles." },
  { q: "Quels moyens de paiement sont acceptés ?", a: "Nous acceptons Mobile Money (MTN, Moov, Orange, Wave, Free) et les cartes bancaires Visa/Mastercard dans plus de 10 pays d'Afrique." },
  { q: "Quand est-ce que je reçois mes revenus ?", a: "Les reversements sont effectués sous 2 à 5 jours directement sur votre compte Mobile Money ou bancaire." },
  { q: "Y a-t-il des frais de commission ?", a: "Le plan Gratuit inclut une commission de 5% par vente. Le plan Pro supprime toute commission." },
  { q: "Puis-je utiliser mon propre domaine ?", a: "Oui ! Avec le plan Pro, vous pouvez connecter votre propre nom de domaine à votre boutique." },
  { q: "Comment protéger mes fichiers contre le piratage ?", a: "Nous utilisons des systèmes DRM, des liens de téléchargement temporaires et la limitation du nombre de téléchargements." },
  { q: "Est-ce que je peux vendre depuis n'importe quel pays ?", a: "Oui, Dukaio est disponible dans plus de 40 pays avec support multi-devises et multi-langues." },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="FAQ" description="Questions fréquentes sur Dukaio : création de compte, types de produits, paiements Mobile Money, commissions et plus." canonicalPath="/faq" keywords="FAQ Dukaio, questions fréquentes, vente produits digitaux, mobile money" />
      <Navbar />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Questions <span className="text-gradient">fréquentes</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <AccordionItem value={`item-${i}`} className="rounded-xl border border-border bg-card px-6">
                  <AccordionTrigger className="text-sm font-semibold text-card-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FAQ;
