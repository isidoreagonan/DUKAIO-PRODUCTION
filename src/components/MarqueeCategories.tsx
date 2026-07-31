import { motion } from "framer-motion";

const categories = [
  "E-books", "Templates", "Formations", "Tutoriels", "Illustrations",
  "Photos", "Plugins", "Scripts", "Automations", "Guides PDF",
  "Logiciels", "Musique", "Vidéos", "Graphismes", "Presets",
];

const MarqueeCategories = () => {
  return (
    <section className="py-12 bg-background overflow-hidden border-y border-border">
      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider">
          Vendez tout ce que vous pouvez imaginer
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Row 1 - left to right */}
        <div className="flex gap-4 mb-4">
          <motion.div
            className="flex gap-4 shrink-0"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...categories, ...categories].map((cat, i) => (
              <div
                key={i}
                className="shrink-0 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm hover:border-primary/30 hover:shadow-md transition-all cursor-default"
              >
                {cat}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Row 2 - right to left */}
        <div className="flex gap-4">
          <motion.div
            className="flex gap-4 shrink-0"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          >
            {[...categories.slice().reverse(), ...categories.slice().reverse()].map((cat, i) => (
              <div
                key={i}
                className="shrink-0 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm hover:border-primary/30 hover:shadow-md transition-all cursor-default"
              >
                {cat}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MarqueeCategories;
