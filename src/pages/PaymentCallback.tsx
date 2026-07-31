import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Copy, Download, FileText, Key, Loader2, Play, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const pendingCheckout = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("dukaio_pending_checkout") || "null");
    } catch {
      return null;
    }
  }, []);

  const orderId = params.get("order_id") || pendingCheckout?.orderId;
  const email = pendingCheckout?.email;

  useEffect(() => {
    if (!orderId || !email) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const loadOrder = async () => {
      attempts += 1;
      const { data, error } = await supabase.functions.invoke("buyer-order-access", {
        body: { order_id: orderId, email },
      });

      if (cancelled) return;

      if (error || data?.error) {
        toast.error(data?.error || error?.message || "Impossible de récupérer la commande");
        setLoading(false);
        return;
      }

      setOrderData(data);
      setLoading(false);

      if (data?.order?.status === "completed") {
        const order = data.order;
        sessionStorage.setItem("buyer_session", JSON.stringify({
          email: order.customers?.email || email,
          customerName: order.customers?.name || pendingCheckout?.customerName || "Client",
          customerId: order.customers?.id,
          orders: [{
            id: order.id,
            amount: order.amount,
            status: order.status,
            created_at: order.created_at,
            product: order.products,
            store_owner: order.profiles,
          }],
          authenticatedAt: Date.now(),
        }));
        sessionStorage.removeItem("dukaio_pending_checkout");
        return;
      }

      if (attempts < 24) window.setTimeout(loadOrder, 5000);
    };

    loadOrder();
    return () => { cancelled = true; };
  }, [orderId, email, pendingCheckout?.customerName]);

  const product = orderData?.order?.products;
  const order = orderData?.order;
  const firstLesson = orderData?.lessons?.[0];

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    toast.success("Clé copiée");
    setTimeout(() => setCopied(null), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <Loader2 className="h-9 w-9 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Vérification de votre paiement…</p>
        </div>
      </div>
    );
  }

  if (!orderId || !email || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-5">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Retrouvez vos achats</h1>
          <p className="text-muted-foreground">Connectez-vous avec l’email utilisé au paiement pour accéder à vos produits.</p>
          <Button onClick={() => navigate("/buyer-login")}>Accéder à mes achats</Button>
        </div>
      </div>
    );
  }

  const completed = order.status === "completed";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="text-center space-y-4 mb-8">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            {completed ? <CheckCircle className="h-9 w-9 text-primary" /> : <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{completed ? "Paiement confirmé" : "Paiement en confirmation"}</h1>
          <p className="text-muted-foreground">
            {completed ? "Votre produit est prêt maintenant." : "La confirmation peut prendre quelques secondes. Cette page se met à jour automatiquement."}
          </p>
        </div>

        {product && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {product.thumbnail_url ? (
                <img src={product.thumbnail_url} alt={product.title} className="aspect-video w-full object-cover" />
              ) : (
                <div className="aspect-video bg-secondary flex items-center justify-center">
                  <FileText className="h-14 w-14 text-muted-foreground" />
                </div>
              )}
              <div className="p-5 space-y-4">
                <h2 className="text-xl font-bold text-foreground">{product.title}</h2>

                {!completed ? (
                  <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                    Dès que Moneroo confirme le paiement, l’accès au produit s’affiche ici automatiquement.
                  </div>
                ) : product.type === "file" ? (
                  product.download_url ? (
                    <Button asChild size="lg" className="gap-2">
                      <a href={product.download_url} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" /> Télécharger maintenant
                      </a>
                    </Button>
                  ) : <p className="text-sm text-muted-foreground">Le fichier n’est pas encore disponible.</p>
                ) : product.type === "course" ? (
                  <div className="space-y-3">
                    {firstLesson?.video_url ? (
                      <div className="aspect-video overflow-hidden rounded-lg border border-border bg-secondary">
                        <iframe src={firstLesson.video_url} title={firstLesson.title} className="h-full w-full" allowFullScreen />
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Play className="h-4 w-4" /> {firstLesson?.title || "Formation disponible"}
                    </div>
                  </div>
                ) : product.type === "license" ? (
                  <div className="space-y-3">
                    {(orderData.licenses || []).map((lic: any) => (
                      <div key={lic.license_key} className="rounded-lg border border-border bg-secondary/40 p-3">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2"><Key className="h-4 w-4" /> Clé de licence</div>
                        <div className="flex gap-2">
                          <code className="flex-1 rounded-md bg-background border border-border px-3 py-2 text-sm font-mono">{lic.license_key}</code>
                          <Button variant="outline" size="icon" onClick={() => copyKey(lic.license_key)}>
                            {copied === lic.license_key ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Button onClick={() => navigate(`/mes-achats/${order.id}`)}>Ouvrir le produit</Button>
                )}
              </div>
            </div>

            <aside className="rounded-xl border border-border bg-card p-5 h-fit space-y-3">
              <h3 className="font-semibold text-foreground">Commande</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex justify-between gap-3"><span>Statut</span><span className="font-medium text-foreground">{completed ? "Payée" : order.status}</span></div>
                <div className="flex justify-between gap-3"><span>Total</span><span className="font-medium text-foreground">{Number(order.amount).toLocaleString("fr-FR")} FCFA</span></div>
                <div className="flex justify-between gap-3"><span>Email</span><span className="font-medium text-foreground truncate">{order.customers?.email}</span></div>
              </div>
              <div className="pt-3 flex flex-col gap-2">
                <Button onClick={() => navigate("/mes-achats")} variant="outline">Mes achats</Button>
                {order.profiles?.store_slug && <Button asChild variant="ghost"><Link to={`/store/${order.profiles.store_slug}`}>Retour boutique</Link></Button>}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
