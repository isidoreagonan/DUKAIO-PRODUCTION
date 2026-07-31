import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, Crown, Gem, X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const ADMIN_EMAIL = "isidoreagonan@gmail.com";

const AdminBadges = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Map<string, any>>(new Map());
  const [search, setSearch] = useState("");
  const [grantUserId, setGrantUserId] = useState("");
  const [grantGrade, setGrantGrade] = useState<"standard" | "pro" | "premium">("standard");
  const [grantMonths, setGrantMonths] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [emailSearch, setEmailSearch] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<{ id: string; email: string; profile: any; badge: any } | null>(null);

  if (user && user.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" />;

  const load = async () => {
    setLoading(true);
    const { data: badgeData } = await supabase
      .from("verified_badges")
      .select("*")
      .order("created_at", { ascending: false });
    setBadges(badgeData || []);
    const ids = [...new Set((badgeData || []).map((b: any) => b.user_id))];
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, store_slug, avatar_url")
        .in("id", ids);
      const m = new Map();
      (profs || []).forEach((p: any) => m.set(p.id, p));
      setProfiles(m);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grant = async (userId: string, grade: any, months = 1) => {
    setBusyId(userId);
    try {
      const { error } = await supabase.functions.invoke("admin-badge", {
        body: { action: "grant", user_id: userId, grade, months },
      });
      if (error) throw error;
      toast.success("Badge accordé");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async (userId: string) => {
    if (!confirm("Révoquer ce badge ?")) return;
    setBusyId(userId);
    try {
      const { error } = await supabase.functions.invoke("admin-badge", {
        body: { action: "revoke", user_id: userId },
      });
      if (error) throw error;
      toast.success("Badge révoqué");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const findByEmail = async () => {
    if (!emailSearch.trim()) return;
    setEmailLoading(true);
    setFoundUser(null);
    try {
      const { data, error } = await supabase.functions.invoke("admin-badge", {
        body: { action: "find_by_email", email: emailSearch.trim() },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const res = data as any;
      setFoundUser({ id: res.user.id, email: res.user.email, profile: res.profile, badge: res.badge });
      setGrantUserId(res.user.id);
      toast.success("Utilisateur trouvé");
    } catch (e: any) {
      toast.error(e.message || "Utilisateur introuvable");
    } finally {
      setEmailLoading(false);
    }
  };

  const filtered = badges.filter((b) => {
    if (!search) return true;
    const p = profiles.get(b.user_id);
    return p?.display_name?.toLowerCase().includes(search.toLowerCase()) || b.user_id.includes(search);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <h1 className="text-2xl font-bold">🏅 Gestion des badges Verify</h1>

        <Card>
          <CardHeader><CardTitle>🔎 Rechercher une boutique par email</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col md:flex-row gap-2">
              <Input
                type="email"
                placeholder="email@exemple.com"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && findByEmail()}
                className="flex-1"
              />
              <Button onClick={findByEmail} disabled={emailLoading || !emailSearch.trim()}>
                {emailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-1" /> Rechercher</>}
              </Button>
            </div>

            {foundUser && (
              <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <div className="flex items-center gap-3 flex-wrap">
                  {foundUser.profile?.avatar_url && (
                    <img src={foundUser.profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {foundUser.profile?.display_name || "Sans nom"}
                      {foundUser.badge?.status === "active" && (
                        <span className="ml-2 inline-flex"><VerifiedBadge grade={foundUser.badge.grade} size="sm" /></span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{foundUser.email}</p>
                    {foundUser.profile?.store_slug && (
                      <p className="text-xs text-muted-foreground truncate">/{foundUser.profile.store_slug}</p>
                    )}
                  </div>
                  {foundUser.badge && (
                    <Badge variant={foundUser.badge.status === "active" ? "default" : "secondary"}>
                      {foundUser.badge.status} • {foundUser.badge.grade}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Select value={grantGrade} onValueChange={(v: any) => setGrantGrade(v)}>
                    <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    max={36}
                    value={grantMonths}
                    onChange={(e) => setGrantMonths(Number(e.target.value))}
                    placeholder="Durée (mois)"
                  />
                  <Button
                    onClick={() => grant(foundUser.id, grantGrade, grantMonths)}
                    disabled={busyId === foundUser.id}
                  >
                    {busyId === foundUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Attribuer le badge"}
                  </Button>
                </div>

                {foundUser.badge && foundUser.badge.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revoke(foundUser.id)}
                    disabled={busyId === foundUser.id}
                  >
                    <X className="h-3 w-3 mr-1" /> Révoquer le badge actuel
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Accorder un badge par User ID</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="User ID" value={grantUserId} onChange={(e) => setGrantUserId(e.target.value)} />
            <Select value={grantGrade} onValueChange={(v: any) => setGrantGrade(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" min={1} max={36} value={grantMonths} onChange={(e) => setGrantMonths(Number(e.target.value))} placeholder="Mois" />
            <Button onClick={() => grantUserId && grant(grantUserId, grantGrade, grantMonths)} disabled={!grantUserId || !!busyId}>
              {busyId === grantUserId ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accorder"}
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {filtered.map((b) => {
              const p = profiles.get(b.user_id);
              return (
                <Card key={b.id}>
                  <CardContent className="p-4 flex items-center gap-3 flex-wrap">
                    <VerifiedBadge grade={b.grade} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{p?.display_name || b.user_id}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.status} • {b.granted_by_admin ? "Admin" : "IA"}
                        {b.expires_at && ` • Expire ${new Date(b.expires_at).toLocaleDateString("fr-FR")}`}
                      </p>
                    </div>
                    <Badge variant={b.status === "active" ? "default" : "secondary"}>{b.status}</Badge>
                    {b.status !== "revoked" && (
                      <Button size="sm" variant="outline" onClick={() => revoke(b.user_id)} disabled={busyId === b.user_id}>
                        <X className="h-3 w-3" /> Révoquer
                      </Button>
                    )}
                    {b.status !== "active" && (
                      <Button size="sm" onClick={() => grant(b.user_id, b.grade, 1)} disabled={busyId === b.user_id}>
                        Activer
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">Aucun badge.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminBadges;
