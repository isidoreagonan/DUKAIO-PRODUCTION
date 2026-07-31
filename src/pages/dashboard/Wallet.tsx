import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet as WalletIcon, Lock, Loader2, Plus, Trash2, Star, ShieldCheck, ArrowLeft, Check, ChevronDown, KeyRound, Fingerprint, Eye, EyeOff, X, ArrowUpRight, ArrowDownLeft, Send, Building2, TrendingUp, Home, Sparkles, Bell, Filter, CreditCard, ArrowRightLeft, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { pawapayCountries, providerLogos, type PawaPayCountry, type PawaPayProvider } from "@/data/pawapayProviders";
import SEOHead from "@/components/SEOHead";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface WalletRow {
  id: string;
  name: string;
  country: string;
  provider_code: string;
  phone: string;
  holder_first_name: string;
  holder_last_name: string;
  is_default: boolean;
}

const UNLOCK_KEY = "dukaio_wallet_unlock";

const Wallet = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<"loading" | "setup" | "unlock" | "ready">("loading");
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  // Wallet financial state (dual balance)
  const [tab, setTab] = useState<"home" | "solde" | "gains" | "accounts">("home");
  const [hideBalance, setHideBalance] = useState(false);
  const [availableFcfa, setAvailableFcfa] = useState(0);
  const [pendingFcfa, setPendingFcfa] = useState(0);
  const [availableUsd, setAvailableUsd] = useState(0);
  const [pendingUsd, setPendingUsd] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [recentGains, setRecentGains] = useState<Array<{ id: string; amount: number; currency: string; created_at: string; product_title?: string }>>([]);
  const [recentTx, setRecentTx] = useState<Array<{ id: string; type: "in" | "out" | "convert"; label: string; amount: number; currency: string; date: string; status: string }>>([]);

  // Conversion AI
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertAmount, setConvertAmount] = useState("");
  const [converting, setConverting] = useState(false);
  const [convertPreview, setConvertPreview] = useState<{ rate: number; fcfa: number; source: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Form state for creating wallet
  const [name, setName] = useState("");
  const [country, setCountry] = useState<PawaPayCountry>(pawapayCountries[0]);
  const [provider, setProvider] = useState<PawaPayProvider>(pawapayCountries[0].deposit[0]);
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  useEffect(() => { setProvider(country.deposit[0]); }, [country.code]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    (async () => {
      const { data } = await supabase.from("wallet_pins").select("user_id").eq("user_id", user.id).maybeSingle();
      const pinExists = !!data;
      setHasPin(pinExists);
      if (!pinExists) { setPhase("setup"); return; }

      const stored = sessionStorage.getItem(UNLOCK_KEY);
      if (stored) {
        try {
          const { token, exp } = JSON.parse(stored);
          if (exp > Date.now()) {
            await loadWallets();
            setPhase("ready");
            return;
          }
        } catch {}
      }
      setPhase("unlock");
    })();
  }, [user, authLoading, navigate]);

  const loadWallets = async () => {
    if (!user) return;
    const [walletsRes, balanceRes, txRes, withdrawalsRes] = await Promise.all([
      supabase.from("wallets").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("user_wallets").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("wallet_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("withdrawals").select("amount, fee, status").eq("user_id", user.id),
    ]);
    setWallets((walletsRes.data as WalletRow[]) || []);

    const bal = balanceRes.data || {} as any;
    setAvailableFcfa(Number(bal.balance_fcfa || 0));
    setPendingFcfa(Number(bal.pending_fcfa || 0));
    setAvailableUsd(Number(bal.balance_usd || 0));
    setPendingUsd(Number(bal.pending_usd || 0));

    const txs = (txRes.data || []) as any[];
    const sales = txs.filter(t => t.type === "sale" && Number(t.amount) > 0);
    setTotalEarned(sales.reduce((s, t) => s + Number(t.amount), 0));

    const wds = (withdrawalsRes.data || []) as any[];
    setTotalWithdrawn(wds.filter(w => ["pending", "processing", "completed"].includes(w.status))
      .reduce((s, w) => s + Number(w.amount) + Number(w.fee || 0), 0));

    setRecentGains(sales.slice(0, 20).map(t => ({
      id: t.id,
      amount: Number(t.amount),
      currency: t.wallet_currency || "FCFA",
      created_at: t.created_at,
      product_title: t.description || "Vente",
    })));

    setRecentTx(txs.slice(0, 30).map(t => {
      const amt = Number(t.amount);
      const isConvert = t.type === "conversion";
      const type: "in" | "out" | "convert" = isConvert ? "convert" : amt >= 0 ? "in" : "out";
      const labelMap: Record<string, string> = {
        sale: "Vente",
        commission: "Commission",
        withdrawal: "Retrait Mobile Money",
        conversion: "Conversion USD→FCFA",
        refund: "Remboursement",
      };
      return {
        id: t.id,
        type,
        label: t.description || labelMap[t.type] || t.type,
        amount: Math.abs(amt),
        currency: t.wallet_currency || "FCFA",
        date: t.created_at,
        status: t.status || "completed",
      };
    }));
  };

  const previewConversion = async () => {
    const amt = parseFloat(convertAmount);
    if (!amt || amt <= 0) return;
    if (amt > availableUsd) { toast.error("Solde USD insuffisant"); return; }
    setPreviewLoading(true);
    setConvertPreview(null);
    try {
      const { data, error } = await supabase.functions.invoke("convert-usd-to-fcfa", {
        body: { amount_usd: amt, preview: true },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setConvertPreview({ rate: data.rate, fcfa: data.amount_fcfa, source: data.source || "AI" });
    } catch (e: any) { toast.error(e.message || "Erreur de taux"); }
    finally { setPreviewLoading(false); }
  };

  const confirmConversion = async () => {
    const amt = parseFloat(convertAmount);
    if (!amt || amt <= 0 || amt > availableUsd) return;
    setConverting(true);
    try {
      const { data, error } = await supabase.functions.invoke("convert-usd-to-fcfa", {
        body: { amount_usd: amt },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success(`Converti : ${fmtMoney(data.amount_fcfa)} FCFA ajoutés au solde`);
      setConvertOpen(false);
      setConvertAmount("");
      setConvertPreview(null);
      await loadWallets();
    } catch (e: any) { toast.error(e.message || "Erreur"); }
    finally { setConverting(false); }
  };

  const handleSetup = async () => {
    if (pin.length !== 4) return toast.error("PIN doit faire 4 chiffres");
    if (pin !== confirmPin) return toast.error("Les PIN ne correspondent pas");
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-pin-set", { body: { pin } });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success("PIN créé !");
      // Auto-unlock
      const { data: vData, error: vErr } = await supabase.functions.invoke("wallet-pin-verify", { body: { pin } });
      if (vErr || vData?.error) throw new Error(vData?.error || vErr?.message);
      sessionStorage.setItem(UNLOCK_KEY, JSON.stringify({
        token: vData.unlock_token,
        exp: Date.now() + (vData.expires_in * 1000),
      }));
      await loadWallets();
      setPhase("ready");
      setPin(""); setConfirmPin("");
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  const handleUnlock = async (pinValue?: string) => {
    const code = pinValue ?? pin;
    if (code.length !== 4) return;
    setSubmitting(true);
    setPinError(null);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-pin-verify", { body: { pin: code } });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      sessionStorage.setItem(UNLOCK_KEY, JSON.stringify({
        token: data.unlock_token,
        exp: Date.now() + (data.expires_in * 1000),
      }));
      await loadWallets();
      setPhase("ready");
      setPin("");
    } catch (e: any) {
      setPinError(e.message?.includes("Invalid") || e.message?.includes("incorrect") ? "Code PIN incorrect" : (e.message || "Code PIN incorrect"));
      setPin("");
    }
    finally { setSubmitting(false); }
  };

  const handleCreateWallet = async () => {
    if (!user) return;
    if (!name.trim()) return toast.error("Nom du wallet requis");
    if (!firstName.trim() || !lastName.trim()) return toast.error("Nom et prénom du titulaire requis");
    if (phone.length < 6) return toast.error("Numéro invalide");
    if (wallets.length >= 3) return toast.error("Maximum 3 wallets");

    setSubmitting(true);
    try {
      const fullPhone = `${country.dial}${phone}`.replace(/\D/g, "");
      const isDefault = wallets.length === 0;
      const { error } = await supabase.from("wallets").insert({
        user_id: user.id,
        name: name.trim(),
        country: country.code,
        provider_code: provider.code,
        phone: `+${fullPhone}`,
        holder_first_name: firstName.trim(),
        holder_last_name: lastName.trim(),
        is_default: isDefault,
      });
      if (error) throw error;
      toast.success("Wallet créé !");
      setCreateOpen(false);
      setName(""); setPhone(""); setFirstName(""); setLastName("");
      await loadWallets();
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce wallet ?")) return;
    const { error } = await supabase.from("wallets").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Wallet supprimé");
    await loadWallets();
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("wallets").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("wallets").update({ is_default: true }).eq("id", id);
    await loadWallets();
  };

  const findProviderLabel = (code: string) => {
    for (const c of pawapayCountries) {
      const p = c.deposit.find(d => d.code === code);
      if (p) return { label: p.label, family: p.family };
    }
    return { label: code, family: "mtn" as const };
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-amber-50/40">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  // SETUP
  if (phase === "setup") {
    return (
      <>
        <SEOHead title="Créer votre PIN — Dukaio Wallet" description="Sécurisez votre wallet" />
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-violet-900 via-violet-700 to-amber-600">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center shadow-xl">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Créez votre PIN</h1>
            <p className="text-sm text-center text-gray-500 mb-6">Un code à 4 chiffres pour protéger votre Dukaio Wallet.</p>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block text-center">Nouveau PIN</label>
                <div className="flex justify-center">
                  <InputOTP maxLength={4} value={pin} onChange={setPin}>
                    <InputOTPGroup>
                      {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-2xl" />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block text-center">Confirmer le PIN</label>
                <div className="flex justify-center">
                  <InputOTP maxLength={4} value={confirmPin} onChange={setConfirmPin}>
                    <InputOTPGroup>
                      {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-2xl" />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                onClick={handleSetup}
                disabled={submitting || pin.length !== 4 || confirmPin.length !== 4}
                className="w-full h-12 rounded-xl text-base font-bold"
                style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer mon PIN"}
              </Button>
              <p className="text-[11px] text-gray-400 text-center">Ne le partagez avec personne. Il vous sera demandé à chaque accès.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // UNLOCK
  if (phase === "unlock") {
    return (
      <>
        <SEOHead title="Déverrouiller — Dukaio Wallet" description="Saisissez votre PIN" />
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-violet-950 via-violet-800 to-amber-700 relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-500/30 blur-3xl" />

          <div className="relative w-full max-w-md bg-white rounded-3xl p-7 sm:p-8 shadow-2xl ring-1 ring-white/40">
            <div className="flex justify-center mb-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold text-emerald-700">Connexion sécurisée · Chiffrée</span>
              </div>
            </div>

            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center shadow-xl">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Dukaio Wallet</h1>
            <p className="text-sm text-center text-gray-500 mb-6">Entrez votre PIN à 4 chiffres pour accéder à vos fonds</p>

            <div className={`flex justify-center mb-3 ${pinError ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
              <InputOTP
                maxLength={4}
                value={pin}
                disabled={submitting}
                onChange={(v) => {
                  setPin(v);
                  if (pinError) setPinError(null);
                  if (v.length === 4) setTimeout(() => handleUnlock(v), 120);
                }}
              >
                <InputOTPGroup>
                  {[0,1,2,3].map(i => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className={`h-14 w-14 text-2xl ${pinError ? "border-red-400 text-red-600" : ""}`}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="h-6 flex items-center justify-center mb-4">
              {submitting && (
                <div className="flex items-center gap-2 text-xs text-violet-700 font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Vérification…
                </div>
              )}
              {pinError && !submitting && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold">
                  <X className="h-3.5 w-3.5" /> {pinError}
                </div>
              )}
              {!pinError && !submitting && pin.length > 0 && pin.length < 4 && (
                <div className="text-xs text-gray-400">{pin.length}/4 chiffres</div>
              )}
              {!pinError && !submitting && pin.length === 0 && (
                <div className="text-xs text-gray-400">Saisie auto-validée</div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
              <div className="flex flex-col items-center text-center gap-1">
                <Fingerprint className="h-4 w-4 text-violet-600" />
                <span className="text-[10px] font-medium text-gray-600 leading-tight">PIN chiffré</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] font-medium text-gray-600 leading-tight">Anti-fraude</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <Lock className="h-4 w-4 text-amber-600" />
                <span className="text-[10px] font-medium text-gray-600 leading-tight">Session privée</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-4">
              Ne partagez jamais votre PIN. Dukaio ne vous le demandera jamais.
            </p>
          </div>
        </div>
        <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }`}</style>
      </>
    );
  }

  // READY — Chariow-style wallet centre
  const fmtMoney = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n));
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  const TabBtn = ({ id, label, icon: Icon }: { id: typeof tab; label: string; icon: any }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex flex-col items-center gap-1 flex-1 py-2.5 transition-colors ${tab === id ? "text-violet-600" : "text-gray-400 hover:text-gray-600"}`}
    >
      <Icon className={`h-5 w-5 ${tab === id ? "stroke-[2.4]" : ""}`} />
      <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
    </button>
  );

  return (
    <>
      <SEOHead title="Dukaio Wallet" description="Votre portefeuille sécurisé : solde, gains et retraits" />
      <div className="min-h-screen bg-gradient-to-b from-violet-50/60 via-white to-white pb-28">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-violet-100/60">
          <div className="max-w-3xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
            <button onClick={() => (window.history.length > 1 ? navigate(-1) : window.close())} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center shadow-md">
                <WalletIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-extrabold text-gray-900">Dukaio Wallet</span>
            </div>
            <button
              onClick={() => { sessionStorage.removeItem(UNLOCK_KEY); setPhase("unlock"); }}
              className="h-8 w-8 rounded-full bg-violet-50 hover:bg-violet-100 flex items-center justify-center"
              title="Verrouiller"
            >
              <Lock className="h-3.5 w-3.5 text-violet-700" />
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5">
          {/* HOME TAB */}
          {tab === "home" && (
            <>
              {/* Hero balance card — Design B style */}
              <div
                className="relative overflow-hidden rounded-[28px] p-6 sm:p-7 text-white shadow-[0_20px_60px_-20px_rgba(124,45,204,0.55)]"
                style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C2DCC 45%, #5B1A9E 100%)" }}
              >
                <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute top-10 right-16 h-3 w-3 rounded-full bg-amber-300/60" />
                <div className="absolute bottom-8 left-8 h-2 w-2 rounded-full bg-white/40" />
                <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                  <defs><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="white" /></pattern></defs>
                  <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>

                <div className="relative z-10 flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60 mb-0.5">Bonjour</p>
                    <h2 className="text-lg font-extrabold">{(user?.user_metadata as any)?.full_name || user?.email?.split("@")[0] || "Vendeur"}</h2>
                  </div>
                  <button
                    onClick={() => setHideBalance(v => !v)}
                    className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-colors"
                  >
                    {hideBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-1">Solde FCFA</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black tracking-tight">
                        {hideBalance ? "•••••" : fmtMoney(availableFcfa)}
                      </span>
                      <span className="text-xs font-bold text-amber-300">FCFA</span>
                    </div>
                    <p className="text-[10px] text-white/60 mt-1">
                      <TrendingUp className="inline h-2.5 w-2.5 mr-0.5 text-amber-300" />
                      {fmtMoney(pendingFcfa)} en attente
                    </p>
                  </div>
                  <div className="border-l border-white/15 pl-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-1">Solde USD</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black tracking-tight">
                        {hideBalance ? "•••••" : availableUsd.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-emerald-300">USD</span>
                    </div>
                    <p className="text-[10px] text-white/60 mt-1">
                      <TrendingUp className="inline h-2.5 w-2.5 mr-0.5 text-emerald-300" />
                      ${pendingUsd.toFixed(2)} en attente
                    </p>
                  </div>
                </div>

                {availableUsd > 0 && (
                  <button
                    onClick={() => { setConvertOpen(true); setConvertPreview(null); setConvertAmount(""); }}
                    className="relative z-10 mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm py-2.5 transition-colors border border-white/20"
                  >
                    <Bot className="h-4 w-4 text-amber-300" />
                    <span className="text-sm font-bold">Convertir USD → FCFA</span>
                    <ArrowRightLeft className="h-3.5 w-3.5 text-amber-300" />
                  </button>
                )}
              </div>

              {/* Quick actions grid — Design B style tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {[
                  { icon: Send, label: "Retirer", desc: "Vers Mobile Money", color: "from-violet-500 to-violet-700", action: () => navigate("/dashboard/withdrawals/new") },
                  { icon: Building2, label: "Mes comptes", desc: `${wallets.length}/3 actifs`, color: "from-amber-400 to-amber-600", action: () => setTab("accounts") },
                  { icon: TrendingUp, label: "Mes gains", desc: `${fmtMoney(totalEarned)} FCFA`, color: "from-emerald-500 to-emerald-700", action: () => setTab("gains") },
                  { icon: CreditCard, label: "Solde", desc: "Historique complet", color: "from-sky-500 to-indigo-600", action: () => setTab("solde") },
                ].map((q) => (
                  <button
                    key={q.label}
                    onClick={q.action}
                    className="group relative overflow-hidden rounded-2xl bg-white p-4 text-left border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50 transition-all"
                  >
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${q.color} flex items-center justify-center shadow-md mb-3`}>
                      <q.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{q.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{q.desc}</p>
                  </button>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mt-5">
                {[
                  { label: "Total gagné", value: totalEarned, color: "text-emerald-600" },
                  { label: "Retraits", value: totalWithdrawn, color: "text-violet-600" },
                  { label: "En attente", value: pendingFcfa, color: "text-amber-600" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-white border border-gray-100 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
                    <p className={`text-sm font-extrabold mt-1 ${s.color}`}>{hideBalance ? "•••" : fmtMoney(s.value)}</p>
                    <p className="text-[10px] text-gray-400">FCFA</p>
                  </div>
                ))}
              </div>

              {/* Recent gains */}
              <div className="mt-6 rounded-2xl bg-white border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" /> Gains récents
                  </h3>
                  <button onClick={() => setTab("gains")} className="text-[11px] font-semibold text-violet-600 hover:underline">Voir tout</button>
                </div>
                {recentGains.length === 0 ? (
                  <div className="p-8 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500">Aucun gain pour l'instant</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {recentGains.slice(0, 4).map((g) => (
                      <div key={g.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50">
                        <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
                          <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{g.product_title || "Vente"}</p>
                          <p className="text-[11px] text-gray-400">{fmtDate(g.created_at)}</p>
                        </div>
                        <p className="text-sm font-extrabold text-emerald-600 shrink-0">+ {fmtMoney(g.amount)} <span className="text-[10px] font-bold">FCFA</span></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* SOLDE TAB — transactions list */}
          {tab === "solde" && (
            <>
              <div className="rounded-[24px] p-5 mb-4 text-white shadow-xl"
                style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C2DCC 60%, #5B1A9E 100%)" }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60 mb-1">Solde disponible</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">{hideBalance ? "•••••" : fmtMoney(availableFcfa)}</span>
                  <span className="text-sm font-bold text-amber-300">FCFA</span>
                  <button onClick={() => setHideBalance(v => !v)} className="ml-auto h-8 w-8 rounded-full bg-white/15 flex items-center justify-center">
                    {hideBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Transactions</h3>
                <span className="text-[11px] text-gray-400">{recentTx.length} mouvements</span>
              </div>

              <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
                {recentTx.length === 0 ? (
                  <div className="p-10 text-center">
                    <CreditCard className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Aucune transaction</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {recentTx.map((t) => {
                      const colorBg = t.type === "in" ? "bg-emerald-100" : t.type === "convert" ? "bg-violet-100" : "bg-rose-100";
                      const colorIcon = t.type === "in" ? "text-emerald-600" : t.type === "convert" ? "text-violet-600" : "text-rose-600";
                      const colorAmt = t.type === "in" ? "text-emerald-600" : t.type === "convert" ? "text-violet-600" : "text-rose-600";
                      const sign = t.type === "in" ? "+" : t.type === "convert" ? "" : "−";
                      const Icon = t.type === "in" ? ArrowDownLeft : t.type === "convert" ? ArrowRightLeft : ArrowUpRight;
                      const isUsd = t.currency === "USD";
                      return (
                        <div key={t.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorBg}`}>
                            <Icon className={`h-4 w-4 ${colorIcon}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{t.label}</p>
                            <p className="text-[11px] text-gray-400">{fmtDate(t.date)} · <span className="capitalize">{t.status}</span></p>
                          </div>
                          <p className={`text-sm font-extrabold shrink-0 ${colorAmt}`}>
                            {sign} {isUsd ? `$${t.amount.toFixed(2)}` : fmtMoney(t.amount)}
                            {!isUsd && <span className="text-[10px] font-bold"> FCFA</span>}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* GAINS TAB */}
          {tab === "gains" && (
            <>
              <div className="rounded-[24px] p-5 mb-4 text-white shadow-xl"
                style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 60%, #047857 100%)" }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-1">Total gagné (net)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">{hideBalance ? "•••••" : fmtMoney(totalEarned)}</span>
                  <span className="text-sm font-bold">FCFA</span>
                </div>
                <p className="text-[11px] text-white/70 mt-1">Après commission Dukaio (10%)</p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Mes gains</h3>
                <span className="text-[11px] text-gray-400 inline-flex items-center gap-1"><Filter className="h-3 w-3" /> Tous</span>
              </div>

              <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
                {recentGains.length === 0 ? (
                  <div className="p-10 text-center">
                    <Sparkles className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Aucun gain pour l'instant</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {recentGains.map((g) => (
                      <div key={g.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center shrink-0">
                          <WalletIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">Dukaio · {g.product_title || "Vente"}</p>
                          <p className="text-[11px] text-gray-400">{fmtDate(g.created_at)}</p>
                        </div>
                        <p className="text-sm font-extrabold text-emerald-600 shrink-0">
                          + {fmtMoney(g.amount)} <span className="text-[10px] font-bold">FCFA</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ACCOUNTS TAB — original wallets management */}
          {tab === "accounts" && (
            <>
              <div className="rounded-[24px] p-5 mb-5 text-white shadow-xl"
                style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #4B1A8A 60%, #C9962E 130%)" }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1.5">Espace sécurisé</div>
                <h2 className="text-xl font-extrabold mb-1">Vos comptes de retrait</h2>
                <p className="text-xs text-white/70 max-w-md">Jusqu'à 3 comptes Mobile Money pour recevoir vos retraits.</p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Mes wallets ({wallets.length}/3)</h3>
                {wallets.length < 3 && (
                  <Button onClick={() => setCreateOpen(true)} size="sm" className="rounded-xl gap-1"
                    style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}>
                    <Plus className="h-4 w-4" /> Ajouter
                  </Button>
                )}
              </div>

              {wallets.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
                  <WalletIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-600 mb-4">Aucun wallet pour l'instant.</p>
                  <Button onClick={() => setCreateOpen(true)} className="rounded-xl"
                    style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}>
                    <Plus className="h-4 w-4 mr-1.5" /> Créer mon premier wallet
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {wallets.map((w) => {
                    const p = findProviderLabel(w.provider_code);
                    const c = pawapayCountries.find(x => x.code === w.country);
                    return (
                      <div key={w.id} className="group relative rounded-2xl bg-white p-4 border border-gray-200 hover:border-violet-300 hover:shadow-lg transition-all">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-xl bg-white p-1.5 ring-1 ring-gray-100 shrink-0">
                            <img src={providerLogos[p.family]} alt={p.label} className="h-full w-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-gray-900 truncate">{w.name}</p>
                              {w.is_default && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{p.label} • {c?.name}</p>
                            <p className="text-xs text-gray-700 font-mono mt-1">{w.phone}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{w.holder_first_name} {w.holder_last_name}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-100">
                          {!w.is_default && (
                            <button onClick={() => setDefault(w.id)} className="text-[11px] font-semibold text-violet-600 hover:underline">
                              Définir par défaut
                            </button>
                          )}
                          <button onClick={() => handleDelete(w.id)} className="ml-auto text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1">
                            <Trash2 className="h-3 w-3" /> Supprimer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 rounded-2xl bg-violet-50/50 border border-violet-100 p-4 flex gap-3">
                <ShieldCheck className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                <div className="text-xs text-violet-900/80">
                  <p className="font-semibold mb-1">Sécurité Dukaio</p>
                  <p>PIN haché, jamais stocké en clair. 5 tentatives échouées = blocage 15 min. Session déverrouillée 15 min max.</p>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Floating action button — Retirer */}
        <button
          onClick={() => navigate("/dashboard/withdrawals/new")}
          className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full shadow-2xl shadow-violet-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}
          title="Demander un retrait"
        >
          <Send className="h-5 w-5 text-white" />
        </button>

        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.08)]">
          <div className="max-w-3xl mx-auto flex items-center px-2">
            <TabBtn id="home" label="Accueil" icon={Home} />
            <TabBtn id="solde" label="Solde" icon={CreditCard} />
            <TabBtn id="gains" label="Gains" icon={TrendingUp} />
            <TabBtn id="accounts" label="Comptes" icon={Building2} />
          </div>
        </nav>

        {/* Conversion USD → FCFA dialog (AI-powered) */}
        <Dialog open={convertOpen} onOpenChange={(o) => { setConvertOpen(o); if (!o) { setConvertPreview(null); setConvertAmount(""); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                Conversion USD → FCFA
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-violet-50 to-amber-50/40 border border-violet-100 p-3">
                <p className="text-[11px] text-violet-700 font-semibold uppercase tracking-wider mb-1">Solde USD disponible</p>
                <p className="text-2xl font-black text-gray-900">${availableUsd.toFixed(2)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Montant à convertir (USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={availableUsd}
                  value={convertAmount}
                  onChange={(e) => { setConvertAmount(e.target.value); setConvertPreview(null); }}
                  placeholder="Ex: 50.00"
                  className="h-12 text-lg font-semibold"
                />
                <button
                  type="button"
                  onClick={() => { setConvertAmount(availableUsd.toFixed(2)); setConvertPreview(null); }}
                  className="text-xs text-violet-600 mt-1 hover:underline"
                >
                  Tout convertir
                </button>
              </div>

              {convertPreview ? (
                <div className="rounded-xl border-2 border-violet-200 bg-violet-50/50 p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Taux IA (temps réel)</span>
                    <span className="font-bold text-gray-900">1 USD = {fmtMoney(convertPreview.rate)} FCFA</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Vous recevrez</span>
                    <span className="text-lg font-black text-violet-700">{fmtMoney(convertPreview.fcfa)} FCFA</span>
                  </div>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Bot className="h-3 w-3" /> Source : {convertPreview.source}
                  </p>
                </div>
              ) : (
                <Button
                  onClick={previewConversion}
                  disabled={previewLoading || !convertAmount || parseFloat(convertAmount) <= 0}
                  variant="outline"
                  className="w-full h-11 border-violet-200 text-violet-700 hover:bg-violet-50"
                >
                  {previewLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> L'IA recherche le taux…</>
                  ) : (
                    <><Bot className="h-4 w-4 mr-2" /> Obtenir le taux IA</>
                  )}
                </Button>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertOpen(false)}>Annuler</Button>
              <Button
                onClick={confirmConversion}
                disabled={converting || !convertPreview}
                style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}
              >
                {converting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Confirmer la conversion</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create wallet dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouveau wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Nom du wallet</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Mon MTN principal" maxLength={40} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Prénom titulaire</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Nom titulaire</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Pays</label>
                <div className="relative">
                  <button type="button" onClick={() => setCountryOpen(!countryOpen)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <img src={country.flag} alt="" className="h-4 w-6 object-cover rounded-sm" />
                      <span className="text-sm">{country.name}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${countryOpen ? "rotate-180" : ""}`} />
                  </button>
                  {countryOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-gray-200 bg-white shadow-xl max-h-48 overflow-y-auto">
                      {pawapayCountries.map((c) => (
                        <button key={c.code} type="button"
                          onClick={() => { setCountry(c); setCountryOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left">
                          <img src={c.flag} alt="" className="h-4 w-6 object-cover rounded-sm" />
                          <span className="text-sm">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Opérateur</label>
                <div className="grid grid-cols-2 gap-2">
                  {country.deposit.map((op) => {
                    const sel = provider.code === op.code;
                    return (
                      <button key={op.code} type="button" onClick={() => setProvider(op)}
                        className={`flex items-center gap-2 p-2 rounded-lg border-2 ${sel ? "border-violet-500 bg-violet-50" : "border-gray-200"}`}>
                        <img src={providerLogos[op.family]} alt="" className="h-7 w-7 object-contain" />
                        <span className="text-xs font-semibold flex-1 text-left">{op.label}</span>
                        {sel && <Check className="h-4 w-4 text-violet-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Numéro Mobile Money</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600">+{country.dial}</div>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="97 00 00 00" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
              <Button onClick={handleCreateWallet} disabled={submitting}
                style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le wallet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Wallet;
