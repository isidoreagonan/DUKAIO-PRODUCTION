import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, GraduationCap, Key, Layers, Check, ArrowLeft,
  Upload, Image as ImageIcon, Package,
  Shield, Clock, Hash, Percent, Video, BookOpen, Download, Loader2, Sparkles
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

const DigitalProductsShapes = () => (
  <div className="relative w-[110%] md:w-3/5 max-w-[140px] h-[80%] md:h-24 flex flex-col items-center justify-end translate-x-2 md:translate-x-0 translate-y-2 md:translate-y-0">
    <div className="absolute bottom-[2rem] md:bottom-[3rem] w-[75%] h-10 md:h-12 bg-amber-400 rounded-t-lg shadow-sm border-t border-amber-300">
      <div className="absolute top-0 right-0 w-1/3 h-2 md:h-2.5 bg-amber-300 rounded-tr-lg"></div>
    </div>
    <div className="absolute bottom-[1rem] md:bottom-[1.8rem] w-[85%] h-10 md:h-12 bg-fuchsia-700 rounded-t-lg shadow-md border-t border-fuchsia-600">
      <div className="absolute top-0 right-2 w-1/3 h-2 md:h-2.5 bg-fuchsia-600 rounded-tr-lg"></div>
    </div>
    <div className="absolute bottom-[0.25rem] md:bottom-[0.6rem] w-[95%] h-10 md:h-12 bg-pink-500 rounded-t-lg shadow-lg border-t border-pink-400">
      <div className="absolute top-0 right-3 w-1/3 h-2 md:h-2.5 bg-pink-400 rounded-tr-lg"></div>
    </div>
    <div className="absolute bottom-[-0.25rem] md:bottom-0 w-full h-[0.9rem] md:h-[1.1rem] bg-indigo-500 rounded-t-md shadow-xl border-t border-indigo-400 flex items-center justify-center z-10">
      <div className="w-1/3 h-1 md:h-1.5 bg-indigo-700/50 rounded-full shadow-inner"></div>
    </div>
  </div>
);

const CourseShapes = () => (
  <div className="relative w-[110%] md:w-3/5 max-w-[140px] h-[90%] md:h-28 flex flex-col items-center justify-end pb-1 md:pb-2 translate-x-2 md:translate-x-0 translate-y-1 md:translate-y-0">
    <div className="absolute top-2 left-0 w-8 md:w-10 h-8 md:h-10 bg-orange-200/60 rounded-full blur-xl"></div>
    <div className="absolute bottom-4 md:bottom-6 right-0 w-10 md:w-12 h-10 md:h-12 bg-rose-200/60 rounded-full blur-xl"></div>

    <div className="absolute top-0 left-0 md:left-4 z-20 animate-bounce" style={{ animationDuration: "4s" }}>
      <div className="relative w-10 md:w-14 h-8 md:h-10">
        <div className="absolute top-0 left-0 w-10 md:w-14 h-3 md:h-4 bg-indigo-600 rounded-sm" style={{ transform: "skew(-20deg) rotate(-10deg)" }}></div>
        <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 w-6 md:w-8 h-4 md:h-6 bg-indigo-800 rounded-b-md"></div>
        <div className="absolute top-1 right-1.5 md:right-2 w-1 h-4 md:h-5 bg-amber-400 origin-top rotate-12">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 md:w-1.5 h-1.5 md:h-2 bg-amber-500 rounded-sm"></div>
        </div>
      </div>
    </div>

    <div className="relative z-10 w-[95%] aspect-[16/10] bg-slate-800 rounded-t-md p-1 md:p-1.5 border-b-2 md:border-b-4 border-slate-900 shadow-2xl flex flex-col">
      <div className="flex-1 bg-slate-900 rounded-sm overflow-hidden relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-rose-500/20"></div>
        <div className="relative w-6 md:w-8 h-6 md:h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] md:border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
        </div>
      </div>
    </div>
    
    <div className="w-1/3 h-1 md:h-1.5 bg-slate-700"></div>
    <div className="w-1/2 h-1 md:h-1.5 bg-slate-500 rounded-t-sm"></div>
  </div>
);

