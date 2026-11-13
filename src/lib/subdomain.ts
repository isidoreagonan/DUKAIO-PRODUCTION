/**
 * Dukaio Subdomain & Store URL Utilities
 * Handles wildcard subdomains (e.g. https://boutique.dukaio.com)
 */

export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "admin",
  "api",
  "mail",
  "auth",
  "dev",
  "staging",
  "test",
  "status",
  "docs",
  "blog",
  "support",
  "assets",
  "static",
  "cdn",
  "dashboard",
  "achat",
  "achats",
  "buyer",
  "portal",
  "account",
  "checkout",
  "pay",
]);

/**
 * Extracts store subdomain from current hostname if on a creator subdomain.
 * Examples:
 *  - "towa-expert-foncier.dukaio.com" => "towa-expert-foncier"
 *  - "towa-expert-foncier.localhost"  => "towa-expert-foncier"
 *  - "dukaio.com" => null
 *  - "www.dukaio.com" => null
 */
export function getStoreSubdomain(): string | null {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname.toLowerCase();

  // If raw IP address, no subdomain
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return null;

  // Local development: e.g. boutique.localhost:8080
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length).trim();
    if (sub && !RESERVED_SUBDOMAINS.has(sub)) return sub;
    return null;
  }

  // Production: *.dukaio.com
  if (hostname.endsWith(".dukaio.com")) {
    const sub = hostname.slice(0, -".dukaio.com".length).trim();
    if (sub && !RESERVED_SUBDOMAINS.has(sub)) return sub;
    return null;
  }

  // Backward compatibility: *.ecom-revolt.com
  if (hostname.endsWith(".ecom-revolt.com")) {
    const sub = hostname.slice(0, -".ecom-revolt.com".length).trim();
    if (sub && !RESERVED_SUBDOMAINS.has(sub)) return sub;
    return null;
  }

  return null;
}

/**
 * Check if the current hostname is the Creator Dashboard subdomain:
 * e.g. dashboard.dukaio.com, dashboard.ecom-revolt.com, dashboard.localhost
 */
export function isDashboardSubdomain(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  return (
    hostname === "dashboard.dukaio.com" ||
    hostname === "dashboard.ecom-revolt.com" ||
    hostname === "dashboard.localhost" ||
    hostname.startsWith("dashboard.")
  );
}

/**
 * Check if the current hostname is the Customer / Buyer portal:
 * e.g. achat.dukaio.com, achats.dukaio.com, achat.localhost, achats.localhost
 */
export function isBuyerSubdomain(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  return (
    hostname === "achat.dukaio.com" ||
    hostname === "achats.dukaio.com" ||
    hostname === "achat.ecom-revolt.com" ||
    hostname === "achats.ecom-revolt.com" ||
    hostname === "achat.localhost" ||
    hostname === "achats.localhost" ||
    hostname.startsWith("achat.") ||
    hostname.startsWith("achats.")
  );
}

/**
 * Returns the official URL for the Dashboard
 * e.g. https://dashboard.dukaio.com
 */
export function getDashboardUrl(path = ""): string {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    const port = window.location.port;
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1") {
      return `http://dashboard.localhost${port ? `:${port}` : ""}${cleanPath}`;
    }
  }
  return `https://dashboard.dukaio.com${cleanPath}`;
}

/**
 * Returns the official URL for the Customer / Buyer Portal
 * e.g. https://achat.dukaio.com
 */
export function getBuyerPortalUrl(path = ""): string {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    const port = window.location.port;
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1") {
      return `http://achat.localhost${port ? `:${port}` : ""}${cleanPath}`;
    }
  }
  return `https://achat.dukaio.com${cleanPath}`;
}

/**
 * Returns the official URL for the Main Website
 * e.g. https://dukaio.com
 */
export function getMainSiteUrl(path = ""): string {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    const port = window.location.port;
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1") {
      return `http://localhost${port ? `:${port}` : ""}${cleanPath}`;
    }
  }
  return `https://dukaio.com${cleanPath}`;
}

/**
 * Returns whether current visitor is viewing a creator store via subdomain
 */
export function isStoreSubdomain(): boolean {
  if (isDashboardSubdomain() || isBuyerSubdomain()) return false;
  return Boolean(getStoreSubdomain());
}

/**
 * Generates the official public URL for a store slug
 * Formats as https://boutique.dukaio.com in production.
 */
export function getStoreUrl(slug?: string | null): string {
  const cleanSlug = (slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");

  if (!cleanSlug) return "https://dukaio.com";

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    const port = window.location.port;

    // Local dev
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1") {
      return `http://${cleanSlug}.localhost${port ? `:${port}` : ""}`;
    }
  }

  return `https://${cleanSlug}.dukaio.com`;
}

/**
 * Generates the official URL for a product within a creator store
 */
export function getStoreProductUrl(slug: string | null | undefined, productIdOrSlug: string): string {
  const base = getStoreUrl(slug);
  return `${base}/${productIdOrSlug}`;
}

