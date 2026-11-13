import { useState, useEffect, useMemo, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/data/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { toast } from "sonner";
import { isAdminUser } from "@/lib/admin";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  UploadCloud,
  FileCheck2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Wallet,
  Calendar,
  User,
  Globe,
  FileText,
  Eye,
  Info,
  Camera,
} from "lucide-react";

type DocumentType = "cni" | "passeport" | "autre";
type GenderType = "homme" | "femme" | "autre";

interface KYCVerification {
  id: string;
  user_id: string;
  document_type: string;
  document_front_url: string;
  document_back_url: string | null;
  selfie_url: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  birth_date: string | null;
  age: number | null;
  gender: string | null;
  birth_country: string | null;
  nationality: string | null;
  document_number: string | null;
}

export default function DashboardKYC() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verification, setVerification] = useState<KYCVerification | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<GenderType>("homme");
  const [birthCountry, setBirthCountry] = useState("Bénin");
  const [nationality, setNationality] = useState("Béninoise");
  const [documentType, setDocumentType] = useState<DocumentType>("cni");
  const [documentNumber, setDocumentNumber] = useState("");

  // Files & Previews
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Auto calculate age from birthDate
  const age = useMemo(() => {
    if (!birthDate) return null;
    const dob = new Date(birthDate);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let calculatedAge = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      calculatedAge--;
    }
    return calculatedAge >= 0 ? calculatedAge : null;
  }, [birthDate]);

  // Load existing KYC record on mount
  useEffect(() => {
    if (!user) return;
    loadKYC();
  }, [user]);

  const loadKYC = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("identity_verifications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching KYC:", error);
      }

      if (data) {
        setVerification(data as KYCVerification);
        // Pre-fill form values in case user wants to edit/resubmit
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setBirthDate(data.birth_date || "");
        setGender((data.gender as GenderType) || "homme");
        setBirthCountry(data.birth_country || "Bénin");
        setNationality(data.nationality || "Béninoise");
        setDocumentType((data.document_type as DocumentType) || "cni");
        setDocumentNumber(data.document_number || "");
        setFrontPreview(data.document_front_url || null);
        setBackPreview(data.document_back_url || null);
        setSelfiePreview(data.selfie_url || null);
      }
    } catch (err) {
      console.error("Failed to load KYC status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFrontFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier dépasse la taille maximale autorisée (10 Mo)");
      return;
    }

    setFrontFile(file);
    const reader = new FileReader();
    reader.onload = () => setFrontPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleBackFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier dépasse la taille maximale autorisée (10 Mo)");
      return;
    }

    setBackFile(file);
    const reader = new FileReader();
    reader.onload = () => setBackPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSelfieFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le selfie dépasse la taille maximale autorisée (10 Mo)");
      return;
    }

    setSelfieFile(file);
    const reader = new FileReader();
    reader.onload = () => setSelfiePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadFileToStorage = async (file: File, side: "front" | "back" | "selfie"): Promise<string> => {
    if (!user) throw new Error("Utilisateur non connecté");

    const fileExt = file.name.split(".").pop() || "jpg";
    const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
    const filePath = `${user.id}/${documentType}_${side}_${Date.now()}.${cleanExt}`;

    const { error: uploadErr } = await supabase.storage
      .from("kyc-documents")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });

    if (uploadErr) {
      console.error(`Upload error (${side}):`, uploadErr);
      throw uploadErr;
    }

    const { data: publicUrlData } = supabase.storage
      .from("kyc-documents")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Veuillez renseigner votre nom et votre prénom.");
      return;
    }

    if (!birthDate) {
      toast.error("Veuillez renseigner votre date de naissance.");
      return;
    }

    if (age === null || age < 18) {
      toast.error("Vous devez avoir au moins 18 ans pour valider votre compte.");
      return;
    }

    if (!birthCountry.trim()) {
      toast.error("Veuillez sélectionner votre pays de naissance.");
      return;
    }

    if (!nationality.trim()) {
      toast.error("Veuillez renseigner votre nationalité.");
      return;
    }

    if (!documentNumber.trim()) {
      toast.error("Veuillez saisir le numéro de votre pièce d'identité.");
      return;
    }

    // Documents check
    const existingFront = verification?.document_front_url;
    const existingBack = verification?.document_back_url;
    const existingSelfie = verification?.selfie_url;

    if (!frontFile && !existingFront) {
      toast.error("Veuillez importer la face Recto (avant) de votre pièce d'identité.");
      return;
    }

    if (documentType !== "passeport" && !backFile && !existingBack) {
      toast.error("Veuillez importer la face Verso (arrière) de votre pièce d'identité.");
      return;
    }

    if (!selfieFile && !existingSelfie) {
      toast.error("Veuillez importer votre selfie avec votre document en main.");
      return;
    }

    setSubmitting(true);
    setUploadProgress(15);

    try {
      let finalFrontUrl = existingFront || "";
      let finalBackUrl = documentType === "passeport" ? null : (existingBack || null);
      let finalSelfieUrl = existingSelfie || "";

      if (frontFile) {
        setUploadProgress(35);
        finalFrontUrl = await uploadFileToStorage(frontFile, "front");
      }

      if (backFile && documentType !== "passeport") {
        setUploadProgress(65);
        finalBackUrl = await uploadFileToStorage(backFile, "back");
      }

      if (selfieFile) {
        setUploadProgress(85);
        finalSelfieUrl = await uploadFileToStorage(selfieFile, "selfie");
      }

      setUploadProgress(95);

      const payload = {
        user_id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        birth_date: birthDate,
        age: age,
        gender: gender,
        birth_country: birthCountry.trim(),
        nationality: nationality.trim(),
        document_type: documentType,
        document_number: documentNumber.trim(),
        document_front_url: finalFrontUrl,
        document_back_url: finalBackUrl,
        selfie_url: finalSelfieUrl,
        status: "pending",
        rejection_reason: null,
        submitted_at: new Date().toISOString(),
      };

      const { data: savedData, error: saveErr } = await supabase
        .from("identity_verifications")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();

      if (saveErr) {
        throw saveErr;
      }

      setUploadProgress(100);

      // Notify admin in background
      try {
        await supabase.functions.invoke("admin-kyc", {
          body: { action: "notify_admin" },
        });
      } catch (notifyErr) {
        console.warn("Admin notification non-blocking warning:", notifyErr);
      }

      toast.success("Vos documents KYC ont été soumis avec succès !");
      setVerification(savedData as KYCVerification);
      setIsEditing(false);
      setFrontFile(null);
      setBackFile(null);
      setSelfieFile(null);
    } catch (err: any) {
      console.error("KYC submission error:", err);
      toast.error(err?.message || "Erreur lors de la soumission de vos documents");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement de votre statut KYC...</p>
        </div>
      </DashboardLayout>
    );
  }

  const isAdmin = isAdminUser(user?.email);
  const isApproved = isAdmin || verification?.status === "approved";
  const isPending = !isAdmin && verification?.status === "pending" && !isEditing;
  const isRejected = !isAdmin && verification?.status === "rejected" && !isEditing;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-16 font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 flex items-center justify-center">
                <Shield className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Vérification d'identité (KYC)
                </h1>
                <p className="text-xs text-muted-foreground">
                  Sécurisez vos transactions et débloquez les retraits instantanés
                </p>
              </div>
            </div>
          </div>

          {/* Quick status pill */}
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 flex items-center gap-1.5 px-3 py-1 text-xs font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                Admin — Exempté de KYC
              </Badge>
            ) : isApproved ? (
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 flex items-center gap-1.5 px-3 py-1 text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Compte Vérifié
              </Badge>
            ) : isPending ? (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 flex items-center gap-1.5 px-3 py-1 text-xs">
                <Clock className="h-3.5 w-3.5 text-amber-600 animate-spin" />
                En attente d'approbation
              </Badge>
            ) : isRejected ? (
              <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1 text-xs">
                <ShieldAlert className="h-3.5 w-3.5" />
                Non validé
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Admin VIP KYC Exemption Banner */}
        {isAdmin && (
          <div className="rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 text-2xl font-bold">
                👑
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-blue-950 dark:text-blue-100">
                    Compte Administrateur Dukaio — Exempté de vérification KYC
                  </h2>
                  <Badge className="bg-blue-600 text-white text-[11px] font-bold">
                    Accès Total Illimité
                  </Badge>
                </div>
                <p className="text-sm text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
                  En tant qu'administrateur de la plateforme Dukaio, l'ensemble de vos boutiques et comptes sont automatiquement validés et exemptés d'obligation de soumission de pièces d'identité. Tous vos retraits, créations de boutiques et fonctionnalités sont actifs sans aucune restriction.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-blue-200/60 dark:border-blue-900/60 text-xs">
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-blue-100 dark:border-blue-900">
                <p className="text-muted-foreground font-medium text-[11px]">Rôle Système</p>
                <p className="font-bold text-foreground text-sm mt-0.5">Super Administrateur</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-blue-100 dark:border-blue-900">
                <p className="text-muted-foreground font-medium text-[11px]">Statut Boutiques</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">100% Opérationnelles</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-blue-100 dark:border-blue-900">
                <p className="text-muted-foreground font-medium text-[11px]">Retraits (Payouts)</p>
                <p className="font-bold text-blue-600 dark:text-blue-400 text-sm mt-0.5">Débloqués en permanence</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                onClick={() => navigate("/dashboard/wallet?action=withdraw")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 rounded-xl"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Accéder au Portefeuille de Retrait
              </Button>
            </div>
          </div>
        )}

        {/* State Banner: Approved */}
        {!isAdmin && isApproved && verification && (
          <div className="rounded-3xl border border-emerald-500/30 bg-card p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <CheckCircle2 className="h-7 w-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground">
                  Félicitations, votre identité est 100% vérifiée !
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Votre profil est conforme aux exigences de conformité DUKAIO. Vous pouvez maintenant retirer vos fonds instantanément vers vos comptes Mobile Money ou bancaires sans aucune limite.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border text-xs">
              <div className="p-4 rounded-2xl bg-muted/40 dark:bg-slate-900/70 border border-border/80">
                <p className="text-muted-foreground font-medium text-[11px]">Titulaire validé</p>
                <p className="font-bold text-foreground text-sm mt-0.5">{verification.full_name}</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/40 dark:bg-slate-900/70 border border-border/80">
                <p className="text-muted-foreground font-medium text-[11px]">Document officiel</p>
                <p className="font-bold text-foreground text-sm mt-0.5 capitalize">
                  {verification.document_type === "cni" ? "Carte d'Identité" : verification.document_type} • {verification.document_number}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/40 dark:bg-slate-900/70 border border-border/80">
                <p className="text-muted-foreground font-medium text-[11px]">Validation DUKAIO</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                  {verification.reviewed_at
                    ? new Date(verification.reviewed_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                    : "Validé"}
                </p>
              </div>
            </div>

            {/* Aperçu des documents validés */}
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground">Pièces certifiées :</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {verification.document_front_url && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Face Recto</span>
                    <a href={verification.document_front_url} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-border overflow-hidden h-24 bg-muted/40 hover:opacity-85 transition-opacity">
                      <img src={verification.document_front_url} alt="Recto" className="h-full w-full object-cover" />
                    </a>
                  </div>
                )}
                {verification.document_back_url && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Face Verso</span>
                    <a href={verification.document_back_url} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-border overflow-hidden h-24 bg-muted/40 hover:opacity-85 transition-opacity">
                      <img src={verification.document_back_url} alt="Verso" className="h-full w-full object-cover" />
                    </a>
                  </div>
                )}
                {verification.selfie_url && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Selfie avec document</span>
                    <a href={verification.selfie_url} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-border overflow-hidden h-24 bg-muted/40 hover:opacity-85 transition-opacity">
                      <img src={verification.selfie_url} alt="Selfie" className="h-full w-full object-cover" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => navigate("/dashboard/wallet")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2 shadow-sm"
              >
                <Wallet className="h-4 w-4" />
                Accéder à mon portefeuille
              </Button>
            </div>
          </div>
        )}

        {/* State Banner: Pending */}
        {isPending && (
          <div className="rounded-3xl border border-amber-500/30 bg-card p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                <Clock className="h-7 w-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground">
                  Votre dossier est en cours de vérification
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Vos documents ont été transmis avec succès. Notre équipe de conformité examine les demandes sous un délai moyen de <strong>24h à 48h ouvrées</strong>. Vous recevrez une alerte dès l'approbation de votre compte.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border text-xs">
              <div className="p-4 rounded-2xl bg-muted/40 dark:bg-slate-900/70 border border-border/80">
                <p className="text-muted-foreground font-medium text-[11px]">Nom complet</p>
                <p className="font-bold text-foreground text-sm mt-0.5">{verification.full_name}</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/40 dark:bg-slate-900/70 border border-border/80">
                <p className="text-muted-foreground font-medium text-[11px]">Document soumis</p>
                <p className="font-bold text-foreground text-sm mt-0.5 capitalize">
                  {verification.document_type === "cni" ? "Carte d'identité" : verification.document_type} ({verification.document_number})
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/40 dark:bg-slate-900/70 border border-border/80">
                <p className="text-muted-foreground font-medium text-[11px]">Date d'envoi</p>
                <p className="font-bold text-foreground text-sm mt-0.5">
                  {new Date(verification.submitted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Aperçu des documents envoyés */}
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground">Documents transmis :</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {verification.document_front_url && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Face Recto</span>
                    <a href={verification.document_front_url} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-border overflow-hidden h-24 bg-muted/40 hover:opacity-85 transition-opacity">
                      <img src={verification.document_front_url} alt="Recto" className="h-full w-full object-cover" />
                    </a>
                  </div>
                )}
                {verification.document_back_url && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Face Verso</span>
                    <a href={verification.document_back_url} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-border overflow-hidden h-24 bg-muted/40 hover:opacity-85 transition-opacity">
                      <img src={verification.document_back_url} alt="Verso" className="h-full w-full object-cover" />
                    </a>
                  </div>
                )}
                {verification.selfie_url && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Selfie avec document</span>
                    <a href={verification.selfie_url} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-border overflow-hidden h-24 bg-muted/40 hover:opacity-85 transition-opacity">
                      <img src={verification.selfie_url} alt="Selfie" className="h-full w-full object-cover" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="h-4 w-4 text-amber-600" />
                Vous pouvez continuer à vendre vos produits et recevoir des paiements normalement.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-xs rounded-xl"
              >
                Mettre à jour les informations
              </Button>
            </div>
          </div>
        )}

        {/* State Banner: Rejected */}
        {isRejected && (
          <div className="rounded-3xl border border-destructive/40 bg-gradient-to-br from-destructive/10 via-card to-destructive/5 p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-destructive text-white flex items-center justify-center shadow-lg shadow-destructive/20 shrink-0">
                <AlertTriangle className="h-7 w-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground">
                  Votre demande de vérification a été rejetée
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  L'un de vos documents ou l'une de vos informations ne remplit pas les critères de conformité.
                </p>
              </div>
            </div>

            {verification.rejection_reason && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-xs sm:text-sm">
                <p className="font-semibold text-destructive mb-1">Motif du refus par l'administrateur :</p>
                <p className="text-foreground">{verification.rejection_reason}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-primary text-primary-foreground font-bold rounded-xl gap-2 shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Corriger et soumettre à nouveau
              </Button>
            </div>
          </div>
        )}

        {/* The KYC Form (Shown if not submitted, or if user is editing/rejected) */}
        {(!verification || isEditing) && !isApproved && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informative Guidance */}
            <div className="rounded-2xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 p-4 sm:p-5 flex items-start gap-3.5">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-foreground/90 space-y-1">
                <p className="font-bold">Information importante sur vos retraits</p>
                <p className="text-muted-foreground leading-relaxed">
                  La création de vos produits et vos ventes sont 100% libres dès l'inscription. La vérification KYC n'est exigée qu'à partir de votre <strong>premier retrait de fonds</strong> pour des raisons de conformité et de sécurité anti-fraude.
                </p>
              </div>
            </div>

            {/* Section 1: Informations Personnelles */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Informations personnelles
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ces informations doivent correspondre exactement à votre pièce d'identité officielle
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Prénom */}
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold text-foreground">
                    Prénom(s) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Ex: Koffi Marc"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="rounded-xl h-11"
                  />
                </div>

                {/* Nom */}
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold text-foreground">
                    Nom de famille <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Ex: DOSSOU"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="rounded-xl h-11"
                  />
                </div>

                {/* Date de naissance */}
                <div className="space-y-1.5">
                  <Label htmlFor="birthDate" className="text-xs font-semibold text-foreground">
                    Date de naissance <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className="rounded-xl h-11"
                  />
                </div>

                {/* Âge (Auto-calculé) */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Âge (Calculé automatiquement)
                  </Label>
                  <div className="h-11 rounded-xl border border-input bg-muted/40 px-3.5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">
                      {age !== null ? `${age} ans` : "Sélectionnez votre date"}
                    </span>
                    {age !== null && (
                      <Badge variant={age >= 18 ? "default" : "destructive"} className="text-[10px]">
                        {age >= 18 ? "Majeur (18+)" : "Mineur (-18 ans)"}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Genre / Sexe */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Genre / Sexe <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["homme", "femme", "autre"] as const).map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setGender(g)}
                        className={`h-11 rounded-xl border text-xs font-bold capitalize transition-all ${
                          gender === g
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pays de naissance */}
                <div className="space-y-1.5">
                  <Label htmlFor="birthCountry" className="text-xs font-semibold text-foreground">
                    Pays de naissance <span className="text-destructive">*</span>
                  </Label>
                  <CountrySelect
                    id="birthCountry"
                    value={birthCountry}
                    onChange={(name) => setBirthCountry(name)}
                    placeholder="Sélectionnez votre pays de naissance"
                  />
                </div>

                {/* Nationalité */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="nationality" className="text-xs font-semibold text-foreground">
                    Nationalité <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nationality"
                    placeholder="Ex: Béninoise, Ivoirienne, Sénégalaise, Française..."
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    required
                    className="rounded-xl h-11"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-muted-foreground mr-1">Suggestions rapides :</span>
                    {[
                      { label: "Béninoise", code: "bj" },
                      { label: "Ivoirienne", code: "ci" },
                      { label: "Sénégalaise", code: "sn" },
                      { label: "Togolaise", code: "tg" },
                      { label: "Camerounaise", code: "cm" },
                      { label: "Malienne", code: "ml" },
                      { label: "Burkinabè", code: "bf" },
                      { label: "Congolaise", code: "cd" },
                      { label: "Gabonaise", code: "ga" },
                      { label: "Française", code: "fr" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setNationality(item.label)}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                          nationality === item.label
                            ? "bg-primary/10 border-primary text-primary font-semibold"
                            : "bg-muted/40 border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        <img
                          src={`https://flagcdn.com/w20/${item.code}.png`}
                          alt={item.label}
                          className="h-2.5 w-3.5 rounded-[1px] object-cover"
                        />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Type de pièce d'identité */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Document officiel d'identification
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Choisissez le document officiel avec photo que vous souhaitez importer
                  </p>
                </div>
              </div>

              {/* 3 Document Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* CNI */}
                <div
                  onClick={() => setDocumentType("cni")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    documentType === "cni"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🪪</span>
                    {documentType === "cni" && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground">Carte d'Identité</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    CNI, CIP ou carte biométrique (Recto + Verso)
                  </p>
                </div>

                {/* Passeport */}
                <div
                  onClick={() => setDocumentType("passeport")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    documentType === "passeport"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">📘</span>
                    {documentType === "passeport" && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground">Passeport</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Page principale avec photo & signature (1 seule face)
                  </p>
                </div>

                {/* Autre document */}
                <div
                  onClick={() => setDocumentType("autre")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    documentType === "autre"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">📄</span>
                    {documentType === "autre" && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground">Autre document</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Permis de conduire ou titre de séjour (Recto + Verso)
                  </p>
                </div>
              </div>

              {/* Document Number */}
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="documentNumber" className="text-xs font-semibold text-foreground">
                  Numéro de la pièce d'identité <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="documentNumber"
                  placeholder={
                    documentType === "passeport"
                      ? "Ex: Numéro de passeport (ex: 21AA12345)"
                      : "Ex: Numéro CIP, NPI ou numéro de série officiel"
                  }
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  required
                  className="rounded-xl h-11 uppercase"
                />
              </div>
            </div>

            {/* Section 3: Import des fichiers */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Photos des documents
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Photos nettes, bien éclairées, tous les 4 coins visibles sans reflet ni doigts masquant le texte
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Face Recto */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">
                      Face Recto (Avant) <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[10px] text-muted-foreground">Photo & informations</span>
                  </div>

                  {frontPreview ? (
                    <div className="relative rounded-2xl border border-border overflow-hidden bg-slate-950/5 group h-48 flex items-center justify-center">
                      <img
                        src={frontPreview}
                        alt="Aperçu Recto"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors shadow">
                          Remplacer
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handleFrontFileChange}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFrontFile(null);
                            setFrontPreview(null);
                          }}
                          className="bg-destructive text-white p-1.5 rounded-lg hover:bg-destructive/90 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all h-48">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-foreground">
                          Importer la face Recto
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          PNG, JPG ou WEBP (Max 10 Mo)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFrontFileChange}
                      />
                    </label>
                  )}
                </div>

                {/* Face Verso (Only if NOT passeport) */}
                {documentType !== "passeport" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-foreground">
                        Face Verso (Arrière) <span className="text-destructive">*</span>
                      </Label>
                      <span className="text-[10px] text-muted-foreground">Dos de la carte</span>
                    </div>

                    {backPreview ? (
                      <div className="relative rounded-2xl border border-border overflow-hidden bg-slate-950/5 group h-48 flex items-center justify-center">
                        <img
                          src={backPreview}
                          alt="Aperçu Verso"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="cursor-pointer bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors shadow">
                            Remplacer
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={handleBackFileChange}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setBackFile(null);
                              setBackPreview(null);
                            }}
                            className="bg-destructive text-white p-1.5 rounded-lg hover:bg-destructive/90 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all h-48">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-foreground">
                            Importer la face Verso
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            PNG, JPG ou WEBP (Max 10 Mo)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={handleBackFileChange}
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 flex flex-col items-center justify-center text-center gap-2 h-48">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-bold text-foreground">Passeport sélectionné</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                      Seule la page d'identité principale (avec photo et données) est requise. Aucune face verso n'est nécessaire.
                    </p>
                  </div>
                )}
              </div>

              {/* Selfie avec le document en main */}
              <div className="space-y-3 pt-5 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Camera className="h-3.5 w-3.5" />
                    </div>
                    <Label className="text-xs font-bold text-foreground">
                      Selfie avec votre document en main <span className="text-destructive">*</span>
                    </Label>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">Requis pour tous les types de documents</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-foreground/90 flex items-start gap-3">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Tenez votre <strong>{documentType === "passeport" ? "passeport" : "pièce d'identité"}</strong> à côté de votre visage et prenez une photo bien éclairée. Votre visage et les écritures sur votre pièce doivent être tous deux parfaitement nets et lisibles (sans lunettes de soleil ni filtres).
                  </p>
                </div>

                {selfiePreview ? (
                  <div className="relative rounded-2xl border border-border overflow-hidden bg-slate-950/5 group h-56 flex items-center justify-center">
                    <img
                      src={selfiePreview}
                      alt="Aperçu Selfie"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer bg-white text-black px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors shadow">
                        Remplacer le selfie
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleSelfieFileChange}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSelfieFile(null);
                          setSelfiePreview(null);
                        }}
                        className="bg-destructive text-white p-2 rounded-lg hover:bg-destructive/90 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all h-48">
                    <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-foreground">
                        Prendre ou importer mon selfie avec le document
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Photo de vous tenant votre document à côté du visage (Max 10 Mo)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSelfieFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submission Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={submitting}
                  className="w-full sm:w-auto rounded-xl"
                >
                  Annuler
                </Button>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto min-w-[220px] h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploadProgress > 0 ? `Envoi en cours (${uploadProgress}%)` : "Traitement..."}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Soumettre ma vérification
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

