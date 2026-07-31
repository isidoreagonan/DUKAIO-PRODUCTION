import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

const SITE_NAME = "Dukaio";
const SITE_URL = "https://dukaio.com";
const DEFAULT_DESCRIPTION = "DUKAIO est la plateforme pour vendre vos produits digitaux en Afrique : fichiers, formations et licences. Créez votre boutique et encaissez via Mobile Money ou carte.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg?v=dukaio-20260505`;
const DEFAULT_KEYWORDS = "DUKAIO, dukaio, vente produits digitaux, marketplace afrique, vendre en ligne, cours en ligne, fichiers numériques, licences digitales, boutique digitale, mobile money, ecommerce afrique";

const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath = "/",
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  noindex = false,
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Vendez vos produits digitaux en Afrique`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", description);
    setMeta("keywords", keywords);
    if (noindex) setMeta("robots", "noindex, nofollow");
    else setMeta("robots", "index, follow");

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:image", ogImage, true);
    setMeta("og:image:secure_url", ogImage, true);
    setMeta("og:image:type", ogImage.endsWith(".png") ? "image/png" : "image/jpeg", true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "630", true);
    setMeta("og:image:alt", fullTitle, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:type", ogType, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:locale", "fr_FR", true);

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // JSON-LD
    const existingLD = document.querySelector('script[data-seo-jsonld]');
    if (existingLD) existingLD.remove();

    const jsonLd = document.createElement("script");
    jsonLd.type = "application/ld+json";
    jsonLd.setAttribute("data-seo-jsonld", "true");
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          description: DEFAULT_DESCRIPTION,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/products?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/logo.png?v=dukaio-20260504`,
          description: DEFAULT_DESCRIPTION,
          sameAs: [],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            url: `${SITE_URL}/contact`,
          },
        },
      ],
    });
    document.head.appendChild(jsonLd);

    return () => {
      const ld = document.querySelector('script[data-seo-jsonld]');
      if (ld) ld.remove();
    };
  }, [fullTitle, description, keywords, canonicalUrl, ogImage, ogType, noindex]);

  return null;
};

export default SEOHead;
