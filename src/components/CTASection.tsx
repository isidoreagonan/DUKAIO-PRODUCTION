import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-20 text-center md:px-16"
        >
          {/* Gradient orb */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-primary/30 blur-[100px]" />
          
          <div className="relative">
            <h2 className="text-3xl font-extrabold text-background md:text-5xl mb-5">
              Prêt à lancer votre business digital ?
            </h2>
            <p className="text-background/60 text-lg max-w-xl mx-auto mb-10">
              Rejoignez des milliers de créateurs qui vendent déjà leurs produits digitaux avec Dukaio.
            </p>
            <Link to="/register">
              <Button 
                size="lg" 
                className="px-10 py-6 text-base font-semibold"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
