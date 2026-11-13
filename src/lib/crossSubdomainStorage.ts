/**
 * Cross-Subdomain Storage for Dukaio (*.dukaio.com)
 * Stores session tokens in localStorage AND synchronizes to a root domain cookie (.dukaio.com).
 * This enables seamless Single Sign-On (SSO) across:
 *  - dukaio.com (marketing & marketplace)
 *  - dashboard.dukaio.com (creator & admin dashboard)
 *  - achat.dukaio.com (buyer portal)
 *  - *.dukaio.com (creator storefronts)
 */

export function getRootCookieDomain(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.endsWith(".dukaio.com") || hostname === "dukaio.com") {
    return ".dukaio.com";
  }
  if (hostname.endsWith(".ecom-revolt.com") || hostname === "ecom-revolt.com") {
    return ".ecom-revolt.com";
  }
  return undefined;
}

export function setCrossDomainCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;
  const domain = getRootCookieDomain();
  const domainPart = domain ? `; domain=${domain}` : "";
  const securePart = window.location.protocol === "https:" ? "; Secure" : "";
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const encoded = encodeURIComponent(value);

  // If payload is large (> 3500 chars), split into chunks
  const CHUNK_SIZE = 3500;
  if (encoded.length > CHUNK_SIZE) {
    const chunks = Math.ceil(encoded.length / CHUNK_SIZE);
    document.cookie = `${name}_chk=${chunks}; expires=${expires}; path=/${domainPart}; SameSite=Lax${securePart}`;
    for (let i = 0; i < chunks; i++) {
      const chunk = encoded.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      document.cookie = `${name}_c${i}=${chunk}; expires=${expires}; path=/${domainPart}; SameSite=Lax${securePart}`;
    }
  } else {
    // Clear chunk markers
    document.cookie = `${name}_chk=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
    document.cookie = `${name}=${encoded}; expires=${expires}; path=/${domainPart}; SameSite=Lax${securePart}`;
  }
}

export function getCrossDomainCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");

  // Check if chunked
  const chunkMatch = cookies.find((c) => c.startsWith(`${name}_chk=`));
  if (chunkMatch) {
    const chunks = parseInt(chunkMatch.split("=")[1], 10);
    let full = "";
    for (let i = 0; i < chunks; i++) {
      const part = cookies.find((c) => c.startsWith(`${name}_c${i}=`));
      if (!part) return null;
      full += part.slice(`${name}_c${i}=`.length);
    }
    try {
      return decodeURIComponent(full);
    } catch {
      return null;
    }
  }

  const match = cookies.find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(`${name}=`.length));
  } catch {
    return null;
  }
}

export function deleteCrossDomainCookie(name: string): void {
  if (typeof document === "undefined") return;
  const domain = getRootCookieDomain();
  const domainPart = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
  document.cookie = `${name}_chk=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
  for (let i = 0; i < 5; i++) {
    document.cookie = `${name}_c${i}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
  }
}

/**
 * Storage adapter implementing Supabase's SupportedStorage interface.
 */
export const crossSubdomainStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;

    // 1. Try localStorage first (fastest)
    try {
      const localVal = window.localStorage.getItem(key);
      if (localVal) {
        // Ensure cookie is in sync if missing
        if (!getCrossDomainCookie(key)) {
          setCrossDomainCookie(key, localVal);
        }
        return localVal;
      }
    } catch {
      // localStorage may be restricted in private browsing
    }

    // 2. Try cross-subdomain cookie fallback
    const cookieVal = getCrossDomainCookie(key);
    if (cookieVal) {
      try {
        window.localStorage.setItem(key, cookieVal);
      } catch {
        // ignore
      }
      return cookieVal;
    }

    return null;
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore
    }
    try {
      setCrossDomainCookie(key, value);
    } catch {
      // ignore
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    try {
      deleteCrossDomainCookie(key);
    } catch {
      // ignore
    }
  },
};

