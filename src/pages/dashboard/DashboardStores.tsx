import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Store, Archive, RotateCcw, ExternalLink, Settings, Pencil } from "lucide-react";

const DashboardStores = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [editStore, setEditStore] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const activeCount = stores.filter((s: any) => !s.is_archived).length;

  const createStore = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("stores").insert({
        owner_id: user!.id,
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
        description,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      setCreateOpen(false);
      setName("");
      setSlug("");
      setDescription("");
      toast.success("Boutique créée avec succès");
    },
    onError: (err: any) => {
      if (err.message?.includes("Maximum of 3")) {
        toast.error("Vous avez atteint la limite de 3 boutiques actives");
      } else if (err.message?.includes("duplicate key")) {
        toast.error("Ce slug est déjà utilisé, choisissez-en un autre");
      } else {
        toast.error("Erreur lors de la création");
      }
    },
  });

  const toggleArchive = useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      const { error } = await supabase
        .from("stores")
        .update({ is_archived: archive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { archive }) => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast.success(archive ? "Boutique archivée" : "Boutique restaurée");
    },
    onError: (err: any) => {
      if (err.message?.includes("Maximum of 3")) {
        toast.error("Vous avez déjà 3 boutiques actives, archivez-en une d'abord");
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    },
  });

  const updateStore = useMutation({
    mutationFn: async () => {
      if (!editStore) throw new Error("Aucune boutique sélectionnée");
      const { error } = await supabase
        .from("stores")
        .update({
          name: editName.trim() || editStore.name,
          description: editDescription,
        })
        .eq("id", editStore.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      setEditStore(null);
      toast.success("Boutique mise à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const openEdit = (store: any) => {
    setEditStore(store);
    setEditName(store.name || "");
    setEditDescription(store.description || "");
  };

  const handleSlugChange = (value: string) => {
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mes Boutiques</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeCount}/3 boutiques actives
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button disabled={activeCount >= 3}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle boutique
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une boutique</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Nom de la boutique</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ma Super Boutique" />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input value={slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="ma-boutique" />
                  <p className="text-xs text-muted-foreground">/store/{slug || "ma-boutique"}</p>
                </div>
                <div className="space-y-2">
                  <Label>Description (optionnel)</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre boutique..." rows={3} />
                </div>
                <Button
                  onClick={() => createStore.mutate()}
                  disabled={!name || !slug || createStore.isPending}
                  className="w-full"
                >
                  {createStore.isPending ? "Création..." : "Créer la boutique"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader><div className="h-5 w-32 bg-muted rounded" /></CardHeader>
                <CardContent><div className="h-4 w-48 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Store className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucune boutique</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Créez votre première boutique pour commencer à vendre
              </p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer ma première boutique
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store: any) => (
              <Card key={store.id} className={store.is_archived ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        {store.name}
                      </CardTitle>
                      <CardDescription className="text-xs">/store/{store.slug}</CardDescription>
                    </div>
                    <Badge variant={store.is_archived ? "secondary" : "default"}>
                      {store.is_archived ? "Archivée" : "Active"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {store.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{store.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {!store.is_archived && (
                      <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Visiter
                        </Button>
                      </a>
                    )}
                    {!store.is_archived && (
                      <Button variant="outline" size="sm" onClick={() => openEdit(store)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Modifier
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleArchive.mutate({ id: store.id, archive: !store.is_archived })}
                      disabled={toggleArchive.isPending}
                    >
                      {store.is_archived ? (
                        <><RotateCcw className="h-3.5 w-3.5 mr-1" /> Restaurer</>
                      ) : (
                        <><Archive className="h-3.5 w-3.5 mr-1" /> Archiver</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit store dialog */}
        <Dialog open={!!editStore} onOpenChange={(o) => !o && setEditStore(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la boutique</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Nom de la boutique</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Ma Super Boutique" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Décrivez votre boutique..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Cette description s'affiche sur la page publique de votre boutique.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditStore(null)}>
                  Annuler
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => updateStore.mutate()}
                  disabled={!editName.trim() || updateStore.isPending}
                >
                  {updateStore.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DashboardStores;
