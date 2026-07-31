import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tag, Mail, Plus, Trash2, Send, Loader2, Copy, Check, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  product_ids: string[] | null;
}

interface Campaign {
  id: string;
  subject: string;
  content: string;
  recipient_type: string;
  status: string;
  sent_count: number;
  created_at: string;
  sent_at: string | null;
}

interface Product {
  id: string;
  title: string;
  type: string;
  price: number;
}

const DashboardMarketing = () => {
  const { user } = useAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Promo code form
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [promoScope, setPromoScope] = useState<"all" | "specific">("all");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [savingPromo, setSavingPromo] = useState(false);

  // Campaign form
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignContent, setCampaignContent] = useState("");
  const [recipientType, setRecipientType] = useState("all_customers");
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [promoRes, campRes, prodRes] = await Promise.all([
      supabase.from("promo_codes").select("*").eq("creator_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("email_campaigns").select("*").eq("creator_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("products").select("id, title, type, price").eq("creator_id", user!.id).order("title"),
    ]);
    if (promoRes.data) setPromoCodes(promoRes.data as any);
    if (campRes.data) setCampaigns(campRes.data as any);
    if (prodRes.data) setProducts(prodRes.data as any);
    setLoading(false);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setPromoCode(code);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const createPromoCode = async () => {
    if (!user || !promoCode.trim() || !discountValue) return;
    if (promoScope === "specific" && selectedProductIds.length === 0) {
      toast.error("Sélectionnez au moins un produit");
      return;
    }
    setSavingPromo(true);
    const { error } = await supabase.from("promo_codes").insert({
      code: promoCode.toUpperCase().trim(),
      discount_percent: discountType === "percent" ? parseFloat(discountValue) : null,
      discount_amount: discountType === "amount" ? parseFloat(discountValue) : null,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt || null,
      creator_id: user.id,
      product_ids: promoScope === "specific" ? selectedProductIds : null,
    } as any);
    setSavingPromo(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Code promo créé !");
    setPromoOpen(false);
    setPromoCode(""); setDiscountValue(""); setMaxUses(""); setExpiresAt("");
    setPromoScope("all"); setSelectedProductIds([]);
    loadData();
  };

  const togglePromo = async (id: string, active: boolean) => {
    await supabase.from("promo_codes").update({ is_active: active } as any).eq("id", id);
    setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, is_active: active } : p));
  };

  const deletePromo = async (id: string) => {
    await supabase.from("promo_codes").delete().eq("id", id);
    setPromoCodes(prev => prev.filter(p => p.id !== id));
    toast.success("Code supprimé");
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.title || id;

  const createCampaign = async () => {
    if (!user || !campaignSubject.trim() || !campaignContent.trim()) return;
    setSavingCampaign(true);
    const { error } = await supabase.from("email_campaigns").insert({
      subject: campaignSubject.trim(),
      content: campaignContent,
      recipient_type: recipientType,
      creator_id: user.id,
    } as any);
    setSavingCampaign(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Campagne créée !");
    setCampaignOpen(false);
    setCampaignSubject(""); setCampaignContent("");
    loadData();
  };

  const sendCampaign = async (campaign: Campaign) => {
    setSendingId(campaign.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-campaign", {
        body: { campaignId: campaign.id },
      });
      if (error) throw error;
      toast.success(`Campagne envoyée à ${data?.sentCount || 0} client(s) !`);
      loadData();
    } catch (err: any) {
      toast.error("Erreur: " + (err.message || "Réessayez"));
    } finally {
      setSendingId(null);
    }
  };

  const deleteCampaign = async (id: string) => {
    await supabase.from("email_campaigns").delete().eq("id", id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast.success("Campagne supprimée");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketing</h1>
          <p className="text-sm text-muted-foreground mt-1">Boostez vos ventes avec des promotions et campagnes</p>
        </div>

        <Tabs defaultValue="promos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="promos" className="gap-2"><Tag className="h-4 w-4" /> Codes promo</TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2"><Mail className="h-4 w-4" /> Campagnes email</TabsTrigger>
          </TabsList>

          {/* Promo codes tab */}
          <TabsContent value="promos" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={promoOpen} onOpenChange={setPromoOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 rounded-full"><Plus className="h-4 w-4" /> Nouveau code</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer un code promo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Code</label>
                      <div className="flex gap-2">
                        <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="CODE2025" />
                        <Button variant="outline" size="sm" onClick={generateCode} type="button">Générer</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Type</label>
                        <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percent">Pourcentage (%)</SelectItem>
                            <SelectItem value="amount">Montant fixe (FCFA)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Valeur</label>
                        <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder={discountType === "percent" ? "20" : "5000"} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Utilisations max</label>
                        <Input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Illimité" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Expire le</label>
                        <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                      </div>
                    </div>

                    {/* Product scope */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Appliquer à</label>
                      <Select value={promoScope} onValueChange={(v: any) => setPromoScope(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les produits</SelectItem>
                          <SelectItem value="specific">Produits spécifiques</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {promoScope === "specific" && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Sélectionner les produits ({selectedProductIds.length} sélectionné{selectedProductIds.length > 1 ? "s" : ""})
                        </label>
                        <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                          {products.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Aucun produit créé</p>
                          ) : (
                            products.map((product) => (
                              <label key={product.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer">
                                <Checkbox
                                  checked={selectedProductIds.includes(product.id)}
                                  onCheckedChange={() => toggleProductSelection(product.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                                  <p className="text-xs text-muted-foreground">{product.price} FCFA • {product.type}</p>
                                </div>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    <Button onClick={createPromoCode} disabled={savingPromo || !promoCode.trim() || !discountValue} className="w-full">
                      {savingPromo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Créer le code
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : promoCodes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucun code promo. Créez-en un pour booster vos ventes !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {promoCodes.map((promo) => (
                  <div key={promo.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-4">
                      <button onClick={() => copyCode(promo.id, promo.code)} className="font-mono font-bold text-foreground bg-secondary px-3 py-1 rounded-lg text-sm flex items-center gap-1.5 hover:bg-secondary/80">
                        {promo.code}
                        {copiedId === promo.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                      </button>
                      <div>
                        <p className="text-sm text-foreground font-medium">
                          {promo.discount_percent ? `-${promo.discount_percent}%` : `-${promo.discount_amount} FCFA`}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-muted-foreground">
                            {promo.current_uses}{promo.max_uses ? `/${promo.max_uses}` : ""} utilisations
                            {promo.expires_at && ` • Expire le ${new Date(promo.expires_at).toLocaleDateString("fr")}`}
                          </p>
                          {promo.product_ids && promo.product_ids.length > 0 ? (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <Package className="h-2.5 w-2.5" />
                              {promo.product_ids.length} produit{promo.product_ids.length > 1 ? "s" : ""}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Tous les produits</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={promo.is_active} onCheckedChange={(v) => togglePromo(promo.id, v)} />
                      <Button variant="ghost" size="icon" onClick={() => deletePromo(promo.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Email campaigns tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 rounded-full"><Plus className="h-4 w-4" /> Nouvelle campagne</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer une campagne email</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Objet de l'email</label>
                      <Input value={campaignSubject} onChange={(e) => setCampaignSubject(e.target.value)} placeholder="Ex: Nouvelle offre exclusive pour vous !" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Destinataires</label>
                      <Select value={recipientType} onValueChange={setRecipientType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all_customers">Tous les clients</SelectItem>
                          <SelectItem value="recent_buyers">Acheteurs récents (30 jours)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Contenu</label>
                      <RichTextEditor content={campaignContent} onChange={setCampaignContent} placeholder="Rédigez votre email ici..." />
                    </div>
                    <Button onClick={createCampaign} disabled={savingCampaign || !campaignSubject.trim() || !campaignContent.trim()} className="w-full">
                      {savingCampaign ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Enregistrer le brouillon
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune campagne. Créez votre première newsletter !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.status === "sent" ? `Envoyée à ${c.sent_count} client(s) le ${new Date(c.sent_at!).toLocaleDateString("fr")}` : "Brouillon"}
                        {" • "}{c.recipient_type === "all_customers" ? "Tous les clients" : "Acheteurs récents"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.status === "draft" && (
                        <Button size="sm" variant="outline" className="gap-1.5 rounded-full" onClick={() => sendCampaign(c)} disabled={sendingId === c.id}>
                          {sendingId === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                          Envoyer
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => deleteCampaign(c.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default DashboardMarketing;
