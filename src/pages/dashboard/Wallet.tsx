import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Wallet as WalletIcon, Loader2, Plus, Trash2, ShieldCheck,
  ChevronDown, Eye, EyeOff,
  ArrowUpRight, RotateCcw, Smartphone, AlertCircle,
  Receipt
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
import {
  SAASPAY_PAYOUT_COUNTRIES,
  SAASPAY_METHODS,
  getSaaSPayNetwork,
} from "@/data/saaspayProviders";

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
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  // Withdrawal form state
  const [selectedWalletId, setSelectedWalletId] = useState<string>("new");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // New account form state
  const [accCountry, setAccCountry] = useState<string>("bj");
  const [accOperator, setAccOperator] = useState<string>("mtn_bj");
  const [accPhone, setAccPhone] = useState<string>("");
  const [accLabel, setAccLabel] = useState<string>("");
  const [accHolderName, setAccHolderName] = useState<string>("");
  const [accSaveForNext, setAccSaveForNext] = useState<boolean>(true);
  const [savingAccount, setSavingAccount] = useState<boolean>(false);

  // PIN security flow state
  const [hasPin, setHasPin] = useState<boolean>(false);
  const [pinMode, setPinMode] = useState<"verify" | "create" | "forgot">("verify");
  const [pinValue, setPinValue] = useState<string>("");
  const [pinConfirmValue, setPinConfirmValue] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSubmitting, setPinSubmitting] = useState<boolean>(false);

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

      const totalCompletedWithdrawn = (userWithdrawals || [])
        .filter((w) => w.status === "completed" || w.status === "processing")
        .reduce((acc, w) => acc + Number(w.amount || 0), 0);

      let currentBal = Number(uw?.balance_fcfa || 0);
      if (currentBal === 0 && totalNetEarned > totalCompletedWithdrawn) {
        currentBal = Math.max(0, totalNetEarned - totalCompletedWithdrawn);
        await supabase.from("user_wallets").upsert({
          user_id: user.id,
          balance_fcfa: currentBal,
          pending_fcfa: 0,
        });
      }

      setBalanceFcfa(currentBal);
      setTotalEarned(totalNetEarned);
      setTotalWithdrawn(totalCompletedWithdrawn);

      const saved = (walletsList as SavedWallet[]) || [];
      setSavedWallets(saved);
      if (saved.length > 0) {
        setSelectedWalletId(saved[0].id);
      } else {
        setSelectedWalletId("new");
      }

      // Format transactions
      const formattedTx: WalletTx[] = (txList || []).map((t) => ({
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

  // Open withdraw modal if ?action=withdraw in query
  useEffect(() => {
    if (searchParams.get("action") === "withdraw") {
      setWithdrawModalOpen(true);
    }
  }, [searchParams]);

  // Selected Country in Account Form
  const currentCountryConfig = useMemo(() => {
    return (
      SAASPAY_PAYOUT_COUNTRIES.find((c) => c.code === accCountry) ||
      SAASPAY_PAYOUT_COUNTRIES[0]
    );
  }, [accCountry]);

  // Networks available for the selected country
  const countryNetworks = useMemo(() => {
    return currentCountryConfig?.networks || [];
  }, [currentCountryConfig]);

  // Sync operator when country changes
  useEffect(() => {
    if (countryNetworks.length > 0) {
      const exists = countryNetworks.some((n) => n.code === accOperator);
      if (!exists) {
        setAccOperator(countryNetworks[0].code);
      }
    }
  }, [accCountry, countryNetworks]);

  // Handle Amount validation
  const numericAmount = parseFloat(withdrawAmount) || 0;
  const isAmountTooHigh = numericAmount > balanceFcfa;
  const isAmountTooLow = numericAmount > 0 && numericAmount < 100;
  const isAmountValid = numericAmount >= 100 && numericAmount <= balanceFcfa;

  // Percentage quick shortcuts
  const applyPercent = (pct: number) => {
    if (balanceFcfa <= 0) return;
    const val = Math.floor((balanceFcfa * pct) / 100);
    setWithdrawAmount(String(val));
  };

  // -------------------------------------------------------------
  // SAVE A NEW WALLET ACCOUNT
  // -------------------------------------------------------------
  const handleSaveAccount = async () => {
    if (!user) return;
    const cleanPh = accPhone.replace(/\D/g, "");
    if (cleanPh.length < 5) {
      toast.error("Veuillez saisir un numéro ou compte valide");
      return;
    }

    setSavingAccount(true);
    try {
      const isDefault = savedWallets.length === 0;
      const selectedNet = countryNetworks.find((n) => n.code === accOperator) || countryNetworks[0];
      const providerCode = selectedNet ? selectedNet.code : accOperator;
      const dialCode = currentCountryConfig.dial.replace(/\D/g, "");
      const fullPhone = cleanPh.startsWith(dialCode) ? `+${cleanPh}` : `+${dialCode}${cleanPh}`;

      const { data, error } = await supabase
        .from("wallets")
        .insert({
          user_id: user.id,
          name: accLabel.trim() || `${selectedNet?.name || "Compte de retrait"}`,
          country: accCountry.toUpperCase(),
          provider_code: providerCode,
          phone: fullPhone,
          holder_first_name: accHolderName.trim() || profile?.display_name || "Créateur",
          holder_last_name: "",
          is_default: isDefault,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Compte de retrait enregistré avec succès !");
      setSavedWallets((prev) => [data as SavedWallet, ...prev]);
      setSelectedWalletId(data.id);
      setAccountModalOpen(false);
      setAccPhone("");
      setAccLabel("");
      setAccHolderName("");
    } catch (err: any) {
      toast.error("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setSavingAccount(false);
    }
  };

  // Delete saved account
  const handleDeleteAccount = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous supprimer ce compte de retrait ?")) return;
    try {
      await supabase.from("wallets").delete().eq("id", id);
      setSavedWallets((prev) => prev.filter((w) => w.id !== id));
      if (selectedWalletId === id) setSelectedWalletId("new");
      toast.success("Compte supprimé");
    } catch (err: any) {
      toast.error("Erreur de suppression : " + err.message);
    }
  };

  // -------------------------------------------------------------
  // INITIATE WITHDRAWAL CLICK
  // -------------------------------------------------------------
  const handleInitiateWithdraw = () => {
    if (!isAmountValid) {
      if (isAmountTooHigh) {
        toast.error(`Solde insuffisant. Vous disposez de ${formatFmt(balanceFcfa)} FCFA.`);
      } else if (isAmountTooLow) {
        toast.error("Montant minimum de retrait : 100 FCFA");
      } else {
        toast.error("Veuillez saisir un montant valide");
      }
      return;
    }

    if (selectedWalletId === "new") {
      const clean = accPhone.replace(/\D/g, "");
      if (clean.length < 5) {
        toast.error("Veuillez saisir votre numéro ou compte de réception");
        return;
      }
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

      let targetPhone = "";
      let targetProvider = "";
      let targetCountry = "";

      if (selectedWalletId === "new") {
        const selectedNet = countryNetworks.find((n) => n.code === accOperator) || countryNetworks[0];
        const dial = currentCountryConfig.dial.replace(/\D/g, "");
        const clean = accPhone.replace(/\D/g, "");
        targetPhone = clean.startsWith(dial) ? `+${clean}` : `+${dial}${clean}`;
        targetProvider = selectedNet ? selectedNet.code : accOperator;
        targetCountry = accCountry.toUpperCase();

        if (accSaveForNext) {
          handleSaveAccount().catch(console.error);
        }
      } else {
        const sw = savedWallets.find((w) => w.id === selectedWalletId);
        if (!sw) throw new Error("Compte de retrait introuvable");
        targetPhone = sw.phone;
        targetProvider = sw.provider_code;
        targetCountry = sw.country;
      }

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

          {/* Top Pill: Solde retirable with Flags */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
            <div className="flex items-center -space-x-1.5">
              <img src="https://flagcdn.com/w40/bj.png" alt="Bénin" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
              <img src="https://flagcdn.com/w40/tg.png" alt="Togo" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
              <img src="https://flagcdn.com/w40/ci.png" alt="Côte d'Ivoire" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
              <img src="https://flagcdn.com/w40/sn.png" alt="Sénégal" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
              <img src="https://flagcdn.com/w40/cm.png" alt="Cameroun" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
              <img src="https://flagcdn.com/w40/ng.png" alt="Nigéria" className="h-4 w-4 rounded-full object-cover border border-white dark:border-slate-800 shadow-2xs" />
            </div>
            <span className="tracking-wider uppercase text-[10px]">Solde disponible au retrait</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Giant Amount Display */}
          <div className="mt-4 sm:mt-6 flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-2xl text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" /> Chargement...
                </span>
              ) : hideBalance ? (
                "••••••••"
              ) : (
                `${formatFmt(balanceFcfa)} F`
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

          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Retrait immédiat • Zéro délai • 0 FCFA de frais DUKAIO
          </p>

          {/* 3 Prominent Round Action Buttons */}
          <div className="mt-8 flex items-center justify-center gap-6 sm:gap-10">
            {/* Action 1: Retirer */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setWithdrawModalOpen(true)}
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
                onClick={() => setAccountModalOpen(true)}
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
                {hideBalance ? "••••" : `${formatFmt(balanceFcfa)} F`}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                100% prêt au virement
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
                {hideBalance ? "••••" : `${formatFmt(totalEarned)} F`}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {formatFmt(totalWithdrawn)} F déjà retirés
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Compte de réception
              </label>

              {savedWallets.length > 0 && (
                <div className="space-y-2 mb-2">
                  {savedWallets.map((sw) => {
                    const meta = getOperatorMeta(sw.provider_code, sw.country);
                    const isSelected = selectedWalletId === sw.id;
                    return (
                      <div
                        key={sw.id}
                        onClick={() => setSelectedWalletId(sw.id)}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#0F172A] dark:border-white bg-slate-50 dark:bg-slate-900/90 ring-1 ring-[#0F172A] dark:ring-white shadow-xs"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
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
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                              <span>{sw.name}</span>
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {meta.name}
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                              {sw.phone} • {meta.country} ({meta.currency})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {sw.is_default && (
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              Défaut
                            </span>
                          )}
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? "border-[#0F172A] dark:border-white bg-[#0F172A] dark:bg-white" : "border-slate-300 dark:border-slate-600"
                            }`}
                          >
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-slate-900" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Option to use another number */}
              <div
                onClick={() => setSelectedWalletId("new")}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedWalletId === "new"
                    ? "border-[#0F172A] dark:border-white bg-slate-50 dark:bg-slate-900/90 ring-1 ring-[#0F172A] dark:ring-white shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Utiliser un autre compte / numéro
                  </span>
                </div>
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedWalletId === "new" ? "border-[#0F172A] dark:border-white bg-[#0F172A] dark:bg-white" : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {selectedWalletId === "new" && <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-slate-900" />}
                </div>
              </div>
            </div>

            {/* If "new" selected, show rich visual inputs */}
            {selectedWalletId === "new" && (
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-3 mt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Pays de réception
                  </label>
                  <div className="relative">
                    <select
                      value={accCountry}
                      onChange={(e) => setAccCountry(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white text-xs font-semibold px-3 pr-10 focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
                    >
                      {SAASPAY_PAYOUT_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code} className="bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white">
                          {c.name} ({c.dial} • {c.currency})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                      <img
                        src={`https://flagcdn.com/w40/${accCountry.toLowerCase()}.png`}
                        alt={accCountry}
                        className="h-4 w-5 rounded object-cover shadow-2xs border border-slate-200 dark:border-slate-700"
                      />
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    Réseau officiel ({countryNetworks.length} disponible{countryNetworks.length > 1 ? "s" : ""})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {countryNetworks.map((net) => {
                      const opMeta = SAASPAY_METHODS[net.operatorKey] || SAASPAY_METHODS.mtn;
                      const isSel = accOperator === net.code;
                      return (
                        <button
                          key={net.code}
                          type="button"
                          onClick={() => setAccOperator(net.code)}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                            isSel
                              ? "border-[#0F172A] dark:border-white bg-[#0F172A]/5 dark:bg-white/10 ring-1 ring-[#0F172A] dark:ring-white shadow-2xs"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                            {opMeta?.logos?.[0] ? (
                              <img src={opMeta.logos[0]} alt={net.name} className="h-full w-full object-contain" />
                            ) : (
                              <Smartphone className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                              {net.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold block">
                              Devise : {net.currency}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Numéro de réception / Compte
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {currentCountryConfig.dial}
                    </span>
                    <Input
                      value={accPhone}
                      onChange={(e) => setAccPhone(e.target.value)}
                      placeholder={currentCountryConfig.placeholder}
                      className="h-10 text-xs font-semibold pl-14 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="saveForNext"
                    checked={accSaveForNext}
                    onChange={(e) => setAccSaveForNext(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                  <label htmlFor="saveForNext" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                    Enregistrer ce compte pour mes prochains retraits
                  </label>
                </div>
              </div>
            )}

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
                  Montant minimum requis : 100 FCFA
                </p>
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
                    if (val.length === 4) {
                      executeWithdrawalWithPin(val);
                    }
                  }}
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
                <p className="text-xs text-red-500 font-semibold">{pinError}</p>
              )}

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

      {/* ======================================================== */}
      {/* DIALOG 3: GESTION DES COMPTES DE RETRAIT                */}
      {/* ======================================================== */}
      <Dialog open={accountModalOpen} onOpenChange={setAccountModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white dark:bg-[#151C2B] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Mes comptes de retrait
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Gérez vos numéros Mobile Money et comptes bancaires enregistrés.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {savedWallets.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Aucun compte enregistré pour le moment.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {savedWallets.map((sw) => {
                  const meta = getOperatorMeta(sw.provider_code, sw.country);
                  return (
                    <div
                      key={sw.id}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex items-center justify-between"
                    >
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
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                            <span>{sw.name}</span>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {meta.name}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {sw.phone} • {meta.country} ({meta.currency})
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteAccount(sw.id, e)}
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors shrink-0"
                        title="Supprimer ce compte"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Form to add a new account */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-primary" />
                Ajouter un nouveau compte
              </h4>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Pays de réception
                </label>
                <div className="relative">
                  <select
                    value={accCountry}
                    onChange={(e) => setAccCountry(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white text-xs font-semibold px-3 pr-10 focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
                  >
                    {SAASPAY_PAYOUT_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white">
                        {c.name} ({c.dial} • {c.currency})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                    <img
                      src={`https://flagcdn.com/w40/${accCountry.toLowerCase()}.png`}
                      alt={accCountry}
                      className="h-4 w-5 rounded object-cover shadow-2xs border border-slate-200 dark:border-slate-700"
                    />
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Réseau officiel ({countryNetworks.length} disponible{countryNetworks.length > 1 ? "s" : ""})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {countryNetworks.map((net) => {
                    const opMeta = SAASPAY_METHODS[net.operatorKey] || SAASPAY_METHODS.mtn;
                    const isSel = accOperator === net.code;
                    return (
                      <button
                        key={net.code}
                        type="button"
                        onClick={() => setAccOperator(net.code)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                          isSel
                            ? "border-[#0F172A] dark:border-white bg-[#0F172A]/5 dark:bg-white/10 ring-1 ring-[#0F172A] dark:ring-white shadow-2xs"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                          {opMeta?.logos?.[0] ? (
                            <img src={opMeta.logos[0]} alt={net.name} className="h-full w-full object-contain" />
                          ) : (
                            <Smartphone className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                            {net.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            Devise : {net.currency}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Numéro de téléphone / Compte
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {currentCountryConfig.dial}
                  </span>
                  <Input
                    value={accPhone}
                    onChange={(e) => setAccPhone(e.target.value)}
                    placeholder={currentCountryConfig.placeholder}
                    className="h-10 text-xs font-semibold pl-14 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Nom du label (ex: Mon compte principal)
                </label>
                <Input
                  value={accLabel}
                  onChange={(e) => setAccLabel(e.target.value)}
                  placeholder="Mon compte principal"
                  className="h-10 text-xs font-semibold bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <Button
                onClick={handleSaveAccount}
                disabled={savingAccount}
                className="w-full h-11 font-bold text-xs bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0F172A]"
              >
                {savingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer ce compte"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
