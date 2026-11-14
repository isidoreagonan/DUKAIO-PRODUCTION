import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, GraduationCap, Key, Layers, Check, ArrowLeft,
  Upload, Image as ImageIcon, Package,
  Shield, Clock, Hash, Percent, Video, BookOpen, Download, Loader2, Sparkles,
  CheckCircle2, Cloud, Film
} from "lucide-react";
import axios from "axios";
import RichTextEditor from "@/components/RichTextEditor";
import CourseLessonsManager, { type Lesson } from "@/components/dashboard/CourseLessonsManager";
import { FileSizeLimitDialog } from "@/components/dashboard/FileSizeLimitDialog";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { uploadToBunny, deleteFromBunny } from "@/lib/bunnyStorage";

type ProductType = "file" | "course" | "service";

import React from "react";
import StoreRequiredDialog from "@/components/dashboard/StoreRequiredDialog";
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 bg-red-100 text-red-900 border border-red-500 rounded">
        <strong>CRASH:</strong> {this.state.error?.toString()} <br/><br/>
        {this.state.error?.stack}
      </div>;
    }
    return this.props.children;
  }
}

const productTypes = [
  {
    type: "file" as ProductType,
    label: "Produits digitaux",
    description: "E-books, templates, audios : téléchargement instantané.",
    image: "/images/product-types/digital-product.png",
    features: ["Tous formats acceptés (PDF, ZIP, MP3…)", "Livraison automatique", "Téléchargement sécurisé"],
    icon: FileText,
    color: "bg-blue-600",
  },
  {
    type: "course" as ProductType,
    label: "Formations",
    description: "Créez des formations avec vidéo et contenu téléchargeable.",
    image: "/images/product-types/course.png",
    features: ["Contenu vidéo, texte & téléchargeable", "Suivi de progression des étudiants", "Modules structurés"],
    icon: GraduationCap,
    color: "bg-orange-500",
  },
  {
    type: "service" as ProductType,
    label: "Services",
    description: "Vendez vos prestations de services en ligne.",
    image: "/images/product-types/service.png",
    features: ["Planification", "Paiement d'avance", "Gestion client"],
    icon: Layers,
    color: "bg-rose-500",
    comingSoon: true,
  },
];

const TOTAL_STEPS = 5;

type UploadedFile = {
  name: string;
  url?: string;
  path?: string;
  progress: number;
  isUploading: boolean;
  error?: string;
  previewUrl?: string;
};

const CreateProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [hasStore, setHasStore] = useState<boolean>(true);
  const [storeRequiredOpen, setStoreRequiredOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkStore = async () => {
      const { data } = await supabase.from("stores").select("id").eq("owner_id", user.id).limit(1);
      setHasStore(data && data.length > 0 ? true : false);
    };
    checkStore();
  }, [user]);

  // Step 1 - Type
  const [selectedType, setSelectedType] = useState<ProductType | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Size limit dialog state
  const [sizeLimitDialogOpen, setSizeLimitDialogOpen] = useState(false);
  const [sizeLimitMaxMB, setSizeLimitMaxMB] = useState(2);
  
  // Delete confirm dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteAction, setPendingDeleteAction] = useState<{ name: string; action: () => void } | null>(null);
  
  const [pricingModel, setPricingModel] = useState("one_time");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Course-specific
  const [courseContentType, setCourseContentType] = useState("mixed");

  // Step 3 - Description
  const [description, setDescription] = useState("");
  const [aiRewriting, setAiRewriting] = useState(false);
  const [aiRewritingTitle, setAiRewritingTitle] = useState(false);

  // Step 4 - Images
  const [thumbnailData, setThumbnailData] = useState<UploadedFile | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Step 5 - Download file
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Course lessons
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);

  const selectedTypeData = productTypes.find(t => t.type === selectedType);

  const handleFilePreview = (file: File, setter: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const priceNum = parseFloat(price) || 0;
  const originalPriceNum = parseFloat(originalPrice) || 0;

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Le nom du produit est obligatoire";
    if (!category) newErrors.category = "Veuillez sélectionner une catégorie";
    
    if (pricingModel === "one_time") {
      if (!price || priceNum < 1000) newErrors.price = "Le prix de vente doit être d'au moins 1000 FCFA";
    } else if (pricingModel === "pay_what_you_want") {
      if (!price || priceNum < 1000) newErrors.price = "Le prix minimum doit être d'au moins 1000 FCFA";
      if (!suggestedPrice || parseFloat(suggestedPrice) < priceNum) newErrors.suggestedPrice = "Le prix suggéré est obligatoire et doit être supérieur au prix minimum";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    const textContent = description.replace(/<[^>]*>/g, "").trim();
    if (!textContent) newErrors.description = "La description du produit est obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    
    if (step === 2 && title.trim()) {
      try {
        const productData = {
          title: title.trim(),
          category: category || null,
          price: pricingModel === "free" ? 0 : parseFloat(price),
          type: selectedType,
          creator_id: user?.id,
          is_published: false,
        };
        
        if (draftId) {
          await supabase.from("products").update(productData).eq("id", draftId);
        } else {
          const { data } = await supabase.from("products").insert(productData).select("id").single();
          if (data) setDraftId(data.id);
        }
      } catch (e) {
        console.error("Auto draft failed", e);
      }
    }
    
    setStep(step + 1);
  };

  const isAnyFileUploading =
    uploadedFiles.some(f => f.isUploading) ||
    courseLessons.some(l => l.isUploading) ||
    !!thumbnailData?.isUploading;

  const canNext = () => {
    if (isAnyFileUploading) return false;
    switch (step) {
      case 1: return !!selectedType;
      case 2: return true; // Validation is done on click
      case 3: return true; // Validation is done on click
      case 4: return !thumbnailData?.isUploading;
      case 5:
        if (selectedType === "file") return uploadedFiles.some(f => f.url && !f.isUploading) && !uploadedFiles.some(f => f.isUploading);
        if (selectedType === "course") return courseLessons.length > 0 && !courseLessons.some(l => l.isUploading);
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

  const deleteFileFromR2 = async (path: string, isPublic: boolean) => {
    try {
      await deleteFromBunny(path, isPublic ? "media" : "files");
    } catch (e) {
      console.error("Failed to delete from Bunny", e);
    }
  };

  const uploadFile = async (
    file: File,
    folder: string,
    onProgress: (progress: number) => void
  ): Promise<{ url: string; path: string } | null> => {
    const isPublicMedia = folder === "thumbnails" || folder === "banners" || folder === "seo-images";

    let currentUserId = user?.id;
    if (!currentUserId) {
      const { data } = await supabase.auth.getUser();
      currentUserId = data?.user?.id || "anonymous";
    }

    // Media assets (Thumbnails, Covers, SEO images, Banners) are stored on Supabase Storage (100GB plan)
    if (isPublicMedia) {
      const ext = file.name.split(".").pop() || "jpg";
      const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${currentUserId}/${folder}_${Date.now()}.${cleanExt}`;

      try {
        const { error: uploadErr } = await supabase.storage
          .from("product-assets")
          .upload(path, file, {
            upsert: true,
            contentType: file.type || "image/jpeg",
          });

        if (uploadErr) {
          console.warn("Supabase storage error, falling back to Bunny:", uploadErr);
          throw uploadErr;
        }

        const { data: pubData } = supabase.storage
          .from("product-assets")
          .getPublicUrl(path);

        onProgress(100);
        return { url: pubData.publicUrl, path };
      } catch (err: any) {
        // Resilient fallback to Bunny.net if Supabase encounters any issue
        try {
          const res = await uploadToBunny(file, path, "media", onProgress);
          return { url: res.url, path: res.path };
        } catch (bunnyErr: any) {
          toast.error(`Erreur upload image: ${err.message || bunnyErr.message}`);
          return null;
        }
      }
    }

    // Heavy downloadable product files (zip, software, courses, videos)
    const ext = file.name.split(".").pop();
    const path = `${folder}/${currentUserId}/${Date.now()}.${ext}`;

    try {
      const res = await uploadToBunny(file, path, "files", onProgress);
      return { url: res.url, path: res.path };
    } catch (err: any) {
      toast.error(`Erreur téléversement fichier : ${err.message || "Échec"}`);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedType || !title.trim()) return;
    if (isAnyFileUploading) {
      toast.error("Veuillez attendre la fin du téléversement de vos fichiers avant de publier");
      return;
    }
    if (selectedType === "file" && uploadedFiles.filter(f => f.url).length === 0) {
      toast.error("Veuillez ajouter au moins un fichier pour ce produit");
      return;
    }
    if (selectedType === "course" && courseLessons.length === 0) {
      toast.error("Veuillez ajouter au moins une leçon à votre formation");
      return;
    }

    setSaving(true);
    let createdProductId: string | null = null;

    try {
      const effectivePrice = parseFloat(price);
      const downloadUrls = uploadedFiles.filter(f => f.url).map(f => f.url);

      const productData: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        price: pricingModel === "free" ? 0 : effectivePrice,
        original_price: originalPrice && pricingModel === "one_time" ? parseFloat(originalPrice) : null,
        type: selectedType,
        thumbnail_url: thumbnailData?.url || null,
        download_url: downloadUrls.length > 0 ? JSON.stringify(downloadUrls) : null,
        creator_id: user.id,
        is_published: hasStore ? true : false,
      };

      if (selectedType === "course") {
        productData.course_content_type = courseContentType;
      }

      let productResult;
      
      if (draftId) {
        const { data, error } = await supabase
          .from("products")
          .update(productData as any)
          .eq("id", draftId)
          .select("id")
          .single();
        if (error) throw error;
        productResult = data;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(productData as any)
          .select("id")
          .single();
        if (error) throw error;
        productResult = data;
      }

      if (error || !productResult) {
        throw error || new Error("Impossible de créer le produit");
      }

      createdProductId = productResult.id;

      if (selectedType === "course" && courseLessons.length > 0) {
        const lessonsToInsert = courseLessons.map((lesson) => ({
          product_id: productResult.id,
          title: lesson.title || `Leçon ${lesson.position + 1}`,
          description: lesson.description || null,
          video_url: lesson.video_url || null,
          video_type: lesson.video_type,
          duration_minutes: lesson.duration_minutes,
          position: lesson.position,
        }));
        const { error: lessonsError } = await supabase.from("course_lessons").insert(lessonsToInsert);
        if (lessonsError) {
          toast.error("Produit créé mais erreur sur les leçons: " + lessonsError.message);
        }
      }

      if (!hasStore) {
        setStoreRequiredOpen(true);
        return; // Don't navigate, let them read the dialog
      }

      toast.success("Produit publié avec succès !");
      navigate("/dashboard/products");
    } catch (error: any) {
      if (createdProductId) {
        toast.error(error.message || "Erreur. Le produit a été enregistré en brouillon.");
        navigate(`/dashboard/products/${createdProductId}/edit`);
      } else {
        toast.error(error.message || "Impossible de créer le produit.");
      }
    } finally {
      setSaving(false);
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
            <div className="space-y-4">
              <div
                className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById("download-input")?.click()}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-amber-600" />
                  </div>
                  <Button variant="outline" className="gap-2 rounded-full pointer-events-none">
                    <Upload className="h-4 w-4" /> Choisir un fichier (Max 5)
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Images, PDF, ZIP uniquement. Taille max: 30 MB par fichier.
                  </p>
                </div>
                <input
                  id="download-input"
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.zip,.rar"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    
                    if (uploadedFiles.length + files.length > 5) {
                      toast.error("Vous ne pouvez ajouter que 5 fichiers maximum.");
                      e.target.value = "";
                      return;
                    }

                    for (const f of files) {
                      if (f.type.startsWith("video/") || f.type.startsWith("audio/")) {
                        toast.error("Les fichiers vidéo et audio ne sont pas autorisés.");
                        continue;
                      }
                      if (f.size > 30 * 1024 * 1024) {
                        setSizeLimitMaxMB(30);
                        setSizeLimitDialogOpen(true);
                        continue;
                      }

                      const newFile: UploadedFile = { name: f.name, progress: 0, isUploading: true };
                      setUploadedFiles(prev => [...prev, newFile]);
                      
                      uploadFile(f, "downloads", (p) => {
                        setUploadedFiles(prev => prev.map(pf => pf.name === f.name ? { ...pf, progress: p } : pf));
                      }).then(res => {
                        if (res) {
                          setUploadedFiles(prev => prev.map(pf => pf.name === f.name ? { ...pf, progress: 100, isUploading: false, url: res.url, path: res.path } : pf));
                        } else {
                          setUploadedFiles(prev => prev.filter(pf => pf.name !== f.name));
                        }
                      });
                    }
                    e.target.value = "";
                  }}
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  {uploadedFiles.map((uf, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-xs font-semibold truncate text-foreground">{uf.name}</p>
                        {uf.isUploading ? (
                          <div className="mt-1.5 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Téléversement en cours...
                              </span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">{uf.progress}%</span>
                            </div>
                            <Progress value={uf.progress} className="h-1.5 w-full bg-blue-100 dark:bg-blue-900/40" />
                          </div>
                        ) : (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Téléversé et sécurisé</span>
                          </div>
                        )}
                      </div>
                      <button
                        className="p-1.5 hover:bg-destructive/10 rounded-full text-destructive transition-colors"
                        onClick={async () => {
                          if (uf.path) {
                            await deleteFileFromR2(uf.path, false);
                          }
                          setUploadedFiles(prev => prev.filter(f => f.name !== uf.name));
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
              <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400 font-medium">
                <Shield className="h-3.5 w-3.5" />
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



      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl lg:max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate("/dashboard/products")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-foreground">Créer un produit</span>
        </div>

        {/* Type banner */}
        <ErrorBoundary>
        {selectedTypeData && step > 1 && (
          <div className="flex items-center gap-3 md:gap-4 mb-6 p-3 md:p-4 rounded-xl bg-secondary border border-border/50">
            <div className="relative h-14 w-16 md:h-16 md:w-20 shrink-0 overflow-hidden rounded-lg border border-border shadow-sm flex items-center justify-center bg-card p-1">
              <img src={selectedTypeData.image} alt={selectedTypeData.label} className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedTypeData.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{selectedTypeData.description}</p>
            </div>
          </div>
        )}
        </ErrorBoundary>

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
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 italic tracking-tight">
                  Quel type de produit désirez-vous créer ?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {productTypes.map((pt) => {
                    const isSelected = selectedType === pt.type;
                    return (
                      <button
                        key={pt.type}
                        type="button"
                        disabled={pt.comingSoon}
                        onClick={() => setSelectedType(pt.type)}
                        className={`group relative rounded-2xl border text-left transition-all duration-150 p-3.5 sm:p-4 flex flex-col justify-between bg-white dark:bg-card shadow-xs ${
                          isSelected
                            ? "border-2 border-amber-500 ring-2 ring-amber-500/20"
                            : pt.comingSoon
                              ? "border-border/60 opacity-60 cursor-not-allowed"
                              : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        {/* Selected Checkmark Badge */}
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 z-20 h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}

                        {/* Top Inner Frame with light background as in reference Capture 2 */}
                        <div className="w-full h-36 sm:h-40 rounded-xl bg-[#F8F9FA] dark:bg-slate-800/50 flex items-center justify-center p-3 relative overflow-hidden">
                          <img
                            src={pt.image}
                            alt={pt.label}
                            className="h-24 sm:h-28 w-auto max-w-[85%] object-contain select-none"
                            loading="eager"
                          />
                          {pt.comingSoon && (
                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/90 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shadow-xs border border-slate-200/80 dark:border-slate-700/80">
                              BIENTÔT
                            </span>
                          )}
                        </div>

                        {/* Text Content */}
                        <div className="mt-3">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                            {pt.label}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {pt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
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
                        onChange={(e) => { setTitle(e.target.value); setErrors({...errors, title: undefined}); }}
                        placeholder="Ex: Guide complet Facebook Ads 2025"
                        className={`h-12 flex-1 ${errors.title ? "border-destructive" : ""}`}
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
                    {errors.title && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.title}</p>}
                    {!errors.title && <p className="text-[11px] text-muted-foreground mt-1">💡 Cliquez sur l'icône ✨ pour améliorer votre titre avec l'IA</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Catégorie <span className="text-destructive">*</span>
                    </label>
                    <Select value={category} onValueChange={(v) => { setCategory(v); setErrors({...errors, category: undefined}); }}>
                      <SelectTrigger className={`h-12 ${errors.category ? "border-destructive" : ""}`}>
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
                    {errors.category && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.category}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Modèle de tarification <span className="text-destructive">*</span>
                    </label>
                    <Select value={pricingModel} onValueChange={(v) => { setPricingModel(v); setErrors({...errors, price: undefined, suggestedPrice: undefined}); }}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">Prix unique</SelectItem>
                        <SelectItem value="pay_what_you_want">Prix libre (Pay what you want)</SelectItem>
                        <SelectItem value="free">Gratuit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {pricingModel === "one_time" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Prix de vente <span className="text-destructive">*</span></label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">FCFA</span>
                          <Input
                            type="number"
                            value={price}
                            onChange={(e) => { setPrice(e.target.value); setErrors({...errors, price: undefined}); }}
                            className={`h-12 pl-14 ${errors.price ? "border-destructive" : ""}`}
                            placeholder="1000"
                            min={1000}
                          />
                        </div>
                        {errors.price ? (
                          <p className="text-xs text-destructive mt-1.5 font-medium">{errors.price}</p>
                        ) : (
                          <p className="text-[11px] text-muted-foreground mt-1">Min : 1000 FCFA</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Prix barré (optionnel)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">FCFA</span>
                          <Input
                            type="number"
                            value={originalPrice}
                            onChange={(e) => setOriginalPrice(e.target.value)}
                            className="h-12 pl-14"
                            placeholder="0"
                          />
                        </div>
                        {originalPrice && Number(originalPrice) > Number(price) && (
                          <p className="text-[11px] text-emerald-600 mt-1">
                            Réduction de {Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}%
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {pricingModel === "pay_what_you_want" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Prix minimum <span className="text-destructive">*</span></label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">FCFA</span>
                          <Input
                            type="number"
                            value={price}
                            onChange={(e) => { setPrice(e.target.value); setErrors({...errors, price: undefined}); }}
                            className={`h-12 pl-14 ${errors.price ? "border-destructive" : ""}`}
                            placeholder="1000"
                            min={1000}
                          />
                        </div>
                        {errors.price ? (
                          <p className="text-xs text-destructive mt-1.5 font-medium">{errors.price}</p>
                        ) : (
                          <p className="text-[11px] text-muted-foreground mt-1">Min : 1000 FCFA</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Prix suggéré <span className="text-destructive">*</span></label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">FCFA</span>
                          <Input
                            type="number"
                            value={suggestedPrice}
                            onChange={(e) => { setSuggestedPrice(e.target.value); setErrors({...errors, suggestedPrice: undefined}); }}
                            className={`h-12 pl-14 ${errors.suggestedPrice ? "border-destructive" : ""}`}
                            placeholder="2000"
                          />
                        </div>
                        {errors.suggestedPrice && (
                          <p className="text-xs text-destructive mt-1.5 font-medium">{errors.suggestedPrice}</p>
                        )}
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
                  <div className={errors.description ? "border border-destructive rounded-lg p-1" : ""}>
                    <RichTextEditor
                      content={description}
                      onChange={(v) => { setDescription(v); setErrors({...errors, description: undefined}); }}
                      placeholder="Décrivez votre produit en détail. Utilisez la barre d'outils pour formater le texte, ajouter des liens, des images..."
                    />
                  </div>
                  {errors.description && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.description}</p>}
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
                    <div className="relative w-48 h-48 rounded-xl bg-secondary border-2 border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden">
                      {thumbnailData ? (
                        <>
                          <img src={thumbnailData.previewUrl || thumbnailData.url} alt="Vignette" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                            {thumbnailData.isUploading ? (
                              <div className="w-3/4 text-center">
                                <Progress value={thumbnailData.progress} className="h-2 mb-2" />
                                <span className="text-xs text-white">{thumbnailData.progress}%</span>
                              </div>
                            ) : (
                              <div className="flex gap-4">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    document.getElementById("thumbnail-input")?.click();
                                  }}
                                  className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full shadow-lg"
                                  title="Remplacer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPendingDeleteAction({
                                      name: "la vignette",
                                      action: async () => {
                                        if (thumbnailData.path) {
                                          await deleteFileFromR2(thumbnailData.path, true);
                                        }
                                        setThumbnailData(null);
                                      }
                                    });
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                                  title="Supprimer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div
                          className="h-full w-full flex flex-col items-center justify-center cursor-pointer"
                          onClick={() => document.getElementById("thumbnail-input")?.click()}
                        >
                          <Package className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <input
                        id="thumbnail-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            if (f.size > 2 * 1024 * 1024) {
                              setSizeLimitMaxMB(2);
                              setSizeLimitDialogOpen(true);
                              e.target.value = "";
                              return;
                            }
                            if (thumbnailData?.path) {
                              // Optimistically delete old file if we are replacing it
                              deleteFileFromR2(thumbnailData.path, true).catch(() => {});
                            }
                            
                            const preview = URL.createObjectURL(f);
                            setThumbnailData({ name: f.name, progress: 0, isUploading: true, previewUrl: preview });
                            
                            const res = await uploadFile(f, "thumbnails", (p) => {
                              setThumbnailData(prev => prev ? { ...prev, progress: p } : null);
                            });
                            
                            if (res) {
                              setThumbnailData({ name: f.name, progress: 100, isUploading: false, previewUrl: preview, url: res.url, path: res.path });
                            } else {
                              setThumbnailData(null);
                            }
                            e.target.value = "";
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

        {/* Navigation buttons */}
        <div className="flex items-center justify-center gap-3 mt-10">
          {step > 1 && (
            <Button variant="outline" className="rounded-full px-8" onClick={() => setStep(step - 1)}>
              Retour
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              className="rounded-full px-12 py-2.5 h-11 bg-[#F6B158] hover:bg-[#ea9f3f] text-white font-semibold text-base shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!canNext() || isAnyFileUploading}
              onClick={handleNextStep}
            >
              {isAnyFileUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Téléversement en cours...
                </span>
              ) : (
                "Continuer"
              )}
            </Button>
          ) : (
            <Button
              className="rounded-full px-12 py-2.5 h-11 bg-[#F6B158] hover:bg-[#ea9f3f] text-white font-semibold text-base shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={saving || !canNext() || isAnyFileUploading}
              onClick={handleSubmit}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </span>
              ) : isAnyFileUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Téléversement en cours...
                </span>
              ) : (
                "Publier"
              )}
            </Button>
          )}
        </div>
        {isAnyFileUploading && (
          <p className="text-center text-xs text-amber-600 dark:text-amber-400 font-medium mt-3 flex items-center justify-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Veuillez attendre la fin du téléversement de tous vos fichiers avant de continuer.
          </p>
        )}
      </div>

      <FileSizeLimitDialog 
        open={sizeLimitDialogOpen} 
        onOpenChange={setSizeLimitDialogOpen} 
        maxSizeMB={sizeLimitMaxMB} 
      />

      <ConfirmDeleteDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        itemName={pendingDeleteAction?.name}
        onConfirm={() => {
          if (pendingDeleteAction) pendingDeleteAction.action();
        }}
      />

      <StoreRequiredDialog 
        open={storeRequiredOpen}
        onOpenChange={(open) => {
          setStoreRequiredOpen(open);
          if (!open) navigate("/dashboard/products");
        }}
      />
    </DashboardLayout>
  );
};

export default CreateProduct;
