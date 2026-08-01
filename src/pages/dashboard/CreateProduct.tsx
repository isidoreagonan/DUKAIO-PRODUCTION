import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, GraduationCap, Key, Layers, Check, ArrowLeft,
  Upload, Image as ImageIcon, Package,
  Shield, Clock, Hash, Percent, Video, BookOpen, Download, Loader2, Sparkles
} from "lucide-react";
import CourseLessonsManager, { type Lesson } from "@/components/dashboard/CourseLessonsManager";
import RichTextEditor from "@/components/RichTextEditor";
import ProductModerationDialog, { type ProductModerationReview } from "@/components/dashboard/ProductModerationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

type ProductType = "file" | "course" | "license";

const productTypes = [
  {
    type: "file" as ProductType,
    label: "Fichiers",
    description: "E-books, templates, fichiers audio : vos clients téléchargent instantanément après achat.",
    icon: FileText,
    color: "bg-amber-500",
    features: ["Tous formats acceptés (PDF, ZIP, MP3…)", "Livraison automatique", "Téléchargement sécurisé"],
  },
  {
    type: "course" as ProductType,
    label: "Formations",
    description: "Créez des formations structurées avec vidéo, texte et contenu téléchargeable.",
    icon: GraduationCap,
    color: "bg-blue-500",
    features: ["Contenu vidéo, texte & téléchargeable", "Suivi de progression des étudiants", "Modules & leçons structurés"],
  },
  {
    type: "license" as ProductType,
    label: "Licences",
    description: "Vendez des clés de licence avec contrôle total sur les activations et la durée.",
    icon: Key,
    color: "bg-purple-500",
    features: ["Génération automatique de licences", "Limite d'activations par licence", "Durée de validité configurable", "Suivi en temps réel"],
  },
];

const TOTAL_STEPS = 5;

