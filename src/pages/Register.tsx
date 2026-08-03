import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ChevronDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import SEOHead from "@/components/SEOHead";
import { countries, Country } from "@/data/countries";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const slideContent = [
    {
      title: "Une Seule Plateforme pour\nGérer Votre Business",
      desc: "Vos revenus n'attendent plus que vous. Gérez vos ventes, suivez vos statistiques et automatisez la livraison de vos produits digitaux."
    },
    {
      title: "Encaissez l'Afrique\nEn Toute Simplicité",
      desc: "Acceptez les paiements Mobile Money (Wave, Orange, MTN) et cartes bancaires instantanément, où que soient vos clients."
    },
    {
      title: "Livraison de Fichiers\n100% Automatisée",
      desc: "Concentrez-vous sur la création. Dukaio gère la livraison de vos ebooks, formations et fichiers dès le paiement validé."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideContent.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    const q = countrySearch.toLowerCase();
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.dial.includes(q)
    );
  }, [countrySearch]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || authLoading) return;

    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Veuillez renseigner votre nom et prénom");
      return;
    }

    setLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: `${selectedCountry.dial}${phone}`,
          country_code: selectedCountry.code,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session?.user) {
      toast.success("Compte créé avec succès !");
      navigate("/onboarding", { replace: true });
      return;
    }

    toast.success("Vérifiez votre email pour confirmer votre inscription !");
    navigate("/login", { replace: true });
  };

  const handleGoogleRegister = async () => {
    if (loading || authLoading) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/register`,
      }
    });

    if (error) {
      toast.error("Erreur lors de l'inscription avec Google");
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const isBusy = loading || authLoading;

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      <SEOHead title="Inscription" description="Créez votre compte Dukaio pour vendre vos produits digitaux." canonicalPath="/register" />
      
      {/* Left - Visual Pane */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative p-12 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex flex-col items-center text-center max-w-md z-10">
          <div className="w-24 h-24 bg-[#111111] rounded-3xl mb-10 flex items-center justify-center border border-white/5 shadow-2xl">
            <img src={logo} alt="Dukaio Logo" className="w-14 h-14 object-contain" />
          </div>
          <motion.div 
            key={activeSlide}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-[2.5rem] font-bold text-white mb-6 leading-[1.1] tracking-tight whitespace-pre-line min-h-[90px] flex items-center justify-center">
              {slideContent[activeSlide].title}
            </h2>
            <p className="text-[#888888] text-base leading-relaxed max-w-[90%] min-h-[70px]">
              {slideContent[activeSlide].desc}
            </p>
          </motion.div>
          
          <div className="flex gap-2.5 mt-10">
            {slideContent.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all duration-500 ease-out ${activeSlide === i ? 'w-6 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                aria-label={`Aller à la slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form Pane */}
      <div className="flex-1 flex flex-col bg-white rounded-l-none lg:rounded-l-[2.5rem] relative z-20 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 lg:p-10 shrink-0">
          <Link to="/">
            <img src={logo} alt="Dukaio" className="h-8 w-8 object-contain lg:hidden" />
          </Link>
          <div className="text-sm font-medium text-[#666666] ml-auto">
            Déjà un compte ? <Link to="/login" className="text-black hover:underline font-bold transition-colors">Se connecter</Link>
          </div>
        </div>

        {/* Form Centered */}
        <div className="flex-1 flex items-center justify-center p-6 py-10">
          <div className="w-full max-w-[380px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-[1.75rem] font-bold text-black mb-2 tracking-tight">Créer un compte</h1>
                <p className="text-[#666666] text-sm">Veuillez entrer vos informations pour vous inscrire</p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-sm font-semibold mb-6 rounded-xl border-[#E5E5E5] text-black hover:bg-slate-50 transition-colors shadow-sm"
                onClick={handleGoogleRegister}
                disabled={isBusy}
              >
                <svg className="mr-2.5 h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E5E5]" />
                </div>
                <div className="relative flex justify-center text-[11px] font-medium uppercase tracking-wider">
                  <span className="bg-white px-3 text-[#999999]">Ou s'inscrire avec email</span>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-black mb-2 block">Nom</label>
                    <Input
                      type="text"
                      placeholder="Dupont"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border-[#E5E5E5] bg-white focus:ring-2 focus:ring-blue/20 focus:border-blue text-black placeholder:text-[#999999] shadow-sm transition-all"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-black mb-2 block">Prénom</label>
                    <Input
                      type="text"
                      placeholder="Jean"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border-[#E5E5E5] bg-white focus:ring-2 focus:ring-blue/20 focus:border-blue text-black placeholder:text-[#999999] shadow-sm transition-all"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-black mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-[#E5E5E5] bg-white focus:ring-2 focus:ring-blue/20 focus:border-blue text-black placeholder:text-[#999999] shadow-sm transition-all"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-black mb-2 block">Numéro de téléphone</label>
                  <div className="flex gap-2">
                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[110px] shrink-0 justify-between px-3 h-12 rounded-xl border-[#E5E5E5] bg-white font-normal"
                          type="button"
                        >
                          <span className="text-xs font-medium text-black">{selectedCountry.code}</span>
                          <span className="text-xs text-[#666666]">{selectedCountry.dial}</span>
                          <ChevronDown className="h-3 w-3 ml-1 text-[#999999]" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[260px] p-2" align="start">
                        <div className="flex items-center gap-2 px-2 pb-2 border-b border-border mb-1">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <input
                            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                            placeholder="Rechercher un pays..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-sm text-left"
                              onClick={() => {
                                setSelectedCountry(c);
                                setCountryOpen(false);
                                setCountrySearch("");
                              }}
                            >
                              <img src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`} alt={c.code} className="h-4 w-6 object-cover rounded-sm shrink-0" />
                              <span className="text-xs font-medium text-foreground">{c.code}</span>
                              <span className="flex-1 truncate">{c.name}</span>
                              <span className="text-xs text-muted-foreground">{c.dial}</span>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="tel"
                      placeholder="97 00 00 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                      className="flex-1 h-12 px-4 rounded-xl border-[#E5E5E5] bg-white focus:ring-2 focus:ring-blue/20 focus:border-blue text-black placeholder:text-[#999999] shadow-sm transition-all"
                      autoComplete="tel"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-black mb-2 block">Mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border-[#E5E5E5] bg-white focus:ring-2 focus:ring-blue/20 focus:border-blue text-black placeholder:text-[#999999] shadow-sm transition-all pr-12"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999999] hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 text-sm font-bold rounded-xl bg-blue hover:bg-blueDeep text-white mt-4 transition-all shadow-md hover:shadow-lg" 
                  disabled={isBusy}
                >
                  {isBusy ? "Création..." : "Créer mon compte →"}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 lg:p-10 text-[13px] font-medium text-[#888888] shrink-0">
          <span>© 2024 Dukaio</span>
          <div className="space-x-5">
            <Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-black transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
