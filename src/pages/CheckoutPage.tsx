import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Loader2, ShieldCheck, Lock, ArrowLeft, CreditCard, Smartphone,
  Check, ChevronRight, Mail, ChevronDown, X, Tag, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  pawapayCountries, providerLogos,
  type PawaPayCountry, type PawaPayProvider,
} from "@/data/pawapayProviders";
import { countries as allCountries, type Country } from "@/data/countries";

interface Product {
  id: string;
  title: string;
  price: number;
  creator_id: string;
  download_url: string | null;
  type: string;
  thumbnail_url: string | null;
  collect_shipping_address: boolean | null;
}

type PayMethod = "mobile" | "card";
type Step = "select" | "mobile" | "card";

// Taux de conversion sécurisé (inférieur au taux réel ~588 XOF/USD pour absorber le spread Stripe)
const USD_RATE_SAFE = 555;
// Frais Stripe internationaux à la charge de l'acheteur : 4.4% + $0.30 + cushion FX
const STRIPE_FEE_PCT = 0.044;
const STRIPE_FEE_FIXED_USD = 0.30;
const ACCENT = "#7C2DCC";
const GOLD = "#E5B73B";

const CheckoutPage = () => {
  const { productId } = useParams();
  const [params] = useSearchParams();
  const storeSlug = params.get("store");

  const [product, setProduct] = useState<Product | null>(null);
  const [storeName, setStoreName] = useState("Dukaio");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wizard
  const [step, setStep] = useState<Step>("select");

  // Pay flow

  // Pay flow status
  const [submitting, setSubmitting] = useState(false);
  const [pendingDepositId, setPendingDepositId] = useState<string | null>(null);
  const [payStatus, setPayStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastEmail, setLastEmail] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!productId) { setError("Produit introuvable"); setLoading(false); return; }
      const { data: p } = await supabase
        .from("products")
        .select("id, title, price, creator_id, download_url, type, thumbnail_url, collect_shipping_address")
        .eq("id", productId).maybeSingle();
      if (!p) { setError("Ce produit n'existe pas ou n'est plus disponible."); setLoading(false); return; }
      setProduct(p as Product);
      if (storeSlug) {
        const { data: store } = await supabase.from("stores")
          .select("logo_url, name").eq("slug", storeSlug).maybeSingle();
        if (store) { setStoreName(store.name || "Dukaio"); setLogoUrl(store.logo_url || null); }
      }
      
      setLoading(false);
    };
    load();
  }, [productId, storeSlug]);

  const priceFcfa = product?.price || 0;
  // L'acheteur couvre les frais Stripe : (FCFA→USD au taux sécurisé + frais fixes) / (1 - frais %)
  const priceUsd = useMemo(() => {
    if (!priceFcfa) return 0;
    const base = priceFcfa / USD_RATE_SAFE;
    const gross = (base + STRIPE_FEE_FIXED_USD) / (1 - STRIPE_FEE_PCT);
    return +(Math.ceil(gross * 100) / 100).toFixed(2);
  }, [priceFcfa]);

  // ─── Mobile money submit
  const submitMobile = async (payload: {
    name: string; email: string; phone: string; provider: PawaPayProvider;
  }) => {
    if (!product) return;
    if (priceFcfa < 100) { toast.error("Minimum 100 FCFA"); return; }
    setSubmitting(true); setErrorMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("pawapay-deposit", {
        body: {
          amount: priceFcfa, currency: "XOF", provider: payload.provider.code,
          phone: payload.phone,
          customer: { name: payload.name, email: payload.email.trim().toLowerCase() },
          metadata: {
            product_id: product.id, product_title: product.title,
            store_owner_id: product.creator_id,
          },
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setLastEmail(payload.email);
      setPendingDepositId(data.depositId);
      setPayStatus("processing");
      toast.info("Validez la transaction sur votre téléphone");
    } catch (e: any) {
      toast.error(e.message || "Erreur paiement");
      setErrorMsg(e.message || "");
    } finally { setSubmitting(false); }
  };

  // poll mobile money
  useEffect(() => {
    if (!pendingDepositId) return;
    const id = setInterval(async () => {
      const { data } = await supabase.functions.invoke("pawapay-status", {
        body: { depositId: pendingDepositId, kind: "deposit" },
      });
      if (data?.status === "COMPLETED") { setPayStatus("success"); clearInterval(id); }
      else if (data?.status === "FAILED" || data?.status === "REJECTED") {
        setPayStatus("failed"); setErrorMsg("Paiement refusé."); clearInterval(id);
      }
    }, 4000);
    return () => clearInterval(id);
  }, [pendingDepositId]);

  // ─── Card (Stripe Checkout — hosted page, backend redirect)
  const startStripeCheckout = async (payload: { name: string; email: string; phone: string; country?: string }) => {
    if (!product) return;
    setSubmitting(true); setErrorMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout-session", {
        body: {
          amount_usd: priceUsd,
          product_id: product.id,
          product_title: product.title,
          store_owner_id: product.creator_id,
          country: payload.country,
          customer: { name: payload.name, email: payload.email.trim().toLowerCase(), phone: payload.phone },
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("URL Stripe manquante");
      setLastEmail(payload.email);
      // Redirect to Stripe hosted checkout
      window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || "Erreur Stripe");
      setErrorMsg(e.message || "");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-violet-50 to-amber-50">
        <Loader2 className="h-8 w-8 animate-spin text-violet-700" />
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-100 via-violet-50 to-amber-50">
        <p className="text-lg font-semibold text-gray-900 mb-2">{error || "Produit introuvable"}</p>
        <Link to="/" className="text-sm text-violet-700 hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  const resetFlow = () => {
    setPayStatus("idle"); setPendingDepositId(null); setErrorMsg("");
  };

  return (
    <>
      <SEOHead title={`Paiement sécurisé — ${product.title}`} description="Finalisez votre achat en toute sécurité." />

      <div
        className="min-h-screen py-4 sm:py-10 px-3 sm:px-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #F5F0FF 0%, #FAF5FF 50%, #FFF8E7 100%)` }}
      >
        {/* Decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: `radial-gradient(circle, ${GOLD}, transparent 70%)` }} />

        <div className="max-w-5xl mx-auto relative">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-violet-100/60 px-4 sm:px-5 py-3 flex items-center justify-between mb-4 sm:mb-6 shadow-sm">
            <button
              onClick={() => step === "select"
                ? (window.location.href = storeSlug ? `/store/${storeSlug}` : "/")
                : (setStep("select"), resetFlow())}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-violet-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">{step === "select" ? "Retour" : "Changer de méthode"}</span>
            </button>
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${GOLD})` }}>
                  {storeName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-bold text-gray-900 truncate max-w-[140px]">{storeName}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-500">
              <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> PCI-DSS</span>
            </div>
          </div>

          {/* Order summary bar */}
          <OrderBar product={product} priceFcfa={priceFcfa} />

          {/* Stepper */}
          {payStatus === "idle" && <Stepper step={step} />}

          {/* Main panel */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-violet-900/10 ring-1 ring-violet-100/60 overflow-hidden mt-4">
            {payStatus === "success" ? (
              <SuccessView product={product} email={lastEmail} />
            ) : payStatus === "processing" ? (
              <ProcessingView method={step === "card" ? "card" : "mobile"} />
            ) : payStatus === "failed" ? (
              <FailedView errorMsg={errorMsg} onRetry={resetFlow} />
            ) : (
              <AnimatePresence mode="wait">
                {step === "select" && (
                  <motion.div key="select"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <SelectStep
                      priceFcfa={priceFcfa}
                      priceUsd={priceUsd}
                      onPick={(m) => setStep(m === "mobile" ? "mobile" : "card")}
                    />
                  </motion.div>
                )}
                {step === "mobile" && (
                  <motion.div key="mobile"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <MobileMoneyStep
                      submitting={submitting}
                      onSubmit={submitMobile}
                      priceFcfa={priceFcfa}
                      errorMsg={errorMsg}
                    />
                  </motion.div>
                )}
                {step === "card" && (
                  <motion.div key="card"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <CardStep
                      onStartCheckout={startStripeCheckout}
                      submitting={submitting}
                      priceUsd={priceUsd}
                      errorMsg={errorMsg}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-6">
            Propulsé par <span className="font-semibold text-gray-600">Dukaio</span> · Chiffrement SSL & PCI-DSS
          </p>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════
// Header order bar
// ═══════════════════════════════════════════════
const OrderBar = ({ product, priceFcfa }: { product: Product; priceFcfa: number }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white/70 backdrop-blur-md rounded-2xl px-4 sm:px-5 py-3.5 flex items-center gap-3 border border-violet-100/60 shadow-sm"
  >
    {product.thumbnail_url ? (
      <img src={product.thumbnail_url} alt={product.title} className="h-12 w-12 rounded-xl object-cover ring-1 ring-gray-200 shrink-0" />
    ) : (
      <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
        style={{ background: `linear-gradient(135deg, ${ACCENT}, ${GOLD})` }}>
        {product.title.charAt(0)}
      </div>
    )}
    <div className="min-w-0 flex-1">
      <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Votre commande</div>
      <div className="text-sm font-bold text-gray-900 truncate">{product.title}</div>
    </div>
    <div className="text-right shrink-0">
      <div className="text-[11px] text-gray-400">Total</div>
      <div className="text-base sm:text-lg font-extrabold" style={{ color: ACCENT }}>
        {priceFcfa.toLocaleString("fr-FR")} <span className="text-xs">FCFA</span>
      </div>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════
// Stepper indicator
// ═══════════════════════════════════════════════
const Stepper = ({ step }: { step: Step }) => {
  const isStep2 = step !== "select";
  return (
    <div className="flex items-center justify-center gap-2 mt-5">
      <Dot active label="Méthode" done={isStep2} />
      <div className="h-[2px] w-10 sm:w-16 bg-gray-200 relative overflow-hidden rounded">
        <motion.div
          initial={false}
          animate={{ width: isStep2 ? "100%" : "0%" }}
          transition={{ duration: 0.4 }}
          className="h-full"
          style={{ background: `linear-gradient(90deg, ${ACCENT}, ${GOLD})` }}
        />
      </div>
      <Dot active={isStep2} label="Paiement" done={false} />
    </div>
  );
};
const Dot = ({ active, label, done }: { active: boolean; label: string; done: boolean }) => (
  <div className="flex items-center gap-1.5">
    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
      active ? "text-white shadow-lg" : "bg-gray-200 text-gray-400"
    }`} style={active ? { background: `linear-gradient(135deg, ${ACCENT}, ${GOLD})` } : undefined}>
      {done ? <Check className="h-3 w-3" strokeWidth={3} /> : (label === "Méthode" ? "1" : "2")}
    </div>
    <span className={`text-[11px] font-semibold hidden sm:inline ${active ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
  </div>
);

// ═══════════════════════════════════════════════
// STEP 1 — Select method
// ═══════════════════════════════════════════════
const SelectStep = ({ priceFcfa, priceUsd, onPick }: {
  priceFcfa: number; priceUsd: number; onPick: (m: PayMethod) => void;
}) => (
  <div className="px-5 sm:px-10 py-8 sm:py-12">
    <div className="text-center max-w-md mx-auto mb-8">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-3"
        style={{ background: `${ACCENT}15`, color: ACCENT }}
      >
        <Sparkles className="h-3 w-3" /> Paiement sécurisé
      </motion.div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
        Comment souhaitez-vous payer ?
      </h1>
      <p className="text-sm text-gray-500 mt-2">
        Choisissez votre moyen de paiement préféré.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
      <BigMethodCard
        onClick={() => onPick("mobile")}
        icon={Smartphone}
        title="Mobile Money"
        subtitle="MTN, Orange, Moov, Airtel, Wave…"
        price={`${priceFcfa.toLocaleString("fr-FR")} FCFA`}
        gradient={`linear-gradient(135deg, ${ACCENT} 0%, #5B1FA0 100%)`}
        badge="Instantané"
        delay={0.15}
      />
      <BigMethodCard
        onClick={() => onPick("card")}
        icon={CreditCard}
        title="Carte bancaire"
        subtitle="Visa, Mastercard, Amex"
        price={`${priceUsd} USD`}
        note="Frais bancaires inclus"
        gradient={`linear-gradient(135deg, #1a1a2e 0%, ${ACCENT} 100%)`}
        badge="International"
        delay={0.25}
      />
    </div>

    <div className="flex items-center justify-center gap-4 mt-8 text-[11px] text-gray-400">
      <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> 256-bit SSL</span>
      <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> PCI-DSS</span>
      <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Sans frais cachés</span>
    </div>
  </div>
);

const BigMethodCard = ({ onClick, icon: Icon, title, subtitle, price, gradient, badge, delay, note }: any) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="group relative overflow-hidden rounded-2xl text-left p-5 sm:p-6 text-white shadow-xl"
    style={{ background: gradient }}
  >
    <div aria-hidden className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
    <div className="relative flex items-start justify-between mb-6">
      <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur px-2 py-1 rounded-full">{badge}</span>
    </div>
    <div className="relative">
      <div className="text-lg font-extrabold">{title}</div>
      <div className="text-xs text-white/70 mt-0.5">{subtitle}</div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="text-base font-bold">{price}</span>
          {note && <div className="text-[10px] text-white/70 mt-0.5">{note}</div>}
        </div>
        <span className="h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-white group-hover:text-gray-900 transition-colors">
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  </motion.button>
);

// ═══════════════════════════════════════════════
// STEP 2 — Mobile Money
// ═══════════════════════════════════════════════
const MobileMoneyStep = ({ submitting, onSubmit, priceFcfa, errorMsg }: {
  submitting: boolean;
  onSubmit: (p: { name: string; email: string; phone: string; provider: PawaPayProvider }) => void;
  priceFcfa: number; errorMsg: string;
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<PawaPayCountry>(
    () => pawapayCountries.find((c) => c.code === "BEN") || pawapayCountries[0]
  );
  const [provider, setProvider] = useState<PawaPayProvider>(phoneCountry.deposit[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promo, setPromo] = useState("");

  useEffect(() => { setProvider(phoneCountry.deposit[0]); }, [phoneCountry.code]);

  const filtered = useMemo(() => {
    if (!countrySearch.trim()) return pawapayCountries;
    const q = countrySearch.toLowerCase();
    return pawapayCountries.filter((c) =>
      c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q));
  }, [countrySearch]);

  const fullName = `${firstName} ${lastName}`.trim();
  const fullPhone = `${phoneCountry.dial}${phone}`.replace(/\D/g, "");

  const submit = () => {
    if (!firstName.trim() || !lastName.trim()) return toast.error("Nom complet requis");
    if (!email.includes("@")) return toast.error("Email valide requis");
    if (phone.length < 6) return toast.error("Téléphone requis");
    onSubmit({ name: fullName, email, phone: fullPhone, provider });
  };

  return (
    <div className="px-5 sm:px-10 py-7">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${ACCENT}, #5B1FA0)` }}>
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Mobile Money</h2>
          <p className="text-xs text-gray-500">Validation par code PIN sur votre téléphone</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          {/* Operator picker */}
          <div>
            <Label>Opérateur</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {phoneCountry.deposit.map((p) => (
                <motion.button
                  key={p.code}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setProvider(p)}
                  className={`flex items-center gap-2 h-14 px-3 rounded-xl border-2 transition-all ${
                    provider.code === p.code
                      ? "bg-violet-50 shadow-md shadow-violet-200/50"
                      : "border-gray-200 bg-white hover:border-violet-200"
                  }`}
                  style={provider.code === p.code ? { borderColor: ACCENT } : undefined}
                >
                  <img src={providerLogos[p.family]} alt={p.label} className="h-7 w-auto object-contain shrink-0" />
                  <span className="text-xs font-semibold text-gray-800 truncate">{p.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Identity */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                placeholder="John" className="h-11 bg-gray-50 border-gray-200 focus:bg-white" />
            </Field>
            <Field label="Nom">
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe" className="h-11 bg-gray-50 border-gray-200 focus:bg-white" />
            </Field>
          </div>

          <Field label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com" className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white" />
            </div>
          </Field>

          <Field label="Numéro de téléphone">
            <div className="flex gap-2">
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline"
                    className="shrink-0 gap-1.5 px-3 h-11 min-w-[110px] bg-gray-50 border-gray-200">
                    <img src={phoneCountry.flag} alt={phoneCountry.code} className="h-4 w-6 object-cover rounded-sm" />
                    <span className="text-xs font-mono">+{phoneCountry.dial}</span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="start">
                  <div className="p-2 border-b">
                    <Input placeholder="Rechercher un pays..." value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <ScrollArea className="h-60">
                    <div className="p-1">
                      {filtered.map((c) => (
                        <button key={c.code} type="button"
                          onClick={() => { setPhoneCountry(c); setCountryOpen(false); setCountrySearch(""); }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-md hover:bg-gray-50 text-left">
                          <img src={c.flag} alt={c.code} className="h-4 w-6 object-cover rounded-sm shrink-0" />
                          <span className="truncate">{c.name}</span>
                          <span className="ml-auto text-gray-400 text-xs">+{c.dial}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <Input type="tel" value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="97 00 00 00"
                className="h-11 flex-1 bg-gray-50 border-gray-200 focus:bg-white font-mono" />
            </div>
          </Field>

          <PromoField open={promoOpen} setOpen={setPromoOpen} value={promo} setValue={setPromo} />
        </div>

        {/* Recap sidebar (desktop) */}
        <RecapPanel
          providerLabel={provider.label}
          providerLogo={providerLogos[provider.family]}
          phone={fullPhone ? `+${fullPhone}` : "—"}
          amount={`${priceFcfa.toLocaleString("fr-FR")} FCFA`}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <Button onClick={submit} disabled={submitting}
          className="w-full h-13 py-3.5 rounded-xl text-base font-bold text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #5B1FA0 100%)` }}
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <>Payer {priceFcfa.toLocaleString("fr-FR")} FCFA <ChevronRight className="h-4 w-4 ml-1" /></>
          )}
        </Button>
        {errorMsg && <p className="text-xs text-red-600 mt-3 text-center">{errorMsg}</p>}
        <p className="text-[11px] text-center text-gray-400 mt-3">
          En cliquant, vous recevrez une demande de validation sur votre téléphone.
        </p>
      </motion.div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// STEP 2 — Card (Stripe)
// ═══════════════════════════════════════════════
const CardStep = ({ onStartCheckout, submitting, priceUsd, errorMsg }: {
  onStartCheckout: (p: { name: string; email: string; phone: string; country?: string }) => Promise<void>;
  submitting: boolean; priceUsd: number; errorMsg: string;
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(
    () => allCountries.find((c) => c.code === "BJ") || allCountries[0]
  );
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promo, setPromo] = useState("");

  const filtered = useMemo(() => {
    if (!countrySearch.trim()) return allCountries;
    const q = countrySearch.toLowerCase();
    return allCountries.filter((c) =>
      c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q));
  }, [countrySearch]);

  const fullName = `${firstName} ${lastName}`.trim();
  const fullPhone = `${country.dial}${phone}`.replace(/[^\d+]/g, "");

  const handleContinue = async () => {
    if (!firstName.trim() || !lastName.trim()) return toast.error("Nom complet requis");
    if (!email.includes("@")) return toast.error("Email valide requis");
    if (phone.length < 6) return toast.error("Téléphone requis");
    await onStartCheckout({ name: fullName, email, phone: fullPhone, country: country.code });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px]">
      <div className="px-5 sm:px-10 py-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: `linear-gradient(135deg, #1a1a2e, ${ACCENT})` }}>
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Carte bancaire</h2>
            <p className="text-xs text-gray-500">Visa, Mastercard, Amex — paiement international sécurisé</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                placeholder="John" className="h-11 bg-gray-50 border-gray-200 focus:bg-white" />
            </Field>
            <Field label="Nom">
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe" className="h-11 bg-gray-50 border-gray-200 focus:bg-white" />
            </Field>
          </div>

          <Field label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com" className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white" />
            </div>
          </Field>

          <Field label="Pays">
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline"
                  className="w-full justify-between h-11 bg-gray-50 border-gray-200">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm">{country.name}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="p-2 border-b">
                  <Input placeholder="Rechercher un pays..." value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)} className="h-8 text-sm" />
                </div>
                <ScrollArea className="h-64">
                  <div className="p-1">
                    {filtered.map((c) => (
                      <button key={c.code} type="button"
                        onClick={() => { setCountry(c); setCountryOpen(false); setCountrySearch(""); }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-md hover:bg-gray-50 text-left">
                        <span className="text-lg">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                        <span className="ml-auto text-gray-400 text-xs">{c.dial}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </Field>

          <Field label="Téléphone">
            <div className="flex gap-2">
              <div className="shrink-0 flex items-center gap-1.5 px-3 h-11 min-w-[90px] rounded-md bg-gray-100 border border-gray-200 text-xs font-mono">
                {country.dial}
              </div>
              <Input type="tel" value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="6 12 34 56 78"
                className="h-11 flex-1 bg-gray-50 border-gray-200 focus:bg-white font-mono" />
            </div>
          </Field>

          <PromoField open={promoOpen} setOpen={setPromoOpen} value={promo} setValue={setPromo} />

          <div className="rounded-xl bg-gradient-to-r from-violet-50 to-amber-50/40 border border-violet-100 p-3 flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Vous serez redirigé vers la page de paiement <strong>Stripe</strong> ultra-sécurisée pour saisir vos informations de carte. Aucune donnée bancaire n'est stockée sur Dukaio.
            </p>
          </div>

          <Button onClick={handleContinue} disabled={submitting}
            className="w-full h-12 rounded-xl text-base font-bold text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #5B1FA0 100%)` }}
          >
            {submitting ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Redirection vers Stripe…</>
            ) : (
              <>Payer {priceUsd} USD <ChevronRight className="h-4 w-4 ml-1" /></>
            )}
          </Button>

          {errorMsg && <p className="text-xs text-red-600 mt-1 text-center">{errorMsg}</p>}
        </div>
      </div>

      {/* 3D card visual */}
      <div className="hidden lg:flex items-center justify-center p-8 relative"
        style={{ background: `linear-gradient(135deg, ${ACCENT}08, ${GOLD}10)` }}>
        <CreditCard3D cardholder={fullName || "VOTRE NOM"} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// Shared bits
// ═══════════════════════════════════════════════
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block uppercase tracking-wider">{children}</label>
);
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><Label>{label}</Label>{children}</div>
);

const PromoField = ({ open, setOpen, value, setValue }: {
  open: boolean; setOpen: (v: boolean) => void; value: string; setValue: (v: string) => void;
}) => (
  <div className="pt-1">
    {!open ? (
      <button onClick={() => setOpen(true)}
        className="text-xs font-semibold text-violet-700 hover:text-violet-900 inline-flex items-center gap-1.5">
        <Tag className="h-3.5 w-3.5" /> J'ai un code promo
      </button>
    ) : (
      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={value} onChange={(e) => setValue(e.target.value.toUpperCase())}
            placeholder="CODE PROMO" className="pl-9 h-11 bg-gray-50 border-gray-200 uppercase font-mono" />
        </div>
        <Button variant="outline" className="h-11" onClick={() => toast.info("Code à appliquer au paiement")}>
          Appliquer
        </Button>
        <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => { setOpen(false); setValue(""); }}>
          <X className="h-4 w-4" />
        </Button>
      </motion.div>
    )}
  </div>
);

const RecapPanel = ({ providerLabel, providerLogo, phone, amount }: {
  providerLabel: string; providerLogo: string; phone: string; amount: string;
}) => (
  <div className="hidden lg:block">
    <div className="sticky top-4 rounded-2xl bg-gradient-to-br from-violet-50 to-amber-50/40 border border-violet-100 p-5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700 mb-3">Récapitulatif</div>
      <div className="space-y-3 text-sm">
        <RecapRow label="Opérateur" value={
          <span className="flex items-center gap-2">
            <img src={providerLogo} alt={providerLabel} className="h-5 w-auto" />
            <span className="font-semibold text-gray-900">{providerLabel}</span>
          </span>
        } />
        <RecapRow label="Numéro" value={<span className="font-mono text-gray-900">{phone}</span>} />
        <div className="h-px bg-violet-200/60 my-2" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Total à débiter</span>
          <span className="text-lg font-extrabold" style={{ color: ACCENT }}>{amount}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-[10px] text-gray-500">
        <ShieldCheck className="h-3 w-3" /> Transaction chiffrée bout-en-bout
      </div>
    </div>
  </div>
);
const RecapRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-xs text-gray-500 shrink-0">{label}</span>
    <div className="text-right">{value}</div>
  </div>
);

// 3D Card visual
const CreditCard3D = ({ cardholder }: { cardholder: string }) => (
  <motion.div
    animate={{ rotateY: [-12, -8, -12], rotateX: [8, 6, 8], y: [0, -8, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    style={{ transformStyle: "preserve-3d", perspective: 1000 }}
    className="relative w-full max-w-sm aspect-[1.6/1] rounded-2xl p-6 flex flex-col justify-between text-white shadow-2xl"
  >
    <div className="absolute inset-0 rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${ACCENT} 0%, #5B1FA0 50%, #3D1670 100%)`,
        boxShadow: `0 25px 60px -15px ${ACCENT}80, inset 0 1px 0 rgba(255,255,255,0.2)`,
      }} />
    <div className="relative flex items-start justify-between">
      <div className="flex gap-1.5">
        <span className="text-[10px] font-bold bg-white/90 text-gray-900 rounded px-1.5 py-0.5">VISA</span>
        <span className="text-[10px] font-bold bg-white/90 text-gray-900 rounded px-1.5 py-0.5">MC</span>
      </div>
      <div className="h-8 w-10 rounded-md"
        style={{ background: `linear-gradient(135deg, ${GOLD}, #B8901F)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }} />
    </div>
    <div className="relative">
      <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Titulaire</div>
      <div className="text-sm font-mono tracking-wide truncate">{cardholder.toUpperCase()}</div>
      <div className="mt-3 text-base font-mono tracking-widest">•••• •••• •••• ••••</div>
      <div className="flex gap-4 mt-2 text-[10px]">
        <div><div className="opacity-70 uppercase">Exp.</div><div className="font-mono">MM/AA</div></div>
        <div><div className="opacity-70 uppercase">CVC</div><div className="font-mono">•••</div></div>
      </div>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════
// Status views
// ═══════════════════════════════════════════════
const SuccessView = ({ product, email }: { product: Product; email: string }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
    className="px-6 sm:px-10 py-14 flex flex-col items-center text-center">
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
      <Check className="h-10 w-10 text-emerald-600" strokeWidth={3} />
    </motion.div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement confirmé !</h2>
    <p className="text-sm text-gray-600 mb-6 max-w-md">
      Merci pour votre achat de <strong>{product.title}</strong>. Un email avec les détails vous a été envoyé à <strong>{email}</strong>.
    </p>
    {product.download_url && (
      <a href={product.download_url} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm">
        Télécharger le produit
      </a>
    )}
  </motion.div>
);

const ProcessingView = ({ method }: { method: PayMethod }) => (
  <div className="px-6 sm:px-10 py-14 flex flex-col items-center text-center">
    <div className="relative mb-4">
      <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
      <div className="absolute inset-0 rounded-full blur-xl bg-violet-400/30 animate-pulse" />
    </div>
    <h2 className="text-xl font-bold text-gray-900 mb-2">Paiement en cours…</h2>
    <p className="text-sm text-gray-500 max-w-md">
      {method === "mobile" ? "Validez la transaction sur votre téléphone (composez le code PIN MoMo)." : "Confirmation du paiement par carte en cours…"}
    </p>
  </div>
);

const FailedView = ({ errorMsg, onRetry }: { errorMsg: string; onRetry: () => void }) => (
  <div className="px-6 sm:px-10 py-14 flex flex-col items-center text-center">
    <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
      <X className="h-10 w-10 text-red-600" strokeWidth={3} />
    </div>
    <h2 className="text-xl font-bold text-gray-900 mb-2">Paiement échoué</h2>
    <p className="text-sm text-gray-600 mb-6 max-w-md">{errorMsg || "Une erreur est survenue."}</p>
    <Button onClick={onRetry} variant="outline" className="rounded-xl">Réessayer</Button>
  </div>
);

export default CheckoutPage;
