import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet as WalletIcon, Loader2, ArrowLeft, ShieldCheck, Lock, Plus, Star, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { pawapayCountries, providerLogos } from "@/data/pawapayProviders";
import SEOHead from "@/components/SEOHead";

const ADMIN_EMAIL = "isidoreagonan@gmail.com";
const UNLOCK_KEY = "dukaio_wallet_unlock";

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

const WithdrawNew = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [availableNet, setAvailableNet] = useState(0);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  // PIN gate
  const [needsPin, setNeedsPin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Forgot PIN flow
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<"send" | "verify">("send");
  const [otpCode, setOtpCode] = useState("");
  const [newPin, setNewPin] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPin, setResettingPin] = useState(false);

  const sendResetOtp = async () => {
    setSendingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-pin-reset-send", { body: {} });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success(`Code envoyé à ${user?.email}`);
      setForgotStep("verify");
    } catch (e: any) { toast.error(e.message); }
    finally { setSendingOtp(false); }
  };

  const confirmResetPin = async () => {
    if (otpCode.length !== 6 || newPin.length !== 4) return;
    setResettingPin(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-pin-reset-confirm", {
        body: { code: otpCode, new_pin: newPin },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success("PIN réinitialisé. Saisissez-le pour confirmer le retrait.");
      setForgotMode(false);
      setForgotStep("send");
      setOtpCode("");
      setPin(newPin);
      const pinValue = newPin;
      setNewPin("");
      // Auto-verify with new PIN
      setTimeout(() => verifyPinAndPayout(pinValue), 150);
    } catch (e: any) { toast.error(e.message); setOtpCode(""); }
    finally { setResettingPin(false); }
  };

  const numAmount = parseFloat(amount) || 0;
  const isAdmin = user?.email === ADMIN_EMAIL;
  const COMMISSION = 0.10;

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    (async () => {
      const [walletBalRes, kycRes, walletsRes] = await Promise.all([
        supabase.from("user_wallets").select("balance_fcfa").eq("user_id", user.id).maybeSingle(),
        supabase.from("identity_verifications").select("status").eq("user_id", user.id).maybeSingle(),
        supabase.from("wallets").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
      ]);
      setKycStatus(isAdmin ? "approved" : (kycRes.data?.status || null));
      setAvailableNet(Number(walletBalRes.data?.balance_fcfa || 0));
      const wList = (walletsRes.data as WalletRow[]) || [];
      setWallets(wList);
      if (wList.length > 0) setSelectedWallet(wList[0].id);
      setLoading(false);
    })();
  }, [user, authLoading, isAdmin, navigate]);

  const getUnlockToken = (): string | null => {
    const stored = sessionStorage.getItem(UNLOCK_KEY);
    if (!stored) return null;
    try {
      const { token, exp } = JSON.parse(stored);
      if (exp > Date.now()) return token;
    } catch {}
    return null;
  };

  const handleSubmit = async () => {
    if (!selectedWallet) { toast.error("Sélectionnez un wallet"); return; }
    if (numAmount < 100) { toast.error("Minimum 100 FCFA"); return; }
    if (numAmount > availableNet) { toast.error("Solde insuffisant"); return; }

    let token = getUnlockToken();
    if (!token) {
      setNeedsPin(true);
      return;
    }
    await doPayout(token);
  };

  const verifyPinAndPayout = async (overridePin?: string) => {
    const pinToUse = overridePin ?? pin;
    if (pinToUse.length !== 4) return;
    setSubmitting(true);
    setPinError(null);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-pin-verify", { body: { pin: pinToUse } });
      if (error || data?.error) {
        if (data?.needs_setup) {
          toast.error("Créez d'abord un PIN dans l'espace Wallet");
          window.open("/dashboard/wallet", "_blank");
          return;
        }
        // Inline error only — no toast/canvas
        setPinError(data?.error || error?.message || "PIN incorrect");
        setPin("");
        return;
      }
      sessionStorage.setItem(UNLOCK_KEY, JSON.stringify({
        token: data.unlock_token, exp: Date.now() + (data.expires_in * 1000),
      }));
      setNeedsPin(false);
      setPin("");
      await doPayout(data.unlock_token);
    } catch (e: any) {
      setPinError(e.message || "PIN incorrect");
      setPin("");
    }
    finally { setSubmitting(false); }
  };

  const doPayout = async (_unlock_token: string) => {
    if (!selectedWallet) return;
    const w = wallets.find((x) => x.id === selectedWallet);
    if (!w) { toast.error("Wallet introuvable"); return; }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-withdraw", {
        body: { amount: numAmount, phone: w.phone, provider: w.provider_code },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success("Demande de retrait envoyée !");
      setTimeout(() => {
        if (window.history.length > 1) navigate("/dashboard/withdrawals");
        else window.close();
      }, 800);
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  const findProvider = (code: string) => {
    for (const c of pawapayCountries) {
      const p = c.deposit.find(d => d.code === code);
      if (p) return { label: p.label, family: p.family };
    }
    return { label: code, family: "mtn" as const };
  };

  const canWithdraw = isAdmin || kycStatus === "approved";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-amber-50/40">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  // PIN gate overlay
  if (needsPin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-violet-900 via-violet-700 to-amber-600">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center shadow-xl">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
          </div>

          {!forgotMode ? (
            <>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-1">Confirmation requise</h2>
              <p className="text-sm text-center text-gray-500 mb-6">Saisissez votre PIN pour valider le retrait</p>
              <div className="flex justify-center mb-3">
                <InputOTP maxLength={4} value={pin} onChange={(v) => { setPin(v); setPinError(null); if (v.length === 4) setTimeout(() => verifyPinAndPayout(v), 100); }}>
                  <InputOTPGroup>
                    {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-2xl" />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {pinError && (
                <p className="text-center text-sm text-red-600 font-medium mb-2">{pinError}</p>
              )}
              <div className="text-center mb-5">
                <button type="button" onClick={() => { setForgotMode(true); setForgotStep("send"); setPinError(null); }}
                  className={`text-xs font-medium hover:underline ${pinError ? "text-red-600" : "text-violet-600"}`}>
                  PIN oublié ?
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setNeedsPin(false); setPin(""); setPinError(null); }} className="flex-1">Annuler</Button>
                <Button onClick={() => verifyPinAndPayout()} disabled={submitting || pin.length !== 4} className="flex-1"
                  style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}
                </Button>
              </div>
            </>
          ) : forgotStep === "send" ? (
            <>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-1">Réinitialiser votre PIN</h2>
              <p className="text-sm text-center text-gray-500 mb-6">
                Nous allons envoyer un code de vérification à<br />
                <span className="font-semibold text-gray-800">{user?.email}</span>
              </p>
              <Button onClick={sendResetOtp} disabled={sendingOtp} className="w-full h-12 mb-2"
                style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}>
                {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le code par email"}
              </Button>
              <Button variant="ghost" onClick={() => setForgotMode(false)} className="w-full">Retour</Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-1">Code reçu par email</h2>
              <p className="text-sm text-center text-gray-500 mb-5">Saisissez le code à 6 chiffres et choisissez un nouveau PIN</p>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Code OTP</label>
              <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456" inputMode="numeric" className="h-12 text-center text-lg font-mono tracking-widest mb-4" />
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Nouveau PIN (4 chiffres)</label>
              <div className="flex justify-center mb-5">
                <InputOTP maxLength={4} value={newPin} onChange={setNewPin}>
                  <InputOTPGroup>
                    {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-12 w-12 text-xl" />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setForgotStep("send"); setOtpCode(""); setNewPin(""); }} className="flex-1">Retour</Button>
                <Button onClick={confirmResetPin} disabled={resettingPin || otpCode.length !== 6 || newPin.length !== 4} className="flex-1"
                  style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}>
                  {resettingPin ? <Loader2 className="h-4 w-4 animate-spin" /> : "Réinitialiser"}
                </Button>
              </div>
              <button type="button" onClick={sendResetOtp} disabled={sendingOtp}
                className="w-full text-xs text-violet-600 hover:underline mt-3 disabled:opacity-50">
                {sendingOtp ? "Envoi..." : "Renvoyer le code"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Retrait — Dukaio" description="Retirez vos gains en toute sécurité." />
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50/40">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-violet-100/60">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
            <button onClick={() => (window.history.length > 1 ? navigate(-1) : window.close())} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Retour</span>
            </button>
            <span className="text-sm font-bold text-gray-900">Retrait Dukaio</span>
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-500">
              <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Sécurisé</span>
            </div>
          </div>
        </header>

        <main className="px-3 sm:px-6 py-6 sm:py-10">
          <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_360px] gap-0 bg-white md:rounded-3xl overflow-hidden shadow-2xl shadow-violet-900/10 ring-1 ring-violet-100/60">
            <div className="p-5 sm:p-8 md:p-10 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Demander un retrait</h1>
                <p className="text-sm text-gray-500 mt-1">Sélectionnez un wallet et confirmez avec votre PIN.</p>
              </div>

              {!canWithdraw && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Vérifiez votre identité (KYC) avant de pouvoir retirer.
                </div>
              )}

              {/* Wallet selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700">Wallet de réception</label>
                  <button onClick={() => window.open("/dashboard/wallet", "_blank")} className="text-[11px] text-violet-600 hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Gérer mes wallets
                  </button>
                </div>
                {wallets.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center bg-gray-50">
                    <WalletIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-3">Aucun wallet enregistré</p>
                    <Button size="sm" onClick={() => window.open("/dashboard/wallet", "_blank")}
                      style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}>
                      Créer un wallet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {wallets.map((w) => {
                      const p = findProvider(w.provider_code);
                      const sel = selectedWallet === w.id;
                      return (
                        <button key={w.id} type="button" onClick={() => setSelectedWallet(w.id)} disabled={!canWithdraw}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${sel ? "border-violet-500 bg-violet-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                          <div className="h-10 w-10 rounded-lg bg-white p-1 ring-1 ring-gray-100">
                            <img src={providerLogos[p.family]} alt="" className="h-full w-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-sm text-gray-900 truncate">{w.name}</p>
                              {w.is_default && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono">{w.phone} • {p.label}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Montant à retirer (FCFA)</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 50000" className="h-12 text-lg font-semibold bg-gray-50 border-gray-200"
                  disabled={!canWithdraw || wallets.length === 0} />
                <button type="button" onClick={() => setAmount(Math.floor(availableNet).toString())}
                  className="text-xs text-violet-600 mt-1 hover:underline">
                  Retirer tout ({Math.floor(availableNet).toLocaleString("fr")} FCFA)
                </button>
              </div>

              <Button onClick={handleSubmit}
                disabled={submitting || !canWithdraw || availableNet < 100 || wallets.length === 0 || !selectedWallet}
                className="w-full h-14 text-base font-bold rounded-xl"
                style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #4B1A8A 50%, #C9962E 130%)", boxShadow: "0 14px 36px -10px rgba(124,45,204,0.55)" }}>
                {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <WalletIcon className="h-5 w-5 mr-2" />}
                Retirer {numAmount > 0 ? numAmount.toLocaleString("fr") : ""} FCFA
              </Button>

              <p className="text-[11px] text-gray-400 text-center">
                Délai : 2 à 11 jours ouvrés selon votre opérateur. Frais inclus dans la commission Dukaio (10%).
              </p>
            </div>

            <div className="hidden md:flex flex-col text-white p-7 relative overflow-hidden"
              style={{ background: "linear-gradient(160deg, #7C2DCC 0%, #4B1A8A 50%, #1F0B3F 130%)" }}>
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
              <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-3">Solde net disponible</div>
                <div className="text-4xl font-extrabold mb-1 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                  {Math.floor(availableNet).toLocaleString("fr")}
                </div>
                <div className="text-sm text-white/70 mb-6">FCFA</div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between"><span className="text-white/70">Commission Dukaio</span><span className="font-semibold text-amber-300">10% (déjà déduit)</span></div>
                  <div className="flex items-center justify-between"><span className="text-white/70">Frais Mobile Money</span><span className="font-semibold text-amber-300">Inclus</span></div>
                  <div className="flex items-center justify-between"><span className="text-white/70">Maturité</span><span className="font-semibold">5 jours après vente</span></div>
                  <div className="flex items-center justify-between"><span className="text-white/70">Minimum retrait</span><span className="font-semibold">100 FCFA</span></div>
                </div>
                <div className="mt-auto pt-6">
                  <div className="rounded-xl bg-white/10 backdrop-blur p-3.5 border border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold mb-1"><ShieldCheck className="h-4 w-4 text-amber-300" /> Sécurité PIN</div>
                    <p className="text-[11px] text-white/70 leading-relaxed">Chaque retrait nécessite votre PIN à 4 chiffres.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default WithdrawNew;
