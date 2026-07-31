import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const FounderQuote = () => {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Decorative gradient blobs */}
          <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-primary/20 blur-[80px]" />
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-primary/10 blur-[80px]" />

          <div className="relative flex flex-col md:flex-row items-center gap-10 md:gap-16 rounded-3xl border border-border bg-card p-8 md:p-12">
            {/* Photo with animated ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
              className="relative flex-shrink-0"
            >
              {/* Animated spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 rounded-full border-2 border-dashed border-primary/30"
              />
              {/* Glowing pulse */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-2 rounded-full bg-primary/20 blur-md"
              />
              <img
                src="/images/founder.png"
                alt="AGONAN ISIDORE, Fondateur & CEO d'Dukaio"
                className="relative z-10 h-28 w-28 md:h-36 md:w-36 rounded-full object-cover ring-4 ring-primary/40"
              />
              {/* Badge */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-lg"
              >
                Fondateur & CEO
              </motion.div>
            </motion.div>

            {/* Quote content */}
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-1 text-center md:text-left"
            >
              <Quote className="h-8 w-8 text-primary/40 mb-4 mx-auto md:mx-0" />
              <blockquote className="text-lg md:text-xl font-medium text-foreground leading-relaxed mb-6">
                Je crois profondément que chaque créateur africain mérite les outils pour transformer son talent en revenus. 
                Dukaio est né de cette conviction : <span className="text-primary font-bold">démocratiser la vente digitale en Afrique</span>, 
                sans barrière technique, sans complexité inutile.
              </blockquote>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div>
                  <p className="font-bold text-foreground">AGONAN ISIDORE</p>
                  <p className="text-sm text-muted-foreground">Fondateur & CEO, Dukaio</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FounderQuote;
