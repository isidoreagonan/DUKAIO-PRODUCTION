import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Wallet as WalletIcon, Loader2, Plus, Trash2, ShieldCheck,
  ChevronDown, Eye, EyeOff,
  ArrowUpRight, RotateCcw, Smartphone, AlertCircle,
  Receipt, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { convertFromXOF, formatMoney, getCurrencyForCountry } from "@/lib/currency";
import { detectUserCountry } from "@/lib/geo";
import {
  SAASPAY_PAYOUT_COUNTRIES,
  SAASPAY_METHODS,
  getSaaSPayNetwork,
} from "@/data/saaspayProviders";
import { isAdminUser } from "@/lib/admin";

interface SavedWallet {
  id: string;
  name: string;
  country: string;
  provider_code: string;
  phone: string;
  holder_first_name: string;
  holder_last_name: string;
  is_default: boolean;
  created_at?: string;
}

interface WalletTx {
  id: string;
  type: "sale" | "withdrawal" | "refund" | "commission" | "conversion";
  label: string;
  amount: number;
  currency: string;
  date: string;
  status: "completed" | "processing" | "pending" | "failed";
}

const formatFmt = (n: number) =>
  Math.round(n)
    .toLocaleString("fr-FR")
    .replace(/\u202f|\u00a0/g, " ");

// Helper to resolve operator logo, official name and country flag
const getOperatorMeta = (providerCode: string, countryCode?: string) => {
  const network = getSaaSPayNetwork(providerCode);
  if (network) {
    const opMeta = SAASPAY_METHODS[network.operatorKey] || SAASPAY_METHODS.mtn;
    return {
      code: network.code,
      name: network.name,
      logo: opMeta.logos?.[0] || null,
      flagUrl: `https://flagcdn.com/w40/${network.countryCode}.png`,
      country: network.countryCode.toUpperCase(),
      currency: network.currency,
    };
  }

  const parts = (providerCode || "").toLowerCase().split("_");
  const method = parts[0] || "mtn";
  const cc = parts[1] || (countryCode || "").toLowerCase() || "bj";
  const meta = SAASPAY_METHODS[method] || { name: providerCode, logos: [] };
  return {
    code: providerCode,
    name: meta.name || providerCode,
    logo: meta.logos?.[0] || null,
    flagUrl: cc ? `https://flagcdn.com/w40/${cc}.png` : null,
    country: cc.toUpperCase(),
    currency: "XOF",
  };
};

