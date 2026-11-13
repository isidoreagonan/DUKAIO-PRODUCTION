import { useEffect, useState, type FormEvent } from "react";
import { DASHBOARD_PATH } from "@/dukaio-site/config";
import { Link, useNavigate } from "@/dukaio-site/router";
import { toast } from "sonner";
import { supabase } from "@/dukaio-site/supabase";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "@/dukaio-site/ui/button";
import { Input } from "@/dukaio-site/ui/input";
import { Logo } from "@/dukaio-site/site/Logo";
import { CountryPicker } from "./CountryPicker";
import { detectUserCountry } from "@/lib/geo";
import { getDashboardUrl, isDashboardSubdomain } from "@/lib/subdomain";
import creator from "@/dukaio-site/assets/creator-studio.jpg";

function GoogleLogo() {
  return <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="!h-[18px] !w-[18px]"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>;
}

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const [visible, setVisible] = useState(false);
  const [country, setCountry] = useState("");
  const [countryError, setCountryError] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const goToDashboard = () => {
      if (typeof window !== "undefined" && !isDashboardSubdomain()) {
        window.location.replace(getDashboardUrl("/dashboard"));
      } else {
        navigate({ to: DASHBOARD_PATH, replace: true });
      }
    };

    supabase.auth.getSession().then(({ data }) => { if (data.session) goToDashboard(); });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") goToDashboard();
    });
    // Auto-detect visitor's country on signup
    detectUserCountry().then((geo) => {
      if (geo.countryCode) {
        setCountry(geo.countryCode.toUpperCase());
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function google() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/connexion` } });
    if (error) { toast.error("La connexion avec Google a échoué."); setBusy(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const f = new FormData(event.currentTarget);
    const email = String(f.get("email") ?? "").trim().toLowerCase();
    setBusy(true);
    try {
      if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe` });
        if (error) throw error;
        toast.success("Si ce compte existe, un lien vient de vous être envoyé.");
        setForgot(false);
        return;
      }
      const password = String(f.get("password") ?? "");
      if (!signup) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { toast.error("Email ou mot de passe incorrect."); return; }
        return;
      }
      if (!country) { setCountryError(true); return; }
      const first = String(f.get("givenName") ?? "").trim(), last = String(f.get("familyName") ?? "").trim();
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/connexion`, data: { full_name: `${first} ${last}`, first_name: first, last_name: last, country_code: country } },
      });
      if (error) throw error;
      if (!data.session) { toast.success("Compte créé. Confirmez votre email pour vous connecter."); navigate({ to: "/connexion" }); }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally { setBusy(false); }
  }
  return (
    <div className="auth-page grid min-h-dvh lg:grid-cols-[1.08fr_1fr]">
      <div className="auth-column flex min-w-0 flex-col px-5 sm:px-10 lg:px-14 xl:px-20">
        <div className="auth-header flex h-24 shrink-0 items-center justify-between gap-4">
          <Link to="/" aria-label="Dukaio, accueil"><Logo /></Link>
          <Button asChild variant="ghost" className="gap-2 px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"><Link to="/"><ArrowLeft />Accueil</Link></Button>
        </div>
        <div className="auth-content flex flex-1 items-center justify-center py-6 sm:py-10">
          <div className="auth-form fade-up w-full max-w-[410px]">
            <p className="mb-3 text-xs font-semibold uppercase text-highlight">{signup ? "Votre aventure commence ici" : "Votre espace créateur"}</p>
            <h1 className="text-[30px] font-semibold leading-tight sm:text-4xl">{forgot ? "Mot de passe oublié ?" : signup ? "Créez votre compte." : "Heureux de vous revoir."}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{forgot ? "Retrouvez l’accès à votre espace Dukaio." : signup ? "Faites de votre savoir votre prochaine réussite." : "Connectez-vous à votre compte Dukaio."}</p>

            {!forgot && <><Button type="button" variant="outline" onClick={google} disabled={busy} className="auth-google mt-7 h-12 w-full gap-2.5 px-3 font-medium shadow-none"><GoogleLogo />{signup ? "S’inscrire avec Google" : "Se connecter avec Google"}</Button><div className="my-6 flex items-center gap-4"><span className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">ou avec votre email</span><span className="h-px flex-1 bg-border" /></div></>}

            <form onSubmit={submit} className={`space-y-4 ${forgot ? "mt-7" : ""}`}>
              {signup && <div className="grid grid-cols-2 gap-3"><div><label htmlFor="last-name" className="auth-label">Nom</label><Input id="last-name" name="familyName" autoComplete="family-name" placeholder="Votre nom" required maxLength={100} className="auth-input" /></div><div><label htmlFor="first-name" className="auth-label">Prénom</label><Input id="first-name" name="givenName" autoComplete="given-name" placeholder="Votre prénom" required maxLength={100} className="auth-input" /></div></div>}
              <div><label htmlFor="email" className="auth-label">Adresse email</label><Input id="email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" required maxLength={254} className="auth-input" /></div>
              {!forgot && <div><div className="mb-2 flex items-center justify-between gap-2"><label htmlFor="password" className="text-sm font-medium">Mot de passe</label>{!signup && <Button type="button" variant="link" onClick={() => setForgot(true)} className="h-auto p-0 text-xs font-medium">Mot de passe oublié ?</Button>}</div><div className="relative"><Input id="password" name="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} placeholder={signup ? "Créez un mot de passe" : "Votre mot de passe"} required minLength={signup ? 8 : 1} maxLength={128} className="auth-input pr-12" /><Button type="button" variant="ghost" size="icon" aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} title={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setVisible(!visible)} className="absolute right-1.5 top-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">{visible ? <EyeOff /> : <Eye />}</Button></div>{signup && <p className="mt-2 text-xs text-muted-foreground">Au moins 8 caractères.</p>}</div>}
              {signup && <div><label htmlFor="country" className="auth-label">Pays de résidence</label><CountryPicker value={country} onChange={(code) => { setCountry(code); setCountryError(false); }} />{countryError && <p role="alert" className="mt-2 text-xs text-destructive">Veuillez sélectionner votre pays.</p>}</div>}
              {signup && <p className="pt-1 text-xs leading-relaxed text-muted-foreground">En créant votre compte, vous acceptez nos <Link to="/legal/$slug" params={{ slug: "conditions-utilisation" }} className="text-foreground underline underline-offset-2">conditions d’utilisation</Link> et notre <Link to="/legal/$slug" params={{ slug: "confidentialite" }} className="text-foreground underline underline-offset-2">politique de confidentialité</Link>.</p>}
              <Button type="submit" disabled={busy} className="btn-primary h-12 w-full font-semibold">{busy ? "Patientez…" : forgot ? "Envoyer le lien" : signup ? "Créer mon compte" : "Se connecter"}<ArrowRight /></Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">{forgot ? <Button variant="link" className="h-auto p-0" onClick={() => setForgot(false)}>Retour à la connexion</Button> : <>{signup ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"} <Link to={signup ? "/connexion" : "/inscription"} className="font-semibold text-primary hover:underline">{signup ? "Se connecter" : "S’inscrire"}</Link></>}</p>
          </div>
        </div>
        <div className="auth-footer flex min-h-16 flex-wrap items-center justify-between gap-3 border-t border-border py-4 text-[11px] text-muted-foreground"><span>© {new Date().getFullYear()} Dukaio · Dolapo ECOM LLC</span><Link to="/legal/$slug" params={{ slug: "confidentialite" }} className="hover:text-foreground">Confidentialité</Link></div>
      </div>
      <aside className="relative hidden min-w-0 overflow-hidden bg-tint lg:flex lg:flex-col lg:justify-end">
        <img src={creator} alt="Un créateur au travail dans son studio" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="auth-image-shade absolute inset-0" />
        <div className="relative p-12 text-primary-foreground xl:p-16"><span className="mb-6 inline-flex items-center gap-2 border-b border-primary-foreground/30 pb-3 text-xs font-semibold"><LockKeyhole className="h-4 w-4" />Dukaio, à vos côtés.</span><h2 className="max-w-md text-4xl font-semibold leading-[1.15] xl:text-5xl">Votre talent.<br />Votre boutique.<br />Vos ambitions.</h2><p className="mt-5 max-w-sm text-sm leading-7 text-primary-foreground/85">Fichiers, cours, services ou licences.<br />Donnez une nouvelle dimension à ce que vous créez.</p><div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-primary-foreground/25 pt-6 text-xs font-medium"><span>Sans abonnement</span><span>5 % par vente, c’est tout.</span></div></div>
      </aside>
    </div>
  );
}