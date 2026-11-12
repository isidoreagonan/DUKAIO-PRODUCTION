import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Users, Search, Mail, Phone, ShoppingBag, Package, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ClientWithOrders {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  totalSpent: number;
  orderCount: number;
  orders: { id: string; amount: number; created_at: string; productTitle: string }[];
}

export default function DashboardClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientWithOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithOrders | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchClients = async () => {
      setLoading(true);
      try {
        const { data: orders } = await supabase
          .from("orders")
          .select("id, amount, status, created_at, customer_id, products(title), customers(id, name, email, phone, created_at)")
          .eq("store_owner_id", user.id)
          .order("created_at", { ascending: false });

        if (!orders || orders.length === 0) {
          setClients([]);
          setLoading(false);
          return;
        }

        const clientMap = new Map<string, ClientWithOrders>();
        for (const o of orders as any[]) {
          const c = o.customers;
          if (!c) continue;
          const existing = clientMap.get(c.id);
          const isCompleted = o.status === "completed";
          const orderItem = {
            id: o.id,
            amount: Number(o.amount),
            created_at: o.created_at,
            productTitle: o.products?.title || "Produit numérique",
          };
          if (existing) {
            if (isCompleted) existing.totalSpent += Number(o.amount);
            existing.orderCount += 1;
            existing.orders.push(orderItem);
          } else {
            clientMap.set(c.id, {
              id: c.id,
              name: c.name || "Client",
              email: c.email || "—",
              phone: c.phone || "—",
              created_at: c.created_at,
              totalSpent: isCompleted ? Number(o.amount) : 0,
              orderCount: 1,
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

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

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
              {clients.length} acheteur{clients.length > 1 ? "s" : ""} enregistré{clients.length > 1 ? "s" : ""} dans votre boutique.
            </p>
          </div>

          {/* Search bar */}
          {clients.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, email..."
                className="w-full h-8 pl-9 pr-3 rounded-lg bg-secondary/40 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none font-medium focus:border-primary/50 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-2">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <h3 className="text-base font-bold text-foreground">Aucun client pour le moment</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Vos clients et leurs historiques d'achats apparaîtront automatiquement dès leur première commande payée.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Téléphone</th>
                    <th className="py-3 px-4 text-center">Achats</th>
                    <th className="py-3 px-4">Total dépensé</th>
                    <th className="py-3 px-4 hidden md:table-cell">Client depuis</th>
                    <th className="py-3 px-4 text-right">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedClient(c)}
                      className="h-14 hover:bg-secondary/20 transition-colors cursor-pointer group"
                    >
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-border flex items-center justify-center font-bold text-xs text-primary shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate text-[13px]">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-4 hidden sm:table-cell text-muted-foreground font-medium">
                        {c.phone || "—"}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary border border-border text-[11px] font-semibold text-foreground">
                          {c.orderCount}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-bold text-foreground whitespace-nowrap">
                        {c.totalSpent.toLocaleString("fr-FR")} F
                      </td>
                      <td className="py-2 px-4 hidden md:table-cell text-muted-foreground text-[11px] whitespace-nowrap">
                        {format(parseISO(c.created_at), "dd MMM yyyy", { locale: fr })}
                      </td>
                      <td className="py-2 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">
                          <span>Voir fiche</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
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
      </div>

      {/* Client Detail Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={(v) => !v && setSelectedClient(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl border-border bg-card p-6 shadow-2xl">
          {selectedClient && (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Fiche client
                </DialogTitle>
              </DialogHeader>

              {/* Profile card */}
              <div className="flex items-center gap-3.5 p-3 rounded-xl border border-border bg-secondary/30">
                <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-base text-primary shrink-0">
                  {selectedClient.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-foreground truncate">{selectedClient.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedClient.email}</p>
                </div>
              </div>

              {/* Contact info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Phone className="h-3 w-3" />
                    <span>Téléphone</span>
                  </div>
                  <p className="text-xs font-bold text-foreground truncate">{selectedClient.phone || "Non renseigné"}</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <ShoppingBag className="h-3 w-3" />
                    <span>Dépenses cumulées</span>
                  </div>
                  <p className="text-xs font-bold text-foreground truncate">{selectedClient.totalSpent.toLocaleString("fr-FR")} F</p>
                </div>
              </div>

              {/* Purchase History */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Historique des achats ({selectedClient.orders.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-border border border-border rounded-xl p-2 bg-secondary/20">
                  {selectedClient.orders.map((o) => (
                    <div key={o.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground truncate">{o.productTitle}</span>
                      </div>
                      <div className="text-right shrink-0 whitespace-nowrap">
                        <span className="font-bold text-foreground">{o.amount.toLocaleString("fr-FR")} F</span>
                        <p className="text-[10px] text-muted-foreground">{format(parseISO(o.created_at), "dd/MM/yyyy", { locale: fr })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
