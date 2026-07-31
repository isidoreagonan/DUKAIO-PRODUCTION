import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Package, Store, Eye, EyeOff, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  title: string;
  price: number;
  type: string;
  is_published: boolean;
  created_at: string;
  thumbnail_url: string | null;
  creator: { display_name: string | null; first_name: string | null; last_name: string | null } | null;
}

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  is_archived: boolean;
  created_at: string;
  logo_url: string | null;
  owner: { display_name: string | null; first_name: string | null; last_name: string | null } | null;
}

const AdminModeration = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email !== "isidoreagonan@gmail.com") return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [prodRes, storeRes] = await Promise.all([
      supabase.functions.invoke("admin-platform", { body: { action: "list_products" } }),
      supabase.functions.invoke("admin-platform", { body: { action: "list_stores" } }),
    ]);
    setProducts(prodRes.data?.products || []);
    setStores(storeRes.data?.stores || []);
    setLoading(false);
  };

  const toggleProduct = async (id: string, isPublished: boolean) => {
    await supabase.functions.invoke("admin-platform", { body: { action: "toggle_product", productId: id, isPublished } });
    toast.success(isPublished ? "Produit publié" : "Produit dépublié");
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    await supabase.functions.invoke("admin-platform", { body: { action: "delete_product", productId: id } });
    toast.success("Produit supprimé");
    fetchData();
  };

  const toggleStore = async (id: string, isArchived: boolean) => {
    await supabase.functions.invoke("admin-platform", { body: { action: "archive_store", storeId: id, isArchived } });
    toast.success(isArchived ? "Boutique archivée" : "Boutique restaurée");
    fetchData();
  };

  const getName = (p: { display_name: string | null; first_name: string | null; last_name: string | null } | null) => {
    if (!p) return "Inconnu";
    if (p.first_name || p.last_name) return `${p.last_name || ""} ${p.first_name || ""}`.trim();
    return p.display_name || "Inconnu";
  };

  const typeLabel: Record<string, string> = { file: "Fichier", course: "Cours", license: "Licence" };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || getName(p.creator).toLowerCase().includes(q);
  });

  const filteredStores = stores.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q) || getName(s.owner).toLowerCase().includes(q);
  });

  if (user?.email !== "isidoreagonan@gmail.com") {
    return <DashboardLayout><div className="text-center py-20 text-muted-foreground">Accès non autorisé</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-6 w-6" /> Modération
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gérer les produits et boutiques de la plateforme</p>
        </div>

        <Input
          placeholder="Rechercher produit, boutique ou créateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products" className="gap-1">
              <Package className="h-3.5 w-3.5" /> Produits ({products.length})
            </TabsTrigger>
            <TabsTrigger value="stores" className="gap-1">
              <Store className="h-3.5 w-3.5" /> Boutiques ({stores.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4">
            {loading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}</div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="rounded-xl border border-border/60 bg-card p-3 flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-lg bg-secondary shrink-0 overflow-hidden">
                      {p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getName(p.creator)} · {typeLabel[p.type] || p.type} · {p.price.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={p.is_published ? "default" : "secondary"} className="text-[10px]">
                        {p.is_published ? "Publié" : "Brouillon"}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => toggleProduct(p.id, !p.is_published)}
                        title={p.is_published ? "Dépublier" : "Publier"}
                      >
                        {p.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le produit "{p.title}" sera définitivement supprimé.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteProduct(p.id)} className="bg-destructive text-destructive-foreground">
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stores" className="mt-4">
            {loading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}</div>
            ) : (
              <div className="space-y-2">
                {filteredStores.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="rounded-xl border border-border/60 bg-card p-3 flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-lg bg-secondary shrink-0 overflow-hidden flex items-center justify-center">
                      {s.logo_url ? <img src={s.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getName(s.owner)} · /{s.slug} · {format(new Date(s.created_at), "dd MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={s.is_archived ? "destructive" : "default"} className="text-[10px]">
                        {s.is_archived ? "Archivée" : "Active"}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => toggleStore(s.id, !s.is_archived)}
                        title={s.is_archived ? "Restaurer" : "Archiver"}
                      >
                        {s.is_archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminModeration;
