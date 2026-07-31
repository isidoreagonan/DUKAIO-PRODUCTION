import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Key, Loader2, Search, Copy, Ban, Eye, CheckCircle2, XCircle, Clock, AlertTriangle, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface License {
  id: string;
  license_key: string;
  product_id: string;
  customer_id: string;
  order_id: string | null;
  status: string;
  max_activations: number;
  validity_days: number | null;
  activated_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
  products?: { title: string } | null;
  customers?: { name: string; email: string } | null;
}

interface Activation {
  id: string;
  device_id: string;
  device_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  activated_at: string;
  deactivated_at: string | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  pending_activation: { label: "En attente", variant: "outline", icon: Clock },
  active: { label: "Active", variant: "default", icon: CheckCircle2 },
  expired: { label: "Expirée", variant: "secondary", icon: AlertTriangle },
  revoked: { label: "Révoquée", variant: "destructive", icon: Ban },
};

const DashboardLicenses = () => {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detail dialog
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [activations, setActivations] = useState<Activation[]>([]);
  const [activationsLoading, setActivationsLoading] = useState(false);

  useEffect(() => {
    if (user) loadLicenses();
  }, [user]);

  const loadLicenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("licenses")
      .select("*, products(title), customers(name, email)")
      .eq("store_owner_id", user!.id)
      .order("created_at", { ascending: false });

    if (data) setLicenses(data as any);
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const openDetail = async (license: License) => {
    setSelectedLicense(license);
    setActivationsLoading(true);
    const { data } = await supabase
      .from("license_activations")
      .select("*")
      .eq("license_id", license.id)
      .order("activated_at", { ascending: false });

    if (data) setActivations(data as any);
    setActivationsLoading(false);
  };

  const revokeLicense = async (id: string) => {
    const { error } = await supabase
      .from("licenses")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Licence révoquée");
    setLicenses((prev) => prev.map((l) => l.id === id ? { ...l, status: "revoked", revoked_at: new Date().toISOString() } : l));
    if (selectedLicense?.id === id) {
      setSelectedLicense({ ...selectedLicense, status: "revoked", revoked_at: new Date().toISOString() });
    }
  };

  const deactivateDevice = async (activationId: string) => {
    const { error } = await supabase
      .from("license_activations")
      .update({ is_active: false, deactivated_at: new Date().toISOString() } as any)
      .eq("id", activationId);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Device désactivé");
    setActivations((prev) =>
      prev.map((a) => a.id === activationId ? { ...a, is_active: false, deactivated_at: new Date().toISOString() } : a)
    );
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Clé copiée !");
  };

  const filtered = licenses.filter((l) => {
    const matchSearch =
      !search ||
      l.license_key.toLowerCase().includes(search.toLowerCase()) ||
      l.products?.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.customers?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: licenses.length,
    active: licenses.filter((l) => l.status === "active").length,
    pending: licenses.filter((l) => l.status === "pending_activation").length,
    expired: licenses.filter((l) => l.status === "expired").length,
    revoked: licenses.filter((l) => l.status === "revoked").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Licences</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les clés de licence de vos produits logiciels
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, color: "bg-primary/10 text-primary" },
            { label: "Actives", value: stats.active, color: "bg-emerald-500/10 text-emerald-600" },
            { label: "En attente", value: stats.pending, color: "bg-amber-500/10 text-amber-600" },
            { label: "Expirées", value: stats.expired, color: "bg-muted text-muted-foreground" },
            { label: "Révoquées", value: stats.revoked, color: "bg-destructive/10 text-destructive" },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl border border-border bg-card text-center">
              <p className={`text-xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par clé, produit, client..."
              className="pl-9"
              maxLength={100}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending_activation">En attente</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expirée</SelectItem>
              <SelectItem value="revoked">Révoquée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* License list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Key className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {licenses.length === 0
                ? "Aucune licence émise. Les licences sont générées automatiquement lors de la vente d'un produit de type licence."
                : "Aucune licence trouvée pour ces filtres."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((l) => {
              const cfg = statusConfig[l.status] || statusConfig.pending_activation;
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={l.id}
                  onClick={() => openDetail(l)}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Key className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-semibold text-foreground">{l.license_key}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyKey(l.license_key); }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {l.products?.title || "Produit"} • {l.customers?.name || l.customers?.email || "Client"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={cfg.variant} className="text-[10px] gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail dialog */}
        <Dialog open={!!selectedLicense} onOpenChange={() => setSelectedLicense(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Détail de la licence
              </DialogTitle>
            </DialogHeader>
            {selectedLicense && (
              <div className="space-y-5">
                {/* Key */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <p className="font-mono font-bold text-sm flex-1">{selectedLicense.license_key}</p>
                  <Button variant="ghost" size="icon" onClick={() => copyKey(selectedLicense.license_key)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Statut</p>
                    <Badge variant={statusConfig[selectedLicense.status]?.variant || "outline"} className="mt-1 gap-1">
                      {statusConfig[selectedLicense.status]?.label || selectedLicense.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Produit</p>
                    <p className="font-medium">{selectedLicense.products?.title || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Client</p>
                    <p className="font-medium">{selectedLicense.customers?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{selectedLicense.customers?.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Max activations</p>
                    <p className="font-medium">{selectedLicense.max_activations}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Créée le</p>
                    <p className="font-medium">{new Date(selectedLicense.created_at).toLocaleDateString("fr")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Expire le</p>
                    <p className="font-medium">
                      {selectedLicense.expires_at
                        ? new Date(selectedLicense.expires_at).toLocaleDateString("fr")
                        : selectedLicense.validity_days
                          ? `${selectedLicense.validity_days} jours après activation`
                          : "Jamais"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {selectedLicense.status !== "revoked" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => revokeLicense(selectedLicense.id)}
                    className="w-full gap-2"
                  >
                    <Ban className="h-4 w-4" /> Révoquer cette licence
                  </Button>
                )}

                {/* Activations */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Historique des activations
                  </h3>
                  {activationsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : activations.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Aucune activation enregistrée
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {activations.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border text-sm">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {a.is_active ? (
                                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                              ) : (
                                <XCircle className="h-3 w-3 text-muted-foreground shrink-0" />
                              )}
                              <p className="font-medium truncate">{a.device_name || a.device_id}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {a.ip_address} • {new Date(a.activated_at).toLocaleDateString("fr", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {a.is_active && selectedLicense.status !== "revoked" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deactivateDevice(a.id)}
                              className="text-destructive hover:text-destructive text-xs shrink-0"
                            >
                              Désactiver
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DashboardLicenses;
