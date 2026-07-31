import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Download, Play, FileText, Key, Copy, Check, ExternalLink, BookOpen, Layers } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface BuyerContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    title: string;
    type: string;
    thumbnail_url: string | null;
    download_url: string | null;
  };
  customerId: string;
}

interface CourseLesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_type: string | null;
  position: number;
  duration_minutes: number | null;
}

interface LicenseInfo {
  license_key: string;
  status: string;
  max_activations: number;
  expires_at: string | null;
  activated_at: string | null;
}

interface BundleProduct {
  id: string;
  title: string;
  type: string;
  thumbnail_url: string | null;
  download_url: string | null;
}

const BuyerContentDialog = ({ open, onOpenChange, product, customerId }: BuyerContentDialogProps) => {
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [licenses, setLicenses] = useState<LicenseInfo[]>([]);
  const [bundleProducts, setBundleProducts] = useState<BundleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);

  useEffect(() => {
    if (!open) return;
    loadContent();
  }, [open, product.id, product.type]);

  const loadContent = async () => {
    setLoading(true);
    try {
      if (product.type === "course") {
        const { data } = await supabase
          .from("course_lessons")
          .select("id, title, description, video_url, video_type, position, duration_minutes")
          .eq("product_id", product.id)
          .order("position");
        setLessons((data as CourseLesson[]) || []);
        if (data && data.length > 0) setActiveLesson(data[0] as CourseLesson);
      } else if (product.type === "license") {
        const { data } = await supabase
          .from("licenses")
          .select("license_key, status, max_activations, expires_at, activated_at")
          .eq("product_id", product.id)
          .eq("customer_id", customerId);
        setLicenses((data as LicenseInfo[]) || []);
      } else if (product.type === "bundle") {
        const { data: prod } = await supabase
          .from("products")
          .select("bundle_product_ids")
          .eq("id", product.id)
          .single();
        if (prod?.bundle_product_ids && prod.bundle_product_ids.length > 0) {
          const { data: bundled } = await supabase
            .from("products")
            .select("id, title, type, thumbnail_url, download_url")
            .in("id", prod.bundle_product_ids);
          setBundleProducts((bundled as BundleProduct[]) || []);
        }
      }
    } catch (err) {
      console.error("Error loading content:", err);
      toast.error("Erreur lors du chargement du contenu");
    }
    setLoading(false);
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success("Clé copiée !");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getEmbedUrl = (lesson: CourseLesson) => {
    if (!lesson.video_url) return null;
    const url = lesson.video_url;
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  const renderFileContent = () => (
    <div className="text-center py-8 space-y-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <FileText className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{product.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">Votre fichier est prêt à être téléchargé</p>
      </div>
      {product.download_url ? (
        <a href={product.download_url} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2">
            <Download className="h-4 w-4" />
            Télécharger
          </Button>
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">Le fichier n'est pas encore disponible.</p>
      )}
    </div>
  );

  const renderCourseContent = () => (
    <div className="space-y-4">
      {activeLesson && (
        <div className="space-y-3">
          {activeLesson.video_url ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-secondary border border-border">
              <iframe
                src={getEmbedUrl(activeLesson) || ""}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center border border-border">
              <p className="text-muted-foreground text-sm">Pas de vidéo pour cette leçon</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground">{activeLesson.title}</h3>
            {activeLesson.description && (
              <p className="text-sm text-muted-foreground mt-1">{activeLesson.description}</p>
            )}
          </div>
        </div>
      )}
      <Separator />
      <div className="space-y-1 max-h-60 overflow-y-auto">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          {lessons.length} leçon{lessons.length > 1 ? "s" : ""}
        </p>
        {lessons.map((lesson, i) => (
          <button
            key={lesson.id}
            onClick={() => setActiveLesson(lesson)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
              activeLesson?.id === lesson.id
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-secondary text-foreground"
            }`}
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
              {i + 1}
            </span>
            <span className="flex-1 line-clamp-1">{lesson.title}</span>
            {lesson.video_url && <Play className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
            {lesson.duration_minutes && (
              <span className="text-xs text-muted-foreground flex-shrink-0">{lesson.duration_minutes} min</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderLicenseContent = () => (
    <div className="space-y-4">
      {licenses.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Aucune licence trouvée pour ce produit.</p>
      ) : (
        licenses.map((lic, i) => (
          <div key={i} className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Clé de licence</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                lic.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {lic.status === "active" ? "Active" : lic.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono select-all">
                {lic.license_key}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyLicenseKey(lic.license_key)}
                className="gap-1.5"
              >
                {copiedKey === lic.license_key ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Max activations: {lic.max_activations}</span>
              {lic.expires_at && <span>Expire: {new Date(lic.expires_at).toLocaleDateString("fr-FR")}</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderBundleContent = () => (
    <div className="space-y-3">
      {bundleProducts.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Aucun produit dans ce bundle.</p>
      ) : (
        bundleProducts.map((bp) => (
          <div key={bp.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
            {bp.thumbnail_url ? (
              <img src={bp.thumbnail_url} alt={bp.title} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-1">{bp.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{bp.type}</p>
            </div>
            {bp.download_url && (
              <a href={bp.download_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );

  const getDialogTitle = () => {
    switch (product.type) {
      case "course": return "Formation";
      case "license": return "Licence";
      case "bundle": return "Bundle";
      default: return "Fichier";
    }
  };

  const getDialogIcon = () => {
    switch (product.type) {
      case "course": return <BookOpen className="h-4 w-4" />;
      case "license": return <Key className="h-4 w-4" />;
      case "bundle": return <Layers className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getDialogIcon()}
            {product.title}
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {product.type === "file" && renderFileContent()}
            {product.type === "course" && renderCourseContent()}
            {product.type === "license" && renderLicenseContent()}
            {product.type === "bundle" && renderBundleContent()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuyerContentDialog;
