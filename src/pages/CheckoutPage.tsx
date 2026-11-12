import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Check, ChevronDown, CreditCard, Lock, MessageCircle,
  Package, ShieldCheck, Smartphone, Loader2, Sparkles, AlertCircle, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import {
  SAASPAY_COUNTRIES,
  SAASPAY_METHODS,
  getSaaSPayMethodCode,
  type MethodId,
  type SaaSPayCountry,
} from "@/data/saaspayProviders";

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

const fmt = (n: number) =>
  Math.round(n)
    .toLocaleString("fr-FR")
    .replace(/\u202f|\u00a0/g, " ");

function Flag({ code, className = "" }: { code: string; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
      alt={code}
      className={`h-3.5 w-5 rounded-[2px] object-cover ring-1 ring-border ${className}`}
      loading="lazy"
    />
  );
}

function LogoBadge({ id, size = "md" }: { id: MethodId; size?: "sm" | "md" }) {
  const meta = SAASPAY_METHODS[id];
  if (!meta) return null;

  const tile = size === "sm" ? "h-7 w-10" : "h-9 w-12";
  const imgSize = size === "sm" ? "max-h-4 max-w-7" : "max-h-5 max-w-8";

  if (meta.logos.length === 0) {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-card font-mono text-[10px] font-bold text-muted-foreground ${tile}`}>
        {id.toUpperCase()}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {meta.logos.map((src, i) => (
        <span
          key={i}
          className={`inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-card p-1 ${tile}`}
        >
          <img src={src} alt={meta.name} className={`object-contain ${imgSize}`} />
        </span>
      ))}
    </span>
  );
}

function Brand({ storeName, logoUrl }: { storeName: string; logoUrl?: string | null }) {
  return (
    <div className="flex items-center gap-2.5">
      {logoUrl ? (
        <img src={logoUrl} alt={storeName} className="h-8 w-8 rounded-lg object-contain border border-border" />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[13px] font-black tracking-tight text-primary-foreground">
          {storeName.charAt(0).toUpperCase() || "D"}
        </span>
      )}
      <span className="text-[15px] font-bold tracking-tight text-foreground truncate max-w-[200px]">
        {storeName}
      </span>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={`truncate text-right font-medium ${mono ? "font-mono text-[12px] tracking-tight" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function CountrySelect({
  value,
  onChange,
}: {
  value: SaaSPayCountry;
  onChange: (c: SaaSPayCountry) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return SAASPAY_COUNTRIES;
    const q = search.toLowerCase();
    return SAASPAY_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.includes(q)
    );
  }, [search]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-12 w-full items-center gap-3 rounded-xl border border-input bg-card px-4 text-left text-sm transition-colors hover:bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <Flag code={value.code} />
        <span className="flex-1 font-semibold text-foreground">{value.name}</span>
        <span className="text-[13px] text-muted-foreground font-mono">{value.dial}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 max-h-72 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-xl animate-in fade-in-0 zoom-in-95">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un pays..."
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-secondary/50 border border-border outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto p-1 space-y-0.5">
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.code === value.code}
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    c.code === value.code ? "bg-primary/10 text-primary font-bold" : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <Flag code={c.code} />
                  <span className="flex-1 text-xs sm:text-sm">{c.name}</span>
                  <span className="text-[12px] text-muted-foreground font-mono">{c.dial}</span>
                  {c.code === value.code && <Check className="h-3.5 w-3.5 text-primary ml-1" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { productId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const storeSlug = params.get("store");

  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [product, setProduct] = useState<Product | null>(null);
  const [storeName, setStoreName] = useState("DUKAIO");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [country, setCountry] = useState<SaaSPayCountry>(SAASPAY_COUNTRIES[0]);
  const [method, setMethod] = useState<MethodId>("mtn");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Payment flow state
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "pending" | "done" | "failed">("form");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [orderReference, setOrderReference] = useState<string>("");
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Automatically select first method when country changes
  useEffect(() => {
    if (country.methods.length > 0) {
      setMethod(country.methods[0]);
    }
  }, [country]);

  // Load product from Supabase
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError("Identifiant du produit manquant");
        setLoading(false);
        return;
      }

      try {
        const { data: p, error: pErr } = await supabase
          .from("products")
          .select("id, title, price, creator_id, download_url, type, thumbnail_url, collect_shipping_address")
          .eq("id", productId)
          .maybeSingle();

        if (pErr) throw pErr;
        if (!p) {
          setError("Ce produit n'existe pas ou n'est plus disponible.");
          setLoading(false);
          return;
        }

        setProduct(p as Product);

        if (storeSlug) {
          const { data: store } = await supabase
            .from("stores")
            .select("name, logo_url")
            .eq("slug", storeSlug)
            .maybeSingle();
          if (store) {
            setStoreName(store.name || "DUKAIO");
            setLogoUrl(store.logo_url || null);
          }
        }
      } catch (err: any) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, storeSlug]);

  const priceAmount = product?.price || 0;
  const currencyCode = country.currency || "XOF";
  const t = (fr: string, en: string) => (lang === "fr" ? fr : en);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
  const isNameValid = customerName.trim().length >= 2;
  const isPhoneValid = phone.replace(/\D/g, "").length >= 8;

  const currentMethodMeta = SAASPAY_METHODS[method] || SAASPAY_METHODS.mtn;
  const isFormValid =
    isNameValid &&
    isEmailValid &&
    (currentMethodMeta.kind !== "momo" || isPhoneValid);

  // -------------------------------------------------------------
  // Submit payment to SaaSPay
  // -------------------------------------------------------------
  const handlePayment = async () => {
    if (!product) return;

    // Handle free product
    if (priceAmount === 0) {
      setSubmitting(true);
      try {
        const { data, error: freeErr } = await supabase.functions.invoke("process-free-order", {
          body: {
            name: customerName.trim(),
            email: customerEmail.trim().toLowerCase(),
            productId: product.id,
          },
        });
        if (freeErr) throw freeErr;
        if (data?.error) throw new Error(data.error);

        setOrderReference(data?.orderId || "DK-FREE");
        setCompletedOrderId(data?.orderId || null);
        setStep("done");
        toast.success("Produit gratuit obtenu avec succès !");
      } catch (err: any) {
        toast.error(err.message || "Erreur lors du traitement");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!isFormValid) {
      toast.error("Veuillez renseigner toutes vos informations.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const saaspayMethod = getSaaSPayMethodCode(method, country.code);
      const fullPhone = `${country.dial}${phone.replace(/\D/g, "")}`;

      const { data, error: callErr } = await supabase.functions.invoke("saaspay-create-payment", {
        body: {
          amount: priceAmount,
          currency: currencyCode,
          country: country.code.toUpperCase(),
          method: saaspayMethod,
          phone: fullPhone,
          customer: {
            name: customerName.trim(),
            email: customerEmail.trim().toLowerCase(),
            phone: fullPhone,
          },
          metadata: {
            product_id: product.id,
            product_title: product.title,
            store_owner_id: product.creator_id,
            return_url: `${window.location.origin}/checkout/${product.id}?ref=saaspay`,
            cancel_url: window.location.href,
          },
        },
      });

      if (callErr) throw new Error(callErr.message || "Erreur réseau");
      if (data?.error) throw new Error(data.error);

      setPaymentId(data.paymentId);
      setOrderReference(data.reference);

      // If Checkout URL returned (Cards, Crypto, Wave Web), redirect
      if (data.checkoutUrl) {
        toast.info("Redirection vers la passerelle sécurisée...");
        window.location.href = data.checkoutUrl;
        return;
      }

      // If direct USSD push (MTN, Moov, Celtiis, Orange), switch to pending screen
      setStep("pending");
      toast.info("Demande envoyée ! Consultez votre téléphone pour valider le code PIN.");
    } catch (err: any) {
      setErrorMessage(err.message || "Impossible de lancer le paiement.");
      toast.error(err.message || "Erreur lors du paiement");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Realtime & Polling check when step is 'pending'
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== "pending" || !paymentId) return;

    let isSubscribed = true;

    // Polling interval every 2.5 seconds
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke("saaspay-status", {
          body: { paymentId, reference: orderReference },
        });

        if (!isSubscribed) return;

        if (data?.status === "success") {
          setCompletedOrderId(data.orderId || null);
          setStep("done");
          toast.success("Paiement validé avec succès !");
          clearInterval(interval);
        } else if (data?.status === "failed") {
          setErrorMessage(data.error || "Paiement refusé ou annulé.");
          setStep("failed");
          clearInterval(interval);
        }
      } catch (pollErr) {
        console.warn("Polling status error:", pollErr);
      }
    }, 2500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [step, paymentId, orderReference]);

  const allSupportedMethods = useMemo(
    () => Array.from(new Set(SAASPAY_COUNTRIES.flatMap((c) => c.methods))),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          Préparation du paiement sécurisé...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Produit introuvable</h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SEOHead
        title={`Paiement sécurisé — ${product.title} | ${storeName}`}
        description={`Réglez votre commande en toute sécurité par Mobile Money ou carte bancaire.`}
      />

      <div className="mx-auto grid max-w-[1080px] gap-4 px-4 py-6 sm:px-6 md:py-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-6">
        {/* ======================================================== */}
        {/* LEFT COLUMN: ORDER SUMMARY                               */}
        {/* ======================================================== */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-7 select-none">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t("Retour", "Back")}
          </button>

          <div>
            <Brand storeName={storeName} logoUrl={logoUrl} />
          </div>

          <div className="mt-6">
            <p className="text-[13px] text-muted-foreground font-medium">
              {t("Montant à payer", "Amount due")}
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="font-extrabold text-4xl sm:text-5xl leading-none tracking-tight text-foreground">
                {priceAmount === 0 ? t("Gratuit", "Free") : fmt(priceAmount)}
              </span>
              {priceAmount > 0 && (
                <span className="text-sm font-bold text-muted-foreground">
                  {currencyCode}
                </span>
              )}
            </p>
          </div>

          {/* Product card info */}
          <div className="mt-6 divide-y divide-border rounded-xl border border-border overflow-hidden bg-secondary/20">
            <div className="flex items-start gap-3 p-4">
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover border border-border"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Package className="h-5 w-5" strokeWidth={1.8} />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{product.title}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5 capitalize">
                  {product.type.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            <Row
              label={t("Sous-total", "Subtotal")}
              value={priceAmount === 0 ? "0 FCFA" : `${fmt(priceAmount)} ${currencyCode}`}
            />
            <Row label={t("Frais de transaction", "Processing fees")} value="0 FCFA (Inclus)" />
            {customerEmail && (
              <Row label={t("Reçu envoyé à", "Receipt sent to")} value={customerEmail} />
            )}
            {orderReference && (
              <Row label={t("Référence", "Reference")} value={orderReference} mono />
            )}
          </div>

          {/* Supported Methods Icons */}
          <div className="mt-5 flex flex-wrap items-center gap-1.5">
            {allSupportedMethods.slice(0, 8).map((id) => (
              <LogoBadge key={id} id={id} size="sm" />
            ))}
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground font-medium">
            {t("Mobile Money et carte bancaire acceptés en temps réel.", "Instant Mobile Money and cards accepted.")}
          </p>

          <div className="mt-6 hidden items-start gap-3 rounded-xl border border-border p-4 lg:flex bg-secondary/15">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <Smartphone className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">
                {t("Payer depuis votre téléphone", "Pay from your phone")}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                {t(
                  "Validez la demande directement sur votre téléphone avec votre code secret Mobile Money.",
                  "Approve the payment request on your phone with your secret Mobile Money PIN."
                )}
              </p>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: PAYMENT FORM & STEPS                       */}
        {/* ======================================================== */}
        <main className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 sm:p-7">
            {/* ---------------------------------------------------- */}
            {/* STEP 1: FORM                                         */}
            {/* ---------------------------------------------------- */}
            {step === "form" && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                {/* Header: Title + Language toggle */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl text-foreground">
                      {t("Moyen de paiement", "Payment method")}
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("Choisissez comment régler", "Choose how to pay")}{" "}
                      <span className="font-bold text-foreground">
                        {priceAmount === 0 ? t("Gratuit", "Free") : `${fmt(priceAmount)} ${currencyCode}`}
                      </span>.
                    </p>
                  </div>

                  <div className="flex items-center rounded-lg border border-border p-0.5 text-[11px] font-bold">
                    {(["fr", "en"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={`rounded px-2.5 py-1 uppercase transition-colors ${
                          lang === l
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country Select */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-foreground">
                      {t("Votre pays de paiement", "Your country")}
                    </label>
                    <span className="hidden text-[11px] text-muted-foreground sm:inline">
                      {t("Adapte les réseaux Mobile Money disponibles", "Adapts available Mobile Money networks")}
                    </span>
                  </div>
                  <CountrySelect value={country} onChange={setCountry} />
                </div>

                {/* Customer Information (Name & Email) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">
                      {t("Votre nom complet", "Full name")}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Kouamé Koffi"
                      className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">
                      {t("Votre adresse email", "Email address")}
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Ex: client@gmail.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                    />
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {t("Le reçu et le lien du produit seront envoyés ici.", "Your receipt and access will be sent here.")}
                    </span>
                  </div>
                </div>

                {/* Payment Methods (Radio Cards) */}
                {priceAmount > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold text-foreground">
                      {t("Payer avec", "Pay with")}
                    </p>
                    <div role="radiogroup" className="space-y-2.5">
                      {country.methods.map((id) => {
                        const active = id === method;
                        const meta = SAASPAY_METHODS[id];
                        if (!meta) return null;

                        return (
                          <div
                            key={id}
                            className={`rounded-xl border transition-all ${
                              active
                                ? "border-primary bg-primary/5 shadow-xs"
                                : "border-border hover:border-muted-foreground/40 bg-card"
                            }`}
                          >
                            <button
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => setMethod(id)}
                              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                            >
                              <span
                                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
                                  active ? "border-primary bg-primary" : "border-muted-foreground/50"
                                }`}
                              >
                                {active && <span className="h-2 w-2 rounded-full bg-white" />}
                              </span>

                              <span className="flex-1 text-xs sm:text-sm font-bold text-foreground">
                                {meta.name}
                                {meta.kind === "momo" && (
                                  <span className="text-muted-foreground font-normal ml-1">
                                    {country.name}
                                  </span>
                                )}
                              </span>

                              <LogoBadge id={id} />
                            </button>

                            {/* Active Content: Phone Input for MoMo / Helper for Card */}
                            {active && (
                              <div className="border-t border-border px-4 pb-4 pt-3 space-y-2 animate-in fade-in-50">
                                {meta.kind === "momo" ? (
                                  <>
                                    <label className="text-xs font-semibold text-muted-foreground block">
                                      {t("Numéro de compte", "Account phone number")} {meta.name}
                                    </label>
                                    <div className="flex h-11 overflow-hidden rounded-xl border border-input bg-card focus-within:border-primary transition-colors">
                                      <span className="flex items-center gap-2 border-r border-input px-3 text-xs font-mono font-bold text-foreground bg-secondary/30">
                                        <Flag code={country.code} />
                                        <span>{country.dial}</span>
                                      </span>
                                      <input
                                        type="tel"
                                        inputMode="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, ""))}
                                        placeholder={country.placeholder}
                                        className="min-w-0 flex-1 bg-transparent px-3 text-sm font-mono outline-none placeholder:text-muted-foreground"
                                      />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                      {t(
                                        "Ce numéro recevra l'invite USSD pour saisir votre code PIN.",
                                        "This number will receive the USSD prompt to approve payment."
                                      )}
                                    </p>
                                  </>
                                ) : meta.kind === "card" ? (
                                  <div className="p-3 rounded-lg bg-secondary/30 border border-border text-xs space-y-1.5">
                                    <div className="flex items-center gap-2 font-bold text-foreground">
                                      <CreditCard className="h-4 w-4 text-primary" />
                                      <span>Paiement sécurisé par Carte Bancaire</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                      Vous serez redirigé vers la passerelle sécurisée 3D-Secure de votre banque pour valider votre carte Visa ou Mastercard en toute sérénité.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="p-3 rounded-lg bg-secondary/30 border border-border text-xs space-y-1.5">
                                    <div className="flex items-center gap-2 font-bold text-foreground">
                                      <Sparkles className="h-4 w-4 text-primary" />
                                      <span>Paiement en Cryptomonnaie</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                      Vous serez dirigé vers la page de règlement pour choisir votre crypto (USDT, USDC) et scanner le QR code de dépôt.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="button"
                  disabled={!isFormValid || submitting}
                  onClick={handlePayment}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-primary-foreground shadow-sm transition-all hover:opacity-95 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("Initialisation sécurisée...", "Securing payment...")}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>
                        {priceAmount === 0
                          ? t("Obtenir gratuitement", "Get for free")
                          : `${t("Payer", "Pay")} ${fmt(priceAmount)} ${currencyCode}`}
                      </span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-muted-foreground">
                  {t(
                    "Aucun frais caché. Le montant est débité une seule fois après votre confirmation.",
                    "No hidden fees. Debited once after your explicit confirmation."
                  )}
                </p>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* STEP 2: PENDING (USSD Prompt on Mobile)              */}
            {/* ---------------------------------------------------- */}
            {step === "pending" && (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center p-4 animate-in fade-in-50">
                <div className="relative flex h-16 w-16 items-center justify-center mb-6">
                  <span className="absolute inset-0 animate-spin rounded-full border-2 border-border border-t-primary" />
                  <LogoBadge id={method} size="sm" />
                </div>

                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  {t("Confirmez sur votre téléphone", "Confirm on your phone")}
                </h2>

                <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  {t(
                    `Une demande de ${fmt(priceAmount)} ${currencyCode} a été envoyée au ${country.dial} ${phone}. Saisissez votre code secret ${currentMethodMeta.name} pour valider la commande.`,
                    `A payment request of ${fmt(priceAmount)} ${currencyCode} was sent to ${country.dial} ${phone}. Enter your secret ${currentMethodMeta.name} PIN to approve.`
                  )}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-primary animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("En attente de votre validation PIN...", "Waiting for your PIN approval...")}</span>
                </div>

                <div className="mt-8 pt-4 border-t border-border w-full max-w-xs">
                  <button
                    onClick={() => {
                      setStep("form");
                      setPaymentId(null);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 font-medium transition-colors"
                  >
                    {t("Modifier le moyen de paiement ou le numéro", "Change payment method or phone number")}
                  </button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* STEP 3: DONE (Payment Success)                       */}
            {/* ---------------------------------------------------- */}
            {step === "done" && (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center p-4 animate-in zoom-in-95 duration-200">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
                  <Check className="h-7 w-7 stroke-[2.5]" />
                </span>

                <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                  {t("Paiement confirmé !", "Payment confirmed!")}
                </h2>

                <p className="mt-2 text-xs text-muted-foreground max-w-sm">
                  {t(
                    `Votre commande a été validée avec succès. Un reçu et vos accès ont été envoyés à`,
                    `Your order has been successfully approved. A receipt has been sent to`
                  )}{" "}
                  <span className="font-bold text-foreground">{customerEmail}</span>.
                </p>

                <div className="mt-6 w-full max-w-sm divide-y divide-border rounded-xl border border-border text-left bg-secondary/20 overflow-hidden">
                  <Row
                    label={t("Montant payé", "Amount paid")}
                    value={priceAmount === 0 ? "0 FCFA" : `${fmt(priceAmount)} ${currencyCode}`}
                  />
                  <Row label={t("Moyen utilisé", "Payment method")} value={currentMethodMeta.name} />
                  {orderReference && (
                    <Row label={t("Référence", "Reference")} value={orderReference} mono />
                  )}
                </div>

                <div className="mt-6 w-full max-w-sm space-y-2">
                  {product.download_url ? (
                    <a
                      href={product.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95"
                    >
                      <Package className="h-4 w-4" />
                      <span>{t("Télécharger mon produit", "Download my product")}</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => navigate(`/buyer/orders`)}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95"
                    >
                      <span>{t("Consulter ma commande", "View my order")}</span>
                    </button>
                  )}

                  <button
                    onClick={() => navigate(-1)}
                    className="flex h-10 w-full items-center justify-center rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("Retourner à la boutique", "Return to store")}
                  </button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* STEP 4: FAILED (Refusal or Timeout)                  */}
            {/* ---------------------------------------------------- */}
            {step === "failed" && (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center p-4 animate-in fade-in-50">
                <div className="h-14 w-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                  <AlertCircle className="h-7 w-7" />
                </div>

                <h2 className="text-lg font-bold text-foreground">
                  {t("Le paiement n'a pas abouti", "Payment could not be completed")}
                </h2>

                <p className="mt-2 text-xs text-muted-foreground max-w-sm">
                  {errorMessage || t("Le délai de validation a expiré ou le paiement a été refusé par l'opérateur.", "The approval timeout expired or payment was cancelled by the carrier.")}
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
                  <button
                    onClick={() => {
                      setStep("form");
                      setPaymentId(null);
                    }}
                    className="flex-1 h-11 rounded-xl bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{t("Réessayer", "Try again")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer of Card */}
          <div className="flex flex-col gap-2 border-t border-border px-5 py-4 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-7 bg-secondary/10">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.8} />
              {t("Paiement chiffré 256-bit, données jamais conservées", "256-bit encrypted, data never stored")}
            </span>
            <a
              href="https://wa.me/2290157385885"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-foreground hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.8} />
              {t("Besoin d'aide ? WhatsApp", "Need help? WhatsApp")}
            </a>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[12px] text-muted-foreground lg:col-span-2">
          <span className="font-semibold">© 2026 DUKAIO</span>
          <span className="hover:text-foreground cursor-pointer">{t("Confidentialité", "Privacy")}</span>
          <span className="hover:text-foreground cursor-pointer">{t("Conditions de vente", "Terms")}</span>
          <span className="hover:text-foreground cursor-pointer">{t("Sécurité garantie", "Security")}</span>
        </footer>
      </div>
    </div>
  );
}
