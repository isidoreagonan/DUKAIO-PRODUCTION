import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Webhook, Plus, Trash2, Loader2, Eye, CheckCircle2, XCircle, RefreshCw, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  product_ids: string[] | null;
  is_active: boolean;
  created_at: string;
}

interface WebhookLog {
  id: string;
  webhook_id: string;
  event: string;
  payload: any;
  response_status: number | null;
  response_body: string | null;
  success: boolean;
  attempt: number;
  created_at: string;
}

const EVENT_OPTIONS = [
  { value: "successful.sale", label: "Vente réussie", description: "Quand un paiement est complété" },
  { value: "failed.sale", label: "Vente échouée", description: "Quand un paiement échoue" },
  { value: "license.issued", label: "Licence émise", description: "Quand une licence est générée après achat" },
  { value: "license.activated", label: "Licence activée", description: "Quand une licence est activée sur un device" },
  { value: "payout.success", label: "Retrait réussi", description: "Quand un retrait est complété" },
  { value: "payout.failed", label: "Retrait échoué", description: "Quand un retrait échoue" },
];

function generateSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "whsec_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const DashboardWebhooks = () => {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);

  // Form state
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Log detail
  const [logDetail, setLogDetail] = useState<WebhookLog | null>(null);

  useEffect(() => {
    if (user) loadWebhooks();
  }, [user]);

  const loadWebhooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("webhooks")
      .select("*")
      .eq("creator_id", user!.id)
      .order("created_at", { ascending: false });

    if (data) setWebhooks(data as any);
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const loadLogs = async (webhookId: string) => {
    setSelectedWebhookId(webhookId);
    setLogsLoading(true);
    const { data, error } = await supabase
      .from("webhook_logs")
      .select("*")
      .eq("webhook_id", webhookId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) setLogs(data as any);
    if (error) toast.error(error.message);
    setLogsLoading(false);
  };

  const createWebhook = async () => {
    if (!user || !name.trim() || !url.trim() || selectedEvents.length === 0) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error("URL invalide. Utilisez une URL complète (https://...)");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("webhooks").insert({
      creator_id: user.id,
      name: name.trim(),
      url: url.trim(),
      secret: secret || null,
      events: selectedEvents,
    } as any);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Webhook créé !");
    setOpen(false);
    resetForm();
    loadWebhooks();
  };

  const resetForm = () => {
    setName("");
    setUrl("");
    setSecret("");
    setSelectedEvents([]);
  };

  const toggleWebhook = async (id: string, active: boolean) => {
    await supabase.from("webhooks").update({ is_active: active } as any).eq("id", id);
    setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, is_active: active } : w)));
    toast.success(active ? "Webhook activé" : "Webhook désactivé");
  };

  const deleteWebhook = async (id: string) => {
    await supabase.from("webhooks").delete().eq("id", id);
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    if (selectedWebhookId === id) {
      setSelectedWebhookId(null);
      setLogs([]);
    }
    toast.success("Webhook supprimé");
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const copySecret = (s: string) => {
    navigator.clipboard.writeText(s);
    toast.success("Secret copié !");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Recevez des notifications en temps réel quand des événements se produisent dans votre boutique
          </p>
        </div>

        <Tabs defaultValue="webhooks" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="h-4 w-4" /> Endpoints
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <Eye className="h-4 w-4" /> Logs
            </TabsTrigger>
          </TabsList>

          {/* Webhooks tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 rounded-full">
                    <Plus className="h-4 w-4" /> Nouveau webhook
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Créer un webhook</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nom</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Zapier - Nouvelle vente"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">URL de l'endpoint</label>
                      <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://hooks.zapier.com/..."
                        type="url"
                        maxLength={2048}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        L'URL doit être accessible via HTTPS
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Secret de signature (optionnel)</label>
                      <div className="flex gap-2">
                        <Input
                          value={secret}
                          onChange={(e) => setSecret(e.target.value)}
                          placeholder="whsec_..."
                          className="font-mono text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSecret(generateSecret())}
                          className="shrink-0"
                        >
                          Générer
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Utilisé pour signer les requêtes (header X-Webhook-Signature)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Événements</label>
                      <div className="space-y-2">
                        {EVENT_OPTIONS.map((ev) => (
                          <label
                            key={ev.value}
                            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                          >
                            <Checkbox
                              checked={selectedEvents.includes(ev.value)}
                              onCheckedChange={() => toggleEvent(ev.value)}
                              className="mt-0.5"
                            />
                            <div>
                              <p className="text-sm font-medium">{ev.label}</p>
                              <p className="text-xs text-muted-foreground">{ev.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={createWebhook}
                      disabled={saving || !name.trim() || !url.trim() || selectedEvents.length === 0}
                      className="w-full"
                    >
                      {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Créer le webhook
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : webhooks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Webhook className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucun webhook configuré</p>
                <p className="text-xs mt-1">Créez un webhook pour recevoir des notifications en temps réel</p>
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks.map((wh) => (
                  <div
                    key={wh.id}
                    className="p-4 rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                            wh.is_active ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <Webhook
                            className={`h-4 w-4 ${wh.is_active ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{wh.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{wh.url}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {wh.events.map((ev) => (
                              <Badge key={ev} variant="secondary" className="text-[10px]">
                                {EVENT_OPTIONS.find((o) => o.value === ev)?.label || ev}
                              </Badge>
                            ))}
                          </div>
                          {wh.secret && (
                            <button
                              onClick={() => copySecret(wh.secret!)}
                              className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                              <span className="font-mono">
                                {wh.secret.substring(0, 10)}...
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => loadLogs(wh.id)}
                          title="Voir les logs"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={wh.is_active}
                          onCheckedChange={(v) => toggleWebhook(wh.id, v)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteWebhook(wh.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Logs tab */}
          <TabsContent value="logs" className="space-y-4">
            {!selectedWebhookId ? (
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  Sélectionnez un webhook pour voir ses logs
                </p>
                {webhooks.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {webhooks.map((wh) => (
                      <Button
                        key={wh.id}
                        variant="outline"
                        size="sm"
                        onClick={() => loadLogs(wh.id)}
                        className="rounded-full text-xs"
                      >
                        {wh.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      Logs : {webhooks.find((w) => w.id === selectedWebhookId)?.name}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadLogs(selectedWebhookId)}
                    className="gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Rafraîchir
                  </Button>
                </div>

                {logsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Aucun log pour ce webhook</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        onClick={() => setLogDetail(log)}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {log.success ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              {EVENT_OPTIONS.find((o) => o.value === log.event)?.label || log.event}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.response_status ? `HTTP ${log.response_status}` : "Pas de réponse"} •{" "}
                              {new Date(log.created_at).toLocaleDateString("fr", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={log.success ? "default" : "destructive"} className="text-[10px]">
                          {log.success ? "OK" : "Erreur"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Log detail dialog */}
            <Dialog open={!!logDetail} onOpenChange={() => setLogDetail(null)}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {logDetail?.success ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    Détail du log
                  </DialogTitle>
                </DialogHeader>
                {logDetail && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Événement</p>
                        <p className="font-medium">
                          {EVENT_OPTIONS.find((o) => o.value === logDetail.event)?.label || logDetail.event}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Statut HTTP</p>
                        <p className="font-medium">{logDetail.response_status || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Date</p>
                        <p className="font-medium">
                          {new Date(logDetail.created_at).toLocaleString("fr")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Tentative</p>
                        <p className="font-medium">{logDetail.attempt}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payload envoyé</p>
                      <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-40 font-mono">
                        {JSON.stringify(logDetail.payload, null, 2)}
                      </pre>
                    </div>
                    {logDetail.response_body && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Réponse</p>
                        <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-40 font-mono">
                          {logDetail.response_body}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardWebhooks;
