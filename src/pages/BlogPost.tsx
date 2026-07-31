import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, ArrowRight, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { blogPosts, getPostBySlug } from "@/data/blogPosts";
import { toast } from "sonner";

const BlogPost = () => {
  const { slug } = useParams();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url });
      } catch {/* noop */}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${post.title} · Blog Dukaio`}
        description={post.excerpt}
        canonicalPath={`/blog/${post.slug}`}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-12 pb-10 md:pt-16 bg-mesh">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Retour au blog
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-5">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{post.author.name}</p>
                  <p className="text-xs text-muted-foreground">{post.author.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {post.date}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 h-8">
                  <Share2 className="h-3.5 w-3.5" /> Partager
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover */}
      <section className="bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.img
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={post.cover}
            alt={post.title}
            width={1280}
            height={720}
            className="w-full rounded-3xl shadow-2xl border border-border"
          />
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 max-w-3xl">
          <article
            className="
              prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-extrabold prose-headings:text-foreground
              prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-strong:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-li:text-muted-foreground
              prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none
              [&_.lead]:text-lg [&_.lead]:text-foreground [&_.lead]:leading-relaxed [&_.lead]:mb-8
            "
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA */}
          <div className="mt-16 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 md:p-10 text-center">
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
              Prêt à lancer votre boutique ?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Créez gratuitement votre boutique Dukaio en 5 minutes et commencez à vendre vos produits digitaux.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-8 gap-2 shadow-lg shadow-primary/25">
                Créer ma boutique gratuite <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="py-16 border-t border-border bg-secondary/20">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-2xl font-bold text-foreground mb-8">À lire ensuite</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={p.cover}
                    alt={p.title}
                    loading="lazy"
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{p.category}</span>
                  <h3 className="mt-2 text-base font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPost;
