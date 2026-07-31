import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Shield, CheckCircle2, XCircle, Clock, Eye, Loader2, Search,
} from "lucide-react";

const ADMIN_EMAIL = "isidoreagonan@gmail.com";

interface KYCRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_front_url: string;
  document_back_url: string | null;
  selfie_url: string | null;
  status: string;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  full_name: string | null;
  country: string | null;
  city: string | null;
  ai_recommendation: string | null;
  ai_confidence: number | null;
  ai_analysis_details: string | null;
  ai_analyzed_at: string | null;
}

const aiRecommendationConfig: Record<string, { label: string; color: string; bg: string }> = {
  approve: { label: "✅ Recommandé", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  review: { label: "⚠️ À vérifier", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  reject: { label: "❌ Rejet suggéré", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", variant: "secondary" },
  approved: { label: "Approuvé", variant: "default" },
  rejected: { label: "Rejeté", variant: "destructive" },
};

const AdminKYC = () => {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<KYCRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (isAdmin) loadRequests();
  }, [isAdmin]);

  const loadRequests = async () => {
    setLoading(true);
    // Admin needs to read all verifications - use service role via edge function
    const { data, error } = await supabase.functions.invoke("admin-kyc", {
      body: { action: "list" },
    });
    if (error) {
      toast.error("Erreur lors du chargement des demandes KYC");
      console.error(error);
    } else {
      setRequests(data?.requests || []);
    }
    setLoading(false);
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (!selected) return;
    if (action === "reject" && !rejectionReason.trim()) {
      toast.error("Veuillez indiquer le motif du rejet");
      return;
    }
    setProcessing(true);
    const { error } = await supabase.functions.invoke("admin-kyc", {
      body: {
        action,
        verificationId: selected.id,
        rejectionReason: action === "reject" ? rejectionReason : null,
      },
    });
    if (error) {
      toast.error("Erreur lors du traitement");
    } else {
      toast.success(action === "approve" ? "Vérification approuvée" : "Vérification rejetée");
      setSelected(null);
      setRejectionReason("");
      loadRequests();
    }
    setProcessing(false);
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const filtered = requests.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search && !r.user_id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Administration KYC</h1>
            <p className="text-sm text-muted-foreground">Gérez les demandes de vérification d'identité</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["all", "pending", "approved", "rejected"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-4 rounded-xl border text-left transition-all ${
                filter === key ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <p className="text-2xl font-bold text-foreground">{counts[key]}</p>
              <p className="text-xs text-muted-foreground">
                {key === "all" ? "Total" : statusBadge[key]?.label}
              </p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par ID utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Aucune demande trouvée
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>IA</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="text-sm font-medium">
                      {req.full_name || <span className="text-muted-foreground italic">Non renseigné</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(req.submitted_at).toLocaleDateString("fr-FR", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-sm capitalize">{req.document_type}</TableCell>
                    <TableCell>
                      {req.ai_recommendation ? (
                        <span className={`text-xs font-medium ${aiRecommendationConfig[req.ai_recommendation]?.color || ""}`}>
                          {req.ai_recommendation === "approve" ? "✅" : req.ai_recommendation === "reject" ? "❌" : "⚠️"}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadge[req.status]?.variant || "outline"}>
                        {statusBadge[req.status]?.label || req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelected(req)}>
                        <Eye className="h-4 w-4 mr-1" /> Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setRejectionReason(""); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Détails de la vérification
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nom complet</p>
                  <p className="font-medium">{selected.full_name || <span className="italic text-muted-foreground">Non renseigné</span>}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Localisation</p>
                  <p className="font-medium">
                    {selected.city && selected.country ? `${selected.city}, ${selected.country}` : 
                     selected.country || <span className="italic text-muted-foreground">Non renseigné</span>}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">ID Utilisateur</p>
                  <p className="font-mono text-xs break-all">{selected.user_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type de document</p>
                  <p className="capitalize">{selected.document_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Soumis le</p>
                  <p>{new Date(selected.submitted_at).toLocaleString("fr-FR")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Statut</p>
                  <Badge variant={statusBadge[selected.status]?.variant || "outline"}>
                    {statusBadge[selected.status]?.label || selected.status}
                  </Badge>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-3">
                <p className="font-medium text-sm">Documents soumis</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Recto</p>
                    <a href={selected.document_front_url} target="_blank" rel="noreferrer">
                      <img src={selected.document_front_url} alt="Recto" className="rounded-lg border w-full h-32 object-cover" />
                    </a>
                  </div>
                  {selected.document_back_url && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Verso</p>
                      <a href={selected.document_back_url} target="_blank" rel="noreferrer">
                        <img src={selected.document_back_url} alt="Verso" className="rounded-lg border w-full h-32 object-cover" />
                      </a>
                    </div>
                  )}
                  {selected.selfie_url && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Selfie</p>
                      <a href={selected.selfie_url} target="_blank" rel="noreferrer">
                        <img src={selected.selfie_url} alt="Selfie" className="rounded-lg border w-full h-32 object-cover" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Analysis */}
              {selected.ai_recommendation && (
                <div className={`p-4 rounded-lg border ${aiRecommendationConfig[selected.ai_recommendation]?.bg || "bg-muted border-border"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${aiRecommendationConfig[selected.ai_recommendation]?.color}`}>
                      🤖 Analyse IA : {aiRecommendationConfig[selected.ai_recommendation]?.label}
                    </span>
                    {selected.ai_confidence !== null && (
                      <span className="text-xs text-muted-foreground">
                        Confiance : {selected.ai_confidence}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 whitespace-pre-line">{selected.ai_analysis_details}</p>
                  {selected.ai_analyzed_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Analysé le {new Date(selected.ai_analyzed_at).toLocaleString("fr-FR")}
                    </p>
                  )}
                </div>
              )}

              {!selected.ai_recommendation && selected.status === "pending" && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyse IA en cours...
                  </p>
                </div>
              )}

              {selected.rejection_reason && (
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-xs text-muted-foreground">Motif du rejet</p>
                  <p className="text-sm text-destructive">{selected.rejection_reason}</p>
                </div>
              )}

              {selected.status === "pending" && (
                <div className="space-y-3 pt-2">
                  <Textarea
                    placeholder="Motif du rejet (obligatoire si rejet)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <DialogFooter className="gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleAction("reject")}
                      disabled={processing}
                    >
                      {processing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                      Rejeter
                    </Button>
                    <Button onClick={() => handleAction("approve")} disabled={processing}>
                      {processing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                      Approuver
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminKYC;
