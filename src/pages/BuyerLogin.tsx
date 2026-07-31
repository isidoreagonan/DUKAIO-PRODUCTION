import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { setBuyerOtpVerified, setBuyerSession } from "@/lib/buyerSession";

const BuyerLogin = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-buyer-otp", {
        body: { email: email.trim().toLowerCase() },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }
      setCustomerName(data?.customerName || "");
      toast.success("Un code à 6 chiffres a été envoyé à votre email");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi du code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-buyer-otp", {
        body: { email: email.trim().toLowerCase(), code: otp.trim() },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }
      // Establish a real Supabase auth session for buyer-only features
      if (data.session?.access_token && data.session?.refresh_token) {
        const { error: sessErr } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (sessErr) {
          console.error("setSession error:", sessErr);
        }
      }
      // Store buyer session (localStorage 3 days inactivity)
      setBuyerSession({
        email: email.trim().toLowerCase(),
        customerName: data.customer?.name || customerName,
        customerId: data.customer?.id,
        authenticatedAt: Date.now(),
      });
      setBuyerOtpVerified();
      toast.success("Connexion réussie !");
      navigate("/mes-achats");
    } catch (err: any) {
      toast.error(err.message || "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="flex items-center gap-2.5 mb-12">
            <img src={logo} alt="Dukaio" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-lg font-bold text-foreground">Dukaio</span>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Mes Achats</h1>
              <p className="text-sm text-muted-foreground">Accédez à tous vos produits achetés</p>
            </div>
          </div>

          {step === "email" && (
            <>
              <div className="space-y-2 mb-5">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-5 text-sm font-medium"
                  onClick={async () => {
                    setLoading(true);
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: {
                        redirectTo: `${window.location.origin}/buyer-oauth-callback`,
                      }
                    });
                    if (error) {
                      toast.error("Erreur de connexion Google");
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuer avec Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-5 text-sm font-medium"
                  onClick={async () => {
                    setLoading(true);
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "apple",
                      options: {
                        redirectTo: `${window.location.origin}/buyer-oauth-callback`,
                      }
                    });
                    if (error) {
                      toast.error("Erreur de connexion Apple");
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 12.04c-.03-2.78 2.27-4.13 2.38-4.2-1.3-1.9-3.32-2.16-4.04-2.19-1.71-.17-3.36 1.01-4.23 1.01-.89 0-2.22-.99-3.65-.96-1.87.03-3.61 1.09-4.58 2.77-1.96 3.39-.5 8.41 1.41 11.16.93 1.34 2.04 2.85 3.5 2.8 1.41-.06 1.94-.91 3.64-.91 1.69 0 2.18.91 3.66.88 1.51-.03 2.46-1.37 3.39-2.72 1.07-1.56 1.51-3.07 1.53-3.15-.03-.01-2.94-1.13-2.97-4.49zM14.32 3.91c.78-.95 1.31-2.27 1.16-3.59-1.13.05-2.49.75-3.3 1.7-.72.84-1.36 2.18-1.19 3.47 1.26.1 2.55-.64 3.33-1.58z"/>
                  </svg>
                  Continuer avec Apple
                </Button>
              </div>

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-3 text-muted-foreground">ou par email</span>
                </div>
              </div>
            </>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Entrez l'adresse email utilisée lors de vos achats pour recevoir un code de connexion.
              </p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button className="w-full py-5 text-sm font-semibold" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Envoi...</> : "Recevoir le code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Un code à 6 chiffres a été envoyé à <strong className="text-foreground">{email}</strong>
              </p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Code de vérification</label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                  required
                />
              </div>
              <Button className="w-full py-5 text-sm font-semibold" disabled={loading || otp.length !== 6}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Vérification...</> : "Se connecter"}
              </Button>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(""); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" /> Changer d'email
                </button>
                <button
                  type="button"
                  onClick={() => { setOtp(""); handleSendOtp(new Event("submit") as any); }}
                  className="text-sm text-primary hover:underline"
                >
                  Renvoyer le code
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Vous êtes vendeur ?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Connexion vendeur
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-foreground relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-primary/15 blur-[80px]" />
        <div className="relative text-center px-12">
          <h2 className="text-3xl font-extrabold text-background mb-4">
            Retrouvez tous vos achats
          </h2>
          <p className="text-background/50 text-lg max-w-md">
            Accédez à vos fichiers, formations et licences achetés sur n'importe quelle boutique Dukaio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyerLogin;
