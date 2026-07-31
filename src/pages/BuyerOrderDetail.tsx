import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  FileText,
  Copy,
  Check,
  Receipt,
  MessageCircle,
  Sparkles,
  Star,
  Package,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

import BuyerContentDialog from "@/components/BuyerContentDialog";
import ProductReviewForm from "@/components/buyer/ProductReviewForm";
import SupportTicketDialog from "@/components/buyer/SupportTicketDialog";
import { generateInvoicePDF } from "@/lib/invoice";

interface OrderRow {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  product_id: string;
  store_owner_id: string;
}
interface ProductRow {
  id: string;
  title: string;
  type: string;
  thumbnail_url: string | null;
  download_url: string | null;
  description: string | null;
}
interface StoreRow {
  display_name: string | null;
  store_slug: string | null;
  contact: string | null;
}

// session/inactivity is enforced by BuyerProtectedRoute

const BuyerOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [store, setStore] = useState<StoreRow | null>(null);
  const [recommendations, setRecommendations] = useState<ProductRow[]>([]);
  const [contentOpen, setContentOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customer, setCustomer] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("buyer_session") ?? sessionStorage.getItem("buyer_session");
    if (!raw) {
      navigate("/buyer-login");
      return;
    }
    let session: any;
    try {
      session = JSON.parse(raw);
    } catch {
      navigate("/buyer-login");
      return;
    }
    setCustomer({ id: session.customerId, name: session.customerName, email: session.email });

    (async () => {
      const { data: o } = await supabase
        .from("orders")
        .select("id, amount, status, created_at, product_id, store_owner_id")
        .eq("id", orderId)
        .eq("customer_id", session.customerId)
        .maybeSingle();
      if (!o) {
        toast.error("Commande introuvable");
        navigate("/mes-achats");
        return;
      }
      setOrder(o as OrderRow);

      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("products").select("id, title, type, thumbnail_url, download_url, description").eq("id", (o as any).product_id).maybeSingle(),
        supabase.from("profiles").select("display_name, store_slug, contact").eq("id", (o as any).store_owner_id).maybeSingle(),
      ]);
      if (p) setProduct(p as ProductRow);
      if (s) setStore(s as StoreRow);

      // AI-flavoured recommendations: same store, similar type
      if (p) {
        const { data: recs } = await supabase
          .from("products")
          .select("id, title, type, thumbnail_url, download_url, description")
          .eq("creator_id", (o as any).store_owner_id)
          .eq("is_published", true)
          .neq("id", (p as any).id)
          .limit(4);
        setRecommendations((recs as ProductRow[]) || []);
      }
      setLoading(false);
    })();
  }, [orderId, navigate]);

  const copyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadInvoice = () => {
    if (!order || !product || !store || !customer) return;
    generateInvoicePDF({
      orderId: order.id,
      date: order.created_at,
      customerName: customer.name,
      customerEmail: customer.email,
      productTitle: product.title,
      amount: Number(order.amount) || 0,
      storeName: store.display_name || "Boutique",
      storeContact: store.contact,
    });
  };

  if (loading || !order || !product || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Dukaio" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-lg font-bold text-foreground">Dukaio</span>
          </Link>
          <Link to="/mes-achats">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Mes achats
            </Button>
          </Link>
        </div>
      </header>

      <section className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Commande</span>
            <button onClick={copyOrderId} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-foreground hover:bg-secondary/70">
              #{order.id.slice(0, 8).toUpperCase()}
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </button>
            <Badge variant="outline" className="capitalize">{order.status}</Badge>
            <span>·</span>
            <span>{new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{product.title}</h1>
          {store?.store_slug && (
            <p className="mt-1 text-sm text-muted-foreground">
              Vendu par{" "}
              <Link to={`/store/${store.store_slug}`} className="text-primary hover:underline">
                {store.display_name || store.store_slug}
              </Link>
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: content access + reviews */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="aspect-[16/7] bg-secondary">
                {product.thumbnail_url ? (
                  <img src={product.thumbnail_url} alt={product.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-14 w-14 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="p-5 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {product.type === "file" && product.download_url ? (
                    <a href={product.download_url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[180px]">
                      <Button className="w-full gap-2"><Download className="h-4 w-4" /> Télécharger le fichier</Button>
                    </a>
                  ) : (
                    <Button onClick={() => setContentOpen(true)} className="flex-1 min-w-[180px] gap-2">
                      <FileText className="h-4 w-4" /> Accéder au contenu
                    </Button>
                  )}
                  <Button variant="outline" onClick={downloadInvoice} className="gap-2">
                    <Receipt className="h-4 w-4" /> Facture PDF
                  </Button>
                  <Button variant="outline" onClick={() => setSupportOpen(true)} className="gap-2">
                    <MessageCircle className="h-4 w-4" /> Support
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-amber-500" />
                <h2 className="text-base font-bold text-foreground">Votre avis sur ce produit</h2>
              </div>
              <ProductReviewForm productId={product.id} customerId={customer.id} />
            </div>
          </div>

          {/* Right: order summary + recommendations */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Récapitulatif</h3>
              <Separator className="mb-3" />
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">Produit</span>
                <span className="text-foreground font-medium text-right max-w-[180px] line-clamp-2">{product.title}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">Total</span>
                <span className="text-foreground font-bold">
                  {Number(order.amount) > 0 ? `${Number(order.amount).toLocaleString("fr-FR")} FCFA` : "Gratuit"}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground">{customer.email}</span>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Recommandé pour vous</h3>
                </div>
                <ul className="space-y-2">
                  {recommendations.map((r) => (
                    <li key={r.id}>
                      <Link
                        to={`/store/${store?.store_slug}/${r.id}`}
                        className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-2 hover:bg-secondary transition-colors"
                      >
                        {r.thumbnail_url ? (
                          <img src={r.thumbnail_url} alt={r.title} className="h-12 w-12 rounded-md object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{r.title}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{r.type}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {contentOpen && product && (
        <BuyerContentDialog
          open={contentOpen}
          onOpenChange={setContentOpen}
          product={product}
          customerId={customer.id}
        />
      )}

      <SupportTicketDialog
        open={supportOpen}
        onOpenChange={setSupportOpen}
        orderId={order.id}
        productId={product.id}
        customerId={customer.id}
      />
    </div>
  );
};

export default BuyerOrderDetail;
