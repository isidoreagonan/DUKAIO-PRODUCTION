import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, ShieldCheck, Smartphone, Check,
  AlertCircle, Loader2, Star, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
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

export default function WalletAccounts() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
  const [savingAccount, setSavingAccount] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  // Form state
  const [accCountry, setAccCountry] = useState<string>("bj");
  const [accOperator, setAccOperator] = useState<string>("mtn_bj");
  const [accPhone, setAccPhone] = useState<string>("");
  const [accLabel, setAccLabel] = useState<string>("");
  const [accHolderName, setAccHolderName] = useState<string>("");
  const [accMakeDefault, setAccMakeDefault] = useState<boolean>(true);

  // Load saved wallets
  const loadWallets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedWallets((data as SavedWallet[]) || []);
    } catch (err: any) {
      toast.error("Erreur de chargement des comptes : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, [user]);

  // Selected country config
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

  // Save account handler
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cleanPh = accPhone.replace(/\D/g, "");
    if (cleanPh.length < 5) {
      toast.error("Veuillez saisir un numéro ou compte valide");
      return;
    }

    setSavingAccount(true);
    try {
      const isDefault = accMakeDefault || savedWallets.length === 0;

      const selectedNet =
        countryNetworks.find((n) => n.code === accOperator) ||
        countryNetworks[0];
      const providerCode = selectedNet ? selectedNet.code : accOperator;
      const dialCode = currentCountryConfig.dial.replace(/\D/g, "");
      const fullPhone = cleanPh.startsWith(dialCode)
        ? `+${cleanPh}`
        : `+${dialCode}${cleanPh}`;

      // If set to default, first reset existing defaults
      if (isDefault && savedWallets.length > 0) {
        await supabase
          .from("wallets")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      const { data, error } = await supabase
        .from("wallets")
        .insert({
          user_id: user.id,
          name: accLabel.trim() || `${selectedNet?.name || "Compte de retrait"}`,
          country: accCountry.toUpperCase(),
          provider_code: providerCode,
          phone: fullPhone,
          holder_first_name:
            accHolderName.trim() || profile?.display_name || "Créateur",
          holder_last_name: "",
          is_default: isDefault,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Compte de retrait enregistré avec succès !");

      // Reset form
      setAccPhone("");
      setAccLabel("");
      setAccHolderName("");

      // Reload
      await loadWallets();
    } catch (err: any) {
      toast.error("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setSavingAccount(false);
    }
  };

  // Set default account
  const handleSetDefault = async (walletId: string) => {
    if (!user) return;
    setSettingDefaultId(walletId);
    try {
      await supabase
        .from("wallets")
        .update({ is_default: false })
        .eq("user_id", user.id);

      const { error } = await supabase
        .from("wallets")
        .update({ is_default: true })
        .eq("id", walletId);

      if (error) throw error;

      setSavedWallets((prev) =>
        prev.map((w) => ({
          ...w,
          is_default: w.id === walletId,
        }))
      );
      toast.success("Compte défini par défaut pour vos retraits !");
    } catch (err: any) {
      toast.error("Erreur : " + err.message);
    } finally {
      setSettingDefaultId(null);
    }
  };

  // Delete account
  const handleDeleteAccount = async (walletId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce compte de retrait ?")) return;
    setDeletingId(walletId);
    try {
      const { error } = await supabase
        .from("wallets")
        .delete()
        .eq("id", walletId);

      if (error) throw error;

      setSavedWallets((prev) => prev.filter((w) => w.id !== walletId));
      toast.success("Compte supprimé avec succès");
    } catch (err: any) {
      toast.error("Erreur de suppression : " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <SEOHead
        title="Mes comptes de retrait | DUKAIO"
        description="Gérez vos coordonnées de paiement pour les retraits"
      />

      <div className="max-w-4xl mx-auto space-y-8 pb-16 font-sans">
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => navigate("/dashboard/wallet")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-3 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au portefeuille
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#263043]">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Mes comptes de retrait
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Gérez vos numéros Mobile Money et comptes bancaires pour recevoir vos gains instantanément.
              </p>
            </div>

            <Button
              onClick={() => {
                const el = document.getElementById("add-account-form");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0F172A] font-bold text-xs h-9 rounded-xl shadow-xs gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Ajouter un compte
            </Button>
          </div>
        </div>

        {/* ─── SECTION 1: LISTE DES COMPTES ENREGISTRÉS ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Comptes enregistrés ({savedWallets.length})
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Le compte par défaut est présélectionné lors des retraits
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-[#263043] bg-white dark:bg-[#151C2B]">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Chargement de vos comptes...</p>
            </div>
          ) : savedWallets.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-[#263043] bg-slate-50/50 dark:bg-[#151C2B]/40 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Aucun compte de retrait enregistré
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Vous n'avez pas encore configuré de compte Mobile Money ou bancaire. Utilisez le formulaire ci-dessous pour ajouter votre premier compte.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {savedWallets.map((sw) => {
                const meta = getOperatorMeta(sw.provider_code, sw.country);
                const isDefault = sw.is_default;
                return (
                  <div
                    key={sw.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDefault
                        ? "border-emerald-500/50 dark:border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30 shadow-xs"
                        : "border-slate-200 dark:border-[#263043] bg-white dark:bg-[#151C2B] hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Logo & Details */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative h-12 w-12 rounded-xl bg-white dark:bg-[#1E2536] border border-slate-200 dark:border-[#263043] flex items-center justify-center p-2 shrink-0 shadow-2xs overflow-hidden">
                          {meta.logo ? (
                            <img
                              src={meta.logo}
                              alt={meta.name}
                              className="h-full w-full max-h-8 max-w-8 object-contain"
                            />
                          ) : (
                            <Smartphone className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                          )}
                          {meta.flagUrl && (
                            <img
                              src={meta.flagUrl}
                              alt={meta.country}
                              className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full object-cover border border-white dark:border-[#1E2536] shadow-2xs"
                            />
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {sw.name}
                            </span>
                            <span className="text-[10px] font-semibold bg-slate-100 dark:bg-[#1E2536] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#263043] px-2 py-0.5 rounded-md">
                              {meta.name}
                            </span>
                            {isDefault && (
                              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                                <CheckCircle2 className="h-3 w-3" />
                                Compte par défaut
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                            {sw.phone}
                          </p>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Titulaire : <span className="font-semibold text-slate-700 dark:text-slate-300">{sw.holder_first_name}</span> • {meta.country} ({meta.currency})
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {!isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={settingDefaultId === sw.id}
                            onClick={() => handleSetDefault(sw.id)}
                            className="h-8 text-xs font-semibold rounded-lg border-slate-200 dark:border-[#263043] bg-white dark:bg-[#1E2536] hover:bg-slate-100 dark:hover:bg-[#252E42] text-slate-700 dark:text-slate-200 gap-1 cursor-pointer"
                          >
                            {settingDefaultId === sw.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Star className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            Définir par défaut
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === sw.id}
                          onClick={() => handleDeleteAccount(sw.id)}
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Supprimer ce compte"
                        >
                          {deletingId === sw.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── SECTION 2: AJOUTER UN NOUVEAU COMPTE ─── */}
        <div
          id="add-account-form"
          className="rounded-3xl border border-slate-200 dark:border-[#263043] bg-white dark:bg-[#151C2B] p-6 sm:p-8 space-y-6 shadow-xs"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-[#263043]">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Ajouter un nouveau compte de retrait
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sélectionnez votre pays et votre opérateur Mobile Money ou réseau bancaire officiel.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveAccount} className="space-y-6">
            {/* 1. Sélection du Pays */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                1. Pays de réception
              </Label>
              <div className="relative">
                <select
                  value={accCountry}
                  onChange={(e) => setAccCountry(e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 dark:border-[#263043] bg-slate-50 dark:bg-[#101726] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
                >
                  {SAASPAY_PAYOUT_COUNTRIES.map((c) => (
                    <option
                      key={c.code}
                      value={c.code}
                      className="bg-white dark:bg-[#101726] text-slate-900 dark:text-white"
                    >
                      {c.name} ({c.dial} • {c.currency})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <img
                    src={`https://flagcdn.com/w40/${accCountry.toLowerCase()}.png`}
                    alt={accCountry}
                    className="h-4 w-5 rounded object-cover shadow-2xs border border-slate-200 dark:border-[#263043]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Sélection du Réseau / Opérateur */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  2. Opérateur officiel ({countryNetworks.length} disponible{countryNetworks.length > 1 ? "s" : ""})
                </Label>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Devise : {currentCountryConfig.currency}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {countryNetworks.map((net) => {
                  const isSelected = accOperator === net.code;
                  const opMeta = SAASPAY_METHODS[net.operatorKey] || SAASPAY_METHODS.mtn;
                  return (
                    <button
                      type="button"
                      key={net.code}
                      onClick={() => setAccOperator(net.code)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-600/40 shadow-xs"
                          : "border-slate-200 dark:border-[#263043] bg-slate-50/60 dark:bg-[#101726] hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="h-9 w-9 rounded-lg bg-white dark:bg-[#1E2536] border border-slate-200 dark:border-[#263043] flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                        {opMeta.logos?.[0] ? (
                          <img
                            src={opMeta.logos[0]}
                            alt={net.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Smartphone className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {net.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {net.currency} direct
                        </p>
                      </div>
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Numéro de téléphone ou Compte */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                3. Numéro de téléphone Mobile Money ou Coordonnées
              </Label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 pointer-events-none select-none">
                  {currentCountryConfig.dial}
                </span>
                <Input
                  type="tel"
                  placeholder={currentCountryConfig.placeholder}
                  value={accPhone}
                  onChange={(e) => setAccPhone(e.target.value)}
                  className="pl-16 h-11 rounded-xl border-slate-200 dark:border-[#263043] bg-slate-50 dark:bg-[#101726] text-slate-900 dark:text-white font-mono font-bold text-sm focus:border-blue-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Saisissez le numéro sans le préfixe indicatif (ex: {currentCountryConfig.placeholder}).
              </p>
            </div>

            {/* 4. Nom du titulaire */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  4. Nom légal du titulaire
                </Label>
                <Input
                  type="text"
                  placeholder="Ex: Jean Dupont"
                  value={accHolderName}
                  onChange={(e) => setAccHolderName(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 dark:border-[#263043] bg-slate-50 dark:bg-[#101726] text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Le nom officiel enregistré sur la ligne téléphonique ou le compte bancaire.
                </p>
              </div>

              {/* 5. Libellé optionnel */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  5. Libellé du compte (Optionnel)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex: Mon MTN Principal"
                  value={accLabel}
                  onChange={(e) => setAccLabel(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 dark:border-[#263043] bg-slate-50 dark:bg-[#101726] text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Un nom mémo pour reconnaître ce compte dans votre liste.
                </p>
              </div>
            </div>

            {/* 6. Option Définir par défaut */}
            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="checkbox"
                id="make-default"
                checked={accMakeDefault}
                onChange={(e) => setAccMakeDefault(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-[#263043] bg-white dark:bg-[#101726] text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="make-default"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
              >
                Définir ce compte comme compte de retrait par défaut
              </label>
            </div>

            {/* 7. Bouton Submit */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#263043] flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/wallet")}
                className="h-11 rounded-xl text-xs font-semibold border-slate-200 dark:border-[#263043] bg-transparent hover:bg-slate-100 dark:hover:bg-[#1E2536] text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Annuler
              </Button>

              <Button
                type="submit"
                disabled={savingAccount || !accPhone.trim()}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs gap-2 cursor-pointer"
              >
                {savingAccount ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Enregistrer ce compte
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
