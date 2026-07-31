import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, DollarSign, ArrowDownRight, ArrowUpRight, Mail, Phone, Globe, Calendar } from "lucide-react";
import { countries } from "@/data/countries";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  country_code: string | null;
  store_slug: string | null;
  created_at: string;
}

interface UserEvent {
  type: "sale" | "withdrawal" | "commission";
  amount: number;
  date: string;
  status?: string;
  detail?: string;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email !== "isidoreagonan@gmail.com") return;
    fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, display_name, avatar_url, phone, country_code, store_slug, created_at")
      .order("created_at", { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  const fetchUserEvents = async (userId: string) => {
    setSelectedUser(userId);
    const events: UserEvent[] = [];

    // Fetch orders (sales + commissions)
    const { data: orders } = await supabase
      .from("orders")
      .select("amount, created_at, status")
      .eq("store_owner_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(50);

    orders?.forEach((o) => {
      events.push({
        type: "sale",
        amount: Number(o.amount),
        date: o.created_at,
        status: o.status,
      });
      events.push({
        type: "commission",
        amount: Number(o.amount) * 0.1,
        date: o.created_at,
        detail: "10% commission",
      });
    });

    // Fetch withdrawals
    const { data: withdrawals } = await supabase
      .from("withdrawals")
      .select("amount, fee, net_amount, created_at, status, operator")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    withdrawals?.forEach((w) => {
      events.push({
        type: "withdrawal",
        amount: Number(w.net_amount),
        date: w.created_at,
        status: w.status,
        detail: `${w.operator} - frais: ${w.fee} FCFA`,
      });
    });

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setUserEvents(events);
  };

  const getFlagImg = (code: string | null, size = 20) => {
    if (!code) return <span>🌍</span>;
    return <img src={`https://flagcdn.com/w${size * 2}/${code.toLowerCase()}.png`} alt={code} className="rounded-sm object-cover" style={{ height: size, width: size * 1.5 }} />;
  };

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.display_name?.toLowerCase().includes(q) ||
      p.first_name?.toLowerCase().includes(q) ||
      p.last_name?.toLowerCase().includes(q) ||
      p.phone?.includes(q) ||
      p.store_slug?.toLowerCase().includes(q)
    );
  });

  const selectedProfile = profiles.find((p) => p.id === selectedUser);

  if (user?.email !== "isidoreagonan@gmail.com") {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-muted-foreground">Accès non autorisé</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" /> Gestion des utilisateurs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profiles.length} utilisateur{profiles.length > 1 ? "s" : ""} inscrit{profiles.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, téléphone, boutique..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users list */}
          <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-10 text-muted-foreground text-sm">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">Aucun utilisateur trouvé</div>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => fetchUserEvents(p.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    selectedUser === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-lg">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        getFlagImg(p.country_code)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {p.first_name || p.last_name
                          ? `${p.last_name || ""} ${p.first_name || ""}`.trim()
                          : p.display_name || "Sans nom"}
                      </p>
                      {p.phone && (
                        <p className="text-xs text-muted-foreground truncate">{p.phone}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {format(new Date(p.created_at), "dd MMM yy", { locale: fr })}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* User detail + events */}
          <div className="lg:col-span-2">
            {!selectedUser ? (
              <div className="text-center py-20 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                Sélectionnez un utilisateur pour voir ses détails
              </div>
            ) : (
              <div className="space-y-4">
                {/* Profile card */}
                {selectedProfile && (
                  <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-2xl">
                        {selectedProfile.avatar_url ? (
                          <img src={selectedProfile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          getFlagImg(selectedProfile.country_code, 28)
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {selectedProfile.first_name || selectedProfile.last_name
                            ? `${selectedProfile.last_name || ""} ${selectedProfile.first_name || ""}`.trim()
                            : selectedProfile.display_name || "Sans nom"}
                        </h3>
                        {selectedProfile.store_slug && (
                          <Badge variant="secondary" className="text-xs">
                            Boutique: {selectedProfile.store_slug}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      {selectedProfile.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{selectedProfile.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span className="flex items-center gap-1">{getFlagImg(selectedProfile.country_code, 14)} {selectedProfile.country_code || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Inscrit le {format(new Date(selectedProfile.created_at), "dd/MM/yyyy", { locale: fr })}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Events */}
                <div className="rounded-xl border border-border bg-card">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Événements financiers</h3>
                  </div>
                  {userEvents.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                      Aucun événement pour cet utilisateur
                    </div>
                  ) : (
                    <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                      {userEvents.map((ev, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                              ev.type === "sale"
                                ? "bg-green-500/10 text-green-600"
                                : ev.type === "commission"
                                ? "bg-blue-500/10 text-blue-600"
                                : "bg-orange-500/10 text-orange-600"
                            }`}
                          >
                            {ev.type === "sale" ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : ev.type === "commission" ? (
                              <DollarSign className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {ev.type === "sale" ? "Vente" : ev.type === "commission" ? "Commission" : "Retrait"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(ev.date), "dd MMM yyyy HH:mm", { locale: fr })}
                              {ev.detail && ` · ${ev.detail}`}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className={`text-sm font-bold ${
                                ev.type === "withdrawal" ? "text-orange-600" : ev.type === "commission" ? "text-blue-600" : "text-green-600"
                              }`}
                            >
                              {ev.type === "withdrawal" ? "-" : "+"}
                              {ev.amount.toLocaleString()} FCFA
                            </p>
                            {ev.status && (
                              <Badge variant="outline" className="text-[10px]">
                                {ev.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
