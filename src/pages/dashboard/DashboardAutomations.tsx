import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Zap, Mail, Bell, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Automation {
  id: string;
  name: string;
  trigger_event: string;
  action_type: string;
  action_config: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const triggerOptions = [
  { value: "new_sale", label: "Nouvelle vente" },
  { value: "new_customer", label: "Nouveau client" },
  { value: "payment_failed", label: "Paiement échoué" },
  { value: "product_published", label: "Produit publié" },
];

const actionOptions = [
  { value: "send_email", label: "Envoyer un email au client" },
  { value: "send_welcome_email", label: "Email de bienvenue" },
  { value: "notify_owner", label: "Notifier le vendeur" },
  { value: "send_followup", label: "Email de suivi (24h après)" },
];

const DashboardAutomations = () => {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("");
  const [actionType, setActionType] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Realtime notifications
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("user-notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const notif = payload.new as Notification;
        setNotifications((prev) => [notif, ...prev]);
        toast.info(notif.title, { description: notif.message });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [autoRes, notifRes] = await Promise.all([
      supabase.from("automations").select("*").eq("creator_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50),
    ]);
    if (autoRes.data) setAutomations(autoRes.data as any);
    if (notifRes.data) setNotifications(notifRes.data as any);
    setLoading(false);
  };

  const createAutomation = async () => {
    if (!user || !name.trim() || !triggerEvent || !actionType) return;
    setSaving(true);
    const config: Record<string, any> = {};
    if (actionType.includes("email")) {
      config.email_subject = emailSubject || `Notification - ${name}`;
      config.email_body = emailBody || "";
    }
    const { error } = await supabase.from("automations").insert({
      name: name.trim(),
      trigger_event: triggerEvent,
      action_type: actionType,
      action_config: config,
      creator_id: user.id,
    } as any);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Automatisation créée !");
    setOpen(false);
    setName(""); setTriggerEvent(""); setActionType(""); setEmailSubject(""); setEmailBody("");
    loadData();
  };

  const toggleAutomation = async (id: string, active: boolean) => {
    await supabase.from("automations").update({ is_active: active } as any).eq("id", id);
    setAutomations((prev) => prev.map((a) => a.id === id ? { ...a, is_active: active } : a));
  };

  const deleteAutomation = async (id: string) => {
    await supabase.from("automations").delete().eq("id", id);
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    toast.success("Automatisation supprimée");
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true } as any).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    for (const n of unread) {
      await supabase.from("notifications").update({ is_read: true } as any).eq("id", n.id);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("Toutes les notifications marquées comme lues");
  };

  const getTriggerLabel = (v: string) => triggerOptions.find((o) => o.value === v)?.label || v;
  const getActionLabel = (v: string) => actionOptions.find((o) => o.value === v)?.label || v;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automatisations</h1>
          <p className="text-sm text-muted-foreground mt-1">Automatisez vos emails et notifications</p>
        </div>

        <Tabs defaultValue="automations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="automations" className="gap-2"><Zap className="h-4 w-4" /> Règles</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" /> Notifications
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <span className="ml-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {notifications.filter((n) => !n.is_read).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Automations tab */}
          <TabsContent value="automations" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 rounded-full"><Plus className="h-4 w-4" /> Nouvelle règle</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer une automatisation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nom</label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Email de bienvenue" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Déclencheur</label>
                      <Select value={triggerEvent} onValueChange={setTriggerEvent}>
                        <SelectTrigger><SelectValue placeholder="Quand déclencher ?" /></SelectTrigger>
                        <SelectContent>
                          {triggerOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Action</label>
                      <Select value={actionType} onValueChange={setActionType}>
                        <SelectTrigger><SelectValue placeholder="Que faire ?" /></SelectTrigger>
                        <SelectContent>
                          {actionOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {actionType && actionType.includes("email") && (
                      <>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Objet de l'email</label>
                          <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Merci pour votre achat !" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Contenu de l'email</label>
                          <textarea
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            placeholder="Bonjour {nom}, merci d'avoir acheté {produit}..."
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Variables : {"{nom}"}, {"{email}"}, {"{produit}"}, {"{montant}"}
                          </p>
                        </div>
                      </>
                    )}
                    <Button onClick={createAutomation} disabled={saving || !name.trim() || !triggerEvent || !actionType} className="w-full">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Créer l'automatisation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : automations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune automatisation. Créez votre première règle !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {automations.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${a.is_active ? "bg-primary/10" : "bg-muted"}`}>
                        <Zap className={`h-4 w-4 ${a.is_active ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{a.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getTriggerLabel(a.trigger_event)} → {getActionLabel(a.action_type)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={a.is_active} onCheckedChange={(v) => toggleAutomation(a.id, v)} />
                      <Button variant="ghost" size="icon" onClick={() => deleteAutomation(a.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Notifications tab */}
          <TabsContent value="notifications" className="space-y-4">
            {notifications.filter((n) => !n.is_read).length > 0 && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="rounded-full" onClick={markAllRead}>
                  Tout marquer comme lu
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune notification pour le moment</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                      n.is_read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`h-2 w-2 rounded-full mt-1.5 ${n.is_read ? "bg-transparent" : "bg-primary"}`} />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {new Date(n.created_at).toLocaleDateString("fr", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAutomations;
