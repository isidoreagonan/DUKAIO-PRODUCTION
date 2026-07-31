import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Scale, FileText, Shield, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";

type LegalKind = "legal" | "terms" | "privacy";

interface StoreLegal {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  brand_color: string | null;
  legal_notice: string | null;
  terms_of_use: string | null;
  privacy_policy: string | null;
}

const META: Record<LegalKind, { title: string; icon: any; field: keyof StoreLegal }> = {
  legal: { title: "Mentions légales", icon: Scale, field: "legal_notice" },
  terms: { title: "Conditions générales", icon: FileText, field: "terms_of_use" },
  privacy: { title: "Politique de confidentialité", icon: Shield, field: "privacy_policy" },
};

const StoreLegalPage = ({ kind }: { kind: LegalKind }) => {
  const { slug } = useParams();
  const [store, setStore] = useState<StoreLegal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("stores")
        .select("id, name, slug, logo_url, brand_color, legal_notice, terms_of_use, privacy_policy" as any)
        .eq("slug", slug)
        .eq("is_archived", false)
        .maybeSingle();
      setStore((data as any) || null);
      setLoading(false);
    })();
  }, [slug]);

  const meta = META[kind];
  const Icon = meta.icon;
  const content = (store?.[meta.field] as string | null) || "";
  const brandColor = store?.brand_color || "#6366f1";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Boutique introuvable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead title={`${meta.title} — ${store.name}`} description={`${meta.title} de la boutique ${store.name}.`} />
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to={`/store/${store.slug}`} className="flex items-center gap-2.5">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brandColor }}>
                {store.name.charAt(0)?.toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-gray-900">{store.name}</span>
          </Link>
          <Link to={`/store/${store.slug}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
              <Icon className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{meta.title}</h1>
          </div>
          {content ? (
            <div
              dangerouslySetInnerHTML={{ __html: content }}
              className="prose prose-sm sm:prose max-w-none text-gray-700 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li]:mb-1"
            />
          ) : (
            <p className="text-sm text-gray-400 italic">
              Le marchand n'a pas encore renseigné cette page.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default StoreLegalPage;
