// Buyer portal session management — 3 days inactivity + 7 days re-OTP

export const BUYER_INACTIVITY_LIMIT_MS = 3 * 24 * 60 * 60 * 1000;
export const BUYER_OTP_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;
export const BUYER_ACTIVITY_KEY = "dukaio_buyer_last_activity";
export const BUYER_OTP_KEY = "dukaio_buyer_last_otp";
export const BUYER_SESSION_KEY = "buyer_session";

export interface BuyerSession {
  email: string;
  customerName: string;
  customerId: string;
  authenticatedAt: number;
}

export const getBuyerSession = (): BuyerSession | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(BUYER_SESSION_KEY)
    ?? window.sessionStorage.getItem(BUYER_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BuyerSession>;
    if (!parsed.email || !parsed.customerId) return null;
    return {
      email: parsed.email,
      customerName: parsed.customerName || "Client",
      customerId: parsed.customerId,
      authenticatedAt: parsed.authenticatedAt || 0,
    };
  } catch {
    return null;
  }
};

export const setBuyerSession = (session: BuyerSession) => {
  try {
    window.localStorage.setItem(BUYER_SESSION_KEY, JSON.stringify(session));
    // legacy sessionStorage cleanup
    window.sessionStorage.removeItem(BUYER_SESSION_KEY);
    updateBuyerActivity();
  } catch { /* ignore */ }
};

export const clearBuyerSession = () => {
  try {
    window.localStorage.removeItem(BUYER_SESSION_KEY);
    window.sessionStorage.removeItem(BUYER_SESSION_KEY);
    window.localStorage.removeItem(BUYER_ACTIVITY_KEY);
    window.localStorage.removeItem(BUYER_OTP_KEY);
  } catch { /* ignore */ }
};

export const updateBuyerActivity = () => {
  try {
    window.localStorage.setItem(BUYER_ACTIVITY_KEY, String(Date.now()));
  } catch { /* ignore */ }
};

export const getBuyerLastActivity = (): number | null => {
  try {
    const v = window.localStorage.getItem(BUYER_ACTIVITY_KEY);
    return v ? parseInt(v, 10) : null;
  } catch { return null; }
};

export const setBuyerOtpVerified = (ts?: number) => {
  try {
    window.localStorage.setItem(BUYER_OTP_KEY, String(ts ?? Date.now()));
  } catch { /* ignore */ }
};

export const getBuyerOtpVerifiedAt = (): number | null => {
  try {
    const v = window.localStorage.getItem(BUYER_OTP_KEY);
    return v ? parseInt(v, 10) : null;
  } catch { return null; }
};

export const isBuyerInactive = (): boolean => {
  const last = getBuyerLastActivity();
  if (!last) return false;
  return Date.now() - last > BUYER_INACTIVITY_LIMIT_MS;
};

export const needsBuyerOtpReverify = (): boolean => {
  const last = getBuyerOtpVerifiedAt();
  if (!last) return true;
  return Date.now() - last > BUYER_OTP_VALIDITY_MS;
};