const ServicesShapes = () => (
  <div className="relative w-[110%] md:w-3/5 max-w-[140px] h-[80%] md:h-24 flex flex-col items-center justify-end pb-2 md:pb-4 translate-x-2 md:translate-x-0 translate-y-2 md:translate-y-0">
    <div className="relative z-10 w-[75%] md:w-[70%] aspect-[5/3.5] bg-amber-400 rounded-lg shadow-xl border-b-[4px] md:border-b-[6px] border-amber-500 overflow-hidden">
      <div className="absolute top-0 w-full h-1/2 bg-amber-300"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-full bg-blue-500 shadow-sm"></div>
    </div>

    <div className="absolute top-0 right-0 md:right-2 animate-bounce" style={{ animationDuration: "3s" }}>
      <div className="bg-rose-500 rounded-full w-5 h-5 md:w-7 md:h-7 flex items-center justify-center shadow-lg shadow-rose-500/30 text-white font-bold text-[10px] md:text-sm">
        $
      </div>
    </div>
    <div className="absolute top-3 md:top-4 left-0 md:left-2 animate-pulse" style={{ animationDuration: "2s" }}>
      <div className="bg-emerald-500 rounded-full p-1 md:p-1.5 shadow-lg shadow-emerald-500/30">
        <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
      </div>
    </div>
  </div>
);

