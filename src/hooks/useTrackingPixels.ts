import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export interface PixelConfig {
  facebookPixelId?: string | null;
  tiktokPixelId?: string | null;
  googleAdsId?: string | null;
  snapchatPixelId?: string | null;
  gtmId?: string | null;
  customJs?: string | null;
}

export type StandardTrackingEvent =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase";

export interface TrackingPayload {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  payment_method?: string;
  order_id?: string;
  [key: string]: any;
}

export interface TrackingOptions {
  eventId?: string; // For Meta & TikTok conversion deduplication
}

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    ttq?: any;
    TiktokAnalyticsObject?: string;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Global set of initialized IDs so we never re-init duplicate scripts
const initializedFBPixels = new Set<string>();
const initializedTTPixels = new Set<string>();
const initializedGAPixels = new Set<string>();

function debugLog(channel: string, event: string, data?: any) {
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname.includes("127.0.0.1") ||
      window.localStorage.getItem("dukaio_debug_pixels") === "1")
  ) {
    // eslint-disable-next-line no-console
    console.log(
      `%c[DUKAIO TRACKING] %c${channel} %c-> ${event}`,
      "color: #f97316; font-weight: bold;",
      "color: #0284c7; font-weight: bold;",
      "color: #10b981; font-weight: bold;",
      data || ""
    );
  }
}

/**
 * Initialize Meta (Facebook) Pixel
 */
export function initFacebookPixel(pixelId: string) {
  if (typeof window === "undefined" || !pixelId) return;
  const cleanId = pixelId.trim();
  if (!cleanId) return;

  try {
    if (!window.fbq) {
      const n: any = function () {
        if (n.callMethod) {
          n.callMethod.apply(n, arguments);
        } else {
          n.queue.push(arguments);
        }
      };
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      window.fbq = n;

      if (!document.getElementById("meta-pixel-script")) {
        const script = document.createElement("script");
        script.id = "meta-pixel-script";
        script.async = true;
        script.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(script);
      }
    }

    if (!initializedFBPixels.has(cleanId)) {
      initializedFBPixels.add(cleanId);
      window.fbq("init", cleanId);
      window.fbq("track", "PageView");
      debugLog("Meta Pixel", `init & PageView (${cleanId})`);
    }
  } catch (err) {
    console.error("[Tracking] Meta Pixel init error:", err);
  }
}

/**
 * Initialize TikTok Pixel
 */
