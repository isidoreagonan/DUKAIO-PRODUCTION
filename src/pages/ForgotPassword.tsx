import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import SEOHead from "@/components/SEOHead";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast.error("Erreur lors de l'envoi. Vérifiez votre adresse e-mail.");
      return;
    }

    setSent(true);
    toast.success("E-mail de réinitialisation envoyé !");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <SEOHead title="Mot de passe oublié" description="Réinitialisez votre mot de passe Dukaio." canonicalPath="/forgot-password" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="flex items-center gap-2.5 mb-12">
          <img src={logo} alt="Dukaio" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-lg font-bold text-foreground">Dukaio</span>
        </Link>

        {!sent ? (
          <>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">Mot de passe oublié</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <Button className="w-full py-5 text-sm font-semibold" disabled={loading}>
                {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Vérifiez votre boîte mail</h1>
            <p className="text-sm text-muted-foreground">
              Un e-mail contenant un lien de réinitialisation a été envoyé à <strong className="text-foreground">{email}</strong>.
            </p>
            <p className="text-xs text-muted-foreground">
              Si vous ne le voyez pas, vérifiez vos spams.
            </p>
          </div>
        )}

        <p className="mt-8 text-center">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à la connexion
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