const CreateProduct = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 - Type
  const [selectedType, setSelectedType] = useState<ProductType | null>(null);

  // Step 2 - Details
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [pricingModel, setPricingModel] = useState("one_time");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");

  // License-specific
  const [licenseMaxActivations, setLicenseMaxActivations] = useState("");
  const [licenseValidityDays, setLicenseValidityDays] = useState("");

  // Course-specific
  const [courseContentType, setCourseContentType] = useState("mixed");

  // Step 3 - Description
  const [description, setDescription] = useState("");
  const [aiRewriting, setAiRewriting] = useState(false);
  const [aiRewritingTitle, setAiRewritingTitle] = useState(false);

  // Step 4 - Images
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Step 5 - Download file
  const [downloadFile, setDownloadFile] = useState<File | null>(null);

  // Course lessons
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);


  // Moderation
  const [moderationDialogOpen, setModerationDialogOpen] = useState(false);
  const [moderationReview, setModerationReview] = useState<ProductModerationReview | null>(null);
  const [moderationRedirectPath, setModerationRedirectPath] = useState<string | null>(null);

  const selectedTypeData = productTypes.find(t => t.type === selectedType);

  const handleFilePreview = (file: File, setter: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const priceNum = parseFloat(price) || 0;
  const originalPriceNum = parseFloat(originalPrice) || 0;
  const priceError = price && priceNum > 0 && priceNum < 100 ? "Le prix minimum est de 100 FCFA" : "";
  const originalPriceError = originalPrice && originalPriceNum > 0 && originalPriceNum <= priceNum
    ? "Le prix barré doit être supérieur au prix de vente" : "";


  const canNext = () => {
    switch (step) {
      case 1: return !!selectedType;
      case 2:
        return !!title.trim() && !!price && priceNum >= 100 && !priceError && !originalPriceError;
      case 3: return !!description.replace(/<[^>]*>/g, "").trim();
      case 4: return true;
      case 5:
        if (selectedType === "file") return !!downloadFile;
        if (selectedType === "course") return courseLessons.length > 0;
        return true;
      default: return false;
    }
  };

  const rewriteTitle = async () => {
    if (!title.trim()) {
      toast.error("Entrez d'abord un titre à améliorer");
      return;
    }
    setAiRewritingTitle(true);
    try {
      const { data, error } = await supabase.functions.invoke("rewrite-description", {
        body: {
          title,
          description: `Réécris uniquement le titre du produit "${title}" (type: ${selectedType || "fichier numérique"}) pour le rendre plus accrocheur, professionnel et vendeur. Réponds UNIQUEMENT avec le nouveau titre, sans guillemets, sans explication.`,
          productType: selectedType || "file",
        },
      });
      if (error) throw error;
      const newTitle = (data?.description || "").replace(/<[^>]*>/g, "").trim();
      if (newTitle) {
        setTitle(newTitle);
        toast.success("Titre amélioré par l'IA !");
      }
    } catch (err: any) {
      toast.error("Erreur IA : " + (err.message || "Réessayez"));
    } finally {
      setAiRewritingTitle(false);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${user!.id}/${Date.now()}.${ext}`;
    const isPublic = folder === "thumbnails" || folder === "banners";
    const bucketName = isPublic ? import.meta.env.VITE_R2_PUBLIC_BUCKET_NAME : import.meta.env.VITE_R2_PRIVATE_BUCKET_NAME;

    try {
      const { data, error } = await supabase.functions.invoke("r2-storage", {
        body: { action: "upload", bucket: bucketName, key: path, contentType: file.type }
      });
      if (error || !data?.url) throw new Error(error?.message || "Erreur de génération du lien d'upload R2");
      
      const uploadRes = await axios.put(data.url, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });
      
      if (uploadRes.status !== 200) throw new Error("Échec de l'upload vers Cloudflare");
      
      if (isPublic) {
        return `${import.meta.env.VITE_R2_PUBLIC_URL}/${path}`;
      }
      return path; 
    } catch (err: any) {
      toast.error(`Erreur upload: ${err.message}`);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedType || !title.trim()) return;
    if (selectedType === "file" && !downloadFile) {
      toast.error("Veuillez ajouter un fichier pour ce produit");
      return;
    }
    if (selectedType === "course" && courseLessons.length === 0) {
      toast.error("Veuillez ajouter au moins une leçon à votre formation");
      return;
    }

    setSaving(true);
    setIsUploading(true);
    let createdProductId: string | null = null;

    try {
      let thumbnailUrl: string | null = null;
      let downloadUrl: string | null = null;

      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, "thumbnails");
        if (!thumbnailUrl) throw new Error("L'upload de la vignette a échoué. Le produit n'a pas été créé.");
      }
      if (downloadFile) {
        downloadUrl = await uploadFile(downloadFile, "downloads");
        if (!downloadUrl) throw new Error("L'upload du fichier a échoué. Le produit n'a pas été créé.");
      }

      const effectivePrice = parseFloat(price);

      const productData: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        price: effectivePrice,
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        type: selectedType,
        thumbnail_url: thumbnailUrl,
        download_url: downloadUrl,
        creator_id: user.id,
        is_published: false,
      };

      if (selectedType === "license") {
        productData.license_max_activations = licenseMaxActivations ? parseInt(licenseMaxActivations) : null;
        productData.license_validity_days = licenseValidityDays ? parseInt(licenseValidityDays) : null;
      }

      if (selectedType === "course") {
        productData.course_content_type = courseContentType;
      }


      const { data: productResult, error } = await supabase
        .from("products")
        .insert(productData as any)
        .select("id")
        .single();

      if (error || !productResult) {
        throw error || new Error("Impossible de créer le produit");
      }

      createdProductId = productResult.id;

      if (selectedType === "course" && courseLessons.length > 0) {
        const lessonsToInsert = [];
        for (const lesson of courseLessons) {
          let videoUrl = lesson.video_url;
          if (lesson.video_type === "upload" && lesson.file) {
            const uploaded = await uploadFile(lesson.file, "course-videos");
            if (uploaded) videoUrl = uploaded;
          }
          lessonsToInsert.push({
            product_id: productResult.id,
            title: lesson.title || `Leçon ${lesson.position + 1}`,
            description: lesson.description || null,
            video_url: videoUrl || null,
            video_type: lesson.video_type,
            duration_minutes: lesson.duration_minutes,
            position: lesson.position,
          });
        }
        const { error: lessonsError } = await supabase.from("course_lessons").insert(lessonsToInsert);
        if (lessonsError) {
          toast.error("Produit créé mais erreur sur les leçons: " + lessonsError.message);
        }
      }


      const { data: moderationData, error: moderationError } = await supabase.functions.invoke("analyze-product-moderation", {
        body: { productId: productResult.id },
      });

      if (moderationError) throw moderationError;
      if (moderationData?.error) throw new Error(moderationData.error);

      const review = moderationData?.review as ProductModerationReview;
      setModerationReview(review);

      if (review?.status === "rejected") {
        // Only block for rejected (illegal/scam)
        setModerationDialogOpen(true);
        setModerationRedirectPath(`/dashboard/products/${productResult.id}/edit`);
        toast.error("Publication bloquée par la modération.");
      } else {
        // approved or needs_review → publish silently
        const { error: publishError } = await supabase
          .from("products")
          .update({ is_published: true })
          .eq("id", productResult.id);

        if (publishError) throw publishError;

        if (review?.status === "approved") {
          setModerationDialogOpen(true);
          setModerationRedirectPath("/dashboard/products");
        } else {
          // needs_review: publish without popup, admin notified by email
          setModerationRedirectPath(null);
          navigate("/dashboard/products");
        }
        toast.success("Produit publié avec succès !");
      }
    } catch (error: any) {
      if (createdProductId) {
        toast.error(error.message || "Analyse impossible. Le produit a été enregistré en brouillon.");
        navigate(`/dashboard/products/${createdProductId}/edit`);
      } else {
        toast.error(error.message || "Impossible de créer le produit.");
      }
    } finally {
      setSaving(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getStep5Content = () => {
    switch (selectedType) {
      case "file":
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Téléchargez votre fichier</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Formats acceptés : Images, PDF, ZIP. (Fichiers audio et vidéo strictement interdits).
            </p>
            <div
              className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => document.getElementById("download-input")?.click()}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-amber-600" />
                </div>
                <Button variant="outline" className="gap-2 rounded-full pointer-events-none">
                  <Upload className="h-4 w-4" /> Choisir un fichier
                </Button>
                <p className="text-xs text-muted-foreground">
                  Images, PDF, ZIP uniquement. Taille max: 30 MB
                </p>
              </div>
              {downloadFile && (
                <p className="text-sm font-medium text-foreground mt-4">
                  📎 {downloadFile.name}
                </p>
              )}
              <input
                id="download-input"
                type="file"
                className="hidden"
                accept="image/*,.pdf,.zip,.rar"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
                      toast({
                        title: "Format non autorisé",
                        description: "Les fichiers vidéo et audio ne sont pas autorisés pour le moment en raison des limites de stockage. Utilisez un fichier ZIP ou PDF contenant un lien externe.",
                        variant: "destructive"
                      });
                      e.target.value = ""; // Reset input
                      return;
                    }
                    if (file.size > 30 * 1024 * 1024) {
                      toast({
                        title: "Fichier trop volumineux",
                        description: "La taille limite est de 30 MB. Veuillez héberger votre fichier sur Google Drive, créer un document avec le lien, et importer ce document ici.",
                        variant: "destructive"
                      });
                      e.target.value = ""; // Reset input
                      return;
                    }
                    setDownloadFile(file);
                  } else {
                    setDownloadFile(null);
                  }
                }}
              />
            </div>
            <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                <Shield className="h-4 w-4" />
                <span>Téléchargement sécurisé avec liens temporaires</span>
              </div>
            </div>
          </div>
        );

      case "course":
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Contenu de la formation</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Structurez votre formation en leçons. Ajoutez des vidéos via lien externe ou upload direct.
            </p>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "video", label: "Vidéo", icon: Video, desc: "Cours en vidéo" },
                  { value: "text", label: "Texte", icon: BookOpen, desc: "Contenu écrit" },
                  { value: "mixed", label: "Mixte", icon: Layers, desc: "Vidéo + texte + fichiers" },
                ].map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => setCourseContentType(ct.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      courseContentType === ct.value
                        ? "border-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <ct.icon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-semibold text-foreground">{ct.label}</p>
                    <p className="text-xs text-muted-foreground">{ct.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <CourseLessonsManager
              lessons={courseLessons}
              onLessonsChange={setCourseLessons}
            />

            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                <GraduationCap className="h-4 w-4" />
                <span>La progression des étudiants sera suivie automatiquement</span>
              </div>
            </div>
          </div>
        );

      case "license":
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Configuration de la licence</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Les clés de licence seront générées automatiquement à chaque achat.
            </p>

            <div className="space-y-6">
              <div className="p-5 rounded-xl border border-border bg-card space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-purple-500" />
                    Nombre max d'activations par licence
                  </label>
                  <Input
                    type="number"
                    value={licenseMaxActivations}
                    onChange={(e) => setLicenseMaxActivations(e.target.value)}
                    placeholder="Ex: 3 (laisser vide pour illimité)"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Limitez le nombre d'appareils sur lesquels la licence peut être activée.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    Durée de validité (en jours)
                  </label>
                  <Input
                    type="number"
                    value={licenseValidityDays}
                    onChange={(e) => setLicenseValidityDays(e.target.value)}
                    placeholder="Ex: 365 (laisser vide pour illimité)"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Après ce délai, la licence expirera automatiquement.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Fichier associé (optionnel)
                </label>
                <div
                  className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => document.getElementById("download-input")?.click()}
                >
                  <Button variant="outline" size="sm" className="gap-2 rounded-full pointer-events-none">
                    <Upload className="h-4 w-4" /> Ajouter un fichier
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Logiciel, documentation, etc.
                  </p>
                  {downloadFile && (
                    <p className="text-sm font-medium text-foreground mt-3">
                      📎 {downloadFile.name}
                    </p>
                  )}
                  <input
                    id="download-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => setDownloadFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-400">
                  <Key className="h-4 w-4" />
                  <span>Les activations seront suivies en temps réel dans votre dashboard</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate("/dashboard/products")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-foreground">Créer un produit</span>
        </div>

        {/* Type banner */}
        {selectedTypeData && step > 1 && (
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-secondary">
            <div className={`h-10 w-10 rounded-xl ${selectedTypeData.color} flex items-center justify-center`}>
              <selectedTypeData.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedTypeData.label}</p>
              <p className="text-xs text-muted-foreground">{selectedTypeData.description}</p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < step ? "bg-foreground" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Type */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-8 italic">
                  Quel type de produit désirez-vous créer ?
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {productTypes.map((pt) => (
                    <button
                      key={pt.type}
                      onClick={() => setSelectedType(pt.type)}
                      className={`relative p-6 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                        selectedType === pt.type
                          ? "border-amber-400 bg-amber-50/50 dark:bg-amber-900/10"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      {selectedType === pt.type && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className={`h-12 w-12 rounded-xl ${pt.color} flex items-center justify-center mb-3`}>
                        <pt.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{pt.label}</p>
                    </button>
                  ))}
                </div>

                {selectedTypeData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 rounded-xl border border-border bg-card"
                  >
                    <h3 className="text-lg font-bold text-foreground mb-2">{selectedTypeData.label}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{selectedTypeData.description}</p>
                    <div className="space-y-2">
                      {selectedTypeData.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-8">Détails du produit</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Nom du produit <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Guide complet Facebook Ads 2025"
                        className="h-12 flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 shrink-0 border-primary/30 hover:bg-primary/5"
                        onClick={rewriteTitle}
                        disabled={aiRewritingTitle || !title.trim()}
                        title="Améliorer le titre avec l'IA"
                      >
                        {aiRewritingTitle ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">💡 Cliquez sur l'icône ✨ pour améliorer votre titre avec l'IA</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Catégorie <span className="text-destructive">*</span>
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Dans quelle catégorie classer ce produit ?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">💼 Business</SelectItem>
                        <SelectItem value="design">🎨 Design</SelectItem>
                        <SelectItem value="tech">💻 Tech & Code</SelectItem>
                        <SelectItem value="marketing">📈 Marketing</SelectItem>
                        <SelectItem value="education">🎓 Éducation</SelectItem>
                        <SelectItem value="lifestyle">🌿 Lifestyle</SelectItem>
                        <SelectItem value="creative">🎬 Créatif</SelectItem>
                        <SelectItem value="other">✨ Autres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Modèle de tarification <span className="text-destructive">*</span>
                    </label>
                    <Select value={pricingModel} onValueChange={setPricingModel}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">Paiement unique</SelectItem>
                        <SelectItem value="subscription">Abonnement</SelectItem>
                        <SelectItem value="free">Gratuit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Prix <span className="text-destructive">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">FCFA</span>
                        <Input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className={`h-12 pl-14 ${priceError ? "border-destructive" : ""}`}
                          placeholder="100"
                          min={100}
                        />
                      </div>
                      {priceError && <p className="text-[11px] text-destructive mt-1">{priceError}</p>}
                      {!priceError && <p className="text-[11px] text-muted-foreground mt-1">Min : 100 FCFA</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Prix barré</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">FCFA</span>
                        <Input
                          type="number"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          className={`h-12 pl-14 ${originalPriceError ? "border-destructive" : ""}`}
                          placeholder="0"
                        />
                      </div>
                      {originalPriceError && <p className="text-[11px] text-destructive mt-1">{originalPriceError}</p>}
                      {!originalPriceError && originalPrice && originalPriceNum > priceNum && (
                        <p className="text-[11px] text-emerald-600 mt-1">
                          Réduction de {Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)}%
                        </p>
                      )}
                    </div>
                  </div>

                  {/* License-specific fields in step 2 */}
                  {selectedType === "license" && (
                    <div className="p-5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10 space-y-4">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Key className="h-4 w-4 text-purple-500" />
                        Options de licence
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1 block">Max activations</label>
                          <Input
                            type="number"
                            value={licenseMaxActivations}
                            onChange={(e) => setLicenseMaxActivations(e.target.value)}
                            placeholder="Illimité"
                            className="h-10"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1 block">Validité (jours)</label>
                          <Input
                            type="number"
                            value={licenseValidityDays}
                            onChange={(e) => setLicenseValidityDays(e.target.value)}
                            placeholder="Illimité"
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Description */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">Ajouter la description du produit</h2>
                <p className="text-sm text-muted-foreground mb-6">La description est obligatoire pour pouvoir publier votre produit.</p>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground">Décrivez votre produit</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-full text-xs"
                      disabled={aiRewriting || !title.trim()}
                      onClick={async () => {
                        setAiRewriting(true);
                        try {
                          const { data, error } = await supabase.functions.invoke('rewrite-description', {
                            body: { title, description, productType: selectedType },
                          });
                          if (error) throw error;
                          if (data?.description) {
                            setDescription(data.description);
                            toast.success("Description réécrite par l'IA !");
                          }
                        } catch (err: any) {
                          toast.error("Erreur IA: " + (err.message || "Réessayez"));
                        } finally {
                          setAiRewriting(false);
                        }
                      }}
                    >
                      {aiRewriting ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> Réécriture...</>
                      ) : (
                        <>✨ Assistant IA</>
                      )}
                    </Button>
                  </div>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Décrivez votre produit en détail. Utilisez la barre d'outils pour formater le texte, ajouter des liens, des images..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Images */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-8">Personnaliser la page produit</h2>
                <div className="space-y-8">
                  {/* Thumbnail */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Ajouter une vignette
                    </label>
                    <div
                      className="relative w-48 h-48 rounded-xl bg-secondary border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center overflow-hidden"
                      onClick={() => document.getElementById("thumbnail-input")?.click()}
                    >
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Vignette" className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                      )}
                      <input
                        id="thumbnail-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            if (f.size > 2 * 1024 * 1024) {
                              toast({
                                title: "Image trop lourde",
                                description: "La taille de la vignette ne doit pas dépasser 2 MB.",
                                variant: "destructive"
                              });
                              e.target.value = "";
                              return;
                            }
                            setThumbnailFile(f);
                            handleFilePreview(f, setThumbnailPreview);
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Créez une vignette mémorable. Utilisez une image (Max 2 MB) au format JPG ou PNG.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Type-specific content */}
            {step === 5 && getStep5Content()}
          </motion.div>
        </AnimatePresence>

        {/* Upload Progress Bar */}
        {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full max-w-md mx-auto mt-6 px-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground font-medium">
              <span>Téléversement du fichier...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2.5 w-full bg-primary/20" />
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-center gap-3 mt-10">
          {step > 1 && (
            <Button variant="outline" className="rounded-full px-8" onClick={() => setStep(step - 1)}>
              Retour
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              className="rounded-full px-8 bg-amber-500 hover:bg-amber-600 text-white"
              disabled={!canNext()}
              onClick={() => setStep(step + 1)}
            >
              Continuer
            </Button>
          ) : (
            <Button
              className="rounded-full px-8 bg-amber-500 hover:bg-amber-600 text-white"
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving ? "Analyse en cours..." : "Analyser et publier"}
            </Button>
          )}
        </div>
      </div>

      <ProductModerationDialog
        open={moderationDialogOpen}
        onOpenChange={(open) => {
          setModerationDialogOpen(open);
          if (!open && moderationRedirectPath) {
            navigate(moderationRedirectPath);
          }
        }}
        review={moderationReview}
      />
    </DashboardLayout>
  );
};

export default CreateProduct;