export default function Wallet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();

  // Financial Balances
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [balanceFcfa, setBalanceFcfa] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);

  // Accounts & Transactions
  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);

  // Modals & Drawers
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>("none");

  // Withdrawal form state
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // PIN security flow state
  const [hasPin, setHasPin] = useState<boolean>(false);
  const [pinMode, setPinMode] = useState<"verify" | "create" | "forgot">("verify");
  const [pinValue, setPinValue] = useState<string>("");
  const [pinConfirmValue, setPinConfirmValue] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSubmitting, setPinSubmitting] = useState<boolean>(false);

  // Multi-Currency & Localized Creator Detection
  const [detectedCountry, setDetectedCountry] = useState<string>("bj");

  useEffect(() => {
    detectUserCountry().then((geo) => setDetectedCountry(geo.countryCode));
  }, []);

  const creatorCountry = useMemo(() => {
    if (savedWallets.length > 0 && savedWallets[0].country) {
      return savedWallets[0].country.toLowerCase();
    }
    const profCountry = (profile as any)?.country_code || (profile as any)?.country;
    if (profCountry) return profCountry.toLowerCase();
    const metaCountry = user?.user_metadata?.country_code || user?.user_metadata?.country;
    if (metaCountry) return String(metaCountry).toLowerCase();
    return detectedCountry;
  }, [savedWallets, profile, user, detectedCountry]);

  const creatorCurrency = useMemo(() => {
    return getCurrencyForCountry(creatorCountry);
  }, [creatorCountry]);

  const isCreatorForeignCurrency = creatorCurrency !== "XOF" && creatorCurrency !== "XAF";

  // Available display currencies for creator
  const availableCurrencies = useMemo(() => {
    switch (creatorCountry) {
      case "cd":
        return ["CDF", "USD", "XOF"];
      case "ng":
        return ["NGN", "USD", "XOF"];
      case "zm":
        return ["ZMW", "USD", "XOF"];
      case "ke":
        return ["KES", "USD", "XOF"];
      case "gh":
        return ["GHS", "USD", "XOF"];
      case "us":
        return ["USD", "XOF"];
      case "fr":
      case "be":
        return ["EUR", "USD", "XOF"];
      default:
        return ["XOF", "USD", "EUR"];
    }
  }, [creatorCountry]);

  const [activeCurrency, setActiveCurrency] = useState<string>("XOF");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dukaio_wallet_display_currency");
      if (saved && availableCurrencies.includes(saved)) {
        setActiveCurrency(saved);
        return;
      }
    } catch {}
    const defaultCurr = getCurrencyForCountry(creatorCountry);
    setActiveCurrency(defaultCurr);
  }, [creatorCountry, availableCurrencies]);

  const handleSelectCurrency = (curr: string) => {
    setActiveCurrency(curr);
    try {
      localStorage.setItem("dukaio_wallet_display_currency", curr);
    } catch {}
  };

  // Forgot PIN state
  const [forgotStep, setForgotStep] = useState<"send" | "verify">("send");
  const [resetOtp, setResetOtp] = useState<string>("");
  const [resetNewPin, setResetNewPin] = useState<string>("");
  const [sendingResetOtp, setSendingResetOtp] = useState<boolean>(false);

  // Load everything on mount without PIN blocking
  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 0. Fetch KYC verification status (Admin is automatically approved & exempt)
      const isAdmin = isAdminUser(user.email);
      if (isAdmin) {
        setKycStatus("approved");
      } else {
        const { data: kycRec } = await supabase
          .from("identity_verifications")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();
        const currentKycStatus = kycRec?.status || "none";
        setKycStatus(currentKycStatus);
      }

      // 1. Check if user has PIN
      const { data: pinData } = await supabase
        .from("wallet_pins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      setHasPin(!!pinData);

      // 2. Fetch user wallet balance
      const { data: uw } = await supabase
        .from("user_wallets")
        .select("balance_fcfa, pending_fcfa")
        .eq("user_id", user.id)
        .maybeSingle();

      // 3. Fetch completed orders
      const { data: completedOrders } = await supabase
        .from("orders")
        .select("id, amount, status, created_at, products(title)")
        .eq("store_owner_id", user.id)
        .eq("status", "completed");

      // 4. Fetch withdrawals
      const { data: userWithdrawals } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // 5. Fetch saved wallets
      const { data: walletsList } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      // 6. Fetch wallet_transactions
      const { data: txList } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      // Calculations
      const totalNetEarned = (completedOrders || []).reduce((acc, o) => {
        const gross = Number(o.amount || 0);
        return acc + Math.round(gross * 0.95);
      }, 0);

      // All withdrawals that were initiated and not cancelled/rejected must be deducted
      const totalActiveWithdrawn = (userWithdrawals || [])
        .filter((w) => w.status !== "rejected" && w.status !== "failed" && w.status !== "cancelled")
        .reduce((acc, w) => acc + Number(w.amount || 0), 0);

      const realAvailable = Math.max(0, totalNetEarned - totalActiveWithdrawn);
      let currentBal = Number(uw?.balance_fcfa ?? 0);
      if (currentBal !== realAvailable) {
        currentBal = realAvailable;
        await supabase.from("user_wallets").upsert({
          user_id: user.id,
          balance_fcfa: currentBal,
          pending_fcfa: 0,
        }, { onConflict: "user_id" });
      }

      setBalanceFcfa(currentBal);
      setTotalEarned(totalNetEarned);
      setTotalWithdrawn(totalActiveWithdrawn);

      const saved = (walletsList as SavedWallet[]) || [];
      setSavedWallets(saved);
      if (saved.length > 0) {
        const def = saved.find((w) => w.is_default) || saved[0];
        setSelectedWalletId(def.id);
      } else {
        setSelectedWalletId("");
      }

      // Valid withdrawals that were actually accepted or completed by payment gateway
      const acceptedWithdrawalIds = new Set(
        (userWithdrawals || [])
          .filter((w) => w.status === "completed" || w.status === "processing")
          .map((w) => w.id)
      );

      // Format transactions (filter out any rejected/phantom withdrawals)
      const formattedTx: WalletTx[] = (txList || [])
        .filter((t) => t.type !== "withdrawal" || acceptedWithdrawalIds.has(t.reference_id))
        .map((t) => ({
          id: t.id,
          type: t.type as any,
          label: t.description || (t.type === "sale" ? "Vente de produit" : "Retrait Mobile Money"),
          amount: Math.abs(Number(t.amount || 0)),
          currency: t.wallet_currency || "FCFA",
          date: t.created_at,
          status: (t.status as any) || "completed",
        }));

      if (formattedTx.length === 0) {
        const orderTxs: WalletTx[] = (completedOrders || []).map((o) => ({
          id: o.id,
          type: "sale",
          label: (o.products as any)?.title || "Vente produit digital",
          amount: Math.round(Number(o.amount || 0) * 0.95),
          currency: "FCFA",
          date: o.created_at,
          status: "completed",
        }));

        const withTxs: WalletTx[] = (userWithdrawals || []).map((w) => ({
          id: w.id,
          type: "withdrawal",
          label: `Retrait (${w.operator || "MoMo"})`,
          amount: Number(w.amount || 0),
          currency: "FCFA",
          date: w.created_at,
          status: (w.status as any) || "processing",
        }));

        const merged = [...orderTxs, ...withTxs].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(merged);
      } else {
        setTransactions(formattedTx);
      }
    } catch (err: any) {
      console.error("[Wallet] loadData error:", err);
      toast.error("Erreur chargement portefeuille");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/connexion");
      return;
    }
    loadData();
  }, [user, authLoading]);

  const handleOpenWithdrawModal = () => {
    const isAdmin = isAdminUser(user?.email);
    if (!isAdmin && kycStatus !== "approved") {
      setKycModalOpen(true);
      return;
    }
    setWithdrawModalOpen(true);
  };

  // Clean action query if present so it never auto-opens modal on page visits or refresh
  useEffect(() => {
    if (searchParams.get("action")) {
      navigate("/dashboard/wallet", { replace: true });
    }
  }, [searchParams, navigate]);

  // Handle Amount validation
  const numericAmount = parseFloat(withdrawAmount) || 0;
  const isAmountTooHigh = numericAmount > balanceFcfa;
  const isAmountTooLow = numericAmount > 0 && numericAmount < 200;
  const isAmountValid = numericAmount >= 200 && numericAmount <= balanceFcfa;

  // Percentage quick shortcuts
  const applyPercent = (pct: number) => {
    if (balanceFcfa <= 0) return;
    const val = Math.floor((balanceFcfa * pct) / 100);
    setWithdrawAmount(String(val));
  };

  const withdrawalCountry = useMemo(() => {
    const sw = savedWallets.find((w) => w.id === selectedWalletId) || savedWallets.find((w) => w.is_default) || savedWallets[0];
    return sw ? sw.country.toLowerCase() : "bj";
  }, [selectedWalletId, savedWallets]);

  const withdrawalCurrency = useMemo(() => {
    return getCurrencyForCountry(withdrawalCountry);
  }, [withdrawalCountry]);

  // -------------------------------------------------------------
  // INITIATE WITHDRAWAL CLICK
  // -------------------------------------------------------------
  const handleInitiateWithdraw = () => {
    const isAdmin = isAdminUser(user?.email);
    if (!isAdmin && kycStatus !== "approved") {
      setWithdrawModalOpen(false);
      setKycModalOpen(true);
      return;
    }

    if (!isAmountValid) {
      if (isAmountTooHigh) {
        toast.error(`Solde insuffisant. Vous disposez de ${formatFmt(balanceFcfa)} FCFA.`);
      } else if (isAmountTooLow) {
        toast.error("Montant minimum de retrait : 200 FCFA");
      } else {
        toast.error("Veuillez saisir un montant valide");
      }
      return;
    }

    if (savedWallets.length === 0) {
      toast.error("Veuillez d'abord enregistrer un compte de retrait");
      setWithdrawModalOpen(false);
      navigate("/dashboard/wallet/accounts");
      return;
    }

    // Open PIN verification modal
    setPinValue("");
    setPinConfirmValue("");
    setPinError(null);
    setPinMode(hasPin ? "verify" : "create");
    setPinModalOpen(true);
  };

  // -------------------------------------------------------------
  // CONFIRM PIN & EXECUTE WITHDRAWAL
  // -------------------------------------------------------------
  const executeWithdrawalWithPin = async (finalPin: string) => {
    if (!user) return;
    setPinSubmitting(true);
    setPinError(null);

    try {
      if (!hasPin) {
        const { error: pinSetErr } = await supabase.functions.invoke("wallet-pin-set", {
          body: { pin: finalPin },
        });
        if (pinSetErr) throw pinSetErr;
        setHasPin(true);
      } else {
        const { data: vData, error: vErr } = await supabase.functions.invoke("wallet-pin-verify", {
          body: { pin: finalPin },
        });
        if (vErr || !vData?.success) {
          setPinError("Code PIN incorrect. Veuillez réessayer.");
          setPinValue("");
          setPinSubmitting(false);
          return;
        }
      }

      const sw = savedWallets.find((w) => w.id === selectedWalletId) || savedWallets.find((w) => w.is_default) || savedWallets[0];
      if (!sw) {
        throw new Error("Compte de retrait introuvable. Veuillez ajouter un compte de retrait.");
      }
      const targetPhone = sw.phone;
      const targetProvider = sw.provider_code;
      const targetCountry = sw.country;

      // Call wallet-withdraw Edge Function (calls SaaSPay Payout API with exact network method)
      const { data: withdrawRes, error: wErr } = await supabase.functions.invoke("wallet-withdraw", {
        body: {
          amount: numericAmount,
          phone: targetPhone,
          provider: targetProvider,
          country: targetCountry,
        },
      });

      if (wErr || withdrawRes?.error) {
        let msg = withdrawRes?.error;
        if (!msg && wErr) {
          try {
            if ((wErr as any)?.context?.json) {
              const errBody = await (wErr as any).context.json();
              if (errBody?.error) msg = errBody.error;
            }
          } catch (_) {}
          if (!msg) msg = wErr.message;
        }
        throw new Error(msg || "Échec du retrait");
      }

      const netMeta = getOperatorMeta(targetProvider, targetCountry);
      toast.success(`Retrait de ${formatFmt(numericAmount)} FCFA initié !`, {
        description: `Le virement vers ${targetPhone} (${netMeta.name}) est en cours de transmission.`,
      });

      // Update local state immediately
      setBalanceFcfa((prev) => Math.max(0, prev - numericAmount));
      setTotalWithdrawn((prev) => prev + numericAmount);
      setWithdrawAmount("");
      setPinModalOpen(false);
      setWithdrawModalOpen(false);

      loadData();
    } catch (err: any) {
      console.error("[executeWithdrawalWithPin]", err);
      setPinError(err.message || "Erreur lors du retrait");
      toast.error(err.message || "Erreur lors du retrait");
    } finally {
      setPinSubmitting(false);
    }
  };

  // Forgot PIN flow
  const handleSendResetOtp = async () => {
    setSendingResetOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-pin-reset-send", { body: {} });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success(`Code de réinitialisation envoyé à ${user?.email}`);
      setForgotStep("verify");
    } catch (err: any) {
      toast.error(err.message || "Impossible d'envoyer le code");
    } finally {
      setSendingResetOtp(false);
    }
  };

  const handleConfirmResetPin = async () => {
    if (resetOtp.length !== 6 || resetNewPin.length !== 4) {
      toast.error("Veuillez saisir le code à 6 chiffres et le nouveau PIN à 4 chiffres");
      return;
    }
    setPinSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-pin-reset-confirm", {
        body: { code: resetOtp, new_pin: resetNewPin },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success("Code PIN réinitialisé avec succès !");
      setHasPin(true);
      setPinMode("verify");
      setPinValue(resetNewPin);
      setResetOtp("");
      setResetNewPin("");
    } catch (err: any) {
      toast.error(err.message || "Code invalide");
    } finally {
      setPinSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <SEOHead title="Portefeuille & Retraits | Dukaio" />

      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16">
        {/* ======================================================== */}
        {/* NEO-BANKING FINTECH CARD (Inspiré des captures mobiles)   */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden rounded-[28px] border border-[#E2E8F0] dark:border-[#263043] bg-white dark:bg-[#111827] shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 sm:p-10 text-center">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Solde retirable with Flags + Currency Toggle */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
              <div className="flex items-center -space-x-1.5">
                <img src="https://flagcdn.com/w40/cd.png" alt="RD Congo" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
                <img src="https://flagcdn.com/w40/bj.png" alt="Bénin" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
                <img src="https://flagcdn.com/w40/ci.png" alt="Côte d'Ivoire" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
                <img src="https://flagcdn.com/w40/ng.png" alt="Nigéria" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
                <img src="https://flagcdn.com/w40/zm.png" alt="Zambie" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
                <img src="https://flagcdn.com/w40/cm.png" alt="Cameroun" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
                <img src="https://flagcdn.com/w40/sn.png" alt="Sénégal" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
              </div>
              <span className="tracking-wider uppercase text-[10px]">Solde disponible au retrait</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Quick Currency Switcher for Creator */}
            <div className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-0.5 text-[11px] font-bold">
              {availableCurrencies.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelectCurrency(c)}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    activeCurrency === c
                      ? "bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-xs font-black"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {c === "XOF" ? "FCFA" : c}
                </button>
              ))}
            </div>
          </div>

          {/* Giant Amount Display */}
          <div className="mt-4 sm:mt-6 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                {loading ? (
                  <span className="inline-flex items-center gap-2 text-2xl text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin" /> Chargement...
                  </span>
                ) : hideBalance ? (
                  "••••••••"
                ) : activeCurrency === "XOF" ? (
                  `${formatFmt(balanceFcfa)} FCFA`
                ) : (
                  formatMoney(convertFromXOF(balanceFcfa, activeCurrency), activeCurrency)
                )}
              </span>

              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                title={hideBalance ? "Afficher le solde" : "Masquer le solde"}
              >
                {hideBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {!loading && !hideBalance && balanceFcfa > 0 && (
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {activeCurrency !== "XOF" ? (
                  <span>
                    Équivalent net de <strong className="text-slate-800 dark:text-slate-200">{formatFmt(balanceFcfa)} FCFA</strong> (95% net après 5% de commission)
                  </span>
                ) : isCreatorForeignCurrency ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-semibold">
                    ≈ {formatMoney(convertFromXOF(balanceFcfa, creatorCurrency), creatorCurrency)} ({creatorCurrency} officiel)
                  </span>
                ) : null}
              </div>
            )}
          </div>

          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Retrait immédiat • Zéro délai • 0 FCFA de frais DUKAIO
          </p>

          {/* 3 Prominent Round Action Buttons */}
          <div className="mt-8 flex items-center justify-center gap-6 sm:gap-10">
            {/* Action 1: Retirer */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleOpenWithdrawModal}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0F172A] flex items-center justify-center shadow-md active:scale-95 transition-all group"
              >
                <ArrowUpRight className="h-6 w-6 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Retirer
              </span>
            </div>

            {/* Action 2: Comptes de retrait */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => navigate("/dashboard/wallet/accounts")}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-xs active:scale-95 transition-all"
              >
                <Smartphone className="h-6 w-6 stroke-[2]" />
              </button>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Mes comptes
              </span>
            </div>

            {/* Action 3: Actualiser */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={loadData}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-xs active:scale-95 transition-all"
              >
                <RotateCcw className={`h-6 w-6 stroke-[2] ${loading ? "animate-spin" : ""}`} />
              </button>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Actualiser
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STATS TILES (Solde disponible + Total encaissé)            */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#151C2B] p-5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Solde disponible (Mobile Money & Banque)
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                {hideBalance
                  ? "••••"
                  : activeCurrency === "XOF"
                  ? `${formatFmt(balanceFcfa)} F`
                  : formatMoney(convertFromXOF(balanceFcfa, activeCurrency), activeCurrency)}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {activeCurrency !== "XOF" && balanceFcfa > 0
                  ? `Base : ${formatFmt(balanceFcfa)} FCFA • 100% prêt`
                  : isCreatorForeignCurrency && balanceFcfa > 0
                  ? `≈ ${formatMoney(convertFromXOF(balanceFcfa, creatorCurrency), creatorCurrency)} • 100% prêt`
                  : "100% prêt au virement"}
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <WalletIcon className="h-6 w-6 stroke-[2]" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#151C2B] p-5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total des gains cumulés (95% net)
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                {hideBalance
                  ? "••••"
                  : activeCurrency === "XOF"
                  ? `${formatFmt(totalEarned)} F`
                  : formatMoney(convertFromXOF(totalEarned, activeCurrency), activeCurrency)}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {formatFmt(totalWithdrawn)} F déjà retirés
                {activeCurrency !== "XOF" && totalEarned > 0 ? (
                  <span className="ml-1 text-slate-400">
                    (Base : {formatFmt(totalEarned)} FCFA)
                  </span>
                ) : isCreatorForeignCurrency && totalEarned > 0 ? (
                  <span className="ml-1 text-slate-400">
                    (Total : ≈ {formatMoney(convertFromXOF(totalEarned, creatorCurrency), creatorCurrency)})
                  </span>
                ) : null}
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Receipt className="h-6 w-6 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TRANSACTIONS RÉCENTES (Style Lovable / Revolut)          */}
        {/* ======================================================== */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#151C2B] p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Transactions récentes
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {transactions.length} opération(s)
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Chargement de vos transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Receipt className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">Aucune transaction pour le moment</p>
              <p className="text-xs text-slate-400 mt-1">Vos ventes et retraits apparaîtront ici dès la première opération.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {transactions.map((tx) => {
                const isIncoming = tx.type === "sale" || tx.type === "refund";
                return (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                          isIncoming
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {isIncoming ? (
                          <Plus className="h-5 w-5 stroke-[2.5]" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {tx.label}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(tx.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs sm:text-sm font-bold block ${
                          isIncoming
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {isIncoming ? `+${formatFmt(tx.amount)} F` : `-${formatFmt(tx.amount)} F`}
                      </span>
                      <span
                        className={`text-[10px] font-medium uppercase tracking-wider inline-block px-1.5 py-0.5 rounded ${
                          tx.status === "completed"
                            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                            : tx.status === "processing" || tx.status === "pending"
                            ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                            : "text-red-600 bg-red-50 dark:bg-red-950/40"
                        }`}
                      >
                        {tx.status === "completed" ? "Validé" : tx.status === "processing" ? "En cours" : tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* DIALOG KYC GATE: VÉRIFICATION OBLIGATOIRE                */}
      {/* ======================================================== */}
      <Dialog open={kycModalOpen} onOpenChange={setKycModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border text-foreground">
          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            <div
              className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg ${
                kycStatus === "pending"
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 shadow-amber-500/10"
                  : kycStatus === "rejected"
                  ? "bg-red-100 dark:bg-red-950/60 text-red-600 shadow-red-500/10"
                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 shadow-emerald-500/10"
              }`}
            >
              {kycStatus === "pending" ? (
                <Clock className="h-8 w-8 stroke-[2.2]" />
              ) : kycStatus === "rejected" ? (
                <AlertCircle className="h-8 w-8 stroke-[2.2]" />
              ) : (
                <ShieldCheck className="h-8 w-8 stroke-[2.2]" />
              )}
            </div>

            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-extrabold text-foreground">
                {kycStatus === "pending"
                  ? "Vérification KYC en cours"
                  : kycStatus === "rejected"
                  ? "Vérification KYC rejetée"
                  : "Vérification d'identité requise"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed px-2">
                {kycStatus === "pending"
                  ? "Votre dossier a été soumis avec succès et est en cours d'examen par notre équipe de conformité (délai indicatif 24h à 48h). Vos retraits seront débloqués automatiquement dès approbation."
                  : kycStatus === "rejected"
                  ? "Votre soumission précédente n'a pas été validée. Veuillez consulter le motif du rejet et soumettre à nouveau vos pièces d'identité pour autoriser les retraits."
                  : "Pour des raisons de conformité financière et de sécurité anti-fraude, la vérification d'une pièce d'identité officielle est obligatoire pour effectuer vos retraits de fonds."}
              </DialogDescription>
            </div>

            <div className="w-full rounded-2xl bg-secondary/50 border border-border p-3.5 text-left text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <span className="text-base">💡</span>
                <span>Bon à savoir</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Vos ventes et vos encaissements continuent de fonctionner à 100%. La vérification ne bloque que la sortie des fonds vers votre numéro ou compte bancaire.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2 pt-2">
              <Button
                onClick={() => {
                  setKycModalOpen(false);
                  navigate("/dashboard/kyc");
                }}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                {kycStatus === "pending"
                  ? "Suivre l'avancement de mon KYC"
                  : kycStatus === "rejected"
                  ? "Corriger mes documents KYC"
                  : "Passer ma vérification KYC (2 min)"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setKycModalOpen(false)}
                className="w-full h-10 rounded-xl text-xs text-muted-foreground hover:text-foreground"
              >
                Plus tard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* DIALOG 1: EFFECTUER UN RETRAIT                          */}
      {/* ======================================================== */}
      <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white dark:bg-[#151C2B] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Effectuer un retrait
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Virement direct vers votre compte Mobile Money ou bancaire. 0 FCFA de frais DUKAIO.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Solde disponible rappel */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Solde retirable disponible</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {formatFmt(balanceFcfa)} FCFA
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                Retrait immédiat
              </span>
            </div>

            {/* Compte de retrait sélection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Compte de réception
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawModalOpen(false);
                    navigate("/dashboard/wallet/accounts");
                  }}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  Gérer mes comptes
                </button>
              </div>

              {savedWallets.length === 0 ? (
                <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Aucun compte de retrait enregistré pour le moment.
                  </p>
                  <Button
                    type="button"
                    onClick={() => {
                      setWithdrawModalOpen(false);
                      navigate("/dashboard/wallet/accounts");
                    }}
                    className="h-8 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Ajouter mon compte de retrait
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(() => {
                    const activeAccount =
                      savedWallets.find((w) => w.id === selectedWalletId) ||
                      savedWallets.find((w) => w.is_default) ||
                      savedWallets[0];
                    const meta = activeAccount ? getOperatorMeta(activeAccount.provider_code, activeAccount.country) : null;

                    return (
                      <>
                        {meta && (
                          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between shadow-2xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative h-11 w-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 shadow-2xs overflow-hidden">
                                {meta.logo ? (
                                  <img src={meta.logo} alt={meta.name} className="h-full w-full object-contain" />
                                ) : (
                                  <Smartphone className="h-5 w-5 text-slate-500" />
                                )}
                                {meta.flagUrl && (
                                  <img
                                    src={meta.flagUrl}
                                    alt={meta.country}
                                    className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {activeAccount.name}
                                  </p>
                                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    {meta.name}
                                  </span>
                                  {activeAccount.is_default && (
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40">
                                      Par défaut
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                                  {activeAccount.phone}
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md shrink-0">
                              Sélectionné
                            </span>
                          </div>
                        )}

                        {/* Select other account if more than 1 */}
                        {savedWallets.length > 1 && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Changer de compte
                            </label>
                            <select
                              value={selectedWalletId}
                              onChange={(e) => setSelectedWalletId(e.target.value)}
                              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                              {savedWallets.map((w) => {
                                const m = getOperatorMeta(w.provider_code, w.country);
                                return (
                                  <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                    {w.name} ({m.name} • {w.phone}) {w.is_default ? "★ [Par défaut]" : ""}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Montant Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Montant à retirer (FCFA)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Ex: 5000"
                  className={`h-12 text-lg font-bold pr-16 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 ${
                    isAmountTooHigh ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  FCFA
                </span>
              </div>

              {/* Percentage Pills */}
              <div className="flex gap-2 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyPercent(pct)}
                    className="flex-1 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {pct === 100 ? "Max" : `${pct}%`}
                  </button>
                ))}
              </div>

              {isAmountTooHigh && (
                <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Solde insuffisant (Disponible : {formatFmt(balanceFcfa)} FCFA)
                </p>
              )}
              {isAmountTooLow && (
                <p className="mt-1.5 text-xs text-amber-500 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Montant minimum requis : 200 FCFA
                </p>
              )}

              {numericAmount >= 200 && withdrawalCurrency !== "XOF" && withdrawalCurrency !== "XAF" && (
                <div className="mt-2.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 p-2.5 text-xs flex items-center justify-between text-blue-900 dark:text-blue-200 font-semibold">
                  <span>💡 Contre-valeur reçue sur votre compte :</span>
                  <span className="font-mono text-sm font-black text-blue-700 dark:text-blue-300">
                    ≈ {formatMoney(convertFromXOF(numericAmount, withdrawalCurrency), withdrawalCurrency)}
                  </span>
                </div>
              )}
            </div>

            {/* Fee Transparency Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Frais de plateforme DUKAIO :</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">0 FCFA (Gratuit)</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Montant transféré :</span>
                <span>{numericAmount > 0 ? `${formatFmt(numericAmount)} FCFA` : "0 FCFA"}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              onClick={handleInitiateWithdraw}
              disabled={!isAmountValid || submittingWithdraw}
              className="w-full h-12 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0F172A] font-bold text-sm"
            >
              {submittingWithdraw ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Traitement...
                </span>
              ) : (
                "Confirmer le retrait"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* DIALOG 2: SÉCURITÉ CODE PIN                             */}
      {/* ======================================================== */}
      <Dialog open={pinModalOpen} onOpenChange={setPinModalOpen}>
        <DialogContent className="sm:max-w-sm rounded-3xl p-6 bg-white dark:bg-[#151C2B] border-slate-200 dark:border-slate-800 text-center text-slate-900 dark:text-white">
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-white flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="h-6 w-6 stroke-[2]" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white text-center">
              {pinMode === "create"
                ? "Définir votre code PIN de retrait"
                : pinMode === "forgot"
                ? "Réinitialiser votre code PIN"
                : "Sécurité du retrait"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 text-center">
              {pinMode === "create"
                ? "Créez un code PIN à 4 chiffres pour valider ce retrait et sécuriser vos futurs retraits."
                : pinMode === "forgot"
                ? "Un code de validation sera envoyé à votre adresse email pour choisir un nouveau code PIN."
                : "Entrez votre code PIN à 4 chiffres pour valider le virement."}
            </DialogDescription>
          </DialogHeader>

          {/* MODE: VERIFY EXISTING PIN */}
          {pinMode === "verify" && (
            <div className="space-y-4 pt-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={4}
                  value={pinValue}
                  onChange={(val) => {
                    setPinValue(val);
                    setPinError(null);
                  }}
                  onComplete={(val) => {
                    executeWithdrawalWithPin(val);
                  }}
                  disabled={pinSubmitting}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-12 text-lg font-black bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                    <InputOTPSlot index={1} className="h-12 w-12 text-lg font-black bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                    <InputOTPSlot index={2} className="h-12 w-12 text-lg font-black bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                    <InputOTPSlot index={3} className="h-12 w-12 text-lg font-black bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {pinError && (
                <p className="text-xs text-red-500 font-semibold text-center">{pinError}</p>
              )}

              <Button
                type="button"
                onClick={() => {
                  if (pinValue.length === 4) {
                    executeWithdrawalWithPin(pinValue);
                  } else {
                    setPinError("Veuillez saisir votre code PIN à 4 chiffres");
                  }
                }}
                disabled={pinSubmitting || pinValue.length !== 4}
                className="w-full h-11 font-bold text-sm bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0F172A]"
              >
                {pinSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Traitement du virement en cours...</span>
                  </div>
                ) : (
                  "Confirmer le virement"
                )}
              </Button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPinMode("forgot");
                    setForgotStep("send");
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Code PIN oublié ?
                </button>
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* MODE: CREATE NEW PIN */}
          {pinMode === "create" && (
            <div className="space-y-4 pt-3 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Code PIN (4 chiffres)</label>
                <Input
                  type="password"
                  maxLength={4}
                  value={pinValue}
                  onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="text-center text-lg font-black tracking-widest bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Confirmez votre code PIN</label>
                <Input
                  type="password"
                  maxLength={4}
                  value={pinConfirmValue}
                  onChange={(e) => setPinConfirmValue(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="text-center text-lg font-black tracking-widest bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                />
              </div>

              {pinError && <p className="text-xs text-red-500 font-semibold">{pinError}</p>}

              <Button
                onClick={() => {
                  if (pinValue.length !== 4) {
                    setPinError("Le code PIN doit comporter 4 chiffres");
                    return;
                  }
                  if (pinValue !== pinConfirmValue) {
                    setPinError("Les deux codes PIN ne correspondent pas");
                    return;
                  }
                  executeWithdrawalWithPin(pinValue);
                }}
                disabled={pinSubmitting || pinValue.length !== 4 || pinConfirmValue.length !== 4}
                className="w-full h-11 font-bold text-sm bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0F172A]"
              >
                {pinSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sauvegarder et retirer"}
              </Button>
            </div>
          )}

          {/* MODE: FORGOT PIN OTP RESET */}
          {pinMode === "forgot" && (
            <div className="space-y-3 pt-3 text-left">
              {forgotStep === "send" ? (
                <div className="space-y-3 text-center">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Nous allons envoyer un code de vérification à 6 chiffres sur <strong>{user?.email}</strong>.
                  </p>
                  <Button
                    onClick={handleSendResetOtp}
                    disabled={sendingResetOtp}
                    className="w-full h-11 font-bold text-xs bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0F172A]"
                  >
                    {sendingResetOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le code par email"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Code reçu par email (6 chiffres)</label>
                    <Input
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="text-center font-bold tracking-widest bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Nouveau code PIN (4 chiffres)</label>
                    <Input
                      type="password"
                      maxLength={4}
                      value={resetNewPin}
                      onChange={(e) => setResetNewPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••"
                      className="text-center font-black tracking-widest bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <Button
                    onClick={handleConfirmResetPin}
                    disabled={pinSubmitting || resetOtp.length !== 6 || resetNewPin.length !== 4}
                    className="w-full h-11 font-bold text-xs bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0F172A]"
                  >
                    {pinSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider mon nouveau PIN"}
                  </Button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setPinMode("verify")}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pt-2"
              >
                Retour
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
