import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Package, Search, MoreVertical, Pencil, Eye, Copy,
  Share2, Link2, EyeOff, Trash2, ChevronLeft, ChevronRight,
  List, LayoutGrid, ArrowUpDown, FileText, GraduationCap, Key,
  Sparkles, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { MissingContentDialog } from "@/components/dashboard/MissingContentDialog";
import StoreRequiredDialog from "@/components/dashboard/StoreRequiredDialog";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { deleteFromBunny } from "@/lib/bunnyStorage";

type ProductType = "file" | "course" | "license";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  type: ProductType;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
  salesCount?: number;
  salesRevenue?: number;
}

type StatusFilter = "all" | "published" | "draft";
type SortOption = "newest" | "oldest" | "price_asc" | "price_desc" | "title_asc";

const ITEMS_PER_PAGE = 12;

export default function DashboardProducts() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type") as ProductType | null;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedType, setSelectedType] = useState<string>(typeParam || "all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);

  const [missingContentProduct, setMissingContentProduct] = useState<Product | null>(null);
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

  const fetchProducts = async () => {
    if (!user) return;
    try {
      const [productsRes, ordersRes] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("product_id, amount")
          .eq("store_owner_id", user.id)
          .eq("status", "completed"),
      ]);

      const raw = (productsRes.data as Product[]) || [];
      const orders = ordersRes.data || [];

      // Calculate sales count and revenue per product
      const salesMap: Record<string, { count: number; revenue: number }> = {};
      orders.forEach((o) => {
        if (!o.product_id) return;
        if (!salesMap[o.product_id]) salesMap[o.product_id] = { count: 0, revenue: 0 };
        salesMap[o.product_id].count += 1;
        salesMap[o.product_id].revenue += Number(o.amount || 0);
      });

      const enriched = raw.map((p) => ({
        ...p,
        salesCount: salesMap[p.id]?.count || 0,
        salesRevenue: salesMap[p.id]?.revenue || 0,
      }));

      setProducts(enriched);
    } catch (err) {
      console.error("Erreur chargement produits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ? Cette action est irréversible.")) return;
    try {
      // Fetch product to get file URLs
      const { data: product } = await supabase
        .from("products")
        .select("thumbnail_url, download_url, seo_image_url")
        .eq("id", id)
        .single();

      // Fetch course lessons to get uploaded video URLs
      const { data: lessons } = await supabase
        .from("course_lessons")
        .select("video_url")
        .eq("product_id", id)
        .eq("video_type", "upload");

      // Delete related records first (cascade)
      await supabase.from("course_lessons").delete().eq("product_id", id);
      await supabase.from("product_faqs").delete().eq("product_id", id);
      const { data: licenses } = await supabase.from("licenses").select("id").eq("product_id", id);
      if (licenses && licenses.length > 0) {
        const licenseIds = licenses.map((l) => l.id);
        await supabase.from("license_activations").delete().in("license_id", licenseIds);
      }
      await supabase.from("licenses").delete().eq("product_id", id);
      await supabase.from("cart_events").delete().eq("product_id", id);
      await supabase.from("payment_events").delete().eq("product_id", id);
      await supabase.from("orders").delete().eq("product_id", id);

      // Finally delete the product
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      // Delete files from R2
      const filesToDelete: { url: string; isPublic: boolean }[] = [];
      if (product) {
        if (product.thumbnail_url) filesToDelete.push({ url: product.thumbnail_url, isPublic: true });
        if (product.seo_image_url) filesToDelete.push({ url: product.seo_image_url, isPublic: true });
        if (product.download_url) {
          try {
            const parsed = JSON.parse(product.download_url);
            if (Array.isArray(parsed)) {
              parsed.forEach((url) => filesToDelete.push({ url, isPublic: false }));
            } else {
              filesToDelete.push({ url: product.download_url, isPublic: false });
            }
          } catch {
            filesToDelete.push({ url: product.download_url, isPublic: false });
          }
        }
      }
      if (lessons) {
        lessons.forEach((l) => {
          if (l.video_url) filesToDelete.push({ url: l.video_url, isPublic: false });
        });
      }

      for (const file of filesToDelete) {
        try {
          const path = file.url.replace(/^https?:\/\/[^\/]+\//, "");
          const zone = file.isPublic ? "media" : "files";
          await deleteFromBunny(path, zone);
        } catch (e) {
          console.error("Failed to delete file from Bunny", file.url, e);
        }
      }
      toast.success("Produit supprimé");
      fetchProducts();
    } catch (err: any) {
      toast.error("Erreur lors de la suppression: " + err.message);
    }
  };

  const togglePublish = async (p: Product) => {
    if (!p.is_published) {
      if (p.type === "file") {
        const { data } = await supabase.from("products").select("download_url").eq("id", p.id).single();
        if (!data?.download_url || data.download_url === "[]" || data.download_url.trim() === "") {
          setMissingContentProduct(p);
          return;
        }
      } else if (p.type === "course") {
        const { count } = await supabase
          .from("course_lessons")
          .select("*", { count: "exact", head: true })
          .eq("product_id", p.id);
        if (count === 0 || count === null) {
          setMissingContentProduct(p);
          return;
        }
      }

      if (!hasStore) {
        setStoreRequiredOpen(true);
        return;
      }
    }

    await supabase.from("products").update({ is_published: !p.is_published }).eq("id", p.id);
    toast.success(p.is_published ? "Produit passé en brouillon" : "Produit publié avec succès");
    fetchProducts();
  };

  const handleDuplicate = async (p: Product) => {
    const { id, created_at, salesCount, salesRevenue, ...rest } = p;
    const { error } = await supabase.from("products").insert({
      ...rest,
      title: `${p.title} (copie)`,
      is_published: false,
      creator_id: user!.id,
    });
    if (error) {
      toast.error("Erreur lors de la duplication");
    } else {
      toast.success("Produit dupliqué");
      fetchProducts();
    }
  };

  const handleCopyLink = (p: Product) => {
    const slug = (profile?.store_slug || "").trim().toLowerCase().replace(/\s+/g, "-");
    const url = slug
      ? `${window.location.origin}/store/${slug}/${p.id}`
      : `${window.location.origin}/products/${p.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié dans le presse-papier");
  };

  const handleShare = (p: Product) => {
    const slug = (profile?.store_slug || "").trim().toLowerCase().replace(/\s+/g, "-");
    const url = slug
      ? `${window.location.origin}/store/${slug}/${p.id}`
      : `${window.location.origin}/products/${p.id}`;
    if (navigator.share) {
      navigator.share({ title: p.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Lien copié dans le presse-papier");
    }
  };

  // Filter & Search & Sort
  const filtered = products
    .filter((p) => {
      if (statusFilter === "published" && !p.is_published) return false;
      if (statusFilter === "draft" && p.is_published) return false;
      if (selectedType !== "all" && p.type !== selectedType) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "title_asc") return a.title.localeCompare(b.title);
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, selectedType, sortBy]);

  const getTypeLabel = (type: ProductType) => {
    switch (type) {
      case "file":
        return "Fichier numérique";
      case "course":
        return "Cours en ligne";
      case "license":
        return "Licence logicielle";
      default:
        return "Produit digital";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full pb-14 font-sans">
        {/* Header: Title + count badge + "+ Nouveau produit" button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              Produits
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border border-border bg-secondary text-muted-foreground">
              {products.length}
            </span>
          </div>

          <button
            onClick={() => navigate("/dashboard/products/new")}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="h-4 w-4 stroke-[2.25]" />
            <span>Nouveau produit</span>
          </button>
        </div>

        {/* Toolbar: Search, Status tabs, Type filter, Sort, List/Grid switch */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2 rounded-2xl border border-border bg-card shadow-2xs">
          {/* Left: Search input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par titre..."
              className="w-full h-8 pl-9 pr-3 rounded-lg bg-secondary/40 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors font-medium"
            />
          </div>

          {/* Right: Controls (Status, Type, Sort, View) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs */}
            <div className="flex items-center p-0.5 rounded-lg border border-border bg-secondary/40 text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all ${
                  statusFilter === "all"
                    ? "bg-card text-foreground font-semibold shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setStatusFilter("published")}
                className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all ${
                  statusFilter === "published"
                    ? "bg-card text-foreground font-semibold shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Publiés
              </button>
              <button
                onClick={() => setStatusFilter("draft")}
                className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all ${
                  statusFilter === "draft"
                    ? "bg-card text-foreground font-semibold shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Brouillons
              </button>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-border bg-secondary/40 text-xs font-medium text-foreground outline-none cursor-pointer hover:bg-secondary transition-colors"
            >
              <option value="all">Tous les types</option>
              <option value="file">Fichiers</option>
              <option value="course">Cours</option>
              <option value="license">Licences</option>
            </select>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-8 px-2.5 rounded-lg border border-border bg-secondary/40 text-xs font-medium text-foreground outline-none cursor-pointer hover:bg-secondary transition-colors"
            >
              <option value="newest">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="price_asc">Prix croissant</option>
              <option value="title_asc">Titre (A-Z)</option>
            </select>

            {/* List / Grid Toggle */}
            <div className="flex items-center p-0.5 rounded-lg border border-border bg-secondary/40">
              <button
                onClick={() => setViewMode("list")}
                aria-label="Vue liste"
                className={`p-1 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Vue grille"
                className={`p-1 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
            <Package className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <h3 className="text-base font-bold text-foreground">Aucun produit trouvé</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search || statusFilter !== "all" || selectedType !== "all"
                ? "Aucun produit ne correspond à vos critères de recherche ou de filtre."
                : "Commencez dès maintenant en publiant votre premier fichier, cours ou licence logicielle."}
            </p>
            <button
              onClick={() => navigate("/dashboard/products/new")}
              className="inline-flex items-center gap-2 h-8 px-4 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity mt-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Créer un produit</span>
            </button>
          </div>
        ) : viewMode === "list" ? (
          /* List View: 64px table rows with 1px fine borders */
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4">Prix</th>
                    <th className="py-3 px-4 hidden md:table-cell">Ventes</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Revenus</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((p) => (
                    <tr
                      key={p.id}
                      className="h-16 hover:bg-secondary/20 transition-colors group"
                    >
                      {/* Product: 44px rounded thumbnail + name + type */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <div className="h-11 w-11 rounded-lg bg-secondary border border-border overflow-hidden flex items-center justify-center shrink-0">
                            {p.thumbnail_url ? (
                              <img
                                src={p.thumbnail_url}
                                alt={p.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}
                              className="font-bold text-foreground truncate cursor-pointer hover:underline text-[13px]"
                            >
                              {p.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {getTypeLabel(p.type)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-foreground text-[13px]">
                          {p.price.toLocaleString("fr-FR")} F
                        </span>
                        {p.original_price && p.original_price > p.price && (
                          <span className="text-[11px] text-muted-foreground line-through ml-1.5">
                            {p.original_price.toLocaleString("fr-FR")} F
                          </span>
                        )}
                      </td>

                      {/* Sales */}
                      <td className="py-2.5 px-4 hidden md:table-cell whitespace-nowrap">
                        <span className="font-medium text-foreground">
                          {p.salesCount || 0}
                        </span>
                      </td>

                      {/* Revenue */}
                      <td className="py-2.5 px-4 hidden lg:table-cell whitespace-nowrap">
                        <span className="font-semibold text-foreground">
                          {Number(p.salesRevenue || 0).toLocaleString("fr-FR")} F
                        </span>
                      </td>

                      {/* Status pill (Publié vert, Brouillon gris) */}
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        {p.is_published ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Publié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                            Brouillon
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-4 hidden sm:table-cell text-muted-foreground whitespace-nowrap text-[11px]">
                        {format(parseISO(p.created_at), "dd MMM yyyy", { locale: fr })}
                      </td>

                      {/* Menu ⋯ with all actions */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              aria-label="Actions produit"
                              className="h-8 w-8 rounded-lg hover:bg-secondary inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-xl border-border bg-card">
                            <DropdownMenuItem
                              onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}
                              className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2 py-1.5"
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Modifier</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const slug = (profile?.store_slug || "").trim().toLowerCase().replace(/\s+/g, "-");
                                if (slug) {
                                  window.open(`/store/${slug}/${p.id}`, "_blank");
                                } else {
                                  navigate(`/products/${p.id}`);
                                }
                              }}
                              className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2 py-1.5"
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Voir sur le site</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(p)}
                              className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2 py-1.5"
                            >
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Dupliquer</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleShare(p)}
                              className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2 py-1.5"
                            >
                              <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Partager</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyLink(p)}
                              className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2 py-1.5"
                            >
                              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Copier le lien</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                              onClick={() => togglePublish(p)}
                              className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2 py-1.5"
                            >
                              {p.is_published ? (
                                <>
                                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>Dépublier</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-primary font-semibold">Publier</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                              onClick={() => handleDelete(p.id)}
                              className="flex items-center gap-2 text-xs font-medium text-destructive focus:text-destructive cursor-pointer rounded-lg px-2 py-1.5 hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View: 4:3 cards with fine 1px border */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((p) => (
              <div
                key={p.id}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-border/80 transition-all flex flex-col justify-between shadow-2xs"
              >
                {/* 4:3 Thumbnail */}
                <div className="relative aspect-4/3 bg-secondary overflow-hidden border-b border-border">
                  {p.thumbnail_url ? (
                    <img
                      src={p.thumbnail_url}
                      alt={p.title}
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground/40">
                      <Package className="h-10 w-10" />
                    </div>
                  )}

                  {/* Top Badges: Status & Menu */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    {p.is_published ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white/95 dark:bg-card/95 border border-emerald-200 px-2 py-0.5 rounded-full shadow-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-white/95 dark:bg-card/95 border border-border px-2 py-0.5 rounded-full shadow-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                        Brouillon
                      </span>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          aria-label="Actions"
                          className="h-7 w-7 rounded-lg bg-white/90 dark:bg-card/90 border border-border text-foreground hover:bg-white inline-flex items-center justify-center shadow-xs"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5 shadow-xl border-border bg-card">
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(p)}>
                          <Copy className="h-3.5 w-3.5 mr-2" /> Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyLink(p)}>
                          <Link2 className="h-3.5 w-3.5 mr-2" /> Copier le lien
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => togglePublish(p)}>
                          {p.is_published ? "Dépublier" : "Publier"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-destructive">
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 space-y-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {getTypeLabel(p.type)}
                    </span>
                    <h3
                      onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}
                      className="font-bold text-foreground text-sm truncate hover:underline cursor-pointer mt-0.5"
                    >
                      {p.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <span className="font-extrabold text-foreground text-sm">
                      {p.price.toLocaleString("fr-FR")} F
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {p.salesCount || 0} vente{(p.salesCount || 0) > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Affichage de {(page - 1) * ITEMS_PER_PAGE + 1} à{" "}
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length} produits
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="h-8 px-2.5 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <span className="text-xs font-semibold text-foreground px-2">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="h-8 px-2.5 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <MissingContentDialog
        open={!!missingContentProduct}
        onOpenChange={(open) => !open && setMissingContentProduct(null)}
        onEdit={() => missingContentProduct && navigate(`/dashboard/products/${missingContentProduct.id}/edit`)}
      />

      <StoreRequiredDialog
        open={storeRequiredOpen}
        onOpenChange={setStoreRequiredOpen}
      />
    </DashboardLayout>
  );
}
