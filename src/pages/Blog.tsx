import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  const [featured, ...rest] = blogPosts;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Blog Dukaio · Conseils pour vendre vos produits digitaux"
        description="Guides, stratégies marketing, sécurité KYC, Mobile Money et formations en ligne — toutes les ressources pour réussir vos ventes digitales."
        canonicalPath="/blog"
        keywords="blog produits digitaux, vendre en ligne afrique, mobile money, KYC, marketing digital"
      />
      <Navbar />

      {/* Hero */}
      <section className="py-20 md:py-28 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-5">
              Le journal des créateurs digitaux
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-5">
              Le <span className="text-gradient">Blog</span> Dukaio
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stratégies de vente, sécurité, paiements Mobile Money et histoires inspirantes —
              tout ce qu'il faut pour faire décoller votre activité digitale.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      <section className="pt-12 pb-8 bg-background">
        <div className="container mx-auto px-6">
          <Link to={`/blog/${featured.slug}`}>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative grid md:grid-cols-2 gap-8 rounded-3xl border border-border bg-card p-4 md:p-6 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all overflow-hidden"
            >
              <div className="relative aspect-[16/10] md:aspect-auto md:h-full overflow-hidden rounded-2xl">
                <img
                  src={featured.cover}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  width={1280}
                  height={720}
                />
                <span className="absolute top-4 left-4 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  À la une · {featured.category}
                </span>
              </div>
              <div className="flex flex-col justify-center p-2 md:p-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {featured.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readTime}</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                  {featured.title}
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed mb-6">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {featured.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{featured.author.name}</p>
                      <p className="text-xs text-muted-foreground">{featured.author.role}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Lire l'article <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.article>
          </Link>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold text-foreground mb-8">Tous les articles</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all h-full"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={post.cover}
                      alt={post.title}
                      loading="lazy"
                      width={1280}
                      height={720}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {post.category}
                      </span>
                      <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
