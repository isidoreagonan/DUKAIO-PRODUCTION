import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Users, Search, Mail, Phone, ShoppingBag, Package, ArrowRight,
  Copy, MessageCircle, Calendar, Clock, Download, Tag, X,
  BadgeCheck, AlertCircle, RefreshCw, Send, Check, BarChart3, Edit2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ClientOrder {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  productTitle: string;
  thumbnailUrl: string | null;
  paymentMethod: string | null;
}

interface ClientWithOrders {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  totalSpent: number;
  completedOrdersCount: number;
  totalAttemptsCount: number;
  firstOrderDate: string;
  lastOrderDate: string;
  orders: ClientOrder[];
}

export default function DashboardClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientWithOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "failed">("all");
  const [selectedClient, setSelectedClient] = useState<ClientWithOrders | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);

  const handleUpdateEmail = async () => {
    if (!newEmail || !newEmail.includes("@") || !selectedClient) {
      toast.error("Veuillez saisir une adresse email valide");
      return;
    }
    setUpdatingEmail(true);
    try {
      const { error } = await supabase
        .from("customers")
        .update({ email: newEmail.trim().toLowerCase() })
        .eq("id", selectedClient.id);

      if (error) throw error;

      toast.success("Adresse email mise à jour avec succès !");
      setSelectedClient((prev) => prev ? { ...prev, email: newEmail.trim().toLowerCase() } : null);
      setClients((prev) =>
        prev.map((c) => (c.id === selectedClient.id ? { ...c, email: newEmail.trim().toLowerCase() } : c))
      );
      setIsEditingEmail(false);
    } catch (err: any) {
      toast.error("Impossible de modifier l'email : " + (err.message || "Erreur"));
    } finally {
      setUpdatingEmail(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchClients = async () => {
      setLoading(true);
      try {
        const { data: orders, error } = await supabase
          .from("orders")
          .select("id, amount, status, created_at, payment_method, customer_id, products(title, thumbnail_url), customers(id, name, email, phone, created_at)")
          .eq("store_owner_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!orders || orders.length === 0) {
          setClients([]);
          setLoading(false);
          return;
        }

        const clientMap = new Map<string, ClientWithOrders>();

        for (const o of orders as any[]) {
          const c = o.customers;
          if (!c) continue;

          const key = c.id || c.email;
          const isCompleted = o.status === "completed";
          const orderItem: ClientOrder = {
            id: o.id,
            amount: Number(o.amount || 0),
            status: o.status || "pending",
            created_at: o.created_at,
            productTitle: o.products?.title || "Produit digital",
            thumbnailUrl: o.products?.thumbnail_url || null,
            paymentMethod: o.payment_method || null,
          };

          const existing = clientMap.get(key);
          if (existing) {
            if (isCompleted) {
              existing.totalSpent += orderItem.amount;
              existing.completedOrdersCount += 1;
            }
            existing.totalAttemptsCount += 1;
            existing.orders.push(orderItem);
            if (new Date(o.created_at) > new Date(existing.lastOrderDate)) {
              existing.lastOrderDate = o.created_at;
            }
            if (new Date(o.created_at) < new Date(existing.firstOrderDate)) {
              existing.firstOrderDate = o.created_at;
            }
          } else {
            clientMap.set(key, {
              id: c.id,
              name: c.name || "Client",
              email: c.email || "—",
              phone: c.phone || "",
              created_at: c.created_at || o.created_at,
              totalSpent: isCompleted ? orderItem.amount : 0,
              completedOrdersCount: isCompleted ? 1 : 0,
              totalAttemptsCount: 1,
              firstOrderDate: o.created_at,
              lastOrderDate: o.created_at,
              orders: [orderItem],
            });
          }
        }

        setClients(Array.from(clientMap.values()));
      } catch (err) {
        console.error("Erreur chargement clients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  const copyText = (text: string, key: string, label: string) => {
    if (!text || text === "—") return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copié !`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openWhatsApp = (phone: string, clientName: string, productTitle?: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) {
      toast.error("Numéro de téléphone introuvable");
      return;
    }
    const msg = productTitle
      ? `Bonjour ${clientName}, j'ai vu votre tentative de commande pour "${productTitle}" sur ma boutique DUKAIO. Avez-vous rencontré un problème ? Je suis à votre disposition pour vous aider.`
      : `Bonjour ${clientName}, je vous contacte concernant votre activité sur ma boutique DUKAIO.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q);

      const hasCompleted = c.orders.some((o) => o.status === "completed");
      const hasPending = c.orders.some((o) => o.status === "pending");
      const hasFailed = c.orders.some((o) => o.status === "failed" || o.status === "cancelled");

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && hasCompleted) ||
        (statusFilter === "pending" && hasPending) ||
        (statusFilter === "failed" && hasFailed);

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full pb-14 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Clients
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {clients.length} contact{clients.length > 1 ? "s" : ""} enregistré{clients.length > 1 ? "s" : ""} (acheteurs & checkouts initiés).
            </p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher nom, email, téléphone..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none font-medium focus:border-primary/50 transition-colors shadow-2xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-border bg-card text-xs font-semibold text-foreground outline-none cursor-pointer shadow-2xs hover:bg-secondary/40 transition-colors"
            >
              <option value="all">Tous les clients</option>
              <option value="completed">Acheteurs confirmés (Payé)</option>
              <option value="pending">En attente (USSD en cours)</option>
              <option value="failed">Abandons / Échoués</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-2">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <h3 className="text-base font-bold text-foreground">Aucun client pour le moment</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Chaque client ayant initié un paiement ou passé commande apparaîtra ici avec son historique complet.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Nom du client</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Téléphone</th>
                    <th className="py-3.5 px-4 text-center">Activité</th>
                    <th className="py-3.5 px-4">Dépenses</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Date d'ajout</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((c) => {
                    const latestOrder = c.orders[0];
                    const hasSuccessful = c.completedOrdersCount > 0;
                    const hasFailed = c.orders.some((o) => o.status === "failed" || o.status === "cancelled");

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedClient(c)}
                        className="h-16 hover:bg-secondary/20 transition-colors cursor-pointer group"
                      >
                        {/* Name & Email */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-xs text-primary shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-foreground truncate text-[13px] group-hover:text-primary transition-colors">
                                {c.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">{c.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground font-mono text-xs">
                          {c.phone || "—"}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4 text-center">
                          {hasSuccessful ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {c.completedOrdersCount} achat{c.completedOrdersCount > 1 ? "s" : ""}
                            </span>
                          ) : hasFailed ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Paiement échoué
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                              En attente
                            </span>
                          )}
                        </td>

                        {/* Total Spent */}
                        <td className="py-3 px-4 font-black text-foreground whitespace-nowrap text-xs">
                          {c.totalSpent.toLocaleString("fr-FR")} FCFA
                        </td>

                        {/* Created Date */}
                        <td className="py-3 px-4 hidden md:table-cell text-muted-foreground text-[11px] whitespace-nowrap">
                          {format(parseISO(c.created_at), "d MMMM yyyy", { locale: fr })}
                        </td>

                        {/* Actions (Email + WhatsApp) */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {c.email && c.email !== "—" && (
                              <a
                                href={`mailto:${c.email}`}
                                title="Envoyer un email"
                                className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </a>
                            )}
                            {c.phone && (
                              <button
                                type="button"
                                onClick={() => openWhatsApp(c.phone, c.name, latestOrder?.productTitle)}
                                title="Contacter sur WhatsApp"
                                className="h-8 w-8 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedClient(c)}
                              className="h-8 px-2.5 rounded-lg border border-border bg-card text-[11px] font-bold text-foreground hover:bg-secondary transition-colors inline-flex items-center gap-1"
                            >
                              <span>Détails</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && search && (
              <div className="py-8 text-center text-muted-foreground text-xs">
                Aucun client ne correspond à « {search} »
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SLIDE-OVER DRAWER (Matches Chariow design exactly)   */}
        {/* ---------------------------------------------------- */}
        <Sheet open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto bg-card border-l border-border">
            {selectedClient && (
              <div className="flex flex-col min-h-full pb-8">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur z-10">
                  <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
                    {selectedClient.name}
                  </SheetTitle>
                </div>

                <div className="p-6 space-y-6">
                  {/* Yellow Banner / Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewEmail(selectedClient.email === "—" ? "" : selectedClient.email);
                      setIsEditingEmail(true);
                    }}
                    className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Changer l'email</span>
                  </button>

                  {/* Profile Card */}
                  <div className="p-4 rounded-2xl border border-border bg-secondary/20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-sm text-primary shrink-0">
                        {selectedClient.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-sm text-foreground truncate">{selectedClient.name}</p>
                          <button
                            type="button"
                            onClick={() => copyText(selectedClient.name, "name", "Nom")}
                            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                            title="Copier le nom"
                          >
                            {copiedKey === "name" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Client depuis le {format(parseISO(selectedClient.created_at), "d MMMM yyyy", { locale: fr })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {selectedClient.email && selectedClient.email !== "—" && (
                        <a
                          href={`mailto:${selectedClient.email}`}
                          className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/40 hover:scale-105 transition-transform"
                          title="Envoyer un email"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {selectedClient.phone && (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(selectedClient.phone, selectedClient.name, selectedClient.orders[0]?.productTitle)}
                          className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/40 hover:scale-105 transition-transform"
                          title="WhatsApp direct"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contact Fields with Copy */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                      <div className="flex items-center gap-2.5 text-xs">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Email</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground truncate max-w-[190px]">{selectedClient.email}</span>
                        <button
                          type="button"
                          onClick={() => copyText(selectedClient.email, "email", "Email")}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1"
                          title="Copier l'email"
                        >
                          {copiedKey === "email" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                      <div className="flex items-center gap-2.5 text-xs">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Téléphone</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-foreground">{selectedClient.phone || "Non renseigné"}</span>
                        {selectedClient.phone && (
                          <button
                            type="button"
                            onClick={() => copyText(selectedClient.phone, "phone", "Téléphone")}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            title="Copier le numéro"
                          >
                            {copiedKey === "phone" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 8 Statistics Tiles (Matches Chariow Grid) */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Statistiques
                    </p>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Ventes confirmées */}
                      <div className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold">
                          <ShoppingBag className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Ventes</span>
                        </div>
                        <p className="text-lg font-black text-foreground">{selectedClient.completedOrdersCount}</p>
                      </div>

                      {/* Revenu total */}
                      <div className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold">
                          <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                          <span>Revenu total</span>
                        </div>
                        <p className="text-lg font-black text-foreground">{selectedClient.totalSpent.toLocaleString("fr-FR")} FCFA</p>
                      </div>

                      {/* Tentatives / Abandons */}
                      <div className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold">
                          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                          <span>Abandons / Échecs</span>
                        </div>
                        <p className="text-lg font-black text-foreground">
                          {selectedClient.orders.filter((o) => o.status === "failed" || o.status === "cancelled").length}
                        </p>
                      </div>

                      {/* Panier moyen */}
                      <div className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold">
                          <Tag className="h-3.5 w-3.5 text-amber-500" />
                          <span>Panier moyen</span>
                        </div>
                        <p className="text-lg font-black text-foreground">
                          {selectedClient.completedOrdersCount > 0
                            ? Math.round(selectedClient.totalSpent / selectedClient.completedOrdersCount).toLocaleString("fr-FR")
                            : 0}{" "}
                          FCFA
                        </p>
                      </div>

                      {/* Premier contact */}
                      <div className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>Premier contact</span>
                        </div>
                        <p className="text-xs font-bold text-foreground">
                          {format(parseISO(selectedClient.firstOrderDate), "d MMM yyyy", { locale: fr })}
                        </p>
                      </div>

                      {/* Dernière activité */}
                      <div className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Dernier achat</span>
                        </div>
                        <p className="text-xs font-bold text-foreground">
                          {format(parseISO(selectedClient.lastOrderDate), "d MMM yyyy", { locale: fr })}
                        </p>
                      </div>

                      {/* Produits consultés */}
                      <div className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold">
                          <Package className="h-3.5 w-3.5 text-slate-400" />
                          <span>Produits</span>
                        </div>
                        <p className="text-lg font-black text-foreground">
                          {new Set(selectedClient.orders.map((o) => o.productTitle)).size}
                        </p>
                      </div>

                      {/* Téléchargements */}
                      <div className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold">
                          <Download className="h-3.5 w-3.5 text-slate-400" />
                          <span>Téléchargements</span>
                        </div>
                        <p className="text-lg font-black text-foreground">{selectedClient.completedOrdersCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section: Achats & Tentatives de commande */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Achats & Activités ({selectedClient.orders.length})
                      </p>
                    </div>

                    <div className="space-y-2">
                      {selectedClient.orders.map((o) => {
                        const isPaye = o.status === "completed";
                        const isEnAttente = o.status === "pending";
                        const isEchoue = o.status === "failed" || o.status === "cancelled";

                        return (
                          <div
                            key={o.id}
                            className="p-3.5 rounded-2xl border border-border bg-card space-y-3 shadow-2xs hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-xl bg-secondary border border-border overflow-hidden flex items-center justify-center shrink-0">
                                  {o.thumbnailUrl ? (
                                    <img src={o.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-xs text-foreground truncate">{o.productTitle}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {format(parseISO(o.created_at), "d MMMM yyyy à HH:mm", { locale: fr })}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-black text-xs text-foreground block">
                                  {o.amount.toLocaleString("fr-FR")} FCFA
                                </span>
                                <div className="mt-1">
                                  {isPaye ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                      Payé
                                    </span>
                                  ) : isEnAttente ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
                                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                      En attente
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800/40">
                                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                      Échoué / Abandonné
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Relancer sur WhatsApp si échoué ou en attente */}
                            {!isPaye && selectedClient.phone && (
                              <button
                                type="button"
                                onClick={() => openWhatsApp(selectedClient.phone, selectedClient.name, o.productTitle)}
                                className="w-full h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800/50 transition-colors"
                              >
                                <MessageCircle className="h-3 w-3" />
                                <span>Relancer ce client sur WhatsApp</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}
