import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/dukaio-site/ui/button";
import { Input } from "@/dukaio-site/ui/input";
import { Logo } from "@/dukaio-site/site/Logo";
import creator from "@/dukaio-site/assets/creator-studio.jpg";
import { setBuyerOtpVerified, setBuyerSession } from "@/lib/buyerSession";
import "@/dukaio-site/dukaio-site.css";

function GoogleLogo() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="!h-[18px] !w-[18px]">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

export default function BuyerLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Veuillez saisir votre adresse email.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-buyer-otp", {
        body: { email: cleanEmail },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }
      setCustomerName(data?.customerName || "");
      toast.success("Un code à 6 chiffres a été envoyé à votre adresse email.");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim().replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      toast.error("Veuillez saisir le code à 6 chiffres complet.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-buyer-otp", {
        body: { email: email.trim().toLowerCase(), code: cleanOtp },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }

      // Establish real Supabase session if tokens are returned
      if (data.session?.access_token && data.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      // Save buyer session
      setBuyerSession({
        email: email.trim().toLowerCase(),
        customerName: data.customer?.name || customerName,
        customerId: data.customer?.id,
        authenticatedAt: Date.now(),
      });
      setBuyerOtpVerified();

      toast.success("Connexion réussie ! Heureux de vous revoir.");
      navigate("/mes-achats");
    } catch (err: any) {
      toast.error(err.message || "Code de vérification invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/buyer-oauth-callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error("La connexion avec Google a échoué.");
      setLoading(false);
    }
  };

  return (
    <div className="dk-site bg-background text-foreground min-h-dvh">
      <div className="auth-page grid min-h-dvh lg:grid-cols-[1.08fr_1fr]">
        {/* Left Column: Form */}
        <div className="auth-column flex min-w-0 flex-col px-5 sm:px-10 lg:px-14 xl:px-20 bg-background">
          {/* Top Bar: Logo & Accueil */}
          <div className="auth-header flex h-24 shrink-0 items-center justify-between gap-4">
            <Link to="/" aria-label="Dukaio, accueil">
              <Logo />
            </Link>
            <Button
              asChild
              variant="ghost"
              className="gap-2 px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Accueil
              </Link>
            </Button>
          </div>

          {/* Center Content */}
          <div className="auth-content flex flex-1 items-center justify-center py-6 sm:py-10">
            <div className="auth-form fade-up w-full max-w-[410px]">
              <p className="mb-3 text-xs font-semibold uppercase text-highlight tracking-wide">
                Votre espace acheteur
              </p>
              <h1 className="text-[30px] font-semibold leading-tight sm:text-4xl text-foreground">
                {step === "otp" ? "Entrez votre code." : "Heureux de vous revoir."}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step === "otp" ? (
                  <>
                    Un code de vérification à 6 chiffres a été envoyé à{" "}
                    <strong className="text-foreground">{email}</strong>.
                  </>
                ) : (
                  "Connectez-vous pour retrouver vos fichiers, cours et licences."
                )}
              </p>

              {step === "email" ? (
                <>
                  {/* Google OAuth Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="auth-google mt-7 h-12 w-full gap-2.5 px-3 font-medium shadow-none hover:bg-muted"
                  >
                    <GoogleLogo />
                    Se connecter avec Google
                  </Button>

                  {/* Divider */}
                  <div className="my-6 flex items-center gap-4">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">ou avec votre email</span>
                    <span className="h-px flex-1 bg-border" />
                  </div>

                  {/* Email Input Form */}
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="auth-label block text-xs font-semibold text-foreground mb-1.5">
                        Adresse email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="vous@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        maxLength={254}
                        className="auth-input h-11"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="btn-primary h-12 w-full font-semibold gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…
                        </>
                      ) : (
                        <>
                          Recevoir mon code de connexion <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                /* Step === "otp" */
                <form onSubmit={handleVerifyOtp} className="space-y-4 mt-7">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label htmlFor="otp" className="auth-label text-xs font-semibold text-foreground">
                        Code de vérification (6 chiffres)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setStep("email");
                          setOtp("");
                        }}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Changer d'email
                      </button>
                    </div>

                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      className="auth-input h-13 text-center text-2xl tracking-[0.4em] font-mono font-bold"
                      autoFocus
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otp.replace(/\D/g, "").length !== 6}
                    className="btn-primary h-12 w-full font-semibold gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Connexion en cours…
                      </>
                    ) : (
                      <>
                        Se connecter <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStep("email");
                        setOtp("");
                      }}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Retour
                    </Button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSendOtp()}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Renvoyer le code
                    </button>
                  </div>
                </form>
              )}

              {/* Switcher: Vendeur */}
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Vous êtes vendeur ?{" "}
                <Link to="/connexion" className="font-semibold text-primary hover:underline">
                  Connexion vendeur
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="auth-footer flex min-h-16 flex-wrap items-center justify-between gap-3 border-t border-border py-4 text-[11px] text-muted-foreground">
            <span>© {new Date().getFullYear()} Dukaio · Dolapo ECOM LLC</span>
            <Link to="/legal/confidentialite" className="hover:text-foreground">
              Confidentialité
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Visual */}
        <aside className="relative hidden min-w-0 overflow-hidden bg-tint lg:flex lg:flex-col lg:justify-end">
          <img
            src={creator}
            alt="Espace acheteur Dukaio"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="auth-image-shade absolute inset-0" />
          <div className="relative p-12 text-primary-foreground xl:p-16">
            <span className="mb-6 inline-flex items-center gap-2 border-b border-primary-foreground/30 pb-3 text-xs font-semibold">
              <LockKeyhole className="h-4 w-4" />
              Dukaio, à vos côtés.
            </span>
            <h2 className="max-w-md text-4xl font-semibold leading-[1.15] xl:text-5xl">
              Tous vos achats.<br />
              Réunis au même endroit.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-primary-foreground/85">
              Fichiers, cours, services ou licences.<br />
              Accédez à tous vos produits numériques achetés sur n'importe quelle boutique Dukaio.
            </p>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-primary-foreground/25 pt-6 text-xs font-medium">
              <span>Accès instantané</span>
              <span>Téléchargements illimités</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
