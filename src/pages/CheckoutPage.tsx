import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Check, ChevronDown, CreditCard, Lock, MessageCircle,
  Package, ShieldCheck, Smartphone, Loader2, Sparkles, AlertCircle, RefreshCw,
  Landmark, Copy, ExternalLink, Clock, Tag, X, Wifi, WifiOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import { extractDownloadUrls } from "@/lib/downloadHelper";
import { detectUserCountry } from "@/lib/geo";
import { convertFromXOF, formatMoney, getCurrencyForCountry } from "@/lib/currency";
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
      className={`h-3.5 w-5 rounded-[2px] object-cover ring-1 ring-[#E2E8F0] ${className}`}
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
      <span className={`inline-flex shrink-0 items-center justify-center rounded-md border border-[#E2E8F0] bg-white font-mono text-[10px] font-bold text-[#64748B] ${tile}`}>
        {id.toUpperCase()}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {meta.logos.map((src, i) => (
        <span
          key={i}
          className={`inline-flex shrink-0 items-center justify-center rounded-md border border-[#E2E8F0] bg-white p-1 ${tile}`}
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
        <img src={logoUrl} alt={storeName} className="h-8 w-8 rounded-lg object-contain border border-[#E2E8F0]" />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F172A] text-[13px] font-black tracking-tight text-white">
          {storeName.charAt(0).toUpperCase() || "D"}
        </span>
      )}
      <span className="text-[15px] font-bold tracking-tight text-[#0F172A] truncate max-w-[200px]">
        {storeName}
      </span>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-[13px]">
      <span className="text-[#64748B]">{label}</span>
      <span className={`truncate text-right font-medium text-[#0F172A] ${mono ? "font-mono text-[12px] tracking-tight" : ""}`}>
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
        className="flex h-12 w-full items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 text-left text-sm transition-colors hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/10"
      >
        <Flag code={value.code} />
        <span className="flex-1 font-semibold text-[#0F172A]">{value.name}</span>
        <span className="text-[13px] text-[#64748B] font-mono">{value.dial}</span>
        <ChevronDown className={`h-4 w-4 text-[#64748B] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 max-h-72 w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-xl animate-in fade-in-0 zoom-in-95">
          <div className="p-2 border-b border-[#E2E8F0]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un pays (ex: France, États-Unis, Bénin...)"
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] outline-none focus:border-[#0F172A] text-[#0F172A] placeholder:text-[#94A3B8]"
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
                    c.code === value.code ? "bg-[#F1F5F9] text-[#0F172A] font-bold" : "hover:bg-[#F8FAFC] text-[#334155]"
                  }`}
                >
                  <Flag code={c.code} />
                  <span className="flex-1 text-xs sm:text-sm">{c.name}</span>
                  <span className="text-[12px] text-[#64748B] font-mono">{c.dial}</span>
                  {c.code === value.code && <Check className="h-3.5 w-3.5 text-[#0F172A] ml-1" />}
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
  const queryCountry = params.get("country");

  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [product, setProduct] = useState<Product | null>(null);
  const [storeName, setStoreName] = useState("DUKAIO");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states: auto-select country from query params, session storage, or default
  const resolveInitialCountry = (): SaaSPayCountry => {
    if (queryCountry) {
      const matchQuery = SAASPAY_COUNTRIES.find((c) => c.code.toLowerCase() === queryCountry.toLowerCase());
      if (matchQuery) return matchQuery;
    }
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("dukaio_geo_country_code") || localStorage.getItem("dukaio_geo_country_code");
      if (saved) {
        const matchSaved = SAASPAY_COUNTRIES.find((c) => c.code.toLowerCase() === saved.toLowerCase());
        if (matchSaved) return matchSaved;
      }
    }
    return SAASPAY_COUNTRIES[0];
  };

  const initialC = resolveInitialCountry();
  const [country, setCountry] = useState<SaaSPayCountry>(initialC);
  const [userManuallySelectedCountry, setUserManuallySelectedCountry] = useState(Boolean(queryCountry));
  const [method, setMethod] = useState<MethodId>(initialC.methods[0] || "mtn");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Promo code states
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    id: string;
    code: string;
    discount_percent: number | null;
    discount_amount: number | null;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [showPromoBox, setShowPromoBox] = useState(false);

  // Payment flow state
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "pending" | "bank_transfer" | "done" | "failed">("form");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [orderReference, setOrderReference] = useState<string>("");
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [bankTransfer, setBankTransfer] = useState<{
    bank_name: string;
    account_number: string;
    account_name: string;
    amount_expected: string | number;
    reference?: string;
    expires_at?: string;
  } | null>(null);
  const [bankTransferCheckoutUrl, setBankTransferCheckoutUrl] = useState<string>("");
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3600);

  // Force strict light mode on the checkout experience
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    if (wasDark) {
      root.classList.remove("dark");
    }
    return () => {
      if (window.location.pathname.startsWith("/dashboard")) {
        const savedTheme = localStorage.getItem("dukaio-theme");
        if (savedTheme === "dark") {
          root.classList.add("dark");
        }
      }
    };
  }, []);

  // Detect visitor's country on mount and on live network/VPN change
  useEffect(() => {
    let isMounted = true;

    detectUserCountry().then((geo) => {
      if (!isMounted || userManuallySelectedCountry) return;
      const matched = SAASPAY_COUNTRIES.find((c) => c.code.toLowerCase() === geo.countryCode.toLowerCase());
      if (matched) {
        setCountry(matched);
        if (matched.methods.length > 0) {
          setMethod(matched.methods[0]);
        }
      }
    });

    const handleGeoChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ countryCode: string }>;
      if (customEvent.detail?.countryCode && isMounted && !userManuallySelectedCountry) {
        const matched = SAASPAY_COUNTRIES.find((c) => c.code.toLowerCase() === customEvent.detail.countryCode.toLowerCase());
        if (matched) {
          setCountry(matched);
          if (matched.methods.length > 0) {
            setMethod(matched.methods[0]);
          }
        }
      }
    };

    window.addEventListener("dukaio_geo_change", handleGeoChange);
    return () => {
      isMounted = false;
      window.removeEventListener("dukaio_geo_change", handleGeoChange);
    };
  }, [userManuallySelectedCountry]);

  // Automatically select first method when country changes
  useEffect(() => {
    if (country.methods.length > 0 && !country.methods.includes(method)) {
      setMethod(country.methods[0]);
    }
  }, [country, method]);

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

  const originalPrice = product?.price || 0;

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discount_percent) {
      return Math.round((originalPrice * appliedPromo.discount_percent) / 100);
    }
    if (appliedPromo.discount_amount) {
      return Math.min(originalPrice, Math.round(Number(appliedPromo.discount_amount)));
    }
    return 0;
  }, [appliedPromo, originalPrice]);

  const priceAmount = Math.max(0, originalPrice - discountAmount);
  const currencyCode = country.currency || getCurrencyForCountry(country.code);
  const isForeignCurrency = currencyCode !== "XOF" && currencyCode !== "XAF";
  const convertedPrice = useMemo(() => {
    if (!isForeignCurrency || priceAmount === 0) return null;
    return convertFromXOF(priceAmount, currencyCode);
  }, [priceAmount, currencyCode, isForeignCurrency]);
  const t = (fr: string, en: string) => (lang === "fr" ? fr : en);

  // Auto-apply promo code from URL query param if present (?coupon=... or ?promo=... or ?code=...)
  useEffect(() => {
    const queryPromo = params.get("coupon") || params.get("promo") || params.get("code");
    if (queryPromo && product && !appliedPromo) {
      const applyInitial = async () => {
        try {
          const { data } = await supabase.rpc("validate_promo_code", {
            p_code: queryPromo.trim().toUpperCase(),
            p_product_id: product.id,
            p_creator_id: product.creator_id,
          });
          if (data?.valid) {
            setAppliedPromo({
              id: data.id,
              code: data.code,
              discount_percent: data.discount_percent ? Number(data.discount_percent) : null,
              discount_amount: data.discount_amount ? Number(data.discount_amount) : null,
            });
            setShowPromoBox(true);
            toast.success(`Code promo ${data.code} appliqué automatiquement !`);
          }
        } catch (e) {
          console.warn("Auto coupon validation failed:", e);
        }
      };
      applyInitial();
    }
  }, [product, params]);

  const handleApplyPromo = async () => {
    const clean = promoInput.trim().toUpperCase();
    if (!clean) {
      setPromoError(t("Veuillez saisir un code promo.", "Please enter a promo code."));
      return;
    }
    if (!product) return;

    setPromoLoading(true);
    setPromoError(null);

    try {
      const { data, error: rpcErr } = await supabase.rpc("validate_promo_code", {
        p_code: clean,
        p_product_id: product.id,
        p_creator_id: product.creator_id,
      });

      if (rpcErr) throw rpcErr;

      if (!data?.valid) {
        const msg = data?.error || t("Code promo invalide", "Invalid promo code");
        setPromoError(msg);
        toast.error(msg);
        return;
      }

      setAppliedPromo({
        id: data.id,
        code: data.code,
        discount_percent: data.discount_percent ? Number(data.discount_percent) : null,
        discount_amount: data.discount_amount ? Number(data.discount_amount) : null,
      });

      const discText = data.discount_percent
        ? `-${data.discount_percent}%`
        : `-${fmt(Number(data.discount_amount))} FCFA`;
      toast.success(t(`Code promo ${data.code} appliqué (${discText}) !`, `Promo code ${data.code} applied (${discText})!`));
      setShowPromoBox(false);
      setPromoInput("");
    } catch (err: any) {
      const msg = err.message || t("Erreur lors de la validation", "Validation error");
      setPromoError(msg);
      toast.error(msg);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
    toast.info(t("Code promo retiré", "Promo code removed"));
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
  const isNameValid = customerName.trim().length >= 2;
  const isPhoneValid = phone.replace(/\D/g, "").length >= 8;

  const currentMethodMeta = SAASPAY_METHODS[method] || SAASPAY_METHODS.mtn;
  const isFormValid =
    isNameValid &&
    isEmailValid &&
    (currentMethodMeta.kind !== "momo" || isPhoneValid);

  // -------------------------------------------------------------
  // Restore pending transaction from localStorage on mount (e.g. if user refreshed after network cut)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!productId) return;
    try {
      const raw = localStorage.getItem("dukaio_active_tx");
      if (raw) {
        const tx = JSON.parse(raw);
        if (tx.productId === productId && Date.now() - tx.timestamp < 15 * 60 * 1000) {
          if (tx.reference) setOrderReference(tx.reference);
          if (tx.paymentId) setPaymentId(tx.paymentId);
          if (tx.customerEmail) setCustomerEmail(tx.customerEmail);
          if (tx.customerName) setCustomerName(tx.customerName);
          if (tx.phone) setPhone(tx.phone);
          if (tx.method) setMethod(tx.method);
          setStep("pending");

          // Check if already finalized while offline
          supabase.functions
            .invoke("saaspay-status", {
              body: {
                paymentId: tx.paymentId || tx.reference,
                reference: tx.reference,
              },
            })
            .then(({ data }) => {
              if (data?.status === "success") {
                setCompletedOrderId(data.orderId || null);
                setStep("done");
                try { localStorage.removeItem("dukaio_active_tx"); } catch {}
              }
            })
            .catch(() => {});
        } else if (Date.now() - tx.timestamp >= 15 * 60 * 1000) {
          localStorage.removeItem("dukaio_active_tx");
        }
      }
    } catch {}
  }, [productId]);

  // -------------------------------------------------------------
  // Online / Offline network listeners
  // -------------------------------------------------------------
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (step === "pending" || step === "bank_transfer") {
        toast.success(t("Connexion rétablie ! Vérification du statut...", "Connection restored! Checking status..."));
        verifyStatus(false);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [step, orderReference, paymentId]);

  // -------------------------------------------------------------
  // Verify status helper
  // -------------------------------------------------------------
  const verifyStatus = async (showToast = false) => {
    if (!orderReference && !paymentId) return;
    setCheckingStatus(true);
    try {
      const { data } = await supabase.functions.invoke("saaspay-status", {
        body: {
          paymentId: paymentId || orderReference,
          reference: orderReference,
        },
      });

      if (data?.status === "success") {
        setCompletedOrderId(data.orderId || null);
        setStep("done");
        try { localStorage.removeItem("dukaio_active_tx"); } catch {}
        toast.success(t("Paiement validé avec succès !", "Payment successfully approved!"));
      } else if (data?.status === "failed") {
        setErrorMessage(data.error || t("Paiement refusé ou annulé.", "Payment declined or cancelled."));
        setStep("failed");
        try { localStorage.removeItem("dukaio_active_tx"); } catch {}
      } else if (showToast) {
        toast.info(t("En attente de validation. Veuillez vérifier votre téléphone pour saisir le code PIN.", "Awaiting confirmation. Please check your phone for the PIN prompt."));
      }
    } catch (pollErr) {
      console.warn("Status check network glitch:", pollErr);
      if (showToast) {
        toast.info(t("Vérification en attente de reconnexion...", "Verification awaiting connection..."));
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  // -------------------------------------------------------------
  // Submit payment to SaaSPay (with African USSD Hotspot resilience)
  // -------------------------------------------------------------
  const handlePayment = async () => {
    if (!product) return;

    // Handle free product (or 100% discounted product)
    if (priceAmount === 0) {
      setSubmitting(true);
      try {
        const { data, error: freeErr } = await supabase.functions.invoke("process-free-order", {
          body: {
            name: customerName.trim(),
            email: customerEmail.trim().toLowerCase(),
            productId: product.id,
            promoCode: appliedPromo?.code || null,
          },
        });
        if (freeErr) throw freeErr;
        if (data?.error) throw new Error(data.error);

        setOrderReference(data?.orderId || "DK-FREE");
        setCompletedOrderId(data?.orderId || null);
        setStep("done");
        toast.success(appliedPromo ? "Produit obtenu gratuitement grâce au code promo !" : "Produit gratuit obtenu avec succès !");
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

    const saaspayMethod = getSaaSPayMethodCode(method, country.code);
    const fullPhone = `${country.dial}${phone.replace(/\D/g, "")}`;
    const clientRef = `DK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    setOrderReference(clientRef);
    setSubmitting(true);
    setErrorMessage("");

    const isMoMo = currentMethodMeta.kind === "momo";

    // For Mobile Money (Celtiis, MTN, Moov, Orange):
    // Save transaction locally and switch IMMEDIATELY to pending
    // because cellular operators immediately pause 4G data/Wi-Fi hotspot during USSD PIN prompt
    if (isMoMo) {
      try {
        localStorage.setItem(
          "dukaio_active_tx",
          JSON.stringify({
            reference: clientRef,
            productId: product.id,
            customerEmail: customerEmail.trim().toLowerCase(),
            customerName: customerName.trim(),
            phone: fullPhone,
            method,
            amount: priceAmount,
            countryCode: country.code,
            timestamp: Date.now(),
          })
        );
      } catch {}

      setStep("pending");
      toast.info(t("Demande envoyée ! Consultez votre téléphone pour saisir votre code PIN.", "Request sent! Check your phone to enter your PIN."));
    }

    try {
      const { data, error: callErr } = await supabase.functions.invoke("saaspay-create-payment", {
        body: {
          reference: clientRef,
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
            promo_code: appliedPromo?.code || null,
            original_price: originalPrice,
            return_url: `${window.location.origin}/checkout/${product.id}?ref=${clientRef}`,
            cancel_url: window.location.href,
          },
        },
      });

      if (callErr) {
        const isNetInterrupted =
          !navigator.onLine ||
          callErr.message?.toLowerCase().includes("failed to fetch") ||
          callErr.message?.toLowerCase().includes("network") ||
          callErr.message?.toLowerCase().includes("timeout") ||
          callErr.message?.toLowerCase().includes("load failed");

        if (isMoMo && isNetInterrupted) {
          console.warn("[Checkout] Cellular hotspot paused during USSD push. Resilient pending maintained.");
          return;
        }
        throw callErr;
      }

      if (data?.error) {
        throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
      }

      if (data?.paymentId) setPaymentId(data.paymentId);
      if (data?.reference) setOrderReference(data.reference);

      // If dynamic Nigerian bank transfer returned, show native bank transfer UI
      if (data?.bankTransfer) {
        setBankTransfer(data.bankTransfer);
        setBankTransferCheckoutUrl(data.checkoutUrl || "");
        setStep("bank_transfer");
        toast.info(t("Coordonnées bancaires générées !", "Bank transfer account generated!"));
        return;
      }

      // If Checkout URL returned (Cards, Crypto, Wave Web), redirect
      if (data?.checkoutUrl) {
        toast.info("Redirection vers la passerelle sécurisée...");
        window.location.href = data.checkoutUrl;
        return;
      }

      if (!isMoMo) {
        setStep("pending");
        toast.info("Demande envoyée ! Consultez votre téléphone pour valider le code PIN.");
      }
    } catch (err: any) {
      const isNetInterrupted =
        !navigator.onLine ||
        err.message?.toLowerCase().includes("failed to fetch") ||
        err.message?.toLowerCase().includes("network") ||
        err.message?.toLowerCase().includes("load failed");

      if (isMoMo && isNetInterrupted) {
        console.warn("[Checkout] Network pause caught during USSD prompt. Staying in pending.");
        setStep("pending");
        return;
      }

      setStep("form");
      setErrorMessage(err.message || "Impossible de lancer le paiement.");
      toast.error(err.message || "Erreur lors du paiement");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Countdown timer for Bank Transfer
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== "bank_transfer") return;
    if (bankTransfer?.expires_at) {
      const exp = new Date(bankTransfer.expires_at).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((exp - now) / 1000));
      setCountdownSeconds(diffSec > 0 ? diffSec : 3600);
    } else {
      setCountdownSeconds(3600);
    }

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, bankTransfer]);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} ${t("copié dans le presse-papier !", "copied to clipboard!")}`);
  };

  // -------------------------------------------------------------
  // Realtime & Polling check when step is 'pending' or 'bank_transfer'
  // -------------------------------------------------------------
  useEffect(() => {
    if ((step !== "pending" && step !== "bank_transfer") || (!paymentId && !orderReference)) return;

    let isSubscribed = true;

    // Polling interval every 3 seconds (only when online)
    const interval = setInterval(async () => {
      if (!isSubscribed) return;
      if (typeof navigator !== "undefined" && !navigator.onLine) return;

      try {
        const { data } = await supabase.functions.invoke("saaspay-status", {
          body: {
            paymentId: paymentId || orderReference,
            reference: orderReference,
          },
        });

        if (!isSubscribed) return;

        if (data?.status === "success") {
          setCompletedOrderId(data.orderId || null);
          setStep("done");
          try { localStorage.removeItem("dukaio_active_tx"); } catch {}
          toast.success("Paiement validé avec succès !");
          clearInterval(interval);
        } else if (data?.status === "failed") {
          setErrorMessage(data.error || "Paiement refusé ou annulé.");
          setStep("failed");
          try { localStorage.removeItem("dukaio_active_tx"); } catch {}
          clearInterval(interval);
        }
      } catch (pollErr) {
        // Silently catch momentary network dips
      }
    }, 3000);

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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#0F172A] mb-3" />
        <p className="text-sm font-semibold text-[#64748B] animate-pulse">
          Préparation du paiement sécurisé...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-[#0F172A] mb-2">Produit introuvable</h1>
        <p className="text-sm text-[#64748B] max-w-sm mb-6">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white font-semibold text-xs hover:bg-[#1E293B]"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      <SEOHead
        title={`Paiement sécurisé — ${product.title} | ${storeName}`}
        description={`Réglez votre commande en toute sécurité par Mobile Money ou carte bancaire.`}
      />

      <div className="mx-auto grid max-w-[1080px] gap-4 px-4 py-6 sm:px-6 md:py-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-6">
        {/* ======================================================== */}
        {/* LEFT COLUMN: ORDER SUMMARY                               */}
        {/* ======================================================== */}
        <aside className="h-fit rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] sm:p-7 select-none">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B] transition-colors hover:text-[#0F172A] mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t("Retour", "Back")}
          </button>

          <div>
            <Brand storeName={storeName} logoUrl={logoUrl} />
          </div>

          <div className="mt-6">
            <p className="text-[13px] text-[#64748B] font-medium">
              {t("Montant à payer", "Amount due")}
            </p>
            <div className="mt-1 flex items-baseline gap-2.5 flex-wrap">
              {priceAmount === 0 ? (
                <span className="font-black text-4xl sm:text-5xl leading-none tracking-tight text-[#0F172A]">
                  {t("Gratuit", "Free")}
                </span>
              ) : isForeignCurrency && convertedPrice !== null ? (
                <>
                  <span className="font-black text-4xl sm:text-5xl leading-none tracking-tight text-[#0F172A]">
                    {formatMoney(convertedPrice, currencyCode)}
                  </span>
                  {appliedPromo && discountAmount > 0 && originalPrice > 0 && (
                    <span className="text-sm font-semibold text-[#94A3B8] line-through decoration-red-400">
                      {formatMoney(convertFromXOF(originalPrice, currencyCode), currencyCode)}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="font-black text-4xl sm:text-5xl leading-none tracking-tight text-[#0F172A]">
                    {fmt(priceAmount)}
                  </span>
                  <span className="text-sm font-bold text-[#64748B]">FCFA</span>
                  {appliedPromo && discountAmount > 0 && originalPrice > 0 && (
                    <span className="text-sm font-semibold text-[#94A3B8] line-through decoration-red-400">
                      {fmt(originalPrice)} FCFA
                    </span>
                  )}
                </>
              )}
            </div>
            {isForeignCurrency && convertedPrice !== null && priceAmount > 0 && (
              <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200/80 px-2.5 py-1 text-xs text-blue-800 font-semibold">
                <span>Soit {fmt(priceAmount)} FCFA</span>
                <span className="text-[10px] font-medium text-blue-600/80">(Taux officiel direct)</span>
              </div>
            )}
          </div>

          {/* Product card info */}
          <div className="mt-6 divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC]">
            <div className="flex items-start gap-3 p-4">
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover border border-[#E2E8F0]"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A]">
                  <Package className="h-5 w-5" strokeWidth={1.8} />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#0F172A] truncate">{product.title}</p>
                <p className="text-[12px] text-[#64748B] mt-0.5 capitalize">
                  {product.type.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            <Row
              label={t("Sous-total", "Subtotal")}
              value={
                originalPrice === 0
                  ? "0 FCFA"
                  : isForeignCurrency && convertedPrice !== null
                  ? `${formatMoney(convertFromXOF(originalPrice, currencyCode), currencyCode)} (${fmt(originalPrice)} FCFA)`
                  : `${fmt(originalPrice)} FCFA`
              }
            />
            {appliedPromo && discountAmount > 0 && (
              <div className="flex items-center justify-between gap-4 px-4 py-3 text-[13px] bg-emerald-50/70 border-t border-emerald-100">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <Tag className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{t("Réduction", "Discount")} ({appliedPromo.code})</span>
                </span>
                <span className="font-bold text-emerald-700 font-mono">
                  -{fmt(discountAmount)} FCFA
                  {isForeignCurrency && (
                    <span className="ml-1 text-[11px] font-normal text-emerald-600">
                      (~{formatMoney(convertFromXOF(discountAmount, currencyCode), currencyCode)})
                    </span>
                  )}
                </span>
              </div>
            )}
            <Row label={t("Frais de transaction", "Processing fees")} value="0 FCFA (Inclus)" />
            {customerEmail && (
              <Row label={t("Reçu envoyé à", "Receipt sent to")} value={customerEmail} />
            )}
            {orderReference && (
              <Row label={t("Référence", "Reference")} value={orderReference} mono />
            )}
          </div>

          {/* Promo Code Box */}
          <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 transition-all">
            {!appliedPromo ? (
              <div>
                {!showPromoBox ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPromoBox(true);
                      setPromoError(null);
                    }}
                    className="flex w-full items-center justify-between text-xs font-bold text-[#0F172A] hover:text-[#475569] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-[#0F172A]" />
                      <span>{t("Vous avez un code promo ?", "Have a promo code?")}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-[#0F172A] underline underline-offset-2">
                      {t("Ajouter", "Add")}
                    </span>
                  </button>
                ) : (
                  <div className="space-y-2 animate-in fade-in-50">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-[#0F172A]" />
                        <span>{t("Code promo", "Promo code")}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPromoBox(false);
                          setPromoError(null);
                        }}
                        className="text-[11px] text-[#64748B] hover:text-[#0F172A]"
                      >
                        {t("Fermer", "Close")}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyPromo();
                          }
                        }}
                        placeholder="Ex: PROMO20"
                        className="flex-1 h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#0F172A] transition-colors"
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={promoLoading || !promoInput.trim()}
                        onClick={handleApplyPromo}
                        className="h-10 px-4 rounded-lg bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                      >
                        {promoLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <span>{t("Appliquer", "Apply")}</span>
                        )}
                      </button>
                    </div>

                    {promoError && (
                      <p className="text-[11px] font-medium text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{promoError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs shrink-0">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black tracking-wider text-[#0F172A]">
                        {appliedPromo.code}
                      </span>
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {appliedPromo.discount_percent
                          ? `-${appliedPromo.discount_percent}%`
                          : `-${fmt(Number(appliedPromo.discount_amount || 0))} FCFA`}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      {t("Code promo actif", "Active promo code")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="p-1 rounded-lg text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors"
                  title={t("Retirer ce code", "Remove code")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Supported Methods Icons */}
          <div className="mt-5 flex flex-wrap items-center gap-1.5">
            {allSupportedMethods.slice(0, 8).map((id) => (
              <LogoBadge key={id} id={id} size="sm" />
            ))}
          </div>
          <p className="mt-2 text-[12px] text-[#64748B] font-medium">
            {t("Mobile Money et carte bancaire acceptés en temps réel.", "Instant Mobile Money and cards accepted.")}
          </p>

          <div className="mt-6 hidden items-start gap-3 rounded-xl border border-[#E2E8F0] p-4 lg:flex bg-[#F8FAFC]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A]">
              <Smartphone className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">
                {t("Payer depuis votre téléphone", "Pay from your phone")}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-[#64748B]">
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
        <main className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between">
          <div className="p-5 sm:p-7">
            {/* ---------------------------------------------------- */}
            {/* STEP 1: FORM                                         */}
            {/* ---------------------------------------------------- */}
            {step === "form" && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                {/* Header: Title + Language toggle */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl text-[#0F172A]">
                      {t("Moyen de paiement", "Payment method")}
                    </h1>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {t("Choisissez comment régler", "Choose how to pay")}{" "}
                      <span className="font-bold text-[#0F172A]">
                        {priceAmount === 0
                          ? t("Gratuit", "Free")
                          : isForeignCurrency && convertedPrice !== null
                          ? `${formatMoney(convertedPrice, currencyCode)} (${fmt(priceAmount)} FCFA)`
                          : `${fmt(priceAmount)} FCFA`}
                      </span>.
                    </p>
                  </div>

                  <div className="flex items-center rounded-lg border border-[#E2E8F0] p-0.5 text-[11px] font-bold bg-[#F8FAFC]">
                    {(["fr", "en"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={`rounded px-2.5 py-1 uppercase transition-colors ${
                          lang === l
                            ? "bg-[#0F172A] text-white shadow-2xs"
                            : "text-[#64748B] hover:text-[#0F172A]"
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
                    <label className="text-xs font-bold text-[#0F172A]">
                      {t("Votre pays de paiement", "Your country")}
                    </label>
                    <span className="hidden text-[11px] text-[#64748B] sm:inline">
                      {t("Adapte les réseaux Mobile Money disponibles", "Adapts available Mobile Money networks")}
                    </span>
                  </div>
                  <CountrySelect
                    value={country}
                    onChange={(c) => {
                      setUserManuallySelectedCountry(true);
                      setCountry(c);
                    }}
                  />
                </div>

                {/* Customer Information (Name & Email) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1.5">
                      {t("Votre nom complet", "Full name")}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Kouamé Koffi"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#0F172A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1.5">
                      {t("Votre adresse email", "Email address")}
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Ex: client@gmail.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#0F172A] transition-colors"
                    />
                    <span className="text-[10px] text-[#64748B] mt-1 block">
                      {t("Le reçu et le lien du produit seront envoyés ici.", "Your receipt and access will be sent here.")}
                    </span>
                  </div>
                </div>

                {/* Payment Methods (Radio Cards) */}
                {priceAmount > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold text-[#0F172A]">
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
                                ? "border-[#0F172A] bg-[#F8FAFC] shadow-2xs"
                                : "border-[#E2E8F0] hover:border-[#CBD5E1] bg-white"
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
                                  active ? "border-[#0F172A] bg-[#0F172A]" : "border-[#CBD5E1]"
                                }`}
                              >
                                {active && <span className="h-2 w-2 rounded-full bg-white" />}
                              </span>

                              <span className="flex-1 text-xs sm:text-sm font-bold text-[#0F172A]">
                                {meta.name}
                                {meta.kind === "momo" && (
                                  <span className="text-[#64748B] font-normal ml-1">
                                    {country.name}
                                  </span>
                                )}
                              </span>

                              <LogoBadge id={id} />
                            </button>

                            {/* Active Content: Phone Input for MoMo / Helper for Card */}
                            {active && (
                              <div className="border-t border-[#E2E8F0] px-4 pb-4 pt-3 space-y-2 animate-in fade-in-50">
                                {meta.kind === "momo" ? (
                                  <>
                                    <label className="text-xs font-semibold text-[#64748B] block">
                                      {t("Numéro de compte", "Account phone number")} {meta.name}
                                    </label>
                                    <div className="flex h-11 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white focus-within:border-[#0F172A] transition-colors">
                                      <span className="flex items-center gap-2 border-r border-[#E2E8F0] px-3 text-xs font-mono font-bold text-[#0F172A] bg-[#F8FAFC]">
                                        <Flag code={country.code} />
                                        <span>{country.dial}</span>
                                      </span>
                                      <input
                                        type="tel"
                                        inputMode="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, ""))}
                                        placeholder={country.placeholder}
                                        className="min-w-0 flex-1 bg-transparent px-3 text-sm font-mono outline-none placeholder:text-[#94A3B8] text-[#0F172A]"
                                      />
                                    </div>
                                    <p className="text-[11px] text-[#64748B]">
                                      {t(
                                        "Ce numéro recevra l'invite USSD pour saisir votre code PIN.",
                                        "This number will receive the USSD prompt to approve payment."
                                      )}
                                    </p>
                                  </>
                                ) : meta.kind === "card" ? (
                                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1.5">
                                    <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                                      <CreditCard className="h-4 w-4 text-[#0F172A]" />
                                      <span>Paiement sécurisé par Carte Bancaire</span>
                                    </div>
                                    <p className="text-[11px] text-[#64748B]">
                                      Vous serez redirigé vers la passerelle sécurisée 3D-Secure de votre banque pour valider votre carte Visa ou Mastercard en toute sérénité.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1.5">
                                    <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                                      <Sparkles className="h-4 w-4 text-[#0F172A]" />
                                      <span>Paiement en Cryptomonnaie</span>
                                    </div>
                                    <p className="text-[11px] text-[#64748B]">
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

                {/* Promo Code Box (Mobile & Form Column) */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 transition-all">
                  {!appliedPromo ? (
                    <div>
                      {!showPromoBox ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowPromoBox(true);
                            setPromoError(null);
                          }}
                          className="flex w-full items-center justify-between text-xs font-bold text-[#0F172A] hover:text-primary transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Tag className="h-3.5 w-3.5 text-primary" />
                            <span>{t("Vous avez un code promo ?", "Have a promo code?")}</span>
                          </span>
                          <span className="text-xs font-bold text-primary underline underline-offset-2">
                            {t("Ajouter un code", "Add code")}
                          </span>
                        </button>
                      ) : (
                        <div className="space-y-2 animate-in fade-in-50">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5 text-[#0F172A]" />
                              <span>{t("Code promo", "Promo code")}</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setShowPromoBox(false);
                                setPromoError(null);
                              }}
                              className="text-[11px] text-[#64748B] hover:text-[#0F172A]"
                            >
                              {t("Fermer", "Close")}
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={promoInput}
                              onChange={(e) => {
                                setPromoInput(e.target.value.toUpperCase());
                                setPromoError(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleApplyPromo();
                                }
                              }}
                              placeholder="Ex: PROMO20"
                              className="flex-1 h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#0F172A] transition-colors"
                              autoFocus
                            />
                            <button
                              type="button"
                              disabled={promoLoading || !promoInput.trim()}
                              onClick={handleApplyPromo}
                              className="h-10 px-4 rounded-lg bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                            >
                              {promoLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <span>{t("Appliquer", "Apply")}</span>
                              )}
                            </button>
                          </div>

                          {promoError && (
                            <p className="text-[11px] font-medium text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              <span>{promoError}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs shrink-0">
                          <Check className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black tracking-wider text-[#0F172A]">
                              {appliedPromo.code}
                            </span>
                            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {appliedPromo.discount_percent
                                ? `-${appliedPromo.discount_percent}%`
                                : `-${fmt(Number(appliedPromo.discount_amount || 0))} FCFA`}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-700 font-medium">
                            {t("Code promo appliqué", "Promo code applied")}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="p-1 rounded-lg text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors"
                        title={t("Retirer ce code", "Remove code")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  disabled={!isFormValid || submitting}
                  onClick={handlePayment}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] text-sm font-extrabold text-white shadow-sm transition-all hover:bg-[#1E293B] active:scale-98 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>{t("Initialisation sécurisée...", "Securing payment...")}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>
                        {priceAmount === 0
                          ? t("Obtenir gratuitement", "Get for free")
                          : isForeignCurrency && convertedPrice !== null
                          ? `${t("Payer", "Pay")} ${formatMoney(convertedPrice, currencyCode)} (${fmt(priceAmount)} FCFA)`
                          : `${t("Payer", "Pay")} ${fmt(priceAmount)} FCFA`}
                      </span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-[#64748B]">
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
              <div className="flex min-h-[440px] flex-col items-center justify-center text-center p-4 animate-in fade-in-50">
                <div className="relative flex h-16 w-16 items-center justify-center mb-4">
                  <span className="absolute inset-0 animate-spin rounded-full border-2 border-[#E2E8F0] border-t-[#0F172A]" />
                  <LogoBadge id={method} size="sm" />
                </div>

                {/* Connection Status Pill */}
                <div className="mb-3">
                  {!isOnline ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                      <WifiOff className="h-3.5 w-3.5 text-amber-600" />
                      <span>{t("Connexion mobile en pause (code PIN en cours)", "Mobile data paused (PIN in progress)")}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{t("Connecté — Vérification en direct", "Connected — Checking live")}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold tracking-tight text-[#0F172A]">
                  {t("Confirmez sur votre téléphone", "Confirm on your phone")}
                </h2>

                <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#64748B]">
                  {t(
                    `Une demande de ${fmt(priceAmount)} FCFA ${isForeignCurrency && convertedPrice !== null ? `(~${formatMoney(convertedPrice, currencyCode)}) ` : ""}a été envoyée au ${country.dial} ${phone}. Saisissez votre code secret ${currentMethodMeta.name} pour valider la commande.`,
                    `A payment request of ${fmt(priceAmount)} FCFA ${isForeignCurrency && convertedPrice !== null ? `(~${formatMoney(convertedPrice, currencyCode)}) ` : ""}was sent to ${country.dial} ${phone}. Enter your secret ${currentMethodMeta.name} PIN to approve.`
                  )}
                </p>

                {/* African Hotspot / Single-SIM Explanation Notice */}
                <div className="mt-4 w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-left text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                    <Smartphone className="h-4 w-4 text-[#0F172A] shrink-0" />
                    <span>{t("Partage Wi-Fi ou connexion coupée ?", "Wi-Fi hotspot or data paused?")}</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    {t(
                      "C'est tout à fait normal : lorsqu'un opérateur (Celtiis, MTN, Moov) affiche l'invite de code PIN, le réseau mobile suspend brièvement la 4G/Wi-Fi. Dès que vous avez validé votre code PIN sur votre téléphone, votre connexion reviendra aussitôt et votre achat sera confirmé !",
                      "This is normal: mobile operators pause cellular data while the PIN prompt is active. Once you enter your PIN, connection will resume immediately and confirm your order!"
                    )}
                  </p>
                </div>

                {/* Active check pulse */}
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0F172A]" />
                  <span>{t("En attente de votre validation PIN...", "Waiting for your PIN approval...")}</span>
                </div>

                {/* Primary Action Button: Manual Verify Now */}
                <div className="mt-6 w-full max-w-xs space-y-2.5">
                  <button
                    type="button"
                    disabled={checkingStatus}
                    onClick={() => verifyStatus(true)}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] text-xs font-bold text-white shadow-sm hover:bg-[#1E293B] transition-colors disabled:opacity-50 cursor-pointer active:scale-98"
                  >
                    {checkingStatus ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>{t("Vérification en cours...", "Checking...")}</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>{t("J'ai validé mon code PIN — Vérifier", "I entered my PIN — Verify")}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("form");
                      setPaymentId(null);
                      try { localStorage.removeItem("dukaio_active_tx"); } catch {}
                    }}
                    className="w-full h-10 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                  >
                    {t("Annuler ou modifier le numéro", "Cancel or change phone number")}
                  </button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* STEP 2B: BANK TRANSFER (Nigeria Sterling Bank Native) */}
            {/* ---------------------------------------------------- */}
            {step === "bank_transfer" && bankTransfer && (
              <div className="flex min-h-[460px] flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in-50">
                {/* Language Toggle in top right */}
                <div className="w-full flex justify-end mb-2">
                  <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-0.5 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setLang("fr")}
                      className={`px-2 py-0.5 rounded-md transition-all ${lang === "fr" ? "bg-white text-[#0F172A] shadow-xs" : "text-[#64748B]"}`}
                    >
                      🇫🇷 FR
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang("en")}
                      className={`px-2 py-0.5 rounded-md transition-all ${lang === "en" ? "bg-white text-[#0F172A] shadow-xs" : "text-[#64748B]"}`}
                    >
                      🇬🇧 EN
                    </button>
                  </div>
                </div>

                {/* Bank Icon Header */}
                <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 shadow-2xs border border-purple-100">
                  <Landmark className="h-7 w-7" />
                </div>

                <h2 className="text-lg font-extrabold tracking-tight text-[#0F172A]">
                  {t("Effectue le virement bancaire", "Make the bank transfer")}
                </h2>

                <p className="mt-1 text-xs text-[#64748B] text-center max-w-sm">
                  {t(
                    `Envoie ${fmt(Number(bankTransfer.amount_expected))} NGN vers le compte ci-dessous avant expiration.`,
                    `Send ${fmt(Number(bankTransfer.amount_expected))} NGN to the account below before expiry.`
                  )}
                </p>

                {/* Countdown Badge */}
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-[11px] font-bold text-amber-800">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>{t("Expire dans", "Expires in")} {formatCountdown(countdownSeconds)}</span>
                </div>

                {/* Bank Account Details Card */}
                <div className="mt-5 w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 divide-y divide-[#E2E8F0]/70 text-xs">
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[#64748B] font-medium">{t("Banque", "Bank")}</span>
                    <span className="font-bold text-[#0F172A] text-right">{bankTransfer.bank_name || "Sterling bank"}</span>
                  </div>

                  <div className="flex items-center justify-between py-2.5 gap-2">
                    <span className="text-[#64748B] font-medium">{t("Numéro de compte", "Account number")}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-[#0F172A] text-sm tracking-wider select-all">
                        {bankTransfer.account_number}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(bankTransfer.account_number, "Numéro de compte")}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50 transition-colors shadow-2xs active:scale-95"
                        title={t("Copier le numéro de compte", "Copy account number")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[#64748B] font-medium">{t("Bénéficiaire", "Beneficiary")}</span>
                    <span className="font-bold text-[#0F172A] text-right">{bankTransfer.account_name || "Korapay-PAL AFRICA"}</span>
                  </div>

                  <div className="flex items-center justify-between py-2.5 gap-2">
                    <span className="text-[#64748B] font-medium">{t("Montant", "Amount")}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-emerald-700 text-sm tracking-tight">
                        {fmt(Number(bankTransfer.amount_expected))} NGN
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(String(Math.round(Number(bankTransfer.amount_expected))), "Montant")}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50 transition-colors shadow-2xs active:scale-95"
                        title={t("Copier le montant", "Copy amount")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pulsing Status Pill */}
                <div className="mt-5 flex flex-col items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700">
                    <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                    <span>{t("Vérification en cours", "Verification in progress")}</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] text-center max-w-xs">
                    {t(
                      "La page se mettra à jour automatiquement dès réception du virement.",
                      "This page will update automatically once the transfer is received."
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-2.5 w-full max-w-md">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!paymentId) return;
                      try {
                        toast.info(t("Vérification du statut bancaire...", "Checking bank status..."));
                        const { data } = await supabase.functions.invoke("saaspay-status", {
                          body: { paymentId, reference: orderReference },
                        });
                        if (data?.status === "success") {
                          setCompletedOrderId(data.orderId || null);
                          setStep("done");
                          toast.success(t("Paiement validé avec succès !", "Payment successfully approved!"));
                        } else {
                          toast.info(t("En attente de réception du virement...", "Awaiting transfer reception..."));
                        }
                      } catch {
                        toast.error(t("Erreur de connexion", "Connection error"));
                      }
                    }}
                    className="flex-1 h-11 rounded-xl bg-[#0F172A] text-xs font-bold text-white hover:bg-[#1E293B] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{t("J'ai effectué le virement", "I have made the transfer")}</span>
                  </button>

                  {bankTransferCheckoutUrl && (
                    <a
                      href={bankTransferCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-11 rounded-xl border border-[#CBD5E1] bg-white text-xs font-bold text-[#0F172A] hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>{t("Ouvrir page officielle", "Open official page")}</span>
                      <ExternalLink className="h-3 w-3 text-[#64748B]" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setPaymentId(null);
                    setBankTransfer(null);
                  }}
                  className="mt-3 text-[11px] font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  {t("Annuler ou changer de moyen", "Cancel or change method")}
                </button>

                {/* Footer Security */}
                <div className="mt-6 flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
                  <Lock className="h-3 w-3" />
                  <span>{t("Paiement sécurisé propulsé par SasPay", "Secure payment powered by SasPay")}</span>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* STEP 3: DONE (Payment Success)                       */}
            {/* ---------------------------------------------------- */}
            {step === "done" && (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center p-4 animate-in zoom-in-95 duration-200">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-4 shadow-2xs">
                  <Check className="h-7 w-7 stroke-[2.5]" />
                </span>

                <h2 className="text-xl font-extrabold tracking-tight text-[#0F172A]">
                  {t("Paiement confirmé !", "Payment confirmed!")}
                </h2>

                <p className="mt-2 text-xs text-[#64748B] max-w-sm">
                  {t(
                    `Votre commande a été validée avec succès. Un reçu et vos accès ont été envoyés à`,
                    `Your order has been successfully approved. A receipt has been sent to`
                  )}{" "}
                  <span className="font-bold text-[#0F172A]">{customerEmail}</span>.
                </p>

                <div className="mt-6 w-full max-w-sm divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] text-left bg-[#F8FAFC] overflow-hidden">
                  <Row
                    label={t("Montant payé", "Amount paid")}
                    value={
                      priceAmount === 0
                        ? "0 FCFA"
                        : isForeignCurrency && convertedPrice !== null
                        ? `${formatMoney(convertedPrice, currencyCode)} (${fmt(priceAmount)} FCFA)`
                        : `${fmt(priceAmount)} FCFA`
                    }
                  />
                  <Row label={t("Moyen utilisé", "Payment method")} value={currentMethodMeta.name} />
                  {orderReference && (
                    <Row label={t("Référence", "Reference")} value={orderReference} mono />
                  )}
                </div>

                <div className="mt-6 w-full max-w-sm space-y-2">
                  {(() => {
                    const downloadLinks = extractDownloadUrls(product.download_url);
                    if (downloadLinks.length === 0) {
                      return (
                        <button
                          onClick={() => navigate(`/buyer/orders`)}
                          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] text-xs font-bold text-white shadow-sm hover:bg-[#1E293B]"
                        >
                          <span>{t("Consulter ma commande", "View my order")}</span>
                        </button>
                      );
                    }
                    return downloadLinks.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] text-xs font-bold text-white shadow-sm hover:bg-[#1E293B]"
                      >
                        <Package className="h-4 w-4" />
                        <span>
                          {downloadLinks.length > 1
                            ? `${t("Télécharger le fichier", "Download file")} ${idx + 1}`
                            : t("Télécharger mon produit", "Download my product")}
                        </span>
                      </a>
                    ));
                  })()}

                  <button
                    onClick={() => navigate(-1)}
                    className="flex h-10 w-full items-center justify-center rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
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
                <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
                  <AlertCircle className="h-7 w-7" />
                </div>

                <h2 className="text-lg font-bold text-[#0F172A]">
                  {t("Le paiement n'a pas abouti", "Payment could not be completed")}
                </h2>

                <p className="mt-2 text-xs text-[#64748B] max-w-sm">
                  {errorMessage || t("Le délai de validation a expiré ou le paiement a été refusé par l'opérateur.", "The approval timeout expired or payment was cancelled by the carrier.")}
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
                  <button
                    onClick={() => {
                      setStep("form");
                      setPaymentId(null);
                    }}
                    className="flex-1 h-11 rounded-xl bg-[#0F172A] text-xs font-bold text-white flex items-center justify-center gap-2 hover:bg-[#1E293B]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{t("Réessayer", "Try again")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer of Card */}
          <div className="flex flex-col gap-2 border-t border-[#E2E8F0] px-5 py-4 text-[12px] text-[#64748B] sm:flex-row sm:items-center sm:justify-between sm:px-7 bg-[#F8FAFC]">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-4 w-4 text-[#0F172A]" strokeWidth={1.8} />
              {t("Paiement chiffré 256-bit, données jamais conservées", "256-bit encrypted, data never stored")}
            </span>
            <a
              href="https://wa.me/2290157385885"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-[#0F172A] hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.8} />
              {t("Besoin d'aide ? WhatsApp", "Need help? WhatsApp")}
            </a>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[12px] text-[#64748B] lg:col-span-2">
          <span className="font-semibold text-[#0F172A]">© 2026 DUKAIO</span>
          <span className="hover:text-[#0F172A] cursor-pointer">{t("Confidentialité", "Privacy")}</span>
          <span className="hover:text-[#0F172A] cursor-pointer">{t("Conditions de vente", "Terms")}</span>
          <span className="hover:text-[#0F172A] cursor-pointer">{t("Sécurité garantie", "Security")}</span>
        </footer>
      </div>
    </div>
  );
}