export function initTikTokPixel(pixelId: string) {
  if (typeof window === "undefined" || !pixelId) return;
  const cleanId = pixelId.trim();
  if (!cleanId) return;

  try {
    if (!window.ttq) {
      (function (w: any, d: any, t: string) {
        w.TiktokAnalyticsObject = t;
        const ttq = (w[t] = w[t] || []);
        ttq.methods = [
          "page",
          "track",
          "identify",
          "instances",
          "debug",
          "on",
          "off",
          "once",
          "ready",
          "alias",
          "group",
          "enableCookie",
          "disableCookie",
          "holdConsent",
          "revokeConsent",
          "grantConsent",
        ];
        ttq.setAndDefer = function (target: any, method: string) {
          target[method] = function () {
            target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (let i = 0; i < ttq.methods.length; i++) {
          ttq.setAndDefer(ttq, ttq.methods[i]);
        }
        ttq.instance = function (instanceId: string) {
          const inst = ttq._i[instanceId] || [];
          for (let n = 0; n < ttq.methods.length; n++) {
            ttq.setAndDefer(inst, ttq.methods[n]);
          }
          return inst;
        };
        ttq.load = function (sdkId: string, opt: any) {
          const url = "https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i = ttq._i || {};
          ttq._i[sdkId] = [];
          ttq._i[sdkId]._u = url;
          ttq._t = ttq._t || {};
          ttq._t[sdkId] = +new Date();
          ttq._o = ttq._o || {};
          ttq._o[sdkId] = opt || {};
          if (!document.getElementById("tiktok-pixel-script")) {
            const script = d.createElement("script");
            script.type = "text/javascript";
            script.async = true;
            script.id = "tiktok-pixel-script";
            script.src = `${url}?sdkid=${sdkId}&lib=${t}`;
            const first = d.getElementsByTagName("script")[0];
            if (first && first.parentNode) {
              first.parentNode.insertBefore(script, first);
            } else {
              d.head.appendChild(script);
            }
          }
        };
      })(window, document, "ttq");
    }

    if (!initializedTTPixels.has(cleanId)) {
      initializedTTPixels.add(cleanId);
      window.ttq.load(cleanId);
      window.ttq.page();
      debugLog("TikTok Pixel", `load & page (${cleanId})`);
    }
  } catch (err) {
    console.error("[Tracking] TikTok Pixel init error:", err);
  }
}

/**
 * Initialize Google Ads / GTag
 */
export function initGoogleAds(adsId: string) {
  if (typeof window === "undefined" || !adsId) return;
  const cleanId = adsId.trim();
  if (!cleanId) return;

  try {
    if (!initializedGAPixels.has(cleanId)) {
      initializedGAPixels.add(cleanId);
      const scriptId = `gtag-script-${cleanId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${cleanId}`;
        document.head.appendChild(script);
      }

      window.dataLayer = window.dataLayer || [];
      if (!window.gtag) {
        window.gtag = function () {
          window.dataLayer!.push(arguments);
        };
        window.gtag("js", new Date());
      }
      window.gtag("config", cleanId);
      debugLog("Google Ads", `config (${cleanId})`);
    }
  } catch (err) {
    console.error("[Tracking] Google Ads init error:", err);
  }
}

/**
 * Initialize Snapchat Pixel
 */
export function initSnapchatPixel(snapId: string) {
  if (typeof window === "undefined" || !snapId) return;
  const cleanId = snapId.trim();
  if (!cleanId) return;
  try {
    if (!(window as any).snaptr) {
      (function (e: any, t: any, n: string) {
        if (e.snaptr) return;
        var a: any = (e.snaptr = function () {
          a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
        });
        a.queue = [];
        var s = "script",
          r: any = t.createElement(s);
        r.async = !0;
        r.src = n;
        var u = t.getElementsByTagName(s)[0];
        u.parentNode.insertBefore(r, u);
      })(window, document, "https://sc-static.net/scevent.min.js");
    }
    (window as any).snaptr("init", cleanId);
    (window as any).snaptr("track", "PAGE_VIEW");
    debugLog("Snapchat Pixel", `init & PAGE_VIEW (${cleanId})`);
  } catch (err) {
    console.error("[Tracking] Snapchat init error:", err);
  }
}

/**
 * Initialize Google Tag Manager
 */
export function initGoogleTagManager(gtmId: string) {
  if (typeof window === "undefined" || !gtmId) return;
  const cleanId = gtmId.trim();
  if (!cleanId) return;
  try {
    const scriptId = `gtm-${cleanId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    if (!document.getElementById(scriptId)) {
      (function (w: any, d: any, s: string, l: string, i: string) {
        w[l] = w[l] || [];
        w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l !== "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", cleanId);
      debugLog("Google Tag Manager", `init (${cleanId})`);
    }
  } catch (err) {
    console.error("[Tracking] GTM init error:", err);
  }
}

/**
 * Inject Custom JavaScript safely into DOM
 */
export function injectCustomScript(code: string) {
  if (typeof window === "undefined" || !code) return;
  try {
    const scriptId = "dukaio-custom-tracking-script";
    if (!document.getElementById(scriptId)) {
      const el = document.createElement("script");
      el.id = scriptId;
      el.text = code.replace(/<\/?script[^>]*>/gi, "");
      document.body.appendChild(el);
      debugLog("Custom JS", "injected");
    }
  } catch (err) {
    console.error("[Tracking] Custom script error:", err);
  }
}

/**
 * Synchronous initialization of all configured pixels
 */
export function initTrackingPixels(config: PixelConfig) {
  if (!config) return;
  if (config.facebookPixelId) initFacebookPixel(config.facebookPixelId);
  if (config.tiktokPixelId) initTikTokPixel(config.tiktokPixelId);
  if (config.googleAdsId) initGoogleAds(config.googleAdsId);
  if (config.snapchatPixelId) initSnapchatPixel(config.snapchatPixelId);
  if (config.gtmId) initGoogleTagManager(config.gtmId);
  if (config.customJs) injectCustomScript(config.customJs);
}

/**
 * React hook to initialize pixels for a store or product page,
 * and track PageView on initial mount and subsequent SPA route changes.
 */
export function useTrackingPixels(config: PixelConfig) {
  const location = useLocation();
  const lastTrackedPath = useRef<string>("");

  useEffect(() => {
    if (!config) return;
    initTrackingPixels(config);
  }, [
    config.facebookPixelId,
    config.tiktokPixelId,
    config.googleAdsId,
    config.snapchatPixelId,
    config.gtmId,
    config.customJs,
  ]);

  useEffect(() => {
    // Avoid double pageview firing on initial mount if already fired during init
    const currentPath = location.pathname + location.search;
    if (lastTrackedPath.current && lastTrackedPath.current !== currentPath) {
      trackEvent("PageView");
    }
    lastTrackedPath.current = currentPath;
  }, [location.pathname, location.search]);
}

/**
 * Universal Event Tracker: Sends standard e-commerce events across
 * Facebook Pixel, TikTok Pixel, and Google Ads with proper normalization.
 */
export function trackEvent(
  eventName: StandardTrackingEvent,
  payload: TrackingPayload = {},
  options?: TrackingOptions
) {
  if (typeof window === "undefined") return;

  const currency = payload.currency || "XOF";
  const value = payload.value !== undefined ? Number(payload.value) : undefined;
  const contentIds = payload.content_ids || (payload.content_id ? [String(payload.content_id)] : []);
  const primaryId = contentIds[0] || "";

  // 1. Facebook (Meta) Pixel
  try {
    if (window.fbq) {
      if (eventName === "PageView") {
        window.fbq("track", "PageView");
        debugLog("Meta Pixel", "track PageView");
      } else if (eventName === "ViewContent") {
        window.fbq("track", "ViewContent", {
          content_name: payload.content_name,
          content_ids: contentIds,
          content_type: payload.content_type || "product",
          value,
          currency,
        });
        debugLog("Meta Pixel", "track ViewContent", payload);
      } else if (eventName === "AddToCart") {
        window.fbq("track", "AddToCart", {
          content_name: payload.content_name,
          content_ids: contentIds,
          content_type: payload.content_type || "product",
          value,
          currency,
        });
        debugLog("Meta Pixel", "track AddToCart", payload);
      } else if (eventName === "InitiateCheckout") {
        window.fbq("track", "InitiateCheckout", {
          content_name: payload.content_name,
          content_ids: contentIds,
          content_type: payload.content_type || "product",
          value,
          currency,
          num_items: payload.num_items || 1,
        });
        debugLog("Meta Pixel", "track InitiateCheckout", payload);
      } else if (eventName === "AddPaymentInfo") {
        window.fbq("track", "AddPaymentInfo", {
          content_category: payload.payment_method || payload.content_category,
          value,
          currency,
        });
        debugLog("Meta Pixel", "track AddPaymentInfo", payload);
      } else if (eventName === "Purchase") {
        window.fbq(
          "track",
          "Purchase",
          {
            content_name: payload.content_name,
            content_ids: contentIds,
            content_type: payload.content_type || "product",
            value,
            currency,
            num_items: payload.num_items || 1,
          },
          options?.eventId ? { eventID: options.eventId } : undefined
        );
        debugLog("Meta Pixel", `track Purchase (eventID: ${options?.eventId})`, payload);
      }
    }
  } catch (err) {
    console.error("[Tracking] Meta event error:", err);
  }

  // 2. TikTok Pixel
  try {
    if (window.ttq && typeof window.ttq.track === "function") {
      const ttOptions = options?.eventId ? { event_id: options.eventId } : undefined;

      if (eventName === "PageView") {
        if (typeof window.ttq.page === "function") window.ttq.page();
        debugLog("TikTok Pixel", "track Page");
      } else if (eventName === "ViewContent") {
        window.ttq.track(
          "ViewContent",
          {
            content_name: payload.content_name,
            content_id: primaryId,
            content_type: payload.content_type || "product",
            value,
            currency,
          },
          ttOptions
        );
        debugLog("TikTok Pixel", "track ViewContent", payload);
      } else if (eventName === "AddToCart") {
        window.ttq.track(
          "AddToCart",
          {
            content_name: payload.content_name,
            content_id: primaryId,
            content_type: payload.content_type || "product",
            value,
            currency,
          },
          ttOptions
        );
        debugLog("TikTok Pixel", "track AddToCart", payload);
      } else if (eventName === "InitiateCheckout") {
        window.ttq.track(
          "InitiateCheckout",
          {
            content_name: payload.content_name,
            content_id: primaryId,
            content_type: payload.content_type || "product",
            value,
            currency,
            quantity: payload.num_items || 1,
          },
          ttOptions
        );
        debugLog("TikTok Pixel", "track InitiateCheckout", payload);
      } else if (eventName === "AddPaymentInfo") {
        window.ttq.track(
          "AddPaymentInfo",
          {
            content_type: "product",
            value,
            currency,
          },
          ttOptions
        );
        debugLog("TikTok Pixel", "track AddPaymentInfo", payload);
      } else if (eventName === "Purchase") {
        // TikTok standard event for purchase is "CompletePayment"
        window.ttq.track(
          "CompletePayment",
          {
            content_name: payload.content_name,
            content_id: primaryId,
            content_type: payload.content_type || "product",
            value,
            currency,
            quantity: payload.num_items || 1,
          },
          ttOptions
        );
        debugLog("TikTok Pixel", `track CompletePayment (event_id: ${options?.eventId})`, payload);
      }
    }
  } catch (err) {
    console.error("[Tracking] TikTok event error:", err);
  }

  // 3. Google Ads (gtag)
  try {
    if (window.gtag) {
      if (eventName === "PageView") {
        window.gtag("event", "page_view", {
          page_path: window.location.pathname,
        });
        debugLog("Google Ads", "event page_view");
      } else if (eventName === "ViewContent") {
        window.gtag("event", "view_item", {
          currency,
          value,
          items: contentIds.map((id) => ({
            item_id: id,
            item_name: payload.content_name,
            price: value,
          })),
        });
        debugLog("Google Ads", "event view_item", payload);
      } else if (eventName === "AddToCart") {
        window.gtag("event", "add_to_cart", {
          currency,
          value,
          items: contentIds.map((id) => ({
            item_id: id,
            item_name: payload.content_name,
            price: value,
          })),
        });
        debugLog("Google Ads", "event add_to_cart", payload);
      } else if (eventName === "InitiateCheckout") {
        window.gtag("event", "begin_checkout", {
          currency,
          value,
          items: contentIds.map((id) => ({
            item_id: id,
            item_name: payload.content_name,
            price: value,
          })),
        });
        debugLog("Google Ads", "event begin_checkout", payload);
      } else if (eventName === "AddPaymentInfo") {
        window.gtag("event", "add_payment_info", {
          payment_type: payload.payment_method,
          currency,
          value,
        });
        debugLog("Google Ads", "event add_payment_info", payload);
      } else if (eventName === "Purchase") {
        window.gtag("event", "purchase", {
          transaction_id: options?.eventId || payload.order_id,
          currency,
          value,
          items: contentIds.map((id) => ({
            item_id: id,
            item_name: payload.content_name,
            price: value,
          })),
        });
        debugLog("Google Ads", "event purchase", payload);
      }
    }
  } catch (err) {
    console.error("[Tracking] Google Ads event error:", err);
  }

  // 4. Snapchat Pixel
  try {
    const snap = (window as any).snaptr;
    if (typeof snap === "function") {
      const snapData: Record<string, any> = {
        currency,
        price: value,
        item_ids: contentIds,
      };

      if (eventName === "PageView") {
        snap("track", "PAGE_VIEW");
        debugLog("Snapchat Pixel", "track PAGE_VIEW");
      } else if (eventName === "ViewContent") {
        snap("track", "VIEW_CONTENT", snapData);
        debugLog("Snapchat Pixel", "track VIEW_CONTENT", snapData);
      } else if (eventName === "AddToCart") {
        snap("track", "ADD_CART", snapData);
        debugLog("Snapchat Pixel", "track ADD_CART", snapData);
      } else if (eventName === "InitiateCheckout") {
        snap("track", "START_CHECKOUT", snapData);
        debugLog("Snapchat Pixel", "track START_CHECKOUT", snapData);
      } else if (eventName === "AddPaymentInfo") {
        snap("track", "ADD_BILLING", snapData);
        debugLog("Snapchat Pixel", "track ADD_BILLING", snapData);
      } else if (eventName === "Purchase") {
        snap("track", "PURCHASE", {
          ...snapData,
          transaction_id: options?.eventId || payload.order_id,
        });
        debugLog("Snapchat Pixel", "track PURCHASE", snapData);
      }
    }
  } catch (err) {
    console.error("[Tracking] Snapchat event error:", err);
  }

  // 5. Google Tag Manager (dataLayer)
  try {
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ecommerce: {
          currency,
          value,
          items: contentIds.map((id) => ({
            item_id: id,
            item_name: payload.content_name,
            price: value,
          })),
        },
      });
      debugLog("Google Tag Manager", `dataLayer push ${eventName}`);
    }
  } catch (err) {
    console.error("[Tracking] GTM event error:", err);
  }
}

/**
 * Deduplicated purchase tracker:
 * Ensures the 'Purchase' event is fired strictly ONCE per order ID,
 * even across page refreshes or multiple callbacks.
 */
export function trackPurchaseOnce(orderId: string, payload: TrackingPayload) {
  if (!orderId || typeof window === "undefined") return false;

  const storageKey = `dukaio_purchase_tracked_${orderId}`;
  try {
    if (sessionStorage.getItem(storageKey)) {
      debugLog("Purchase", `Already tracked for order ${orderId}, skipping duplicate.`);
      return false;
    }
    sessionStorage.setItem(storageKey, new Date().toISOString());
  } catch {}

  trackEvent("Purchase", { ...payload, order_id: orderId }, { eventId: orderId });
  return true;
}