const productTypes = [
  {
    type: "file" as ProductType,
    label: "Produits digitaux",
    description: "E-books, templates, audios : téléchargement instantané.",
    bgGradient: "bg-gradient-to-br from-[#F4F7FE] to-blue-50/50 dark:from-slate-800 dark:to-slate-900",
    bgRadial: "circle_at_top_right,_var(--tw-gradient-stops)",
    illustration: <DigitalProductsShapes />,
    features: ["Tous formats acceptés (PDF, ZIP, MP3…)", "Livraison automatique", "Téléchargement sécurisé"],
    icon: FileText,
    color: "bg-blue-600",
  },
  {
    type: "course" as ProductType,
    label: "Formations",
    description: "Créez des formations avec vidéo et contenu téléchargeable.",
    bgGradient: "bg-gradient-to-br from-orange-50/80 to-amber-50/50 dark:from-slate-800 dark:to-slate-900",
    bgRadial: "circle_at_top_left,_var(--tw-gradient-stops)",
    illustration: <CourseShapes />,
    features: ["Contenu vidéo, texte & téléchargeable", "Suivi de progression des étudiants", "Modules structurés"],
    icon: GraduationCap,
    color: "bg-orange-500",
  },
  {
    type: "service" as ProductType,
    label: "Services",
    description: "Vendez vos prestations de services en ligne.",
    bgGradient: "bg-gradient-to-br from-orange-50/50 to-[#FFF6F0] dark:from-slate-800 dark:to-slate-900",
    bgRadial: "circle_at_center,_var(--tw-gradient-stops)",
    illustration: <ServicesShapes />,
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

  const canNext = () => {
    switch (step) {
      case 1: return !!selectedType;
      case 2: return true; // Validation is done on click
      case 3: return true; // Validation is done on click
      case 4: return !thumbnailData?.isUploading;
      case 5:
        if (selectedType === "file") return uploadedFiles.some(f => f.url && !f.isUploading);
        if (thumbnailData?.isUploading || uploadedFiles.some(f => f.isUploading)) return false;
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

  const deleteFileFromR2 = async (path: string, isPublic: boolean) => {
    try {
      const bucketName = isPublic ? import.meta.env.VITE_R2_PUBLIC_BUCKET_NAME : import.meta.env.VITE_R2_PRIVATE_BUCKET_NAME;
      await supabase.functions.invoke("r2-storage", {
        body: { action: "delete", bucket: bucketName, key: path }
      });
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const uploadFile = async (
    file: File,
    folder: string,
    onProgress: (progress: number) => void
  ): Promise<{ url: string; path: string } | null> => {
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
            onProgress(percentCompleted);
          }
        }
      });

      if (uploadRes.status !== 200) throw new Error("Échec de l'upload vers Cloudflare");

      const url = isPublic ? `${import.meta.env.VITE_R2_PUBLIC_URL}/${path}` : path;
      return { url, path };
    } catch (err: any) {
      toast.error(`Erreur upload: ${err.message}`);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedType || !title.trim()) return;
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
        const lessonsToInsert = [];
        for (const lesson of courseLessons) {
          let videoUrl = lesson.video_url;
          if (lesson.video_type === "upload" && lesson.file) {
            const uploaded = await uploadFile(lesson.file, "course-videos", () => {});
            if (uploaded?.url) videoUrl = uploaded.url;
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
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium truncate text-foreground">{uf.name}</p>
                        {uf.isUploading ? (
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={uf.progress} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground">{uf.progress}%</span>
                          </div>
                        ) : (
                          <p className="text-xs text-green-500 mt-1">Téléversé avec succès</p>
                        )}
                      </div>
                      <button
                        className="p-2 hover:bg-destructive/10 rounded-full text-destructive transition-colors"
                        onClick={async () => {
                          if (uf.path) {
                            await deleteFileFromR2(uf.path, false);
                          }
                          setUploadedFiles(prev => prev.filter(f => f.name !== uf.name));
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
        <ErrorBoundary>
        {selectedTypeData && step > 1 && (
          <div className="flex items-center gap-3 md:gap-4 mb-6 p-3 md:p-4 rounded-xl bg-secondary border border-border/50">
            <div className={`relative h-14 w-16 md:h-16 md:w-20 shrink-0 overflow-hidden rounded-lg border border-border shadow-sm flex items-center justify-center ${selectedTypeData.bgGradient}`}>
              <div className={`absolute inset-0 bg-[radial-gradient(${selectedTypeData.bgRadial})] opacity-50`}></div>
              <div className="absolute inset-0 flex items-center justify-center transform scale-[0.35] md:scale-[0.4] origin-center">
                {selectedTypeData.illustration}
              </div>
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
                <h2 className="text-2xl font-bold text-foreground mb-8 italic">
                  Quel type de produit désirez-vous créer ?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {productTypes.map((pt) => (
                    <button
                      key={pt.type}
                      disabled={pt.comingSoon}
                      onClick={() => setSelectedType(pt.type)}
                      className={`relative group rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden hover:shadow-xl flex flex-row md:flex-col items-center md:items-stretch h-24 md:h-auto ${
                        selectedType === pt.type
                          ? "border-blue-500 shadow-blue-500/20 ring-4 ring-blue-500/10"
                          : pt.comingSoon
                            ? "border-border/50 opacity-70 cursor-not-allowed"
                            : "border-border hover:border-blue-300"
                      } md:bg-card`}
                    >
                      {/* Background Layer */}
                      <div className={`absolute inset-0 md:bottom-auto md:h-28 lg:h-32 ${pt.bgGradient} transition-transform duration-500 md:group-hover:scale-105 origin-bottom`}>
                        <div className={`absolute inset-0 bg-[radial-gradient(${pt.bgRadial})] opacity-50`}></div>
                      </div>

                      {/* Text Content */}
                      <div className="relative z-10 p-4 sm:p-5 flex-1 md:mt-28 lg:mt-32 md:bg-card flex flex-col justify-center md:justify-start h-full md:h-auto">
                        <h3 className={`text-[15px] sm:text-lg font-bold md:mb-1.5 ${selectedType === pt.type ? "text-blue-600 dark:text-blue-400" : "text-foreground"}`}>
                          {pt.label}
                        </h3>
                        <p className="hidden md:block text-sm text-muted-foreground leading-relaxed">
                          {pt.description}
                        </p>
                      </div>

                      {/* Illustration */}
                      <div className="relative z-10 w-32 sm:w-36 h-full md:absolute md:top-0 md:inset-x-0 md:w-full md:h-28 lg:h-32 flex items-end justify-end md:justify-center overflow-hidden md:overflow-visible transition-transform duration-500 md:group-hover:scale-105">
                        {pt.illustration}
                      </div>

                      {selectedType === pt.type && (
                        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 h-5 w-5 md:h-6 md:w-6 rounded-full bg-white dark:bg-slate-800 border-[1.5px] border-blue-500 shadow-md flex items-center justify-center animate-in zoom-in">
                          <Check className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-600 dark:text-blue-500 stroke-[3]" />
                        </div>
                      )}
                      
                      {pt.comingSoon && (
                        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider shadow-sm">
                          Bientôt
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {selectedTypeData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 rounded-2xl border border-border bg-card/50 p-6 sm:p-8"
                  >
                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 md:items-center">
                      {/* Text Block */}
                      <div className="md:w-1/3">
                        <div className="inline-flex items-center justify-center p-2 mb-4 rounded-xl border border-border bg-card text-foreground shadow-sm">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          Idéal pour vos {selectedTypeData.label.toLowerCase()}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedTypeData.description}
                        </p>
                      </div>
                      
                      {/* Features Grid */}
                      <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedTypeData.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border shadow-sm">
                            <div className="mt-0.5 flex-shrink-0 flex items-center justify-center text-foreground">
                              <Check className="h-4 w-4 stroke-[2.5]" />
                            </div>
                            <span className="text-sm font-medium text-foreground leading-snug">{f}</span>
                          </div>
                        ))}
                      </div>
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
              className="rounded-full px-8 bg-amber-500 hover:bg-amber-600 text-white"
              disabled={!canNext()}
              onClick={handleNextStep}
            >
              Continuer
            </Button>
          ) : (
            <Button
              className="rounded-full px-8 bg-amber-500 hover:bg-amber-600 text-white"
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving ? "Enregistrement..." : "Publier"}
            </Button>
          )}
        </div>
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
