import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message envoyé ! Nous vous répondrons sous 24h.");
    setName(""); setEmail(""); setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Contact" description="Contactez l'équipe Dukaio. Support disponible 24/7 pour répondre à toutes vos questions sur la vente de produits digitaux." canonicalPath="/contact" />
      <Navbar />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              <span className="text-gradient">Contactez</span>-nous
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une question ? Notre équipe est là pour vous aider.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid gap-16 md:grid-cols-2 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input type="email" placeholder="Votre email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Textarea placeholder="Votre message..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
                <Button type="submit" className="w-full">Envoyer</Button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Autres moyens</h2>
              {[
                { icon: Mail, title: "Email", desc: "contact@dukaio.com", href: "mailto:contact@dukaio.com" },
                { icon: MessageCircle, title: "Chat en direct", desc: "Disponible du lundi au vendredi, 9h-18h" },
                { icon: MapPin, title: "Adresse", desc: "Cotonou, Bénin" },
              ].map((c) => (
                <div key={c.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                    <p className="text-sm text-muted-foreground">{c.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
